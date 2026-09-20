import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const LogAuditoria = sequelize.define("log_auditoria", {
  id_log: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tabela_afetada: { type: DataTypes.STRING(60), allowNull: false },
  id_registro: { type: DataTypes.INTEGER, allowNull: false },
  operacao: { type: DataTypes.STRING(10), allowNull: false }, // INSERT | UPDATE | DELETE
  id_funcionario: { type: DataTypes.INTEGER, allowNull: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: true },
  dados_alterados: { type: DataTypes.JSON, allowNull: true },
  data_hora: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
