import { useState, useRef, useEffect, type FunctionComponent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminSidebar.module.css';

const MENU = [
  { path: '/admin-dashboard', label: 'Dashboard', icon: '/images/icons/layout-grid.svg' },
  { path: '/admin-usuarios', label: 'Clientes', icon: '/images/icons/users.svg' },
  { path: '/admin-pedidos', label: 'Pedidos', icon: '/images/icons/shopping-bag.svg' },
  { path: '/admin-trocas', label: 'Trocas', icon: '/images/icons/arrow-right-left.svg' },
  { path: '/admin-analise', label: 'Análises', icon: '/images/icons/chart-line.svg' },
  { path: '/admin-livros', label: 'Livros', icon: '/images/icons/book-open.svg' },
];

const AdminSidebar: FunctionComponent = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
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
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <b className={styles.nexo}>Nexo</b>
        <div className={styles.brandDot} />
        <div className={styles.adminTag}>
          <b className={styles.nexo}>ADMIN</b>
        </div>
      </div>
      <div className={styles.navList}>
        {MENU.map((item) => {
          const ativo = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={ativo ? styles.navItemDashboard : styles.navItemClientes}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className={styles.iconWrapper}>
                <img src={item.icon} alt="" className={styles.frameIcon} />
              </div>
              <div className={ativo ? styles.dashboard : styles.clientes}>{item.label}</div>
            </Link>
          );
        })}
      </div>
      <div className={styles.sidebarFooter}>
        <div className={styles.line} />
        <div
          className={styles.userProfile}
          onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
          style={{ cursor: 'pointer', position: 'relative' }}
          ref={menuRef}
        >
          <div className={styles.avatar}>
            <b className={styles.nexo}>{user?.nome?.charAt(0)?.toUpperCase() || 'A'}</b>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.arthurSchopenhauer}>{user?.nome || 'Administrador'}</div>
            <div className={styles.curadorMaster}>{user?.perfil || 'ADMIN'}</div>
          </div>
          {menuPerfilAberto && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: '8px',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '6px',
                zIndex: 50,
                boxShadow: '0 -4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <div
                onClick={logout}
                style={{
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: '#ef4444',
                  fontWeight: 500,
                }}
              >
                Sair
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
