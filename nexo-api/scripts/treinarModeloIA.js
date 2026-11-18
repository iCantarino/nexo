/**
 * Script de ajuste fino contínuo do chatbot de recomendação (RNF0044-3).
 *
 * Como a OpenRouter é uma API de inferência e não permite fine-tuning direto,
 * este script realiza:
 * 1. Ajuste dos scores de recomendação com base no feedback dos usuários.
 * 2. Geração de um dataset JSONL compatível com fine-tuning futuro (ex: OpenAI).
 *
 * Uso:
 *   npm run ia:treinar
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "../src/config/database.js";
import { Op } from "sequelize";
import {
  InteracaoChatbot,
  RecomendacaoIA,
  Avaliacao,
  Pedido,
  ItemPedido,
  Livro,
  Cliente,
} from "../src/models/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATASET_DIR = path.resolve(__dirname, "..", "..", "nexo-design", "bdd", "seeds");
const DATASET_PATH = path.join(DATASET_DIR, "004_dataset_treinamento_chatbot.jsonl");

async function ajustarScores() {
  const interacoes = await InteracaoChatbot.findAll({
    where: { feedback: ["UTIL", "NAO_UTIL"] },
  });

  let ajustados = 0;
  for (const interacao of interacoes) {
    const livrosIds = interacao.livros_sugeridos || [];
    const ajuste = interacao.feedback === "UTIL" ? 0.15 : -0.2;

    for (const idLivro of livrosIds) {
      const recs = await RecomendacaoIA.findAll({
        where: {
          id_cliente: interacao.id_cliente,
          id_livro: Number(idLivro),
        },
        order: [["data_geracao", "DESC"]],
        limit: 1,
      });

      for (const rec of recs) {
        const novoScore = Math.min(1, Math.max(0, Number(rec.score) + ajuste));
        await rec.update({ score: novoScore });
        ajustados++;
      }
    }
  }

  return { totalInteracoes: interacoes.length, ajustados };
}

async function gerarDataset() {
  const rows = [];

  // Exemplos positivos do chatbot
  const positivas = await InteracaoChatbot.findAll({
    where: { feedback: "UTIL" },
    include: [{ model: Cliente, attributes: ["nome"] }],
  });

  for (const i of positivas) {
    rows.push({
      messages: [
        { role: "system", content: "Você é o Nexo IA Assistente, curador virtual de livros." },
        { role: "user", content: i.mensagem_cliente },
        { role: "assistant", content: i.resposta_ia },
      ],
      metadata: {
        id_cliente: i.id_cliente,
        id_interacao: i.id_interacao,
        fonte: "feedback_util",
      },
    });
  }

  // Exemplos de vendas bem-sucedidas (pedidos ENTREGUE)
  const pedidos = await Pedido.findAll({
    where: { status: "ENTREGUE" },
    include: [
      {
        model: ItemPedido,
        as: "itens",
        include: [{ model: Livro, attributes: ["titulo", "sinopse"] }],
      },
      { model: Cliente, attributes: ["id_cliente"] },
    ],
  });

  for (const p of pedidos) {
    for (const item of p.itens || []) {
      const livro = item.livro;
      rows.push({
        messages: [
          { role: "system", content: "Você é o Nexo IA Assistente, curador virtual de livros." },
          {
            role: "user",
            content: `Me recomende livros como ${livro.titulo}`,
          },
          {
            role: "assistant",
            content: `Com certeza! Com base no seu interesse por "${livro.titulo}", sugiro explorar títulos similares do nosso catálogo.`,
          },
        ],
        metadata: {
          id_cliente: p.id_cliente,
          id_livro: livro.id_livro,
          fonte: "venda_entregue",
        },
      });
    }
  }

  // Exemplos de avaliações positivas
  const avaliacoes = await Avaliacao.findAll({
    where: { estrelas: { [Op.gte]: 4 } },
    include: [
      { model: Livro, attributes: ["titulo"] },
      { model: Cliente, attributes: ["id_cliente"] },
    ],
  });

  for (const a of avaliacoes) {
    rows.push({
      messages: [
        { role: "system", content: "Você é o Nexo IA Assistente, curador virtual de livros." },
        { role: "user", content: `Gostei muito de ${a.livro.titulo}. Tem algo parecido?` },
        {
          role: "assistant",
          content: `Que ótimo! Pela sua avaliação positiva de ${a.estrelas} estrelas para "${a.livro.titulo}", vou buscar obras com perfil semelhante para você.`,
        },
      ],
      metadata: {
        id_cliente: a.id_cliente,
        id_livro: a.livro.id_livro,
        fonte: "avaliacao_positiva",
      },
    });
  }

  if (!existsSync(DATASET_DIR)) {
    mkdirSync(DATASET_DIR, { recursive: true });
  }

  const lines = rows.map((r) => JSON.stringify(r)).join("\n");
  writeFileSync(DATASET_PATH, lines, "utf-8");

  return { total: rows.length, porFonte: contarPorFonte(rows) };
}

function contarPorFonte(rows) {
  const map = {};
  for (const r of rows) {
    const fonte = r.metadata?.fonte || "desconhecido";
    map[fonte] = (map[fonte] || 0) + 1;
  }
  return map;
}

async function main() {
  try {
    console.log("🔧 Iniciando ajuste fino contínuo do chatbot...\n");

    const scoreResult = await ajustarScores();
    console.log(`✅ Scores ajustados: ${scoreResult.ajustados} registros de ${scoreResult.totalInteracoes} interações com feedback.`);

    const datasetResult = await gerarDataset();
    console.log(`✅ Dataset de treinamento gerado: ${datasetResult.total} exemplos.`);
    console.log("📊 Distribuição por fonte:", datasetResult.porFonte);
    console.log(`📁 Arquivo salvo em: ${DATASET_PATH}\n`);

    console.log("ℹ️  Esse dataset pode ser usado para fine-tuning futuro em plataformas que o suportem (ex: OpenAI).");
    console.log("ℹ️  A personalização contínua já ocorre via RAG + few-shot em tempo de inferência.");
  } catch (err) {
    console.error("❌ Erro no treinamento:", err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
