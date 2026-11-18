import { useEffect, useState, type FunctionComponent } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { pedidosApi, API_BASE, rotuloStatus } from '../../services/api';
import type { Pedido, ItemPedido, PedidoCupom, PedidoCartao } from '../../services/api';
import styles from './OrderDetail.module.css';

const brl = (v: string | number) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

const ETAPAS = [
  { key: 'EM_ABERTO', label: 'EM ABERTO' },
  { key: 'EM_PROCESSAMENTO', label: 'EM PROCESSAMENTO' },
  { key: 'APROVADA', label: 'PAGAMENTO REALIZADO' },
  { key: 'EM_TRANSITO', label: 'EM TRÂNSITO' },
  { key: 'ENTREGUE', label: 'ENTREGUE' },
];

const statusParaEtapa = (status: string) => {
  if (['CANCELADO', 'REPROVADA'].includes(status)) return -1;
  const idx = ETAPAS.findIndex((e) => e.key === status);
  return idx >= 0 ? idx : 0;
};

const OrderDetail: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;
    pedidosApi
      .detalhe(Number(id))
      .then((r: { data: Pedido }) => setPedido(r.data))
      .catch(() => setErro('Pedido não encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  const etapaAtiva = pedido ? statusParaEtapa(pedido.status) : 0;
  const cancelado = pedido?.status === 'CANCELADO' || pedido?.status === 'REPROVADA';

  const coverUrl = (item: ItemPedido) => {
    if (item.livro?.imagem_principal_url) {
      return item.livro.imagem_principal_url.startsWith('http')
        ? item.livro.imagem_principal_url
        : `${API_BASE}${item.livro.imagem_principal_url}`;
    }
    return '/images/book-placeholder.png';
  };

  if (loading)
    return (
      <div className={styles.orderDetail}>
        <Navbar />
        <div className={styles.body}>Carregando...</div>
      </div>
    );

  if (erro || !pedido)
    return (
      <div className={styles.orderDetail}>
        <Navbar />
        <div className={styles.body}>{erro || 'Erro ao carregar pedido.'}</div>
      </div>
    );

  const endereco = pedido.endereco;
  const cupons = pedido.cupons_utilizados || [];
  const cartoes = pedido.pagamentos_cartao || [];
  const itens = pedido.itens || [];
  const subtotal = itens.reduce((acc, i) => acc + Number(i.valor_total_item || 0), 0);

  return (
    <div className={styles.orderDetail}>
      <Navbar />
      <div className={styles.body}>
        <Link to="/pedidos" className={styles.backToList} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>←</span>
          <div className={styles.voltarParaMeus}>Voltar para Meus Pedidos</div>
        </Link>

        <div className={styles.stepperCard}>
          <div className={styles.frame}>
            <b className={styles.logo}>Detalhe do Status do Pedido</b>
            <div className={styles.pedidoNx2981a}>
              Pedido #{pedido.codigo_pedido} •{' '}
              {new Date(pedido.data_pedido).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>

          <div className={styles.stepper}>
            {ETAPAS.map((etapa, idx) => {
              const ativo = cancelado ? false : idx <= etapaAtiva;
              const atual = cancelado ? false : idx === etapaAtiva;
              const ultimo = idx === ETAPAS.length - 1;
              return (
                <div key={etapa.key} className={ultimo ? styles.frame14 : styles.frame2}>
                  <div className={styles.backToList}>
                    <div className={atual ? styles.frame13 : ativo ? styles.frame4 : styles.frame16}>
                      <b className={styles.logo}>{idx + 1}</b>
                    </div>
                    <b className={atual ? styles.emTrnsito : ativo ? styles.emAberto : styles.entregue}>
                      {cancelado && idx === 0 ? rotuloStatus(pedido.status) : etapa.label}
                    </b>
                  </div>
                  {!ultimo && <div className={ativo ? styles.line : styles.line} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.detailsSplit}>
          <div className={styles.leftCol}>
            <div className={styles.addressPayment}>
              <div className={styles.address}>
                <b className={styles.endereoDeEntrega}>Endereço de Entrega</b>
                <div className={styles.arthurSchopenhauer}>
                  {endereco?.nome_identificador || 'Endereço'}
                </div>
                <div className={styles.avPaulista1000}>
                  {endereco
                    ? `${endereco.tipo_logradouro} ${endereco.logradouro}, ${endereco.numero} — ${endereco.bairro}, ${endereco.cidade}/${endereco.estado} — ${endereco.cep}`
                    : '-'}
                </div>
              </div>
              <div className={styles.address}>
                <b className={styles.endereoDeEntrega}>Forma de Pagamento</b>
                <div className={styles.frame17}>
                  {cartoes.length === 0 && <div>PIX ou outra forma</div>}
                  {cartoes.map((c: PedidoCartao) => (
                    <div key={c.id_pedido_cartao}>
                      {c.cartao_credito?.bandeira?.nome || 'Cartão'} final {c.cartao_credito?.numero_cartao.slice(-4)} — {brl(c.valor_pago)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.itemsBreakdown}>
              <b className={styles.produtosDoPedido}>Produtos do Pedido</b>
              {itens.map((item) => (
                <div key={item.id_item_pedido} className={styles.itemRow}>
                  <img src={coverUrl(item)} alt="Capa" className={styles.rectangleIcon} />
                  <div className={styles.frame18}>
                    <div className={styles.aOrdemDo}>
                      {item.livro?.titulo || `Livro #${item.id_livro}`}
                    </div>
                    <div className={styles.porCarloRovelli}>
                      {item.livro?.autor?.nome || ''}
                    </div>
                    <div className={styles.frame19}>
                      <div className={styles.frame20}>Qtd: {item.quantidade}</div>
                      <div className={styles.frame20}>{brl(item.valor_unitario)} un.</div>
                      <div className={styles.frame24}>
                        <div className={styles.frame25}>{brl(item.valor_total_item)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.summaryCard}>
              <b className={styles.produtosDoPedido}>Resumo do Pedido</b>
              <div className={styles.frame26}>
                <div className={styles.footerTop}>
                  <div className={styles.logo}>Subtotal</div>
                  <div className={styles.r21470}>{brl(subtotal)}</div>
                </div>
                {cupons.map((c: PedidoCupom) => (
                  <div className={styles.footerTop} key={c.id_pedido_cupom}>
                    <div className={styles.logo}>
                      Cupom ({c.cupom?.codigo_cupom || c.cupom_catalogo?.codigo_cupom || 'Promo'})
                    </div>
                    <div className={styles.r2500}>-{brl(c.valor_utilizado)}</div>
                  </div>
                ))}
                <div className={styles.footerTop}>
                  <div className={styles.logo}>Frete</div>
                  <div className={styles.r21470}>{brl(pedido.valor_frete)}</div>
                </div>
              </div>
              <div className={styles.line5} />
              <div className={styles.frame30}>
                <b className={styles.logo}>Total Pago</b>
                <b className={styles.r21220}>{brl(pedido.valor_total)}</b>
              </div>
              <div className={styles.line5} />
              <div className={styles.frame31}>
                {pedido.status === 'EM_TRANSITO' && (
                  <button className={styles.frame32} style={{ border: 'none', cursor: 'pointer' }}>
                    <b className={styles.logo}>Confirmar Recebimento</b>
                  </button>
                )}
                {['EM_ABERTO', 'EM_PROCESSAMENTO'].includes(pedido.status) && (
                  <button className={styles.frame33} style={{ border: 'none', cursor: 'pointer' }}>
                    <b className={styles.logo}>Cancelar Pedido</b>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
