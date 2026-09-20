import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const STATUS_PEDIDO = [
  "EM_ABERTO",
  "EM_PROCESSAMENTO",
  "APROVADA",
  "REPROVADA",
  "EM_TRANSITO",
  "ENTREGUE",
  "EM_TROCA",
  "TROCA_AUTORIZADA",
  "TROCADO",
  "CANCELADO",
];

export const Pedido = sequelize.define("pedido", {
  id_pedido: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo_pedido: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  id_endereco_entrega: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING(30), defaultValue: "EM_ABERTO" },
  valor_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  valor_frete: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  data_pedido: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  data_processamento: { type: DataTypes.DATE, allowNull: true },
  data_transporte: { type: DataTypes.DATE, allowNull: true },
  data_entrega: { type: DataTypes.DATE, allowNull: true },
  observacao: { type: DataTypes.STRING(255), allowNull: true },
});

export const ItemPedido = sequelize.define("item_pedido", {
  id_item_pedido: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_pedido: { type: DataTypes.INTEGER, allowNull: false },
  id_livro: { type: DataTypes.INTEGER, allowNull: false },
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  valor_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  valor_total_item: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});

export const PedidoStatusHistorico = sequelize.define("pedido_status_historico", {
  id_historico: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_pedido: { type: DataTypes.INTEGER, allowNull: false },
  id_funcionario: { type: DataTypes.INTEGER, allowNull: true },
  status_anterior: { type: DataTypes.STRING(30), allowNull: true },
  status_novo: { type: DataTypes.STRING(30), allowNull: false },
  data_alteracao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export const PedidoCartao = sequelize.define("pedido_cartao", {
  id_pedido_cartao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_pedido: { type: DataTypes.INTEGER, allowNull: false },
  id_cartao: { type: DataTypes.INTEGER, allowNull: false },
  valor_pago: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});

export const Cupom = sequelize.define("cupom", {
  id_cupom: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo_cupom: { type: DataTypes.STRING(30), unique: true, allowNull: false },
  tipo: { type: DataTypes.STRING(20), allowNull: false }, // PROMOCIONAL | TROCA
  valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  id_pedido_origem: { type: DataTypes.INTEGER, allowNull: true },
  utilizado: { type: DataTypes.BOOLEAN, defaultValue: false },
  valido_de: { type: DataTypes.DATEONLY, allowNull: false },
  valido_ate: { type: DataTypes.DATEONLY, allowNull: false },
});

export const PedidoCupom = sequelize.define("pedido_cupom", {
  id_pedido_cupom: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_pedido: { type: DataTypes.INTEGER, allowNull: false },
  id_cupom: { type: DataTypes.INTEGER, allowNull: false },
  valor_utilizado: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});
