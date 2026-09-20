import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Avaliacao = sequelize.define("avaliacao", {
  id_avaliacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_livro: { type: DataTypes.INTEGER, allowNull: false },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  estrelas: { type: DataTypes.SMALLINT, allowNull: false },
  comentario: { type: DataTypes.TEXT, allowNull: true },
  data_avaliacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
