import { useState, useRef, useEffect, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../admin-dashboard/AdminDashboard.module.css';

const STATUS_FLUXO = [
  { key: 'EM_PROCESSAMENTO', label: 'Em Processamento', proximo: 'PAGAMENTO_APROVADO' },
  { key: 'PAGAMENTO_APROVADO', label: 'Pagamento Aprovado', proximo: 'EM_TRANSITO' },
  { key: 'EM_TRANSITO', label: 'Em Trânsito', proximo: 'ENTREGUE' },
];

const AdminFluxo: FunctionComponent = () => {
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

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.sidebar}>
        <div className={styles.brand}>
          <b className={styles.nexo}>Nexo</b>
          <div className={styles.brandDot} />
          <div className={styles.adminTag}>
            <b className={styles.nexo}>ADMIN</b>
          </div>
        </div>
        <div className={styles.navList}>
          <Link to="/admin-dashboard" className={styles.navItemDashboard}>
            <div className={styles.iconWrapper}>
              <img src="/images/icons/layout-grid.svg" alt="" className={styles.frameIcon} />
            </div>
            <div className={styles.dashboard}>Dashboard</div>
          </Link>
          <Link to="/admin-usuarios" className={styles.navItemClientes}>
            <div className={styles.iconWrapper}>
              <img src="/images/icons/users.svg" alt="" className={styles.frameIcon} />
            </div>
            <div className={styles.clientes}>Clientes</div>
          </Link>
          <Link to="/admin-pedidos" className={styles.navItemClientes}>
            <div className={styles.iconWrapper}>
              <img src="/images/icons/shopping-bag.svg" className={styles.frameIcon} alt="" />
            </div>
            <div className={styles.clientes}>Pedidos</div>
          </Link>
          <Link to="/admin-trocas" className={styles.navItemClientes}>
            <div className={styles.iconWrapper}>
              <img src="/images/icons/arrow-right-left.svg" className={styles.frameIcon} alt="" />
            </div>
            <div className={styles.clientes}>Trocas</div>
          </Link>
          <Link to="/admin-analise" className={styles.navItemClientes}>
            <div className={styles.iconWrapper}>
              <img src="/images/icons/chart-line.svg" className={styles.frameIcon} alt="" />
            </div>
            <div className={styles.clientes}>Análises</div>
          </Link>
          <Link to="/admin-fluxo" className={styles.navItemDashboard}>
            <div className={styles.iconWrapper}>
              <img src="/images/icons/git-commit-horizontal.svg" alt="" className={styles.frameIcon} />
            </div>
            <div className={styles.dashboard}>Fluxo</div>
          </Link>
        </div>
        <div className={styles.sidebarFooter}>
          <div className={styles.line} />
          <div className={styles.userProfile} onClick={() => setMenuPerfilAberto(!menuPerfilAberto)} style={{ cursor: 'pointer', position: 'relative' }} ref={menuRef}>
            <div className={styles.avatar}>
              <b className={styles.nexo}>{user?.nome?.charAt(0)?.toUpperCase() || 'A'}</b>
            </div>
            <div className={styles.userInfo}>
              <div className={styles.arthurSchopenhauer}>{user?.nome || 'Administrador'}</div>
              <div className={styles.curadorMaster}>{user?.perfil || 'ADMIN'}</div>
            </div>
            {menuPerfilAberto && (
              <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', zIndex: 50, boxShadow: '0 -4px 6px rgba(0,0,0,0.1)' }}>
                <div onClick={logout} style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', color: '#ef4444', fontWeight: 500 }}>
                  Sair
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.contentArea}>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <b className={styles.nexo}>Fluxo de Pedidos</b>
            <div className={styles.visoGeralDa}>Acompanhamento dos status do pipeline de pedidos.</div>
          </div>
        </div>
        <div className={styles.workspace}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {STATUS_FLUXO.map((s) => (
              <div key={s.key} className={styles.kpiCard} style={{ padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{s.label}</div>
                <b className={styles.b} style={{ fontSize: '16px' }}>{s.key}</b>
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#475569' }}>
                  Próximo: <strong>{s.proximo}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.chartSection} style={{ marginTop: '24px' }}>
            <div className={styles.sectionHeader}>
              <b className={styles.nexo}>Ações</b>
            </div>
            <div style={{ padding: '16px', color: '#475569', fontSize: '14px' }}>
              Use a tela <Link to="/admin-pedidos" style={{ color: '#d97706', fontWeight: 600 }}>Pedidos</Link> para atualizar o status de cada pedido.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFluxo;
