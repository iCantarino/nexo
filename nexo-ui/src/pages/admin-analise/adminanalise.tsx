import { type FunctionComponent } from 'react';
import VendasPorCategoria from './VendasPorCategoria';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import styles from './AdminAnalytics.module.css';

const AdminAnalytics: FunctionComponent = () => {
  return (
    <div className={styles.adminAnalytics}>
      <AdminSidebar />
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
    </div>
  );
};

export default AdminAnalytics;

