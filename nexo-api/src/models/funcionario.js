import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Funcionario = sequelize.define("funcionario", {
  id_funcionario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150), unique: true, allowNull: false },
  senha_hash: { type: DataTypes.STRING(255), allowNull: false },
  perfil: { type: DataTypes.STRING(30), allowNull: false }, // ADMIN | GERENTE_VENDAS | OPERADOR_ESTOQUE
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
  data_cadastro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
