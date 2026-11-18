import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// RNF0046: notificações ao cliente (ex.: troca autorizada, cupom de troca disponível).
export const Notificacao = sequelize.define("notificacao", {
  id_notificacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING(30), allowNull: false }, // TROCA_AUTORIZADA | CUPOM_TROCA
  mensagem: { type: DataTypes.STRING(255), allowNull: false },
  id_pedido: { type: DataTypes.INTEGER, allowNull: true },
  id_troca: { type: DataTypes.INTEGER, allowNull: true },
  lida: { type: DataTypes.BOOLEAN, defaultValue: false },
  data_criacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

// RF0053 / RF0054 / RNF0012: rastreio das baixas e reentradas de estoque ligadas à venda.
export const MovimentacaoEstoque = sequelize.define("movimentacao_estoque", {
  id_movimentacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_livro: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING(20), allowNull: false }, // BAIXA | REENTRADA
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  id_pedido: { type: DataTypes.INTEGER, allowNull: true },
  id_troca: { type: DataTypes.INTEGER, allowNull: true },
  data_movimentacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
