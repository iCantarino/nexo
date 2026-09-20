import { useState, useEffect, useRef, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { clientesApi, funcionariosApi } from '../../services/api';
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

const formatarData = (data: string) => {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AdminUsuarios: FunctionComponent = () => {
  	const { user, logout } = useAuth();
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
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

  	const [formData, setFormData] = useState({
  		nome: '',
  		email: '',
  		cpf: '',
  		telefone: '',
  		dataNascimento: '',
  		senha: '',
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
  				id: c.id_cliente,
  				tipo: 'cliente' as const,
  				nome: c.nome,
  				email: c.email,
  				cpf: c.cpf,
  				perfil: 'Cliente',
  				ativo: c.ativo,
  				data_cadastro: c.data_cadastro,
  			}));

  			const funcionarios: Usuario[] = funcionariosRes.data.map((f: any) => ({
  				id: f.id_funcionario,
  				tipo: 'funcionario' as const,
  				nome: f.nome,
  				email: f.email,
  				cpf: '-',
  				perfil: f.perfil,
  				ativo: f.ativo,
  				data_cadastro: f.data_cadastro,
  			}));

  			setUsuarios([...clientes, ...funcionarios]);
  		} catch (erro) {
  			console.error('Erro ao carregar usuários:', erro);
  		} finally {
  			setCarregando(false);
  		}
  	};

  	useEffect(() => {
  		carregarUsuarios();
  	}, []);

  	const usuariosFiltrados = usuarios.filter((u) => {
  		if (filtroTipo !== 'todos' && u.tipo !== filtroTipo) return false;
  		if (filtroStatus === 'ativo' && !u.ativo) return false;
  		if (filtroStatus === 'inativo' && u.ativo) return false;
  		if (busca) {
  			const termo = busca.toLowerCase();
  			
  				return (u.nome.toLowerCase().includes(termo) ||
  				u.email.toLowerCase().includes(termo) ||
  				u.cpf.toLowerCase().includes(termo)
  			);
  		}
  		return true;
  	});

  	const abrirModalCriar = () => {
  		setUsuarioEditando(null);
  		setFormData({
  			nome: '',
  			email: '',
  			cpf: '',
  			telefone: '',
  			dataNascimento: '',
  			senha: '',
  			tipo: 'cliente',
  			perfil: 'ADMIN',
  			ativo: true,
  		});
  		setModalAberto(true);
  	};

  	const abrirModalEditar = (usuario: Usuario) => {
  		setUsuarioEditando(usuario);
  		setFormData({
  			nome: usuario.nome,
  			email: usuario.email,
  			cpf: usuario.cpf,
  			telefone: '',
  			dataNascimento: '',
  			senha: '',
  			tipo: usuario.tipo,
  			perfil: usuario.tipo === 'funcionario' ? usuario.perfil : 'ADMIN',
  			ativo: usuario.ativo,
  		});
  		setModalAberto(true);
  	};

  	const salvarUsuario = async () => {
  		try {
  			if (usuarioEditando) {
  				if (usuarioEditando.tipo === 'cliente') {
  					await clientesApi.atualizar(usuarioEditando.id, {
  						nome: formData.nome,
  						email: formData.email,
  					});
  				} else {
  					await funcionariosApi.atualizar(usuarioEditando.id, {
  						nome: formData.nome,
  						email: formData.email,
  						perfil: formData.perfil as any,
  						ativo: formData.ativo,
  					});
  				}
  			} else if (formData.tipo === 'cliente') {
  				const telefoneLimpo = formData.telefone.replace(/\D/g, '');
  				await clientesApi.criar({
  					nome: formData.nome,
  					genero: 'Não informado',
  					data_nascimento: formData.dataNascimento,
  					cpf: formData.cpf,
  					telefone_tipo: 'Celular',
  					telefone_ddd: telefoneLimpo.substring(0, 2),
  					telefone_numero: telefoneLimpo.substring(2),
  					email: formData.email,
  					senha: formData.senha || 'SenhaTemp123!',
  				});
  			} else {
  				await funcionariosApi.criar({
  					nome: formData.nome,
  					email: formData.email,
  					senha: formData.senha || 'SenhaTemp123!',
  					perfil: formData.perfil as any,
  					ativo: formData.ativo,
  				});
  			}
  			setModalAberto(false);
  			carregarUsuarios();
  		} catch (erro: any) {
  			alert(erro.response?.data?.message || erro.response?.data?.detail || 'Erro ao salvar usuário');
  		}
  	};

  	const inativarUsuario = async (usuario: Usuario) => {
  		if (!confirm(`Inativar o usuário ${usuario.nome}?`)) return;
  		try {
  			if (usuario.tipo === 'cliente') {
  				await clientesApi.inativar(usuario.id);
  			} else {
  				await funcionariosApi.inativar(usuario.id);
  			}
  			carregarUsuarios();
  		} catch (erro) {
  			alert('Erro ao inativar usuário');
  		}
  	};

  	const ativarUsuario = async (usuario: Usuario) => {
  		try {
  			if (usuario.tipo === 'funcionario') {
				await funcionariosApi.ativar(usuario.id);
			} else {
				await clientesApi.ativar(usuario.id);
			}
			carregarUsuarios()
  		} catch (erro) {
  			alert('Erro ao ativar usuário');
  		}
  	};

  	const excluirUsuario = async (usuario: Usuario) => {
  		if (!confirm(`Excluir permanentemente o usuário ${usuario.nome}? Essa ação não pode ser desfeita.`)) return;
  		try {
  			if (usuario.tipo === 'cliente') {
  				await clientesApi.excluir(usuario.id);
  			} else {
  				await funcionariosApi.excluir(usuario.id);
  			}
  			carregarUsuarios();
  		} catch (erro) {
  			alert('Erro ao excluir usuário');
  		}
  	};

  	return (
    		<div className={styles.adminUsuarios}>
      			<div className={styles.frame}>
        				<div className={styles.frame2}>
          					<b className={styles.nexo}>Nexo</b>
          					<div className={styles.rectangle} />
          					<div className={styles.frame3}>
            						<b className={styles.nexo}>ADMIN</b>
          					</div>
        				</div>
        				<div className={styles.frame4}>
          					<Link to="/admin-dashboard" className={styles.frame5}>
            						<div className={styles.frame6}>
              							<img src="/images/icons/layout-grid.svg" className={styles.vectorIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Dashboard</div>
          					</Link>
          					<Link to="/admin-usuarios" className={styles.frame7}>
            						<div className={styles.frame6}>
              							<img src="/images/icons/users.svg" className={styles.vectorIcon} alt="" />
            						</div>
            						<div className={styles.clientes}>Clientes</div>
          					</Link>
          					<Link to="/admin-pedidos" className={styles.frame5}>
            						<div className={styles.frame6}>
              							<img src="/images/icons/shopping-bag.svg" className={styles.vectorIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Pedidos</div>
          					</Link>
          					<Link to="/admin-trocas" className={styles.frame5}>
            						<div className={styles.frame6}>
              							<img src="/images/icons/arrow-right-left.svg" className={styles.vectorIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Trocas</div>
          					</Link>
          					<Link to="/admin-analise" className={styles.frame5}>
            						<div className={styles.frame6}>
              							<img src="/images/icons/chart-line.svg" className={styles.vectorIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Análises</div>
          					</Link>
        				</div>
        												<div className={styles.frame15}>
					<div className={styles.frame16} onClick={() => setMenuPerfilAberto(!menuPerfilAberto)} style={{ cursor: 'pointer', position: 'relative' }} ref={menuRef}>
						<div className={styles.frame17}>
							<b className={styles.nexo}>{typeof (user as any)?.nome === 'string' ? (user as any)?.nome?.charAt(0).toUpperCase() : 'A'}</b>
						</div>
						<div className={styles.frame18}>
							<div className={styles.arthurSchopenhauer}>{(user as any)?.nome || 'Administrador'}</div>
							<div className={styles.curadorMaster}>{(user as any)?.perfil || 'ADMIN'}</div>
						</div>
						{menuPerfilAberto && (
							<div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', zIndex: 50, boxShadow: '0 -4px 6px rgba(0,0,0,0.1)' }}>
								<div onClick={logout} style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', color: '#ef4444', fontWeight: 500 }}>
									Sair
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
<div className={styles.frame19}>
        				<div className={styles.frame20}>
          					<div className={styles.frame21}>
            						<b className={styles.nexo}>Gestão de Usuários</b>
            						<div className={styles.cadastroEdioE}>Cadastro, edição e controle de acesso de clientes e administradores.</div>
          					</div>
          					<div className={styles.frame22} onClick={abrirModalCriar} style={{ cursor: 'pointer' }}>
            						<div className={styles.cadastrarNovoUsurio}>+ Cadastrar Novo Usuário</div>
          					</div>
        				</div>
        				<div className={styles.frame23}>
          					<div className={styles.frame24}>
            						<div className={styles.frame25}>
              							<div className={styles.frame26}>
                								<div className={styles.frame27}>
                  									<select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className={styles.tipoTodos} style={{ border: "none", background: "transparent", outline: "none" }}><option value="todos">Tipo: Todos</option><option value="cliente">Cliente</option><option value="funcionario">Funcionário</option></select>
                								</div>
                								<div className={styles.frame27}>
                  									<select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className={styles.tipoTodos} style={{ border: "none", background: "transparent", outline: "none" }}><option value="todos">Status: Todos</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select>
                								</div>
              							</div>
              							<div className={styles.frame29}>
                								<img className={styles.vectorIcon6} alt="" />
                								<input type="text" placeholder="Buscar por nome, e-mail, CPF..." value={busca} onChange={(e) => setBusca(e.target.value)} className={styles.nexo} style={{ border: "none", background: "transparent", outline: "none", width: "100%" }} />
              							</div>
            						</div>
            						<div className={styles.frame30}>
              							<div className={styles.frame31}>
                								<b className={styles.nome}>NOME</b>
                								<b className={styles.eMail}>E-MAIL</b>
                								<b className={styles.cpf}>CPF</b>
                								<b className={styles.tipo}>TIPO</b>
                								<b className={styles.status}>STATUS</b>
                								<b className={styles.cadastro}>CADASTRO</b>
                								<b className={styles.cadastro}>ATIVIDADE</b>
                								<b className={styles.aes}>AÇÕES</b>
              							</div>
              <div className={styles.frame32}>
                {carregando ? (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>
                ) : usuariosFiltrados.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>Nenhum usuário encontrado.</div>
                ) : usuariosFiltrados.map((usuario) => (
                  <div className={styles.frame33} key={`${usuario.tipo}-${usuario.id}`}>
                    <div className={styles.marianaLLima}>{usuario.nome}</div>
                    <div className={styles.marianalimacuriouscom}>{usuario.email}</div>
                    <div className={styles.cpf}>{usuario.cpf}</div>
                    <div className={usuario.tipo === 'cliente' ? styles.frame34 : styles.frame52}>
                      <div className={usuario.tipo === 'cliente' ? styles.frame35 : styles.frame53}>
                        <b className={styles.nexo}>{usuario.tipo === 'cliente' ? 'Cliente' : usuario.perfil}</b>
                      </div>
                    </div>
                    <div className={usuario.ativo ? styles.frame36 : styles.frame63}>
                      <div className={usuario.ativo ? styles.frame37 : styles.frame35}>
                        <b className={styles.nexo}>{usuario.ativo ? 'Ativo' : 'Inativo'}</b>
                      </div>
                    </div>
                    <div className={styles.cadastro}>{formatarData(usuario.data_cadastro)}</div>
                    <div className={styles.cadastro}>-</div>
                    <div className={styles.frame38}>
                      <div className={styles.frame39} onClick={() => abrirModalEditar(usuario)} style={{ cursor: 'pointer' }} title="Editar">
                        <img src="/images/icons/pencil.svg" className={styles.vectorIcon} alt="Editar" />
                      </div>
                      <div className={styles.frame40} onClick={() => (usuario.ativo ? inativarUsuario(usuario) : ativarUsuario(usuario))} style={{ cursor: 'pointer' }} title={usuario.ativo ? 'Inativar' : 'Ativar'}>
                        <img src="/images/icons/ban.svg" className={styles.vectorIcon} alt="Inativar" />
                      </div>
                      <div className={styles.frame41} onClick={() => excluirUsuario(usuario)} style={{ cursor: 'pointer' }} title="Excluir">
                        <img src="/images/icons/trash.svg" className={styles.vectorIcon} alt="Excluir" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {modalAberto && (
        <div className={styles.modalBackdrop} onClick={() => setModalAberto(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <b className={styles.nexo}>{usuarioEditando ? "Editar Usuário" : "Cadastrar Novo Usuário"}</b>
              <div className={styles.insiraAsInformaes}>Insira as informações do perfil abaixo.</div>
            </div>
            <div className={styles.line} />
            <div className={styles.frame87}>
              <div className={styles.frame88}>
                <div className={styles.cadastrarNovoUsurio}>Nome Completo</div>
                <div className={styles.frame89}>
                  <input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Nome completo" style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
                </div>
              </div>
              <div className={styles.frame88}>
                <div className={styles.cadastrarNovoUsurio}>E-mail</div>
                <div className={styles.frame89}>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@nexo.com" style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
                </div>
              </div>
              {formData.tipo === "cliente" && (
                <div className={styles.frame92}>
                  <div className={styles.frame93}>
                    <div className={styles.cadastrarNovoUsurio}>CPF</div>
                    <div className={styles.frame89}>
                      <input value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" disabled={!!usuarioEditando} style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
                    </div>
                  </div>
                  <div className={styles.frame93}>
                    <div className={styles.cadastrarNovoUsurio}>Telefone</div>
                    <div className={styles.frame89}>
                      <input value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} placeholder="(11) 98888-0000" disabled={!!usuarioEditando} style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
                    </div>
                  </div>
                </div>
              )}
              {formData.tipo === "cliente" && !usuarioEditando && (
                <div className={styles.frame92}>
                  <div className={styles.frame93}>
                    <div className={styles.cadastrarNovoUsurio}>Data de Nascimento</div>
                    <div className={styles.frame89}>
                      <input type="date" value={formData.dataNascimento} onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })} style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
                    </div>
                  </div>
                  <div className={styles.frame93}>
                    <div className={styles.cadastrarNovoUsurio}>Senha Temporária</div>
                    <div className={styles.frame89}>
                      <input type="password" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} placeholder="********" style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
                    </div>
                  </div>
                </div>
              )}
              {formData.tipo === "funcionario" && !usuarioEditando && (
                <div className={styles.frame88}>
                  <div className={styles.cadastrarNovoUsurio}>Senha Temporária</div>
                  <div className={styles.frame89}>
                    <input type="password" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} placeholder="********" style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
                  </div>
                </div>
              )}
              <div className={styles.frame102}>
                <div className={styles.cadastrarNovoUsurio}>Tipo de Usuário</div>
                <div className={styles.frame103}>
                  <div className={styles.frame104} onClick={() => !usuarioEditando && setFormData({ ...formData, tipo: "cliente" })} style={{ cursor: usuarioEditando ? "default" : "pointer" }}>
                    <div className={styles.frame105}>
                      {formData.tipo === "cliente" && <div className={styles.ellipse} />}
                    </div>
                    <div className={styles.nexo}>Cliente</div>
                  </div>
                  <div className={styles.frame104} onClick={() => !usuarioEditando && setFormData({ ...formData, tipo: "funcionario" })} style={{ cursor: usuarioEditando ? "default" : "pointer" }}>
                    <div className={formData.tipo === "funcionario" ? styles.frame105 : styles.frame107}>
                      {formData.tipo === "funcionario" && <div className={styles.ellipse} />}
                    </div>
                    <div className={styles.nexo}>Administrador</div>
                  </div>
                </div>
              </div>
              {formData.tipo === "funcionario" && (
                <div className={styles.frame88}>
                  <div className={styles.cadastrarNovoUsurio}>Perfil</div>
                  <select value={formData.perfil} onChange={(e) => setFormData({ ...formData, perfil: e.target.value })} className={styles.frame89} style={{ border: "1px solid #e2e8f0", width: "100%" }}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="GERENTE_VENDAS">GERENTE_VENDAS</option>
                    <option value="ESTOQUISTA">ESTOQUISTA</option>
                    <option value="ATENDENTE">ATENDENTE</option>
                  </select>
                </div>
              )}
              <div className={styles.frame25}>
                <div className={styles.cadastrarNovoUsurio}>Status do Usuário (Ativo)</div>
                <div className={styles.frame109} onClick={() => setFormData({ ...formData, ativo: !formData.ativo })} style={{ cursor: "pointer", backgroundColor: formData.ativo ? "#15803d" : "#94a3b8", justifyContent: formData.ativo ? "flex-end" : "flex-start" }}>
                  <div className={styles.ellipse2} />
                </div>
              </div>
              {usuarioEditando && (
                <div className={styles.frame88}>
                  <div className={styles.cadastrarNovoUsurio}>Nova Senha (opcional)</div>
                  <div className={styles.frame89}>
                    <input type="password" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} placeholder="********" style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
                  </div>
                </div>
              )}
            </div>
            <div className={styles.line} />
            <div className={styles.frame110}>
              <div className={styles.frame111} onClick={() => setModalAberto(false)} style={{ cursor: "pointer" }}>
                <div className={styles.cadastrarNovoUsurio}>Cancelar</div>
              </div>
              <div className={styles.frame112} onClick={salvarUsuario} style={{ cursor: "pointer" }}>
                <div className={styles.cadastrarNovoUsurio}>Salvar Usuário</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>);
};

export default AdminUsuarios;













