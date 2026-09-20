import { Cliente, Endereco, BandeiraCartao, CartaoCredito } from "./cliente.js";
import { Funcionario } from "./funcionario.js";
import {
  Autor,
  Editora,
  Categoria,
  GrupoPrecificacao,
  MotivoStatusLivro,
  Livro,
  LivroCategoria,
  Fornecedor,
  EntradaEstoque,
} from "./livro.js";
import { Carrinho, ItemCarrinho } from "./carrinho.js";
import {
  Pedido,
  ItemPedido,
  PedidoStatusHistorico,
  PedidoCartao,
  Cupom,
  PedidoCupom,
  STATUS_PEDIDO,
} from "./pedido.js";
import { Troca, ItemTroca, STATUS_TROCA } from "./troca.js";
import { Avaliacao } from "./avaliacao.js";
import { InteracaoChatbot, RecomendacaoIA } from "./ia.js";
import { LogAuditoria } from "./auditoria.js";

// --- Cliente e dependências ---
Cliente.hasMany(Endereco, { foreignKey: "id_cliente", as: "enderecos" });
Endereco.belongsTo(Cliente, { foreignKey: "id_cliente" });

Cliente.hasMany(CartaoCredito, { foreignKey: "id_cliente", as: "cartoes" });
CartaoCredito.belongsTo(Cliente, { foreignKey: "id_cliente" });
CartaoCredito.belongsTo(BandeiraCartao, { foreignKey: "id_bandeira" });

// --- Livro e catálogo ---
Livro.belongsTo(Autor, { foreignKey: "id_autor" });
Livro.belongsTo(Editora, { foreignKey: "id_editora" });
Livro.belongsTo(GrupoPrecificacao, { foreignKey: "id_grupo_precificacao" });
Livro.belongsTo(MotivoStatusLivro, { foreignKey: "id_motivo_status" });

Livro.belongsToMany(Categoria, { through: LivroCategoria, foreignKey: "id_livro", otherKey: "id_categoria" });
Categoria.belongsToMany(Livro, { through: LivroCategoria, foreignKey: "id_categoria", otherKey: "id_livro" });

EntradaEstoque.belongsTo(Livro, { foreignKey: "id_livro" });
EntradaEstoque.belongsTo(Fornecedor, { foreignKey: "id_fornecedor" });
EntradaEstoque.belongsTo(Funcionario, { foreignKey: "id_funcionario" });

// --- Carrinho ---
Carrinho.belongsTo(Cliente, { foreignKey: "id_cliente" });
Carrinho.hasMany(ItemCarrinho, { foreignKey: "id_carrinho", as: "itens" });
ItemCarrinho.belongsTo(Carrinho, { foreignKey: "id_carrinho" });
ItemCarrinho.belongsTo(Livro, { foreignKey: "id_livro" });

// --- Pedido ---
Pedido.belongsTo(Cliente, { foreignKey: "id_cliente" });
Pedido.belongsTo(Endereco, { foreignKey: "id_endereco_entrega" });

Pedido.hasMany(ItemPedido, { foreignKey: "id_pedido", as: "itens" });
ItemPedido.belongsTo(Pedido, { foreignKey: "id_pedido" });
ItemPedido.belongsTo(Livro, { foreignKey: "id_livro" });

Pedido.hasMany(PedidoStatusHistorico, { foreignKey: "id_pedido", as: "historico" });
PedidoStatusHistorico.belongsTo(Pedido, { foreignKey: "id_pedido" });
PedidoStatusHistorico.belongsTo(Funcionario, { foreignKey: "id_funcionario" });

Pedido.hasMany(PedidoCartao, { foreignKey: "id_pedido", as: "pagamentos_cartao" });
PedidoCartao.belongsTo(Pedido, { foreignKey: "id_pedido" });
PedidoCartao.belongsTo(CartaoCredito, { foreignKey: "id_cartao" });

Cupom.belongsTo(Cliente, { foreignKey: "id_cliente" });
Cupom.belongsTo(Pedido, { foreignKey: "id_pedido_origem", as: "pedido_origem" });

Pedido.hasMany(PedidoCupom, { foreignKey: "id_pedido", as: "cupons_utilizados" });
PedidoCupom.belongsTo(Pedido, { foreignKey: "id_pedido" });
PedidoCupom.belongsTo(Cupom, { foreignKey: "id_cupom" });

// --- Troca ---
Troca.belongsTo(Pedido, { foreignKey: "id_pedido" });
Troca.belongsTo(Cliente, { foreignKey: "id_cliente" });
Troca.belongsTo(Funcionario, { foreignKey: "id_funcionario_autorizacao", as: "funcionario_autorizacao" });
Troca.belongsTo(Cupom, { foreignKey: "id_cupom_gerado", as: "cupom_gerado" });

Troca.hasMany(ItemTroca, { foreignKey: "id_troca", as: "itens" });
ItemTroca.belongsTo(Troca, { foreignKey: "id_troca" });
ItemTroca.belongsTo(ItemPedido, { foreignKey: "id_item_pedido" });

// --- Avaliação ---
Avaliacao.belongsTo(Livro, { foreignKey: "id_livro" });
Avaliacao.belongsTo(Cliente, { foreignKey: "id_cliente" });

// --- IA / Chatbot ---
InteracaoChatbot.belongsTo(Cliente, { foreignKey: "id_cliente" });
RecomendacaoIA.belongsTo(Cliente, { foreignKey: "id_cliente" });
RecomendacaoIA.belongsTo(Livro, { foreignKey: "id_livro" });

// --- Auditoria ---
LogAuditoria.belongsTo(Funcionario, { foreignKey: "id_funcionario" });
LogAuditoria.belongsTo(Cliente, { foreignKey: "id_cliente" });

export {
  Cliente,
  Endereco,
  BandeiraCartao,
  CartaoCredito,
  Funcionario,
  Autor,
  Editora,
  Categoria,
  GrupoPrecificacao,
  MotivoStatusLivro,
  Livro,
  LivroCategoria,
  Fornecedor,
  EntradaEstoque,
  Carrinho,
  ItemCarrinho,
  Pedido,
  ItemPedido,
  PedidoStatusHistorico,
  PedidoCartao,
  Cupom,
  PedidoCupom,
  STATUS_PEDIDO,
  Troca,
  ItemTroca,
  STATUS_TROCA,
  Avaliacao,
  InteracaoChatbot,
  RecomendacaoIA,
  LogAuditoria,
};
