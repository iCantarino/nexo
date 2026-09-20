import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Carrinho = sequelize.define("carrinho", {
  id_carrinho: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  data_criacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  data_atualizacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export const ItemCarrinho = sequelize.define("item_carrinho", {
  id_item_carrinho: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_carrinho: { type: DataTypes.INTEGER, allowNull: false },
  id_livro: { type: DataTypes.INTEGER, allowNull: false },
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  data_bloqueio: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  data_expiracao_bloqueio: { type: DataTypes.DATE, allowNull: false },
  notificado_expiracao: { type: DataTypes.BOOLEAN, defaultValue: false },
  removido_por_expiracao: { type: DataTypes.BOOLEAN, defaultValue: false },
});
