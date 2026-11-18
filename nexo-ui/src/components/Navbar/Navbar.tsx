import { useState, useRef, useEffect, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Navbar.module.css';

export type NavbarActiveItem =
  | 'catalogo'
  | 'destaques'
  | 'pre-venda'
  | 'ofertas'
  | 'nexo-ia';

interface NavbarProps {
  activeItem?: NavbarActiveItem;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  cartBadge?: number;
}

const navItems: { id: NavbarActiveItem; label: string; to: string }[] = [
  { id: 'catalogo', label: 'Catálogo', to: '/home' },
  { id: 'destaques', label: 'Destaques', to: '#' },
  { id: 'pre-venda', label: 'Pré-Venda', to: '#' },
  { id: 'ofertas', label: 'Ofertas', to: '#' },
  { id: 'nexo-ia', label: 'Nexo IA', to: '/ai-chatbot' },
];

const Navbar: FunctionComponent<NavbarProps> = ({
  activeItem,
  searchValue,
  onSearchChange,
  cartBadge,
}) => {
  const { user, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primeiroNome = user?.nome?.split(' ')[0] || 'Cliente';
  const iniciais = primeiroNome.charAt(0).toUpperCase();

  const hasFunctionalSearch =
    typeof searchValue === 'string' && typeof onSearchChange === 'function';

  return (
    <nav className={styles.navbar}>
      <Link to="/home" className={styles.brand}>
        Nexo
        <span className={styles.brandDot} />
      </Link>

      <div className={styles.navLinks}>
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          const className = isActive ? styles.navLinkActive : styles.navLink;
          return item.to.startsWith('/') ? (
            <Link key={item.id} to={item.to} className={className}>
              {item.label}
            </Link>
          ) : (
            <span key={item.id} className={className}>
              {item.label}
            </span>
          );
        })}
      </div>

      <div className={styles.navActions}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          {hasFunctionalSearch ? (
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar no catálogo..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          ) : (
            <span className={styles.searchPlaceholder}>Buscar no catálogo...</span>
          )}
        </div>

        <div
          className={styles.userMenu}
          ref={menuRef}
          onClick={() => setMenuAberto(!menuAberto)}
        >
          <div className={styles.userAvatar}>{iniciais}</div>
          <span className={styles.userName}>{primeiroNome}</span>
          {menuAberto && (
            <div className={styles.dropdown}>
              <Link
                to="/perfil"
                className={styles.dropdownItemLink}
                onClick={(e) => e.stopPropagation()}
              >
                Perfil
              </Link>
              <div
                className={styles.dropdownItem}
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
              >
                Sair
              </div>
            </div>
          )}
        </div>

        <Link to="/carrinho" className={styles.cartBtn}>
          <span className={styles.cartIcon}>🛍️</span>
          {typeof cartBadge === 'number' && cartBadge > 0 && (
            <div className={styles.badge} data-testid="badge-carrinho">
              <b>{cartBadge}</b>
            </div>
          )}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
