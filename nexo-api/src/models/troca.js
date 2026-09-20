import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const STATUS_TROCA = ["SOLICITADA", "ACEITA", "NEGADA", "ITEM_ENVIADO", "ITEM_RECEBIDO", "PROCESSADA"];

export const Troca = sequelize.define("troca", {
  id_troca: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_pedido: { type: DataTypes.INTEGER, allowNull: false },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  id_funcionario_autorizacao: { type: DataTypes.INTEGER, allowNull: true },
  id_cupom_gerado: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.STRING(20), defaultValue: "SOLICITADA" },
  motivo: { type: DataTypes.TEXT, allowNull: false },
  retorna_estoque: { type: DataTypes.BOOLEAN, allowNull: true },
  data_solicitacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  data_autorizacao: { type: DataTypes.DATE, allowNull: true },
  data_processamento: { type: DataTypes.DATE, allowNull: true },
});

export const ItemTroca = sequelize.define("item_troca", {
  id_item_troca: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_troca: { type: DataTypes.INTEGER, allowNull: false },
  id_item_pedido: { type: DataTypes.INTEGER, allowNull: false },
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
});
