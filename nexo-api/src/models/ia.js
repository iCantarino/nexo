import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const InteracaoChatbot = sequelize.define("interacao_chatbot", {
  id_interacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  mensagem_cliente: { type: DataTypes.TEXT, allowNull: false },
  resposta_ia: { type: DataTypes.TEXT, allowNull: false },
  livros_sugeridos: { type: DataTypes.JSON, allowNull: true },
  feedback: { type: DataTypes.ENUM("UTIL", "NAO_UTIL"), allowNull: true },
  feedback_data: { type: DataTypes.DATE, allowNull: true },
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

export const PreferenciaCliente = sequelize.define("preferencia_cliente", {
  id_preferencia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  categoria: { type: DataTypes.STRING(100), allowNull: false },
  origem: { type: DataTypes.ENUM("EXPLICITO", "IMPLICITO"), defaultValue: "EXPLICITO" },
  data_cadastro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

