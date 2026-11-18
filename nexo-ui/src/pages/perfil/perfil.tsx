import { useState, useEffect, type FunctionComponent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { clientesApi, enderecosApi, cartoesApi } from '../../services/api';
import type { Cliente, Endereco, CartaoCredito } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import styles from './Profile.module.css';

const CATEGORIAS_PREFERENCIAS = [
  'Ficção Científica',
  'Fantasia',
  'Romance',
  'Thriller',
  'História',
  'Biografia',
  'Autoajuda',
  'Negócios',
  'Poesia',
  'Terror',
  'Infantil',
  'HQs e Mangás',
];

const Profile: FunctionComponent = () => {
  const { logout } = useAuth();
  const [senhaMenuAberto, setSenhaMenuAberto] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [preferencias, setPreferencias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEnd, setModalEnd] = useState(false);
  const [modalCart, setModalCart] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone_ddd: '',
    telefone_numero: '',
    data_nascimento: '',
    genero: '',
  });
  const [pwForm, setPwForm] = useState({ atual: '', nova: '', confirmar: '' });

  const loadData = async () => {
    try {
      const [cr, er, cr2, pr] = await Promise.all([
        clientesApi.meuPerfil(),
        enderecosApi.listar(),
        cartoesApi.listar(),
        clientesApi.listarPreferencias().catch(() => ({ data: [] })),
      ]);
      setCliente(cr.data);
      setEnderecos(er.data);
      setCartoes(cr2.data);
      setPreferencias(pr.data.map((p: { categoria: string }) => p.categoria));
      setEditForm({
        nome: cr.data.nome || '',
        email: cr.data.email || '',
        cpf: cr.data.cpf || '',
        telefone_ddd: cr.data.telefone_ddd || '',
        telefone_numero: cr.data.telefone_numero || '',
        data_nascimento: cr.data.data_nascimento || '',
        genero: cr.data.genero || '',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const fmtTel = (d?: string, n?: string) =>
    !d || !n ? '-' : `(${d}) ${n.slice(0, 5)}-${n.slice(5)}`;
  const fmtCpf = (c?: string) =>
    !c ? '-' : c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  const maskCard = (n?: string) => (!n ? '-' : `•••• •••• •••• ${n.slice(-4)}`);
  const bandeiraNome = (c: CartaoCredito) => c.bandeira?.nome || 'Cartão';

  const salvarPerfil = async () => {
    setSaving(true);
    try {
      await clientesApi.atualizarMe({
        nome: editForm.nome,
        email: editForm.email,
        telefone_ddd: editForm.telefone_ddd,
        telefone_numero: editForm.telefone_numero,
        genero: editForm.genero,
      });
      setEditando(false);
      loadData();
    } catch (x: any) {
      alert(x.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const togglePreferencia = async (categoria: string) => {
    const novas = preferencias.includes(categoria)
      ? preferencias.filter((c) => c !== categoria)
      : [...preferencias, categoria];
    setPreferencias(novas);
    try {
      await clientesApi.salvarPreferencias(novas.length ? novas : ['Nenhuma']);
    } catch (e) {
      alert('Erro ao salvar preferências');
      loadData();
    }
  };

  const alterarSenha = async () => {
    if (pwForm.nova !== pwForm.confirmar) {
      alert('Nova senha e confirmação não conferem');
      return;
    }
    setSaving(true);
    try {
      await clientesApi.alterarSenha({
        senha_atual: pwForm.atual,
        nova_senha: pwForm.nova,
      });
      setPwForm({ atual: '', nova: '', confirmar: '' });
      setSenhaMenuAberto(false);
      alert('Senha alterada com sucesso!');
    } catch (x: any) {
      alert(x.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async () => {
    if (!cliente) return;
    if (!confirm('Desativar conta permanentemente? Esta ação não pode ser desfeita.'))
      return;
    try {
      await clientesApi.inativarMe();
      logout();
    } catch (x) {
      alert('Erro ao desativar conta');
    }
  };

  const excluirEndereco = async (id: number) => {
    if (!confirm('Excluir este endereço?')) return;
    try {
      await enderecosApi.excluir(id);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao excluir endereço');
    }
  };

  const excluirCartao = async (id: number) => {
    if (!confirm('Excluir este cartão?')) return;
    try {
      await cartoesApi.excluir(id);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao excluir cartão');
    }
  };

  if (loading)
    return (
      <div className={styles.profile}>
        <div className={styles.profileBody}>
          <div className={styles.profileLeft}>
            <div className={styles.frame}>
              <b className={styles.logo}>Carregando...</b>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className={styles.profile}>
      <Navbar />

      <div className={styles.profileBody}>
        <div className={styles.profileLeft}>
          <div className={styles.frame}>
            <b className={styles.logo}>Seu Perfil</b>
            <div className={styles.frame2}>
              <div className={styles.statusDot} />
              <b className={styles.curadorPremium}>Curador Premium</b>
            </div>
          </div>

          <div className={styles.personalInfoForm}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <b className={styles.dadosPessoais}>Dados Pessoais</b>
              <button
                onClick={() => (editando ? setEditando(false) : setEditando(true))}
                className={styles.secondaryBtn}
              >
                {editando ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {editando ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className={styles.frame5}>
                  <div className={styles.fieldCpf}>
                    <label className={styles.nomeCompleto}>Nome completo</label>
                    <input
                      value={editForm.nome}
                      onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                      className={styles.inputBox}
                    />
                  </div>
                </div>
                <div className={styles.frame5}>
                  <div className={styles.fieldCpf}>
                    <label className={styles.nomeCompleto}>E-mail</label>
                    <input
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className={styles.inputBox}
                      type="email"
                    />
                  </div>
                  <div className={styles.fieldCpf}>
                    <label className={styles.nomeCompleto}>CPF</label>
                    <input value={fmtCpf(editForm.cpf)} disabled className={styles.inputBox} />
                  </div>
                </div>
                <div className={styles.frame5}>
                  <div className={styles.fieldCpf}>
                    <label className={styles.nomeCompleto}>Telefone</label>
                    <div className={styles.frame5}>
                      <input
                        value={editForm.telefone_ddd}
                        onChange={(e) =>
                          setEditForm({ ...editForm, telefone_ddd: e.target.value })
                        }
                        placeholder="DDD"
                        className={styles.inputBox}
                        style={{ flex: 0.3 }}
                      />
                      <input
                        value={editForm.telefone_numero}
                        onChange={(e) =>
                          setEditForm({ ...editForm, telefone_numero: e.target.value })
                        }
                        placeholder="Número"
                        className={styles.inputBox}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div className={styles.fieldCpf}>
                    <label className={styles.nomeCompleto}>Data de nascimento</label>
                    <input
                      value={editForm.data_nascimento}
                      onChange={(e) =>
                        setEditForm({ ...editForm, data_nascimento: e.target.value })
                      }
                      type="date"
                      className={styles.inputBox}
                    />
                  </div>
                </div>
                <div className={styles.frame5}>
                  <div className={styles.fieldCpf}>
                    <label className={styles.nomeCompleto}>Gênero</label>
                    <select
                      value={editForm.genero}
                      onChange={(e) => setEditForm({ ...editForm, genero: e.target.value })}
                      className={styles.inputBox}
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Não-binário">Não-binário</option>
                      <option value="Prefiro não informar">Prefiro não informar</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={salvarPerfil}
                  disabled={saving}
                  className={styles.saveDetailsCta}
                  style={{ cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className={styles.frame5}>
                  <Field label="Nome" value={cliente?.nome} />
                  <Field label="E-mail" value={cliente?.email} />
                </div>
                <div className={styles.frame5}>
                  <Field label="CPF" value={fmtCpf(cliente?.cpf)} />
                  <Field
                    label="Telefone"
                    value={fmtTel(cliente?.telefone_ddd, cliente?.telefone_numero)}
                  />
                </div>
                <div className={styles.frame5}>
                  <Field
                    label="Data de nascimento"
                    value={
                      cliente?.data_nascimento
                        ? new Date(cliente.data_nascimento).toLocaleDateString('pt-BR')
                        : '-'
                    }
                  />
                  <Field label="Gênero" value={cliente?.genero} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.personalInfoForm}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <b className={styles.dadosPessoais}>Segurança</b>
              <button
                onClick={() => setSenhaMenuAberto(!senhaMenuAberto)}
                className={styles.secondaryBtn}
              >
                {senhaMenuAberto ? 'Cancelar' : 'Mudar senha'}
              </button>
            </div>
            {senhaMenuAberto && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="password"
                  value={pwForm.atual}
                  onChange={(e) => setPwForm({ ...pwForm, atual: e.target.value })}
                  placeholder="Senha atual"
                  className={styles.inputBox}
                />
                <div className={styles.frame5}>
                  <input
                    type="password"
                    value={pwForm.nova}
                    onChange={(e) => setPwForm({ ...pwForm, nova: e.target.value })}
                    placeholder="Nova senha"
                    className={styles.inputBox}
                  />
                  <input
                    type="password"
                    value={pwForm.confirmar}
                    onChange={(e) => setPwForm({ ...pwForm, confirmar: e.target.value })}
                    placeholder="Confirmar nova senha"
                    className={styles.inputBox}
                  />
                </div>
                <button
                  onClick={alterarSenha}
                  disabled={saving}
                  className={styles.saveDetailsCta}
                  style={{
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    alignSelf: 'flex-start',
                  }}
                >
                  {saving ? 'Alterando...' : 'Alterar senha'}
                </button>
              </div>
            )}
          </div>

          <div className={styles.readingPrefsToggles}>
            <b className={styles.dadosPessoais}>Preferências de leitura</b>
            <div className={styles.configureQuaisTipos}>
              Configure quais tipos de livros você gosta para receber recomendações da IA.
            </div>
            <div className={styles.togglesGrid}>
              {CATEGORIAS_PREFERENCIAS.map((cat) => {
                const ativo = preferencias.includes(cat);
                return (
                  <div key={cat} className={styles.toggleRow0}>
                    <span style={{ fontSize: '14px', color: '#0f172a' }}>{cat}</span>
                    <button
                      type="button"
                      onClick={() => togglePreferencia(cat)}
                      className={ativo ? styles.pillToggle : styles.pillToggle4}
                      aria-pressed={ativo}
                    >
                      <div className={styles.knob} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.profileRight}>
          <div className={styles.savedAddresses}>
            <div className={styles.frame13}>
              <b className={styles.endereosSalvos}>Endereços salvos</b>
              <button onClick={() => setModalEnd(true)} className={styles.secondaryBtn}>
                + Adicionar
              </button>
            </div>
            {enderecos.length === 0 ? (
              <div className={styles.configureQuaisTipos}>Nenhum endereço cadastrado.</div>
            ) : (
              enderecos.map((e) => (
                <div key={e.id_endereco} className={styles.frame11}>
                  <b className={styles.casaPadro}>
                    {e.nome_identificador} {e.padrao && '(Padrão)'}
                  </b>
                  <div>
                    {e.tipo_logradouro} {e.logradouro}, {e.numero}
                  </div>
                  <div>
                    {e.bairro} — {e.cidade}/{e.estado}, {e.cep}
                  </div>
                  <div className={styles.frame12}>
                    <span style={{ cursor: 'pointer' }}>Editar</span>
                    <span
                      className={styles.excluir}
                      style={{ cursor: 'pointer' }}
                      onClick={() => excluirEndereco(e.id_endereco)}
                    >
                      Excluir
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.savedAddresses}>
            <div className={styles.frame13}>
              <b className={styles.endereosSalvos}>Pagamentos salvos</b>
              <button onClick={() => setModalCart(true)} className={styles.secondaryBtn}>
                + Adicionar
              </button>
            </div>
            {cartoes.length === 0 ? (
              <div className={styles.configureQuaisTipos}>Nenhum cartão cadastrado.</div>
            ) : (
              cartoes.map((c) => (
                <div key={c.id_cartao} className={styles.frame13}>
                  <div className={styles.frame14}>
                    <span
                      style={{
                        fontSize: '13px',
                        background: '#f1f5f9',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        color: '#0f172a',
                      }}
                    >
                      {bandeiraNome(c)}
                    </span>
                    <div>
                      <div style={{ fontSize: '14px', color: '#0f172a' }}>
                        {maskCard(c.numero_cartao)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {c.nome_impresso} {c.preferencial && '• Preferencial'}
                      </div>
                    </div>
                  </div>
                  <span
                    className={styles.excluir2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => excluirCartao(c.id_cartao)}
                  >
                    Excluir
                  </span>
                </div>
              ))
            )}
          </div>

          <div className={styles.dangerZone}>
            <b className={styles.zonaDeRisco}>Zona de Risco</b>
            <div className={styles.desativarSuaConta}>
              Desativar sua conta é irreversível. Todos os seus dados permanecerão arquivados, mas
              você não poderá mais acessar o sistema.
            </div>
            <button onClick={deactivate} className={styles.deactivateCta}>
              <b>Desativar conta</b>
            </button>
          </div>
        </div>
      </div>

      {modalEnd && (
        <Modal title="Adicionar endereço" onClose={() => setModalEnd(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                const t = e.currentTarget;
                await enderecosApi.criar({
                  nome_identificador: t.ni.value,
                  tipo: t.ti.value as any,
                  tipo_residencia: t.tr.value,
                  tipo_logradouro: t.tl.value,
                  logradouro: t.lo.value,
                  numero: t.nu.value,
                  bairro: t.ba.value,
                  cep: t.ce.value,
                  cidade: t.ci.value,
                  estado: t.es.value,
                  pais: t.pa.value,
                  observacoes: t.obs.value || null,
                  padrao: t.pad.checked,
                });
                setModalEnd(false);
                loadData();
              } catch (err: any) {
                alert(err.response?.data?.detail || 'Erro ao salvar endereço');
              } finally {
                setSaving(false);
              }
            }}
          >
            <input name="ni" placeholder="Nome (Casa, Trabalho)" required className={styles.inputBox} style={{ marginBottom: '8px' }} />
            <select name="ti" className={styles.inputBox} style={{ marginBottom: '8px' }}>
              <option value="ENTREGA">Entrega</option>
              <option value="COBRANCA">Cobrança</option>
              <option value="AMBOS">Ambos</option>
            </select>
            <div className={styles.frame5}>
              <select name="tr" required className={styles.inputBox}>
                <option value="Casa">Casa</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Comercial">Comercial</option>
              </select>
              <select name="tl" required className={styles.inputBox}>
                <option value="Rua">Rua</option>
                <option value="Avenida">Avenida</option>
                <option value="Travessa">Travessa</option>
                <option value="Alameda">Alameda</option>
                <option value="Estrada">Estrada</option>
              </select>
            </div>
            <div className={styles.frame5}>
              <input name="lo" placeholder="Logradouro" required className={styles.inputBox} />
              <input name="nu" placeholder="Número" required className={styles.inputBox} />
            </div>
            <div className={styles.frame5}>
              <input name="ba" placeholder="Bairro" required className={styles.inputBox} />
              <input name="ce" placeholder="CEP" required className={styles.inputBox} />
            </div>
            <div className={styles.frame5}>
              <input name="ci" placeholder="Cidade" required className={styles.inputBox} />
              <input name="es" placeholder="Estado (SP)" required className={styles.inputBox} />
            </div>
            <input name="pa" placeholder="País" defaultValue="Brasil" required className={styles.inputBox} style={{ marginBottom: '8px' }} />
            <input name="obs" placeholder="Observações" className={styles.inputBox} style={{ marginBottom: '8px' }} />
            <label className={styles.nomeCompleto} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <input name="pad" type="checkbox" /> Endereço padrão
            </label>
            <div className={styles.frame13}>
              <button type="button" onClick={() => setModalEnd(false)} className={styles.secondaryBtn}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={styles.saveDetailsCta}
                style={{ cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalCart && (
        <Modal title="Adicionar cartão" onClose={() => setModalCart(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                await cartoesApi.criar({
                  id_bandeira: Number(e.currentTarget.ib.value),
                  numero_cartao: e.currentTarget.nc.value,
                  nome_impresso: e.currentTarget.nm.value,
                  codigo_seguranca: e.currentTarget.cs.value,
                  preferencial: e.currentTarget.pr.checked,
                });
                setModalCart(false);
                loadData();
              } catch (err: any) {
                alert(err.response?.data?.detail || 'Erro ao salvar cartão');
              } finally {
                setSaving(false);
              }
            }}
          >
            <select name="ib" className={styles.inputBox} style={{ marginBottom: '8px' }}>
              <option value="1">Visa</option>
              <option value="2">Mastercard</option>
              <option value="3">Amex</option>
            </select>
            <input name="nc" placeholder="Número do cartão" required className={styles.inputBox} style={{ marginBottom: '8px' }} />
            <input name="nm" placeholder="Nome impresso" required className={styles.inputBox} style={{ marginBottom: '8px' }} />
            <input name="cs" placeholder="CVV" maxLength={4} required className={styles.inputBox} style={{ marginBottom: '8px' }} />
            <label className={styles.nomeCompleto} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <input name="pr" type="checkbox" /> Preferencial
            </label>
            <div className={styles.frame13}>
              <button type="button" onClick={() => setModalCart(false)} className={styles.secondaryBtn}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={styles.saveDetailsCta}
                style={{ cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.fieldCpf}>
      <div className={styles.nomeCompleto} style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
        {label}
      </div>
      <div className={styles.inputBox} style={{ background: '#faf9f6', color: '#0f172a' }}>
        {value || '-'}
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '480px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <b style={{ fontSize: '18px', marginBottom: '20px', display: 'block' }}>{title}</b>
        {children}
      </div>
    </div>
  );
}

export default Profile;
