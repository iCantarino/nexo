import { useState, useEffect, type FunctionComponent } from 'react';
import { analiseApi } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import styles from './AdminDashboard.module.css';

interface Kpis {
  pedidos_hoje: number;
  receita_dia: number;
  novos_clientes: number;
  itens_em_transito: number;
}

const fmtBr = (n: number) =>
  'R$ ' + Number(n).toFixed(2).replace('.', ',');

const AdminDashboard: FunctionComponent = () => {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [carregandoKpis, setCarregandoKpis] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await analiseApi.kpis();
        setKpis(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setCarregandoKpis(false);
      }
    };
    carregar();
  }, []);

  return (
    <div className={styles.adminDashboard}>
      <AdminSidebar />
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
              <b className={styles.b}>{carregandoKpis ? '—' : (kpis?.pedidos_hoje ?? 0)}</b>
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
              <b className={styles.b}>{carregandoKpis ? '—' : fmtBr(kpis?.receita_dia ?? 0)}</b>
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
              <b className={styles.b}>{carregandoKpis ? '—' : (kpis?.novos_clientes ?? 0)}</b>
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
              <b className={styles.b}>{carregandoKpis ? '—' : (kpis?.itens_em_transito ?? 0)}</b>
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
