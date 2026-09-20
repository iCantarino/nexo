import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const InteracaoChatbot = sequelize.define("interacao_chatbot", {
  id_interacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  mensagem_cliente: { type: DataTypes.TEXT, allowNull: false },
  resposta_ia: { type: DataTypes.TEXT, allowNull: false },
  data_interacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export const RecomendacaoIA = sequelize.define("recomendacao_ia", {
  id_recomendacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  id_livro: { type: DataTypes.INTEGER, allowNull: false },
  score: { type: DataTypes.DECIMAL(5, 4), allowNull: false },
  origem: { type: DataTypes.STRING(30), allowNull: false },
  data_geracao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
