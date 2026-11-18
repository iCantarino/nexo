import { QueryTypes } from "sequelize";
import { sequelize } from "../../config/database.js";
import { HttpError } from "../../utils/asyncHandler.js";

export const MAX_MESES = 24;

/** Aceita "AAAA-MM" ou "AAAA-MM-DD" e devolve { ano, mes } sem passar por fuso horário. */
export function parseAnoMes(valor) {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(valor ?? "").trim());
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) return null;
  if (m[3] !== undefined) {
    const dia = Number(m[3]);
    if (dia < 1 || dia > new Date(Date.UTC(ano, mes, 0)).getUTCDate()) return null;
  }
  return { ano, mes };
}

const chave = ({ ano, mes }) => `${ano}-${String(mes).padStart(2, "0")}`;

/** Lista todos os meses (AAAA-MM) do intervalo, inclusive as pontas. */
export function listarMeses(inicio, fim) {
  const meses = [];
  let ano = inicio.ano;
  let mes = inicio.mes;
  while (ano < fim.ano || (ano === fim.ano && mes <= fim.mes)) {
    meses.push(chave({ ano, mes }));
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }
  return meses;
}

export async function listarCategorias() {
  return sequelize.query("SELECT id_categoria, nome FROM categoria ORDER BY nome", { type: QueryTypes.SELECT });
}

/**
 * RF0055 / RNF0043: valor total (R$) de vendas ENTREGUE por categoria e mês.
 * RN0073: meses sem venda entram como 0,00 (linha contínua).
 * RN0072: no mínimo 1 e no máximo 24 meses (contados de forma inclusiva).
 */
export async function vendasPorCategoria({ dataInicio, dataFim, categorias }) {
  const inicio = parseAnoMes(dataInicio);
  const fim = parseAnoMes(dataFim);
  if (!inicio || !fim) throw new HttpError(400, "Datas inválidas. Use o formato AAAA-MM-DD.");
  if (chave(fim) < chave(inicio)) throw new HttpError(400, "Data de fim não pode ser anterior à data de início.");

  const meses = listarMeses(inicio, fim);
  if (meses.length > MAX_MESES) throw new HttpError(400, `O período deve ter no máximo ${MAX_MESES} meses.`);

  const ids = [...new Set(categorias)];
  if (!ids.length || ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new HttpError(400, "Selecione ao menos uma categoria válida.");
  }

  const cats = await sequelize.query(
    "SELECT id_categoria, nome FROM categoria WHERE id_categoria IN (:ids) ORDER BY nome",
    { replacements: { ids }, type: QueryTypes.SELECT }
  );
  if (cats.length !== ids.length) throw new HttpError(400, "Uma ou mais categorias não existem.");

  // Uma única consulta agregada (índices em pedido(status, data_pedido) e livro_categoria).
  const linhas = await sequelize.query(
    `SELECT lc.id_categoria,
            DATE_FORMAT(p.data_pedido, '%Y-%m') AS ano_mes,
            SUM(ip.valor_total_item) AS valor
       FROM pedido p
       JOIN item_pedido ip ON ip.id_pedido = p.id_pedido
       JOIN livro_categoria lc ON lc.id_livro = ip.id_livro
      WHERE p.status = 'ENTREGUE'
        AND p.data_pedido >= :de
        AND p.data_pedido < :ate
        AND lc.id_categoria IN (:ids)
      GROUP BY lc.id_categoria, DATE_FORMAT(p.data_pedido, '%Y-%m')`,
    {
      replacements: {
        ids,
        de: `${meses[0]}-01 00:00:00`,
        ate: `${proximoMes(fim)}-01 00:00:00`,
      },
      type: QueryTypes.SELECT,
    }
  );

  const mapa = new Map(linhas.map((l) => [`${l.id_categoria}|${l.ano_mes}`, Number(l.valor)]));
  const series = cats.map((c) => ({
    id_categoria: c.id_categoria,
    categoria: c.nome,
    valores: meses.map((m) => Math.round((mapa.get(`${c.id_categoria}|${m}`) ?? 0) * 100) / 100),
  }));

  return { periodo: { inicio: meses[0], fim: meses[meses.length - 1] }, meses, series };
}

function proximoMes({ ano, mes }) {
  return mes === 12 ? chave({ ano: ano + 1, mes: 1 }) : chave({ ano, mes: mes + 1 });
}
