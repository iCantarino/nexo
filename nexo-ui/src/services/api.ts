import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Cliente axios configurado
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const token = localStorage.getItem('token');
    if (error.response?.status === 401 && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tipos
export interface Cliente {
  id_cliente: number;
  codigo_cliente: string;
  nome: string;
  genero: string;
  data_nascimento: string;
  cpf: string;
  telefone_tipo: string;
  telefone_ddd: string;
  telefone_numero: string;
  email: string;
  ranking: string;
  ativo: boolean;
  data_cadastro: string;
  data_inativacao: string | null;
}

export interface Endereco {
  id_endereco: number;
  id_cliente: number;
  nome_identificador: string;
  tipo: string;
  tipo_residencia: string;
  tipo_logradouro: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  pais: string;
  observacoes: string | null;
  padrao: boolean;
}

export interface CartaoCredito {
  id_cartao: number;
  id_cliente: number;
  id_bandeira: number;
  numero_cartao: string;
  nome_impresso: string;
  codigo_seguranca: string;
  preferencial: boolean;
  ativo: boolean;
  bandeira?: { nome: string };
}

export interface CreateEnderecoData {
  nome_identificador: string;
  tipo: 'ENTREGA' | 'COBRANCA' | 'AMBOS';
  tipo_residencia: string;
  tipo_logradouro: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  pais: string;
  observacoes?: string | null;
  padrao?: boolean;
}

export interface CreateCartaoData {
  id_bandeira: number;
  numero_cartao: string;
  nome_impresso: string;
  codigo_seguranca: string;
  preferencial?: boolean;
}

export interface Funcionario {
  id_funcionario: number;
  codigo_funcionario: string;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'GERENTE_VENDAS' | 'ESTOQUISTA' | 'ATENDENTE';
  ativo: boolean;
  data_cadastro: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  perfil: string;
  nome?: string;
}

export interface Livro {
  id_livro: number;
  codigo_livro: string;
  titulo: string;
  isbn: string;
  valor_venda: string;
  quantidade_estoque: number;
  ativo: boolean;
  sinopse: string;
  autor?: { nome: string };
  editora?: { nome: string };
  categorias?: { id_categoria: number; nome: string }[];
}

export interface CarrinhoItem {
  id_item_carrinho: number;
  id_carrinho: number;
  id_livro: number;
  quantidade: number;
  removido_por_expiracao: boolean;
  livro?: Livro;
}

export interface CarrinhoData {
  id_carrinho: number;
  id_cliente: number;
  itens: CarrinhoItem[];
  itens_expirados?: CarrinhoItem[];
  minutos_bloqueio?: number;
  /** RNF0042: false quando há itens removidos por expiração do bloqueio (botão "comprar" desabilitado). */
  pode_comprar?: boolean;
  alertas?: string[];
}

export interface ItemPedido {
  id_item_pedido: number;
  id_livro: number;
  quantidade: number;
  quantidade_trocada: number;
  valor_unitario: string;
  valor_total_item: string;
}

export interface Pedido {
  id_pedido: number;
  codigo_pedido: string;
  id_cliente: number;
  id_endereco_entrega: number;
  status: string;
  valor_total: string;
  valor_frete: string;
  valor_pix?: string;
  data_pedido: string;
  observacao?: string | null;
  itens?: ItemPedido[];
}

export interface ItemTroca {
  id_item_troca: number;
  id_item_pedido: number;
  quantidade: number;
}

export interface Troca {
  id_troca: number;
  id_pedido: number;
  id_cliente: number;
  status: string;
  motivo: string;
  compra_inteira: boolean;
  data_solicitacao: string;
  itens?: ItemTroca[];
  pedido?: Pedido;
}

export interface InteracaoChatbot {
  id_interacao: number;
  id_cliente: number;
  mensagem_cliente: string;
  resposta_ia: string;
  livros_sugeridos: number[] | null;
  feedback: 'UTIL' | 'NAO_UTIL' | null;
  feedback_data: string | null;
  data_interacao: string;
}

export interface PerfilLeitura {
  cliente: string;
  categorias: { nome: string; origem: 'EXPLICITO' | 'IMPLICITO'; peso?: number }[];
  livrosComprados: { id_livro: number; titulo: string; preco: string; categorias: string[]; quantidade: number }[];
  avaliacoesPositivas: { id_livro: number; titulo: string; estrelas: number; categorias: string[] }[];
}

export interface Notificacao {
  id_notificacao: number;
  tipo: string;
  mensagem: string;
  id_pedido: number | null;
  id_troca: number | null;
  lida: boolean;
  data_criacao: string;
}

/** O valor interno EM_TRANSITO é exibido como "EM TRANSPORTE" (RF0038). */
export const rotuloStatus = (status: string): string =>
  status === 'EM_TRANSITO' ? 'EM TRANSPORTE' : status.replace(/_/g, ' ');

export interface Cupom {
  id_cupom: number;
  codigo_cupom: string;
  tipo: 'PROMOCIONAL' | 'TROCA';
  valor: string;
  percentual?: string | null;
  descricao?: string | null;
  origem?: 'CLIENTE' | 'CATALOGO';
  id_cliente?: number;
  utilizado: boolean;
  valido_de?: string;
  valido_ate?: string;
}

/** Valor em reais que o cupom abate (percentual incide sobre os itens, não sobre o frete). */
export function valorDoCupom(cupom: Cupom, subtotalItens: number): number {
  if (cupom.percentual) {
    return Math.round(subtotalItens * Number(cupom.percentual)) / 100;
  }
  return Number(cupom.valor);
}

export interface Bandeira {
  id_bandeira: number;
  nome: string;
}

export interface CreateClienteData {
  nome: string;
  genero: string;
  data_nascimento: string;
  cpf: string;
  telefone_tipo: string;
  telefone_ddd: string;
  telefone_numero: string;
  email: string;
  senha: string;
}

export interface CreateFuncionarioData {
  nome: string;
  email: string;
  senha: string;
  perfil: 'ADMIN' | 'GERENTE_VENDAS' | 'ESTOQUISTA' | 'ATENDENTE';
  ativo?: boolean;
}

// APIs de Autenticação
export const authApi = {
  loginCliente: (email: string, senha: string) =>
    api.post<LoginResponse>('/auth/cliente/login', { email, senha }),
  
  loginFuncionario: (email: string, senha: string) =>
    api.post<LoginResponse>('/auth/funcionario/login', { email, senha }),
};

// APIs de Clientes
export const clientesApi = {
  listar: (params?: { nome?: string; cpf?: string; email?: string; ativo?: string }) =>
    api.get<Cliente[]>('/clientes', { params }),
  
  criar: (data: CreateClienteData) =>
    api.post<Cliente>('/clientes', data),
  
  atualizar: (id: number, data: Partial<CreateClienteData>) =>
    api.patch<Cliente>(`/clientes/${id}`, data),
  
  inativar: (id: number) =>
    api.patch(`/clientes/${id}/inativar`),
  
  inativarMe: () =>
    api.patch('/clientes/me/inativar'),
  
  ativar: (id: number) =>
    api.patch(`/clientes/${id}/ativar`),
  
  meuPerfil: () =>
    api.get<Cliente>('/clientes/me'),
  
  atualizarMe: (data: { nome?: string; genero?: string; telefone_tipo?: string; telefone_ddd?: string; telefone_numero?: string; email?: string }) =>
    api.patch<Cliente>('/clientes/me', data),
  
  alterarSenha: (data: { senha_atual: string; nova_senha: string }) =>
    api.patch('/clientes/me/senha', data),
};

// APIs de Funcionários
export const funcionariosApi = {
  listar: (params?: { nome?: string; email?: string; perfil?: string; ativo?: string }) =>
    api.get<Funcionario[]>('/funcionarios', { params }),
  
  criar: (data: CreateFuncionarioData) =>
    api.post<Funcionario>('/funcionarios', data),
  
  atualizar: (id: number, data: Partial<CreateFuncionarioData>) =>
    api.patch<Funcionario>(`/funcionarios/${id}`, data),
  
  inativar: (id: number) =>
    api.patch(`/funcionarios/${id}/inativar`),
  
  ativar: (id: number) =>
    api.patch(`/funcionarios/${id}/ativar`),
};

// APIs de Endereços
export const enderecosApi = {
  listar: () => api.get<Endereco[]>('/enderecos'),
  criar: (data: CreateEnderecoData) =>
    api.post<Endereco>('/enderecos', data),
};

// APIs de Cartões de Crédito
export const cartoesApi = {
  listar: () => api.get<CartaoCredito[]>('/cartoes'),
  criar: (data: CreateCartaoData) =>
    api.post<CartaoCredito>('/cartoes', data),
};
// APIs de Endereços (Admin)
export const enderecosAdminApi = {
  listar: (idCliente: number) =>
    api.get<Endereco[]>(`/clientes/${idCliente}/enderecos`),
  criar: (idCliente: number, data: CreateEnderecoData) =>
    api.post<Endereco>(`/clientes/${idCliente}/enderecos`, data),
  excluir: (idCliente: number, idEndereco: number) =>
    api.delete(`/clientes/${idCliente}/enderecos/${idEndereco}`),
};

// APIs de Cartões de Crédito (Admin)
export const cartoesAdminApi = {
  listar: (idCliente: number) =>
    api.get<CartaoCredito[]>(`/clientes/${idCliente}/cartoes`),
  criar: (idCliente: number, data: CreateCartaoData) =>
    api.post<CartaoCredito>(`/clientes/${idCliente}/cartoes`, data),
  excluir: (idCliente: number, idCartao: number) =>
    api.delete(`/clientes/${idCliente}/cartoes/${idCartao}`),
};

// APIs de Carrinho
export const carrinhoApi = {
  listar: () =>
    api.get<CarrinhoData>('/carrinho'),
  
  adicionarItem: (id_livro: number, quantidade: number = 1) =>
    api.post<CarrinhoData>('/carrinho/itens', { id_livro, quantidade }),
  
  atualizarItem: (idItemCarrinho: number, quantidade: number) =>
    api.patch<CarrinhoData>(`/carrinho/itens/${idItemCarrinho}`, { quantidade }),
  
  removerItem: (idItemCarrinho: number) =>
    api.delete(`/carrinho/itens/${idItemCarrinho}`),

  // RNF0042: devolve ao carrinho os itens removidos por expiração do bloqueio.
  reincluirExpirados: () =>
    api.post<CarrinhoData>('/carrinho/reincluir-expirados'),
};

// APIs de Pedidos
export const pedidosApi = {
  calcularFrete: (id_endereco_entrega: number) =>
    api.post<{ valor_frete: number; qtde_itens: number }>('/pedidos/calcular-frete', { id_endereco_entrega }),
  
  finalizar: (data: {
    id_endereco_entrega?: number;
    cartoes?: { id_cartao: number; valor_pago: number }[];
    pix?: { valor_pago: number };
    codigos_cupom?: string[];
    novo_endereco?: any;
    salvar_endereco_perfil?: boolean;
    novo_cartao?: any;
    salvar_cartao_perfil?: boolean;
  }) => api.post<Pedido>('/pedidos', data),
  
  meusPedidos: () =>
    api.get<Pedido[]>('/pedidos/meus'),
  
  detalhe: (idPedido: number) =>
    api.get<Pedido>(`/pedidos/${idPedido}`),

  // Perfil administrador (RF0038 / RF0039)
  adminTodos: (status_filtro?: string) =>
    api.get<Pedido[]>('/pedidos/admin/todos', { params: status_filtro ? { status_filtro } : undefined }),
  despachar: (idPedido: number) => api.patch<Pedido>(`/pedidos/${idPedido}/despachar`),
  confirmarEntrega: (idPedido: number) => api.patch<Pedido>(`/pedidos/${idPedido}/confirmar-entrega`),
};

// APIs de Trocas (RF0040 a RF0044)
export const trocasApi = {
  solicitar: (data: {
    id_pedido: number;
    motivo: string;
    compra_inteira?: boolean;
    itens?: { id_item_pedido: number; quantidade: number }[];
  }) => api.post<Troca>('/trocas', data),
  minhas: () => api.get<Troca[]>('/trocas/minhas'),
  adminPendentes: () => api.get<Troca[]>('/trocas/admin/pendentes'),
  autorizar: (idTroca: number) => api.patch<Troca>(`/trocas/${idTroca}/autorizar`, {}),
  receber: (idTroca: number) => api.patch<Troca>(`/trocas/${idTroca}/receber`, {}),
};

// APIs de Notificações (RNF0046)
export const notificacoesApi = {
  listar: (nao_lidas = false) => api.get<Notificacao[]>('/notificacoes', { params: nao_lidas ? { nao_lidas: true } : undefined }),
  marcarLida: (id: number) => api.patch<Notificacao>(`/notificacoes/${id}/lida`),
};

// APIs de Cupons
export const cuponsApi = {
  meusCupons: () =>
    api.get<Cupom[]>('/cupons/meus'),
};

// APIs de Bandeiras
export const bandeirasApi = {
  listar: () =>
    api.get<Bandeira[]>('/cartoes/bandeiras'),
};

// APIs do Chatbot IA (RNF0044)
export const chatbotApi = {
  enviarMensagem: (mensagem: string) =>
    api.post<{ id_interacao: number; resposta: string; livros_recomendados: { id_livro: number; titulo: string; valor_venda: string }[] }>('/chatbot/mensagem', { mensagem }),
  listarHistorico: () =>
    api.get<InteracaoChatbot[]>('/chatbot/historico'),
  enviarFeedback: (idInteracao: number, feedback: 'UTIL' | 'NAO_UTIL') =>
    api.post<InteracaoChatbot>(`/chatbot/mensagem/${idInteracao}/feedback`, { feedback }),
  obterPerfil: () =>
    api.get<PerfilLeitura>('/chatbot/perfil-leitura'),
  obterRecomendacoes: () =>
    api.get<{ perfil: PerfilLeitura; recomendacoes: { id_recomendacao: number; id_livro: number; score: string; origem: string; livro: Livro }[] }>('/chatbot/recomendacoes'),
};

// APIs de Análise (admin)
export const analiseApi = {
  categorias: () =>
    api.get<{ id_categoria: number; nome: string }[]>('/analise/categorias'),
  vendasPorCategoria: (params: { data_inicio: string; data_fim: string; categorias: number[] }) =>
    api.get('/analise/vendas-por-categoria', { params }),
  kpis: () =>
    api.get<{ pedidos_hoje: number; receita_dia: number; novos_clientes: number; itens_em_transito: number }>('/analise/kpis'),
};

export default api;

