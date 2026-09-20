import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Cliente = sequelize.define("cliente", {
  id_cliente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo_cliente: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  nome: { type: DataTypes.STRING(150), allowNull: false },
  genero: { type: DataTypes.STRING(30), allowNull: false },
  data_nascimento: { type: DataTypes.DATEONLY, allowNull: false },
  cpf: { type: DataTypes.STRING(14), unique: true, allowNull: false },
  telefone_tipo: { type: DataTypes.STRING(20), allowNull: false },
  telefone_ddd: { type: DataTypes.STRING(3), allowNull: false },
  telefone_numero: { type: DataTypes.STRING(15), allowNull: false },
  email: { type: DataTypes.STRING(150), unique: true, allowNull: false },
  senha_hash: { type: DataTypes.STRING(255), allowNull: false },
  ranking: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
  data_cadastro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  data_inativacao: { type: DataTypes.DATE, allowNull: true },
});

export const Endereco = sequelize.define("endereco", {
  id_endereco: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  nome_identificador: { type: DataTypes.STRING(100), allowNull: false },
  tipo: { type: DataTypes.STRING(20), allowNull: false }, // ENTREGA | COBRANCA | AMBOS
  tipo_residencia: { type: DataTypes.STRING(50), allowNull: false },
  tipo_logradouro: { type: DataTypes.STRING(50), allowNull: false },
  logradouro: { type: DataTypes.STRING(150), allowNull: false },
  numero: { type: DataTypes.STRING(20), allowNull: false },
  bairro: { type: DataTypes.STRING(100), allowNull: false },
  cep: { type: DataTypes.STRING(10), allowNull: false },
  cidade: { type: DataTypes.STRING(100), allowNull: false },
  estado: { type: DataTypes.STRING(50), allowNull: false },
  pais: { type: DataTypes.STRING(60), allowNull: false },
  observacoes: { type: DataTypes.STRING(255), allowNull: true },
  padrao: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export const BandeiraCartao = sequelize.define("bandeira_cartao", {
  id_bandeira: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(50), unique: true, allowNull: false },
});

export const CartaoCredito = sequelize.define("cartao_credito", {
  id_cartao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  id_bandeira: { type: DataTypes.INTEGER, allowNull: false },
  numero_cartao: { type: DataTypes.STRING(25), allowNull: false },
  nome_impresso: { type: DataTypes.STRING(150), allowNull: false },
  codigo_seguranca: { type: DataTypes.STRING(4), allowNull: false },
  preferencial: { type: DataTypes.BOOLEAN, defaultValue: false },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
});
