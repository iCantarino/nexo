import { CartaoCredito } from "../../models/index.js";

/**
 * RN0028 / RN0037: simulação da operadora de cartão de crédito.
 * Regra definida pelo grupo: cartões cujo número termina em "0000" são recusados;
 * os demais são autorizados.
 */
export function operadoraAutoriza(numeroCartao) {
  const digitos = String(numeroCartao ?? "").replace(/\D/g, "");
  return digitos.length > 0 && !digitos.endsWith("0000");
}

const hojeISO = () => new Date().toISOString().slice(0, 10);

/**
 * RN0037: valida a forma de pagamento APÓS a finalização da compra.
 *  - cupons de troca e promocionais: validade e veracidade (existência, titularidade, não utilizado);
 *  - cartões: aceite da operadora (simulado).
 * Retorna { aprovado, motivo }.
 */
export async function validarPagamento({ idCliente, cuponsAplicados, cartoes, transaction }) {
  const hoje = hojeISO();
  for (const cupom of cuponsAplicados) {
    const r = cupom.registro;
    if (r) {
      if (r.id_cliente !== idCliente || r.utilizado) {
        return { aprovado: false, motivo: `Cupom ${cupom.codigo_cupom} inválido ou já utilizado.` };
      }
      if (String(r.valido_de) > hoje || String(r.valido_ate) < hoje) {
        return { aprovado: false, motivo: `Cupom ${cupom.codigo_cupom} fora do prazo de validade.` };
      }
    } else if (!cupom.catalogo || !cupom.catalogo.ativo) {
      return { aprovado: false, motivo: `Cupom ${cupom.codigo_cupom} inválido.` };
    }
  }

  for (const c of cartoes) {
    const cartao = await CartaoCredito.findByPk(c.id_cartao, { transaction });
    if (!cartao || !operadoraAutoriza(cartao.numero_cartao)) {
      return { aprovado: false, motivo: "Pagamento recusado pela operadora do cartão." };
    }
  }
  return { aprovado: true, motivo: null };
}
