import { useState, useRef, useEffect, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VendasPorCategoria from './VendasPorCategoria';
import styles from './AdminAnalytics.module.css';


const AdminAnalytics: FunctionComponent = () => {
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
    		<div className={styles.adminAnalytics}>
      			<div className={styles.sidebar}>
        				<div className={styles.brand}>
          					<b className={styles.logo}>Nexo</b>
          					<div className={styles.brandDot} />
          					<div className={styles.adminTag}>
            						<b className={styles.logo}>ADMIN</b>
          					</div>
        				</div>
        				<div className={styles.navList}>
          					<Link to="/admin-dashboard" className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img src="/images/icons/layout-grid.svg" className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Dashboard</div>
          					</Link>
          					<Link to="/admin-usuarios" className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img src="/images/icons/users.svg" className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Clientes</div>
          					</Link>
          					<Link to="/admin-pedidos" className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img src="/images/icons/shopping-bag.svg" className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Pedidos</div>
          					</Link>
          					<Link to="/admin-trocas" className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img src="/images/icons/arrow-right-left.svg" className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Trocas</div>
          					</Link>
          					<Link to="/admin-analise" className={styles.navItemAnalises}>
            						<div className={styles.iconWrapper}>
              							<img src="/images/icons/chart-line.svg" className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.anlises}>Análises</div>
          					</Link>
        				</div>
        				<div className={styles.sidebarFooter}>
          					<div className={styles.line} />
          					<div className={styles.userProfile} onClick={() => setMenuPerfilAberto(!menuPerfilAberto)} style={{ cursor: 'pointer', position: 'relative' }} ref={menuRef}>
            						<div className={styles.avatar}>
              							<b className={styles.logo}>{user?.nome?.charAt(0)?.toUpperCase() || 'A'}</b>
            						</div>
            						<div className={styles.userInfo}>
              							<div className={styles.arthurSchopenhauer}>{user?.nome || 'Administrador'}</div>
              							<div className={styles.curadorMaster}>{user?.perfil || 'ADMIN'}</div>
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
        				<div className={styles.headerRow}>
          					<div className={styles.headerTitles}>
            						<b className={styles.logo}>{`Análise de Vendas`}</b>
            						<div className={styles.anliseEmTempo}>Compare o histórico de vendas entre categorias de livros por período.</div>
          					</div>
        				</div>
        <div className={styles.workspace}>
          <VendasPorCategoria />
        </div>
      			</div>
    		</div>);
};

export default AdminAnalytics ;
