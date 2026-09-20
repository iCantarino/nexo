import { useState, useRef, useEffect, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminDashboard.module.css';


const AdminDashboard: FunctionComponent = () => {
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
        </div>
        <div className={styles.sidebarFooter}>
          <div className={styles.line} />
          <div className={styles.userProfile} onClick={() => setMenuPerfilAberto(!menuPerfilAberto)} style={{ cursor: 'pointer', position: 'relative' }} ref={menuRef}>
            <div className={styles.avatar}>
              <b className={styles.nexo}>{(user as any)?.nome?.charAt(0)?.toUpperCase() || 'A'}</b>
            </div>
            <div className={styles.userInfo}>
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
      <div className={styles.contentArea}>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <b className={styles.nexo}>Painel de Controle</b>
            <div className={styles.visoGeralDa}>Visão geral da operação Nexo em tempo real.</div>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.notificationBell}>
              <div className={styles.iconWrapper6}>
                <img className={styles.frameIcon6} alt="" />
              </div>
            </div>
            <div className={styles.adminBadge}>
              <div className={styles.liveIndicator} />
              <div className={styles.dashboard}>Sessão Ativa</div>
            </div>
          </div>
        </div>
        <div className={styles.workspace}>
          <div className={styles.kpiStrip}>
            <div className={styles.kpiCard}>
              <div className={styles.pedidosHoje}>Pedidos Hoje</div>
              <b className={styles.b}>34</b>
              <div className={styles.trend}>
                <div className={styles.iconWrapper7}>
                  <img className={styles.frameIcon7} alt="" />
                </div>
                <b className={styles.nexo}>+18.5%</b>
                <div className={styles.vsOntem}>vs ontem</div>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.pedidosHoje}>Receita do Dia</div>
              <b className={styles.b}>R$ 4.280</b>
              <div className={styles.trend}>
                <div className={styles.iconWrapper7}>
                  <img className={styles.frameIcon7} alt="" />
                </div>
                <b className={styles.nexo}>+24.1%</b>
                <div className={styles.vsOntem}>vs ontem</div>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.pedidosHoje}>Novos Clientes</div>
              <b className={styles.b}>12</b>
              <div className={styles.trend}>
                <div className={styles.iconWrapper7}>
                  <img className={styles.frameIcon7} alt="" />
                </div>
                <b className={styles.nexo}>+5.0%</b>
                <div className={styles.vsOntem}>média diária</div>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.pedidosHoje}>Itens em Trânsito</div>
              <b className={styles.b}>87</b>
              <div className={styles.trend4}>
                <div className={styles.dashboard}>Envio prioritário</div>
              </div>
            </div>
          </div>
          <div className={styles.chartSection}>
            <div className={styles.sectionHeader}>
              <b className={styles.nexo}>Receita (últimos 30 dias)</b>
              <div className={styles.periodLabel}>Período: 19 Jan - 18 Fev 2026</div>
            </div>
            <div className={styles.chartPlaceholder} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
