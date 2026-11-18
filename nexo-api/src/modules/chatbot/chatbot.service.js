import { Op } from "sequelize";
import { env } from "../../config/env.js";
import {
  InteracaoChatbot,
  RecomendacaoIA,
  PreferenciaCliente,
  Livro,
  Categoria,
  Avaliacao,
  ItemPedido,
  Pedido,
  Cliente,
} from "../../models/index.js";

const OPENROUTER_URL = env.ia.openRouterUrl;
const OPENROUTER_MODEL = env.ia.openRouterModel;
const OPENROUTER_API_KEY = env.ia.openRouterApiKey;

function formatarPreco(valor) {
  return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
}

export async function construirPerfilLeitura(idCliente) {
  const cliente = await Cliente.findByPk(idCliente, {
    attributes: ["id_cliente", "nome"],
  });

  const preferenciasExplicitas = await PreferenciaCliente.findAll({
    where: { id_cliente: idCliente },
    order: [["data_cadastro", "DESC"]],
  });

  const pedidos = await Pedido.findAll({
    where: { id_cliente: idCliente, status: "ENTREGUE" },
    attributes: ["id_pedido"],
  });
  const idsPedidos = pedidos.map((p) => p.id_pedido);

  let livrosComprados = [];
  if (idsPedidos.length) {
    livrosComprados = await ItemPedido.findAll({
      where: { id_pedido: { [Op.in]: idsPedidos } },
      include: [
        {
          model: Livro,
          attributes: ["id_livro", "titulo", "valor_venda"],
          include: [
            { model: Categoria, through: { attributes: [] }, attributes: ["nome"] },
          ],
        },
      ],
    });
  }

  const avaliacoesPositivas = await Avaliacao.findAll({
    where: { id_cliente: idCliente, estrelas: { [Op.gte]: 4 } },
    include: [
      {
        model: Livro,
        attributes: ["id_livro", "titulo"],
        include: [
          { model: Categoria, through: { attributes: [] }, attributes: ["nome"] },
        ],
      },
    ],
  });

  const contagens = new Map();
  for (const item of livrosComprados) {
    for (const cat of item.livro.categoria || []) {
      contagens.set(cat.nome, (contagens.get(cat.nome) || 0) + item.quantidade);
    }
  }
  for (const av of avaliacoesPositivas) {
    for (const cat of av.livro.categoria || []) {
      contagens.set(cat.nome, (contagens.get(cat.nome) || 0) + 1);
    }
  }

  const categoriasImplicitas = Array.from(contagens.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([nome, peso]) => ({ nome, peso }));

  for (const cat of categoriasImplicitas) {
    await PreferenciaCliente.findOrCreate({
      where: { id_cliente: idCliente, categoria: cat.nome, origem: "IMPLICITO" },
      defaults: { id_cliente: idCliente, categoria: cat.nome, origem: "IMPLICITO" },
    });
  }

  const categoriasFinais = [
    ...preferenciasExplicitas.map((p) => ({ nome: p.categoria, origem: "EXPLICITO" })),
    ...categoriasImplicitas.map((c) => ({ nome: c.nome, origem: "IMPLICITO", peso: c.peso })),
  ];

  return {
    cliente: cliente ? cliente.nome.split(" ")[0] : "Cliente",
    categorias: categoriasFinais,
    livrosComprados: livrosComprados.map((i) => ({
      id_livro: i.livro.id_livro,
      titulo: i.livro.titulo,
      preco: formatarPreco(i.livro.valor_venda),
      categorias: (i.livro.categoria || []).map((c) => c.nome),
      quantidade: i.quantidade,
    })),
    avaliacoesPositivas: avaliacoesPositivas.map((a) => ({
      id_livro: a.livro.id_livro,
      titulo: a.livro.titulo,
      estrelas: a.estrelas,
      categorias: (a.livro.categoria || []).map((c) => c.nome),
    })),
  };
}

async function buscarExemplosPositivos(idCliente, limite = 3) {
  return InteracaoChatbot.findAll({
    where: { id_cliente: idCliente, feedback: "UTIL" },
    order: [["data_interacao", "DESC"]],
    limit: limite,
    attributes: ["mensagem_cliente", "resposta_ia"],
  });
}

async function buscarCatalogo(limite = 50) {
  return Livro.findAll({
    where: { ativo: true, quantidade_estoque: { [Op.gt]: 0 } },
    include: [
      { model: Categoria, through: { attributes: [] }, attributes: ["id_categoria", "nome"] },
    ],
    limit: limite,
    order: [["id_livro", "ASC"]],
  });
}

async function montarPrompt(mensagem, idCliente) {
  const perfil = await construirPerfilLeitura(idCliente);
  const exemplos = await buscarExemplosPositivos(idCliente);
  const catalogo = await buscarCatalogo();

  const interesses = perfil.categorias.map((c) => `${c.nome} (${c.origem})`).join(", ") || "ainda não identificados";
  const compras = perfil.livrosComprados.map((l) => `- ${l.titulo} (${l.categorias.join(", ")})`).join("\n") || "nenhuma compra registrada";
  const avaliacoes = perfil.avaliacoesPositivas.map((a) => `- ${a.titulo}: ${a.estrelas} estrelas`).join("\n") || "nenhuma avaliação registrada";

  const catalogoTexto = catalogo
    .map((l) => {
      const cats = (l.categoria || []).map((c) => c.nome).join(", ");
      return `- ID ${l.id_livro}: "${l.titulo}" por ${l.autor?.nome || "autor desconhecido"}, ${formatarPreco(l.valor_venda)}, categorias: [${cats}], sinopse: ${l.sinopse?.slice(0, 120) || ""}`;
    })
    .join("\n");

  const exemplosTexto = exemplos.length
    ? exemplos.map((e) => `Usuário: ${e.mensagem_cliente}\nAssistente: ${e.resposta_ia}`).join("\n\n")
    : "nenhum exemplo anterior";

  const systemPrompt = `Você é o Nexo IA Assistente, um curador virtual especializado em livros de alta qualidade (filosofia, ciência, arte, história, literatura). 
Você atua no e-commerce Nexo e deve ajudar o cliente a encontrar livros, responder dúvidas e sugerir conteúdos relevantes.

REGRAS:
1. Baseie suas recomendações no perfil de leitura do cliente (histórico de compras, avaliações e preferências explícitas).
2. Seja caloroso, mas conciso. Máximo de 3 parágrafos na resposta principal.
3. Quando sugerir livros, use SOMENTE os IDs do catálogo fornecido.
4. Ao final da resposta, adicione uma seção JSON no formato: {"livros_recomendados": [id1, id2, ...]}. Pode ser uma lista vazia.
5. Se o cliente perguntar algo que não seja sobre livros, responda gentilmente que seu papel é ajudar com recomendações literárias.
6. O nome do cliente é ${perfil.cliente}.
7. NUNCA invente livros que não estejam no catálogo.

PERFIL DE LEITURA DO CLIENTE:
- Interesses: ${interesses}
- Livros comprados:\n${compras}
- Avaliações positivas (≥4 estrelas):\n${avaliacoes}

EXEMPLOS DE INTERAÇÕES BEM AVALIADAS:
${exemplosTexto}

CATÁLOGO DISPONÍVEL (use apenas esses IDs):
${catalogoTexto}`;

  return {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: mensagem },
    ],
    perfil,
    catalogo,
  };
}

function extrairLivrosRecomendados(texto) {
  try {
    const match = texto.match(/\{[\s\S]*"livros_recomendados"[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed.livros_recomendados) ? parsed.livros_recomendados : [];
    }
  } catch {
    // ignora erro de parse
  }
  return [];
}

function limparResposta(texto) {
  return texto.replace(/\{[\s\S]*"livros_recomendados"[\s\S]*\}/, "").trim();
}

export async function gerarRespostaIA(mensagem, idCliente) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes("sua-chave-aqui")) {
    throw new Error("Chave da OpenRouter não configurada.");
  }

  const { messages, perfil, catalogo } = await montarPrompt(mensagem, idCliente);

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "Nexo E-commerce de Livros",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter retornou erro ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || "";
  const livrosIds = extrairLivrosRecomendados(raw);
  const resposta = limparResposta(raw) || "Não consegui formular uma resposta. Poderia reformular a pergunta?";

  const idsValidos = catalogo.map((l) => l.id_livro);
  const livrosIdsValidos = livrosIds.filter((id) => idsValidos.includes(Number(id))).map(Number);

  return { resposta, livrosIds: livrosIdsValidos, perfil };
}

export async function registrarInteracao(idCliente, mensagem, resposta, livrosIds) {
  const interacao = await InteracaoChatbot.create({
    id_cliente: idCliente,
    mensagem_cliente: mensagem,
    resposta_ia: resposta,
    livros_sugeridos: livrosIds,
  });

  for (const idLivro of livrosIds) {
    await RecomendacaoIA.create({
      id_cliente: idCliente,
      id_livro: idLivro,
      score: 0.8,
      origem: "CHATBOT",
    });
  }

  return interacao;
}

export async function registrarFeedback(idInteracao, idCliente, feedback) {
  if (!["UTIL", "NAO_UTIL"].includes(feedback)) {
    throw new Error("Feedback deve ser UTIL ou NAO_UTIL.");
  }

  const interacao = await InteracaoChatbot.findOne({
    where: { id_interacao: idInteracao, id_cliente: idCliente },
  });

  if (!interacao) {
    throw new Error("Interação não encontrada.");
  }

  await interacao.update({
    feedback,
    feedback_data: new Date(),
  });

  const livrosIds = interacao.livros_sugeridos || [];
  const ajuste = feedback === "UTIL" ? 0.15 : -0.2;

  for (const idLivro of livrosIds) {
    const recomendacoes = await RecomendacaoIA.findAll({
      where: { id_cliente: idCliente, id_livro: idLivro },
      order: [["data_geracao", "DESC"]],
      limit: 1,
    });
    for (const rec of recomendacoes) {
      const novoScore = Math.min(1, Math.max(0, Number(rec.score) + ajuste));
      await rec.update({ score: novoScore });
    }
  }

  return interacao;
}

export async function gerarRecomendacoesPerfil(idCliente, limite = 5) {
  const perfil = await construirPerfilLeitura(idCliente);
  const categorias = perfil.categorias.map((c) => c.nome);

  const where = { ativo: true, quantidade_estoque: { [Op.gt]: 0 } };
  const include = [
    { model: Categoria, through: { attributes: [] }, attributes: ["id_categoria", "nome"] },
  ];

  if (categorias.length) {
    include[0].where = { nome: { [Op.in]: categorias } };
  }

  const livros = await Livro.findAll({ where, include, limit: limite * 2 });
  const recomendacoes = [];

  for (const livro of livros.slice(0, limite)) {
    const rec = await RecomendacaoIA.create({
      id_cliente: idCliente,
      id_livro: livro.id_livro,
      score: 0.75,
      origem: "HISTORICO_COMPRA",
    });
    recomendacoes.push({ ...rec.toJSON(), livro });
  }

  return { perfil, recomendacoes };
}
