import { useEffect, useState, type FunctionComponent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { pedidosApi, trocasApi, notificacoesApi, cuponsApi } from '../../services/api';
import type { Pedido, Troca, Notificacao, Cupom } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import PedidoCard, { brl } from './PedidoCard';
import FormTroca from './FormTroca';
import styles from './MyOrders.module.css';

/**
 * Cliente: consulta de pedidos e status, solicitação de troca (RF0040), notificações (RNF0046)
 * e cupons de troca (RF0044).
 */
const MyOrders: FunctionComponent = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [trocando, setTrocando] = useState<Pedido | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      const [p, t, n, c] = await Promise.all([
        pedidosApi.meusPedidos(),
        trocasApi.minhas(),
        notificacoesApi.listar(),
        cuponsApi.meusCupons(),
      ]);
      setPedidos(p.data);
      setTrocas(t.data);
      setNotificacoes(n.data);
      setCupons(c.data.filter((x) => x.origem !== 'CATALOGO' && x.tipo === 'TROCA' && !x.utilizado));
    } catch {
      setMensagem('Erro ao carregar seus pedidos.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    carregar();
  }, []);

  const enviarTroca = async (d: {
    motivo: string;
    compraInteira: boolean;
    itens: { id_item_pedido: number; quantidade: number }[];
  }) => {
    if (!trocando) return;
    if (!d.motivo.trim()) {
      setMensagem('Informe o motivo da troca.');
      return;
    }
    if (!d.compraInteira && d.itens.length === 0) {
      setMensagem('Selecione ao menos um item.');
      return;
    }
    try {
      await trocasApi.solicitar({
        id_pedido: trocando.id_pedido,
        motivo: d.motivo,
        compra_inteira: d.compraInteira,
        itens: d.itens,
      });
      setTrocando(null);
      setMensagem('Troca solicitada. Aguarde a autorização.');
      carregar();
    } catch (e: any) {
      setMensagem(e.response?.data?.detail || 'Erro ao solicitar a troca.');
    }
  };

  const lerNotificacao = async (n: Notificacao) => {
    await notificacoesApi.marcarLida(n.id_notificacao);
    carregar();
  };

  return (
    <div className={styles.myOrders}>
      <Navbar />

      <div className={styles.body}>
        <div className={styles.headerRow}>
          <b className={styles.logo}>Meus Pedidos &amp; Trocas</b>
          <div className={styles.arthurS}>{user?.nome}</div>
        </div>

        {mensagem && (
          <div className={styles.orderCard} style={{ background: '#fef3c7' }}>
            {mensagem}
          </div>
        )}

        {notificacoes
          .filter((n) => !n.lida)
          .map((n) => (
            <div
              key={n.id_notificacao}
              data-testid="notificacao"
              className={styles.orderCard}
              style={{ background: '#ecfeff', borderColor: '#67e8f9' }}
            >
              🔔 {n.mensagem}{' '}
              <span
                onClick={() => lerNotificacao(n)}
                style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: 8 }}
              >
                marcar como lida
              </span>
            </div>
          ))}

        <div className={styles.orderCard}>
          <b className={styles.cuponsPromocionais}>Cupons de troca disponíveis</b>
          <div data-testid="cupons-troca">
            {cupons.length === 0 && (
              <span style={{ color: '#94a3b8' }}>Nenhum cupom de troca disponível.</span>
            )}
            {cupons.map((c) => (
              <div key={c.id_cupom}>
                {c.codigo_cupom} — {brl(c.valor)} (válido até {c.valido_ate}) — use no carrinho
              </div>
            ))}
          </div>
        </div>

        <div className={styles.filtersRow}>
          <button className={styles.frame} style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
            Todos ({pedidos.length})
          </button>
          <button className={styles.frame2} style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
            Em andamento
          </button>
          <button className={styles.frame2} style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
            Entregues
          </button>
          <button className={styles.frame2} style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
            Com troca
          </button>
        </div>

        {loading ? (
          <div className={styles.orderCard}>Carregando pedidos...</div>
        ) : pedidos.length === 0 ? (
          <div className={styles.orderCard} style={{ color: '#94a3b8' }}>
            Você ainda não fez pedidos.
          </div>
        ) : (
          <div className={styles.ordersList}>
            {pedidos.map((p) => (
              <PedidoCard
                key={p.id_pedido}
                pedido={p}
                trocas={trocas.filter((t) => t.id_pedido === p.id_pedido)}
                onTrocar={(ped) => {
                  setTrocando(ped);
                  setMensagem('');
                }}
              />
            ))}
          </div>
        )}

        {trocando && (
          <FormTroca pedido={trocando} onEnviar={enviarTroca} onCancelar={() => setTrocando(null)} />
        )}
      </div>
    </div>
  );
};

export default MyOrders;
