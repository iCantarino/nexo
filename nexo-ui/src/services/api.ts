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
  
  ativar: (id: number) =>
    api.patch(`/clientes/${id}/ativar`),
  
  excluir: (id: number) =>
    api.delete(`/clientes/${id}`),
  
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
  
  excluir: (id: number) =>
    api.delete(`/funcionarios/${id}`),
};

// APIs de Endereços
export const enderecosApi = {
  listar: () => api.get<Endereco[]>('/enderecos'),
  criar: (data: any) =>
    api.post<Endereco>('/enderecos', data),
};

// APIs de Cartões de Crédito
export const cartoesApi = {
  listar: () => api.get<CartaoCredito[]>('/cartoes'),
  criar: (data: any) =>
    api.post<CartaoCredito>('/cartoes', data),
};

export default api;

