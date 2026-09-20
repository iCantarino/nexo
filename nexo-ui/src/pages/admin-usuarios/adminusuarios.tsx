import { useState, useEffect, useRef, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { clientesApi, funcionariosApi, enderecosAdminApi, cartoesAdminApi } from '../../services/api';
import styles from './AdminUsuarios.module.css';

interface Usuario {
  id: number;
  tipo: 'cliente' | 'funcionario';
  nome: string;
  email: string;
  cpf: string;
  perfil: string;
  ativo: boolean;
  data_cadastro: string;
}

interface EnderecoItem {
  id_endereco: number;
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

interface CartaoItem {
  id_cartao: number;
  id_bandeira: number;
  numero_cartao: string;
  nome_impresso: string;
  preferencial: boolean;
  bandeira?: { nome: string };
}

const formatarData = (data: string) => {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};
const mascaraCartao = (n: string) => !n ? '-' : 'Final ' + n.slice(-4);
const fmtCpf = (c: string) => !c ? '-' : c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

// RNF0031: valida senha forte
function validarSenhaForte(senha: string): string | null {
  if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres';
  if (!/(?=.*[a-z])/.test(senha)) return 'A senha deve conter pelo menos uma letra minúscula';
  if (!/(?=.*[A-Z])/.test(senha)) return 'A senha deve conter pelo menos uma letra maiúscula';
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(senha)) return 'A senha deve conter pelo menos um caractere especial (!@#$%^&* etc.)';
  return null;
}

const AdminUsuarios: FunctionComponent = () => {
  const { user } = useAuth();
  const [_menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuPerfilAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'endereco' | 'cartoes'>('geral');
  const [erro, setErro] = useState('');
  const [saving, setSaving] = useState(false);

  // Endereços e cartões para o cliente selecionado
  const [enderecos, setEnderecos] = useState<EnderecoItem[]>([]);
  const [cartoes, setCartoes] = useState<CartaoItem[]>([]);
  const [enderecoForm, setEnderecoForm] = useState({
    nome_identificador: '', tipo: 'ENTREGA' as 'ENTREGA' | 'COBRANCA' | 'AMBOS',
    tipo_residencia: '', tipo_logradouro: '', logradouro: '', numero: '',
    bairro: '', cep: '', cidade: '', estado: '', pais: 'Brasil', observacoes: '', padrao: false,
  });
  const [cartaoForm, setCartaoForm] = useState({
    id_bandeira: 1, numero_cartao: '', nome_impresso: '', codigo_seguranca: '', preferencial: false,
  });

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    dataNascimento: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'cliente' as 'cliente' | 'funcionario',
    perfil: 'ADMIN',
    ativo: true,
  });

  const carregarUsuarios = async () => {
    setCarregando(true);
    try {
      const [clientesRes, funcionariosRes] = await Promise.all([
        clientesApi.listar(),
        funcionariosApi.listar(),
      ]);
      const clientes: Usuario[] = clientesRes.data.map((c: any) => ({
        id: c.id_cliente, tipo: 'cliente' as const, nome: c.nome, email: c.email,
        cpf: c.cpf, perfil: 'Cliente', ativo: c.ativo, data_cadastro: c.data_cadastro,
      }));
      const funcionarios: Usuario[] = funcionariosRes.data.map((f: any) => ({
        id: f.id_funcionario, tipo: 'funcionario' as const, nome: f.nome, email: f.email,
        cpf: '-', perfil: f.perfil, ativo: f.ativo, data_cadastro: f.data_cadastro,
      }));
      setUsuarios([...clientes, ...funcionarios]);
    } catch (erro) { console.error('Erro ao carregar usuários:', erro);
    } finally { setCarregando(false); }
  };

  useEffect(() => { carregarUsuarios(); }, []);

  const carregarEnderecosCartoes = async (idCliente: number) => {
    try {
      const [er, cr] = await Promise.all([
        enderecosAdminApi.listar(idCliente), cartoesAdminApi.listar(idCliente),
      ]);
      setEnderecos(er.data); setCartoes(cr.data);
    } catch { setEnderecos([]); setCartoes([]); }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtroTipo !== 'todos' && u.tipo !== filtroTipo) return false;
    if (filtroStatus === 'ativo' && !u.ativo) return false;
    if (filtroStatus === 'inativo' && u.ativo) return false;
    if (busca) {
      const termo = busca.toLowerCase();
      return u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo) || u.cpf.toLowerCase().includes(termo);
    }
    return true;
  });

  const abrirModal = (usuario?: Usuario) => {
    setErro(''); setAbaAtiva('geral'); setEnderecos([]); setCartoes([]);
    if (usuario) {
      setUsuarioEditando(usuario);
      setFormData({
        nome: usuario.nome, email: usuario.email, cpf: usuario.cpf === '-' ? '' : usuario.cpf,
        telefone: '', dataNascimento: '', senha: '', confirmarSenha: '',
        tipo: usuario.tipo, perfil: usuario.perfil === 'Cliente' ? 'ADMIN' : usuario.perfil, ativo: usuario.ativo,
      });
      if (usuario.tipo === 'cliente') carregarEnderecosCartoes(usuario.id);
    } else {
      setUsuarioEditando(null);
      setFormData({ nome: '', email: '', cpf: '', telefone: '', dataNascimento: '', senha: '', confirmarSenha: '', tipo: 'cliente', perfil: 'ADMIN', ativo: true });
    }
    setModalAberto(true);
  };
const salvarUsuario = async () => {
    setErro('');
    if (formData.senha) {
      if (formData.senha !== formData.confirmarSenha) { setErro('As senhas não coincidem'); return; }
      const erroSenha = validarSenhaForte(formData.senha);
      if (erroSenha) { setErro(erroSenha); return; }
    } else if (!usuarioEditando) {
      setErro('A senha é obrigatória'); return;
    }
    setSaving(true);
    try {
      if (usuarioEditando) {
        if (usuarioEditando.tipo === 'cliente') {
          const updateData: any = { nome: formData.nome, email: formData.email, cpf: formData.cpf };
          if (formData.telefone) { const t = formData.telefone.replace(/\D/g, ''); updateData.telefone_ddd = t.substring(0, 2); updateData.telefone_numero = t.substring(2); }
          if (formData.senha) updateData.senha = formData.senha;
          await clientesApi.atualizar(usuarioEditando.id, updateData);
        } else {
          const updateData: any = { nome: formData.nome, email: formData.email };
          if (formData.senha) updateData.senha = formData.senha;
          if (formData.perfil) updateData.perfil = formData.perfil;
          await funcionariosApi.atualizar(usuarioEditando.id, updateData);
        }
      } else {
        if (formData.tipo === 'cliente') {
          const t = formData.telefone.replace(/\D/g, '');
          await clientesApi.criar({ nome: formData.nome, genero: 'Não informado', data_nascimento: formData.dataNascimento, cpf: formData.cpf, telefone_tipo: 'Celular', telefone_ddd: t.substring(0, 2), telefone_numero: t.substring(2), email: formData.email, senha: formData.senha });
        } else {
          await funcionariosApi.criar({ nome: formData.nome, email: formData.email, senha: formData.senha, perfil: formData.perfil as any, ativo: formData.ativo });
        }
      }
      setModalAberto(false); carregarUsuarios();
    } catch (error: any) {
      setErro(error.response?.data?.message || error.response?.data?.[0]?.message || 'Erro ao salvar usuário');
    } finally { setSaving(false); }
  };

  const inativarUsuario = async (usuario: Usuario) => {
    if (!window.confirm(`Inativar ${usuario.nome}?`)) return;
    try { await (usuario.tipo === 'cliente' ? clientesApi.inativar : funcionariosApi.inativar)(usuario.id); carregarUsuarios(); } catch { alert('Erro ao inativar'); }
  };
  const ativarUsuario = async (usuario: Usuario) => {
    try { await (usuario.tipo === 'cliente' ? clientesApi.ativar : funcionariosApi.ativar)(usuario.id); carregarUsuarios(); } catch { alert('Erro ao ativar'); }
  };
  const excluirUsuario = async (usuario: Usuario) => {
    if (!window.confirm(`Excluir permanentemente ${usuario.nome}?`)) return;
    try { await (usuario.tipo === 'cliente' ? clientesApi.excluir : funcionariosApi.excluir)(usuario.id); carregarUsuarios(); } catch { alert('Erro ao excluir'); }
  };

  const adicionarEndereco = async (e: React.FormEvent) => {
    e.preventDefault(); if (!usuarioEditando) return; setErro('');
    try {
      await enderecosAdminApi.criar(usuarioEditando.id, { ...enderecoForm, observacoes: enderecoForm.observacoes || null });
      setEnderecoForm({ nome_identificador: '', tipo: 'ENTREGA', tipo_residencia: '', tipo_logradouro: '', logradouro: '', numero: '', bairro: '', cep: '', cidade: '', estado: '', pais: 'Brasil', observacoes: '', padrao: false });
      carregarEnderecosCartoes(usuarioEditando.id);
    } catch (x: any) { setErro(x.response?.data?.message || 'Erro ao adicionar endereço'); }
  };

  const excluirEndereco = async (idEndereco: number) => {
    if (!usuarioEditando || !window.confirm('Remover este endereço?')) return;
    try { await enderecosAdminApi.excluir(usuarioEditando.id, idEndereco); carregarEnderecosCartoes(usuarioEditando.id); } catch { alert('Erro ao excluir endereço'); }
  };

  const adicionarCartao = async (e: React.FormEvent) => {
    e.preventDefault(); if (!usuarioEditando) return; setErro('');
    try {
      await cartoesAdminApi.criar(usuarioEditando.id, cartaoForm);
      setCartaoForm({ id_bandeira: 1, numero_cartao: '', nome_impresso: '', codigo_seguranca: '', preferencial: false });
      carregarEnderecosCartoes(usuarioEditando.id);
    } catch (x: any) { setErro(x.response?.data?.message || 'Erro ao adicionar cartão'); }
  };

  const excluirCartao = async (idCartao: number) => {
    if (!usuarioEditando || !window.confirm('Remover este cartão?')) return;
    try { await cartoesAdminApi.excluir(usuarioEditando.id, idCartao); carregarEnderecosCartoes(usuarioEditando.id); } catch { alert('Erro ao excluir cartão'); }
  };
const inputS: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px',
    fontSize: '13px', boxSizing: 'border-box', background: '#fff', color: '#0f172a', outline: 'none',
  };

  return (
    <div className={styles.adminUsuarios}>
      {/* Sidebar */}
      <div className={styles.frame}>
        <Link to="/admin-dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.frame2}>
            <b className={styles.nexo}>Nexo</b><div className={styles.rectangle} /><div className={styles.frame3}>v0.7</div>
          </div>
        </Link>
        <div className={styles.frame4}>
          <Link to="/admin-dashboard" className={styles.frame5} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.frame6}><img className={styles.vectorIcon} alt="" src="/images/icons/layout-dashboard.svg" /></div>
            <div className={styles.dashboard}>Dashboard</div>
          </Link>
          <div className={styles.frame7}>
            <div className={styles.frame6}><img className={styles.vectorIcon} alt="" src="/images/icons/users.svg" /></div>
            <div className={styles.clientes}>Usuários</div>
          </div>
          <Link to="/admin-gerenciamento" className={styles.frame5} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.frame6}><img className={styles.vectorIcon} alt="" src="/images/icons/package.svg" /></div>
            <div className={styles.dashboard}>Pedidos</div>
          </Link>
          <Link to="/admin-trocas" className={styles.frame5} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.frame6}><img className={styles.vectorIcon} alt="" src="/images/icons/repeat.svg" /></div>
            <div className={styles.dashboard}>Trocas</div>
          </Link>
          <Link to="/admin-analise" className={styles.frame5} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.frame6}><img className={styles.vectorIcon} alt="" src="/images/icons/bar-chart.svg" /></div>
            <div className={styles.dashboard}>Análise</div>
          </Link>
        </div>
        <div className={styles.frame15}>
          <div className={styles.line} />
          <div className={styles.frame16}>
            <div className={styles.frame17}><img className={styles.vectorIcon} alt="" src="/images/icons/user-round.svg" /></div>
            <div className={styles.frame18}>
              <div className={styles.arthurSchopenhauer}>{user?.nome || 'Admin'}</div>
              <div className={styles.curadorMaster}>{user?.perfil || 'ADMIN'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 48px', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '28px', fontFamily: 'Newsreader', fontWeight: 700, color: '#0f172a' }}>Gestão de Usuários</div>
            <div style={{ fontSize: '13px', color: '#475569', fontFamily: 'Inter', marginTop: '4px' }}>{usuarios.length} usuários cadastrados</div>
          </div>
          <div onClick={() => abrirModal()} style={{ cursor: 'pointer', borderRadius: '6px', background: '#0f172a', display: 'flex', alignItems: 'center', padding: '10px 16px', gap: '8px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
            <span style={{ fontSize: '16px' }}>+</span><span>Cadastrar Novo Usuário</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', background: '#fff', color: '#475569' }}>
            <option value="todos">Todos os tipos</option><option value="cliente">Clientes</option><option value="funcionario">Administradores</option>
          </select>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', background: '#fff', color: '#475569' }}>
            <option value="todos">Todos os status</option><option value="ativo">Ativos</option><option value="inativo">Inativos</option>
          </select>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, email ou CPF..." style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' }} />
        </div>
{/* Table */}
        {carregando ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Carregando...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Nome</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>CPF</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Tipo</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Perfil</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Cadastro</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u.tipo + '-' + u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{u.nome}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{fmtCpf(u.cpf)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: u.tipo === 'cliente' ? '#e0f2fe' : '#fef3c7', color: u.tipo === 'cliente' ? '#0369a1' : '#d97706' }}>
                        {u.tipo === 'cliente' ? 'Cliente' : 'Admin'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{u.perfil}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: u.ativo ? '#dcfce7' : '#fee2e2', color: u.ativo ? '#15803d' : '#b91c1c' }}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{formatarData(u.data_cadastro)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <span onClick={() => abrirModal(u)} title="Editar" style={{ cursor: 'pointer', color: '#d97706', fontSize: '16px' }}>✏️</span>
                        {u.ativo ? (<span onClick={() => inativarUsuario(u)} title="Inativar" style={{ cursor: 'pointer', color: '#b91c1c', fontSize: '16px' }}>⛔</span>) : (<span onClick={() => ativarUsuario(u)} title="Ativar" style={{ cursor: 'pointer', color: '#15803d', fontSize: '16px' }}>✅</span>)}
                        <span onClick={() => excluirUsuario(u)} title="Excluir" style={{ cursor: 'pointer', color: '#b91c1c', fontSize: '16px' }}>🗑️</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuariosFiltrados.length === 0 && (<tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Nenhum usuário encontrado</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
{/* MODAL */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className={styles.modalContainer} style={{ width: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className={styles.modalHeader}>
              <div className={styles.nexo}>{usuarioEditando ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</div>
              <div className={styles.insiraAsInformaes}>Preencha os dados do usuário</div>
            </div>

            {/* Abas (só para clientes) */}
            {usuarioEditando?.tipo === 'cliente' && (
              <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #e2e8f0', marginBottom: '16px' }}>
                {(['geral', 'endereco', 'cartoes'] as const).map((aba) => (
                  <div key={aba} onClick={() => { setAbaAtiva(aba); setErro(''); }} style={{
                    cursor: 'pointer', padding: '10px 20px', fontSize: '13px', fontWeight: 600,
                    color: abaAtiva === aba ? '#d97706' : '#94a3b8',
                    borderBottom: abaAtiva === aba ? '2px solid #d97706' : '2px solid transparent',
                    marginBottom: '-2px',
                  }}>{aba === 'geral' ? 'Geral' : aba === 'endereco' ? 'Endereços' : 'Cartões'}</div>
                ))}
              </div>
            )}

            {erro && <div style={{ color: '#e94560', fontSize: '0.875rem', marginBottom: '1rem', padding: '8px 12px', background: '#fef2f2', borderRadius: '6px' }}>{erro}</div>}
{/* ABA GERAL */}
            {(abaAtiva === 'geral' || usuarioEditando?.tipo !== 'cliente') && (
              <div className={styles.frame87}>
                <div className={styles.frame92}>
                  <div className={styles.frame93}>
                    <div className={styles.cadastrarNovoUsurio}>Nome Completo</div>
                    <div className={styles.frame89}><input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Nome completo" style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: '#0f172a' }} required /></div>
                  </div>
                  <div className={styles.frame93}>
                    <div className={styles.cadastrarNovoUsurio}>E-mail</div>
                    <div className={styles.frame89}><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemplo.com" style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: '#0f172a' }} required /></div>
                  </div>
                </div>
                {formData.tipo === 'cliente' && (
                  <div className={styles.frame92}>
                    <div className={styles.frame93}>
                      <div className={styles.cadastrarNovoUsurio}>CPF</div>
                      <div className={styles.frame89}><input type="text" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: '#0f172a' }} required /></div>
                    </div>
                    <div className={styles.frame93}>
                      <div className={styles.cadastrarNovoUsurio}>Telefone</div>
                      <div className={styles.frame89}><input type="tel" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} placeholder="(11) 98888-0000" style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: '#0f172a' }} /></div>
                    </div>
                  </div>
                )}
                {formData.tipo === 'cliente' && (
                  <div className={styles.frame88}>
                    <div className={styles.cadastrarNovoUsurio}>Data de Nascimento</div>
                    <div className={styles.frame89}><input type="date" value={formData.dataNascimento} onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })} style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: '#0f172a' }} /></div>
                  </div>
                )}
                <div className={styles.frame102}>
                  <div className={styles.cadastrarNovoUsurio}>Tipo de Usuário</div>
                  <div className={styles.frame103}>
                    <div className={styles.frame104} onClick={() => !usuarioEditando && setFormData({ ...formData, tipo: 'cliente' })} style={{ cursor: usuarioEditando ? 'default' : 'pointer' }}>
                      <div className={styles.frame105}>{formData.tipo === 'cliente' && <div className={styles.ellipse} />}</div>
                      <div className={styles.nexo}>Cliente</div>
                    </div>
                    <div className={styles.frame104} onClick={() => !usuarioEditando && setFormData({ ...formData, tipo: 'funcionario' })} style={{ cursor: usuarioEditando ? 'default' : 'pointer' }}>
                      <div className={formData.tipo === 'funcionario' ? styles.frame105 : styles.frame107}>{formData.tipo === 'funcionario' && <div className={styles.ellipse} />}</div>
                      <div className={styles.nexo}>Administrador</div>
                    </div>
                  </div>
                </div>
{formData.tipo === 'funcionario' && (
                  <div className={styles.frame88}>
                    <div className={styles.cadastrarNovoUsurio}>Perfil</div>
                    <select value={formData.perfil} onChange={(e) => setFormData({ ...formData, perfil: e.target.value })} className={styles.frame89} style={{ border: '1px solid #e2e8f0', width: '100%' }}>
                      <option value="ADMIN">ADMIN</option><option value="GERENTE_VENDAS">GERENTE_VENDAS</option>
                      <option value="ESTOQUISTA">ESTOQUISTA</option><option value="ATENDENTE">ATENDENTE</option>
                    </select>
                  </div>
                )}
                <div className={styles.frame25}>
                  <div className={styles.cadastrarNovoUsurio}>Status do Usuário (Ativo)</div>
                  <div className={styles.frame109} onClick={() => setFormData({ ...formData, ativo: !formData.ativo })} style={{ cursor: 'pointer', backgroundColor: formData.ativo ? '#15803d' : '#94a3b8', justifyContent: formData.ativo ? 'flex-end' : 'flex-start' }}>
                    <div className={styles.ellipse2} />
                  </div>
                </div>
                {/* RNF0032: Senha + Confirmar Senha */}
                <div className={styles.frame92}>
                  <div className={styles.frame93}>
                    <div className={styles.cadastrarNovoUsurio}>{usuarioEditando ? 'Nova Senha (opcional)' : 'Senha'}</div>
                    <div className={styles.frame89}>
                      <input type="password" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} placeholder={usuarioEditando ? '********' : 'Mín. 8 chars, maiúsc., minúsc., especial'} style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: '#0f172a' }} />
                    </div>
                  </div>
                  <div className={styles.frame93}>
                    <div className={styles.cadastrarNovoUsurio}>Confirmar Senha</div>
                    <div className={styles.frame89}>
                      <input type="password" value={formData.confirmarSenha} onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })} placeholder="Repita a senha" style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: '#0f172a' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
{/* ABA ENDEREÇO */}
            {abaAtiva === 'endereco' && usuarioEditando?.tipo === 'cliente' && (
              <div>
                {enderecos.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Endereços Cadastrados</div>
                    {enderecos.map((end) => (
                      <div key={end.id_endereco} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
                        <div>
                          <strong>{end.nome_identificador}</strong> {end.tipo === 'ENTREGA' ? '📦' : end.tipo === 'COBRANCA' ? '💰' : '📦💰'}
                          {end.padrao && <span style={{ marginLeft: '6px', padding: '1px 6px', borderRadius: '3px', background: '#d97706', color: '#fff', fontSize: '10px' }}>Padrão</span>}
                          <div style={{ color: '#475569' }}>{end.tipo_logradouro} {end.logradouro}, {end.numero} - {end.bairro}, {end.cidade}/{end.estado} - CEP: {end.cep}</div>
                        </div>
                        <span onClick={() => excluirEndereco(end.id_endereco)} style={{ cursor: 'pointer', color: '#b91c1c', fontSize: '14px' }}>🗑️</span>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={adicionarEndereco}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Adicionar Endereço</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input value={enderecoForm.nome_identificador} onChange={(e) => setEnderecoForm({ ...enderecoForm, nome_identificador: e.target.value })} placeholder="Nome (ex: Casa)" required style={inputS} />
                    <select value={enderecoForm.tipo} onChange={(e) => setEnderecoForm({ ...enderecoForm, tipo: e.target.value as any })} style={inputS}>
                      <option value="ENTREGA">Entrega</option><option value="COBRANCA">Cobrança</option><option value="AMBOS">Ambos</option>
                    </select>
                    <input value={enderecoForm.tipo_residencia} onChange={(e) => setEnderecoForm({ ...enderecoForm, tipo_residencia: e.target.value })} placeholder="Tipo residência (Casa/Ap)" required style={inputS} />
                    <input value={enderecoForm.tipo_logradouro} onChange={(e) => setEnderecoForm({ ...enderecoForm, tipo_logradouro: e.target.value })} placeholder="Tipo logradouro (Rua/Av)" required style={inputS} />
                    <input value={enderecoForm.logradouro} onChange={(e) => setEnderecoForm({ ...enderecoForm, logradouro: e.target.value })} placeholder="Logradouro" required style={{ ...inputS, gridColumn: 'span 2' }} />
                    <input value={enderecoForm.numero} onChange={(e) => setEnderecoForm({ ...enderecoForm, numero: e.target.value })} placeholder="Número" required style={inputS} />
                    <input value={enderecoForm.bairro} onChange={(e) => setEnderecoForm({ ...enderecoForm, bairro: e.target.value })} placeholder="Bairro" required style={inputS} />
                    <input value={enderecoForm.cep} onChange={(e) => setEnderecoForm({ ...enderecoForm, cep: e.target.value })} placeholder="CEP" required style={inputS} />
                    <input value={enderecoForm.cidade} onChange={(e) => setEnderecoForm({ ...enderecoForm, cidade: e.target.value })} placeholder="Cidade" required style={inputS} />
                    <input value={enderecoForm.estado} onChange={(e) => setEnderecoForm({ ...enderecoForm, estado: e.target.value })} placeholder="Estado (SP)" required style={inputS} />
                    <input value={enderecoForm.pais} onChange={(e) => setEnderecoForm({ ...enderecoForm, pais: e.target.value })} placeholder="País" required style={inputS} />
                    <input value={enderecoForm.observacoes} onChange={(e) => setEnderecoForm({ ...enderecoForm, observacoes: e.target.value })} placeholder="Observações (opcional)" style={inputS} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginTop: '8px' }}>
                    <input type="checkbox" checked={enderecoForm.padrao} onChange={(e) => setEnderecoForm({ ...enderecoForm, padrao: e.target.checked })} /> Endereço padrão
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button type="submit" disabled={saving} style={{ cursor: saving ? 'not-allowed' : 'pointer', padding: '8px 16px', borderRadius: '6px', background: '#0f172a', color: '#fff', fontSize: '13px', border: 'none', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Salvando...' : 'Adicionar Endereço'}
                    </button>
                  </div>
                </form>
              </div>
            )}
{/* ABA CARTÕES */}
            {abaAtiva === 'cartoes' && usuarioEditando?.tipo === 'cliente' && (
              <div>
                {cartoes.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Cartões Cadastrados</div>
                    {cartoes.map((c) => (
                      <div key={c.id_cartao} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
                        <div>
                          <strong>{c.bandeira?.nome || 'Cartão'}</strong> - {mascaraCartao(c.numero_cartao)}
                          {c.preferencial && <span style={{ marginLeft: '6px', padding: '1px 6px', borderRadius: '3px', background: '#d97706', color: '#fff', fontSize: '10px' }}>Preferencial</span>}
                        </div>
                        <span onClick={() => excluirCartao(c.id_cartao)} style={{ cursor: 'pointer', color: '#b91c1c', fontSize: '14px' }}>🗑️</span>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={adicionarCartao}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Adicionar Cartão</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <select value={cartaoForm.id_bandeira} onChange={(e) => setCartaoForm({ ...cartaoForm, id_bandeira: Number(e.target.value) })} style={inputS}>
                      <option value={1}>Visa</option><option value={2}>Mastercard</option><option value={3}>Amex</option>
                    </select>
                    <input value={cartaoForm.numero_cartao} onChange={(e) => setCartaoForm({ ...cartaoForm, numero_cartao: e.target.value })} placeholder="Número do cartão" required style={inputS} />
                    <input value={cartaoForm.nome_impresso} onChange={(e) => setCartaoForm({ ...cartaoForm, nome_impresso: e.target.value })} placeholder="Nome impresso" required style={inputS} />
                    <input value={cartaoForm.codigo_seguranca} onChange={(e) => setCartaoForm({ ...cartaoForm, codigo_seguranca: e.target.value })} placeholder="CVV" maxLength={4} required style={inputS} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginTop: '8px' }}>
                    <input type="checkbox" checked={cartaoForm.preferencial} onChange={(e) => setCartaoForm({ ...cartaoForm, preferencial: e.target.checked })} /> Preferencial
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button type="submit" disabled={saving} style={{ cursor: saving ? 'not-allowed' : 'pointer', padding: '8px 16px', borderRadius: '6px', background: '#0f172a', color: '#fff', fontSize: '13px', border: 'none', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Salvando...' : 'Adicionar Cartão'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Modal footer */}
            <div className={styles.line} style={{ marginTop: '16px' }} />
            <div className={styles.frame110}>
              <div className={styles.frame111} onClick={() => setModalAberto(false)} style={{ cursor: 'pointer' }}>
                <div className={styles.cadastrarNovoUsurio}>Cancelar</div>
              </div>
              {abaAtiva === 'geral' && (
                <div className={styles.frame112} onClick={salvarUsuario} style={{ cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  <div className={styles.cadastrarNovoUsurio}>{saving ? 'Salvando...' : 'Salvar Usuário'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
