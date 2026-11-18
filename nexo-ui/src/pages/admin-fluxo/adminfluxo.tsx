import { type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import styles from '../admin-dashboard/AdminDashboard.module.css';

const STATUS_FLUXO = [
  { key: 'EM_PROCESSAMENTO', label: 'Em Processamento', proximo: 'PAGAMENTO_APROVADO' },
  { key: 'PAGAMENTO_APROVADO', label: 'Pagamento Aprovado', proximo: 'EM_TRANSITO' },
  { key: 'EM_TRANSITO', label: 'Em Trânsito', proximo: 'ENTREGUE' },
];

const AdminFluxo: FunctionComponent = () => {
  return (
    <div className={styles.adminDashboard}>
      <AdminSidebar />
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
