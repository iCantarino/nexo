import { useEffect, useState, type FunctionComponent } from 'react';
import { pedidosApi, trocasApi, rotuloStatus } from '../../services/api';
import type { Pedido, Troca } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import styles from './AdminPedidos.module.css';

const FILTROS = [
  { key: '', label: 'Todos' },
  { key: 'APROVADA', label: 'Aguardando Envio' },
  { key: 'EM_TRANSITO', label: 'Aguardando Entrega' },
];

const brl = (v: string) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

const proximoStatus = (status: string) => {
  const map: Record<string, string> = {
    APROVADA: 'EM_TRANSITO',
    EM_TRANSITO: 'ENTREGUE',
  };
  return map[status] || '';
};

const rotuloAcao = (prox: string) => {
  if (prox === 'EM_TRANSITO') return 'Despachar';
  if (prox === 'ENTREGUE') return 'Confirmar Entrega';
  return `Avançar para: ${rotuloStatus(prox).toUpperCase()}`;
};

const AdminCustomersOrders: FunctionComponent = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [filtro, setFiltro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [modal, setModal] = useState<{ aberto: boolean; pedido?: Pedido; proximo?: string }>({ aberto: false });

  const carregar = async (f = filtro) => {
    try {
      const [p, t] = await Promise.all([pedidosApi.adminTodos(f || undefined), trocasApi.adminPendentes()]);
      setPedidos(p.data);
      setTrocas(t.data);
    } catch {
      setMensagem('Erro ao carregar os pedidos.');
    }
  };
  useEffect(() => { carregar(); }, []);

  const abrirModal = (p: Pedido) => {
    const prox = proximoStatus(p.status);
    if (!prox) return;
    setModal({ aberto: true, pedido: p, proximo: prox });
  };

  const confirmar = async () => {
    if (!modal.pedido || !modal.proximo) return;
    try {
      if (modal.proximo === 'EM_TRANSITO') {
        await pedidosApi.despachar(modal.pedido.id_pedido);
      } else if (modal.proximo === 'ENTREGUE') {
        await pedidosApi.confirmarEntrega(modal.pedido.id_pedido);
      }
      setMensagem(`Pedido avançado para ${rotuloStatus(modal.proximo)}.`);
      setModal({ aberto: false });
      carregar();
    } catch (e: any) {
      setMensagem(e.response?.data?.detail || 'Operação não permitida.');
    }
  };

  const executarTroca = async (acao: () => Promise<unknown>, ok: string) => {
    try { await acao(); setMensagem(ok); carregar(); }
    catch (e: any) { setMensagem(e.response?.data?.detail || 'Operação não permitida.'); }
  };

  return (
    <div className={styles.adminPedidos}>
      <AdminSidebar />
      <div className={styles.contentArea}>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <b className={styles.titulo}>Fluxo e Gestão de Pedidos</b>
            <div className={styles.subtitulo}>Supervisão de status operacionais, envios e trocas de produtos.</div>
          </div>
        </div>
        <div className={styles.workspace}>
          {mensagem && <div className={styles.mensagem}>{mensagem}</div>}

          <div className={styles.secao}>
            <b className={styles.secaoTitulo}>Fila de Transições de Status</b>
            <div className={styles.filtros}>
              {FILTROS.map((f) => (
                <button
                  key={f.key}
                  className={filtro === f.key ? styles.filtroAtivo : styles.filtro}
                  onClick={() => { setFiltro(f.key); carregar(f.key); }}
                >
                  {f.label} {f.key === '' && `(${pedidos.length})`}
                </button>
              ))}
            </div>

            <div className={styles.tabela}>
              <div className={styles.tabelaHeader}>
                <span>Pedido</span>
                <span>Cliente</span>
                <span>Data</span>
                <span>Itens</span>
                <span>Total</span>
                <span>Status Atual</span>
                <span>Ação de Fluxo Disponível</span>
              </div>
              {pedidos.length === 0 && <div className={styles.vazio}>Nenhum pedido encontrado.</div>}
              {pedidos.map((p) => {
                const prox = proximoStatus(p.status);
                return (
                  <div key={p.id_pedido} className={styles.tabelaRow} data-testid={`admin-pedido-${p.id_pedido}`}>
                    <span><b>{p.codigo_pedido}</b></span>
                    <span>Cliente #{p.id_cliente}</span>
                    <span>{new Date(p.data_pedido).toLocaleDateString('pt-BR')}</span>
                    <span>{p.itens?.length ?? 0}</span>
                    <span><b>{brl(p.valor_total)}</b></span>
                    <span><span className={styles.badge}>{rotuloStatus(p.status)}</span></span>
                    <span>
                      {prox ? (
                        <button className={styles.botaoAcao} onClick={() => abrirModal(p)}>
                          {rotuloAcao(prox).toUpperCase()} →
                        </button>
                      ) : (
                        <span className={styles.semAcao}>—</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.secao}>
            <b className={styles.secaoTitulo}>Solicitações de Troca em Aberto</b>
            {trocas.filter((t) => t.status === 'SOLICITADA').length === 0 && (
              <div className={styles.vazio}>Nenhuma solicitação de troca em aberto.</div>
            )}
            {trocas.filter((t) => t.status === 'SOLICITADA').map((t) => (
              <div key={t.id_troca} className={styles.trocaCard}>
                <div>
                  <b>Pedido #{t.pedido?.codigo_pedido}</b>
                  <span className={styles.badgeTroca}>TROCA SOLICITADA</span>
                  <div className={styles.trocaDesc}>
                    Solicitado por Cliente #{t.id_cliente} em {new Date(t.data_solicitacao).toLocaleDateString('pt-BR')}. Motivo: {t.motivo}
                  </div>
                </div>
                <div className={styles.trocaAcoes}>
                  <button className={styles.botaoAceitar} onClick={() => executarTroca(() => trocasApi.autorizar(t.id_troca), 'Troca aceita.')}>Aceitar Troca</button>
                  <button className={styles.botaoRecusar} onClick={() => executarTroca(() => trocasApi.negar(t.id_troca), 'Troca recusada.')}>Recusar Troca</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal.aberto && modal.pedido && modal.proximo && (
        <div className={styles.modalOverlay} onClick={() => setModal({ aberto: false })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>⚠️</div>
              <b>Confirmar alteração de status?</b>
            </div>
            <p className={styles.modalText}>
              Você está prestes a atualizar o status do Pedido <b>#{modal.pedido.codigo_pedido}</b> de{' '}
              <b>{rotuloStatus(modal.pedido.status)}</b> para <b className={styles.destaque}>{rotuloStatus(modal.proximo)}</b>.
              Esta ação enviará uma notificação ao e-mail cadastrado do cliente.
            </p>
            <div className={styles.modalBotoes}>
              <button className={styles.botaoCancelar} onClick={() => setModal({ aberto: false })}>Cancelar</button>
              <button className={styles.botaoConfirmar} onClick={confirmar}>Confirmar Transição</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersOrders;
