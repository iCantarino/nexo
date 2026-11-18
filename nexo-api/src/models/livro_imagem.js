import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const LivroImagem = sequelize.define("livro_imagem", {
  id_imagem: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_livro: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.ENUM("CAPA", "GALERIA"), defaultValue: "GALERIA" },
  ordem: { type: DataTypes.INTEGER, defaultValue: 0 },
  url_imagem: { type: DataTypes.STRING(500), allowNull: false },
  nome_arquivo: { type: DataTypes.STRING(255), allowNull: false },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
});
