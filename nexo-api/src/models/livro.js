import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Autor = sequelize.define("autor", {
  id_autor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(150), allowNull: false },
});

export const Editora = sequelize.define("editora", {
  id_editora: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(150), allowNull: false },
});

export const Categoria = sequelize.define("categoria", {
  id_categoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), unique: true, allowNull: false },
});

export const GrupoPrecificacao = sequelize.define("grupo_precificacao", {
  id_grupo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  margem_lucro_percentual: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
});

export const MotivoStatusLivro = sequelize.define("motivo_status_livro", {
  id_motivo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descricao: { type: DataTypes.STRING(150), allowNull: false },
  tipo: { type: DataTypes.STRING(20), allowNull: false }, // ATIVACAO | INATIVACAO
  automatico: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export const Fornecedor = sequelize.define("fornecedor", {
  id_fornecedor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(150), allowNull: false },
  cnpj: { type: DataTypes.STRING(18), unique: true, allowNull: false },
  contato: { type: DataTypes.STRING(150), allowNull: true },
});

export const Livro = sequelize.define("livro", {
  id_livro: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo_livro: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  titulo: { type: DataTypes.STRING(200), allowNull: false },
  isbn: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  id_autor: { type: DataTypes.INTEGER, allowNull: false },
  id_editora: { type: DataTypes.INTEGER, allowNull: false },
  ano_publicacao: { type: DataTypes.INTEGER, allowNull: false },
  edicao: { type: DataTypes.STRING(30), allowNull: false },
  num_paginas: { type: DataTypes.INTEGER, allowNull: false },
  sinopse: { type: DataTypes.TEXT, allowNull: false },
  altura: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
  largura: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
  peso: { type: DataTypes.DECIMAL(6, 3), allowNull: false },
  profundidade: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
  codigo_barras: { type: DataTypes.STRING(30), unique: true, allowNull: false },
  id_grupo_precificacao: { type: DataTypes.INTEGER, allowNull: false },
  valor_custo: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  valor_venda: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  quantidade_estoque: { type: DataTypes.INTEGER, defaultValue: 0 },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
  id_motivo_status: { type: DataTypes.INTEGER, allowNull: true },
  justificativa_status: { type: DataTypes.TEXT, allowNull: true },
  data_cadastro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export const LivroCategoria = sequelize.define(
  "livro_categoria",
  {
    id_livro: { type: DataTypes.INTEGER, primaryKey: true },
    id_categoria: { type: DataTypes.INTEGER, primaryKey: true },
  },
  { timestamps: false }
);

export const EntradaEstoque = sequelize.define("entrada_estoque", {
  id_entrada: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_livro: { type: DataTypes.INTEGER, allowNull: false },
  id_fornecedor: { type: DataTypes.INTEGER, allowNull: false },
  id_funcionario: { type: DataTypes.INTEGER, allowNull: false },
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  valor_custo: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  data_entrada: { type: DataTypes.DATEONLY, allowNull: false },
});
