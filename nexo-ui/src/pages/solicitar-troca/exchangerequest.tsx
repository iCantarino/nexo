import { useEffect, useState, type FunctionComponent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { trocasApi, API_BASE } from '../../services/api';
import type { Troca, ItemTroca } from '../../services/api';
import styles from './ExchangeRequest.module.css';

const ETAPAS = [
  { key: 'SOLICITADA', label: 'Solicitação Criada' },
  { key: 'ACEITA', label: 'Aprovada pela Nexo' },
  { key: 'ITEM_ENVIADO', label: 'Aguardando Despacho' },
  { key: 'ITEM_RECEBIDO', label: 'Item Recebido' },
];

const statusIndex = (s?: string) => {
  if (!s) return -1;
  return ETAPAS.findIndex((e) => e.key === s);
};

const coverUrl = (troca: Troca) => {
  const item = troca.itens?.[0]?.item_pedido;
  if (item?.livro?.imagem_principal_url) {
    return item.livro.imagem_principal_url.startsWith('http')
      ? item.livro.imagem_principal_url
      : `${API_BASE}${item.livro.imagem_principal_url}`;
  }
  return '/images/book-placeholder.png';
};

const ExchangeRequest: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [troca, setTroca] = useState<Troca | null>(null);
  const [loading, setLoading] = useState(true);
  const [transportadora, setTransportadora] = useState('DHL Express');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;
    trocasApi
      .detalhe(Number(id))
      .then((r) => setTroca(r.data))
      .catch(() => setErro('Troca não encontrada.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className={styles.exchangeRequest}>
        <Navbar />
        <div className={styles.body}>Carregando...</div>
      </div>
    );

  if (erro || !troca)
    return (
      <div className={styles.exchangeRequest}>
        <Navbar />
        <div className={styles.body}>{erro || 'Erro ao carregar troca.'}</div>
      </div>
    );

  const idx = statusIndex(troca.status);
  const item = troca.itens?.[0];
  const livro = item?.item_pedido?.livro;

  return (
    <div className={styles.exchangeRequest}>
      <Navbar />
      <div className={styles.body}>
        <b className={styles.solicitarTrocaDe}>Solicitar Troca de Item</b>

        <div className={styles.stepperCard}>
          <b className={styles.progressoDaTroca}>Progresso da Troca</b>
          <div className={styles.frame}>
            {ETAPAS.map((etapa, i) => {
              const ativo = i <= idx;
              const atual = i === idx;
              return (
                <div key={etapa.key} className={styles.frame4}>
                  <div className={atual ? styles.frame3 : ativo ? styles.frame3 : styles.frame5}>
                    <b className={styles.logo}>{i + 1}</b>
                  </div>
                  <div className={atual ? styles.solicitaoCriada : styles.aprovadaPelaNexo}>{etapa.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.frame12}>
          <div className={styles.frame13}>
            <b className={styles.detalhesDaTroca}>Detalhes da Troca</b>

            <div className={styles.frame14}>
              <b className={styles.logo}>Motivo da Troca</b>
              <div className={styles.frame17}>{troca.motivo}</div>
            </div>

            <div className={styles.frame14}>
              <b className={styles.logo}>Itens sendo trocados</b>
              {troca.itens?.map((it: ItemTroca) => (
                <div key={it.id_item_troca} className={styles.frame15}>
                  <div className={styles.logo}>
                    {it.item_pedido?.livro?.titulo || `Livro #${it.id_item_pedido}`} (Qtd: {it.quantidade})
                  </div>
                </div>
              ))}
            </div>

            {troca.status === 'ACEITA' && (
              <>
                <div className={styles.frame14}>
                  <b className={styles.logo}>Transportadora de Devolução Preferida</b>
                  <div className={styles.frame15}>
                    <select
                      value={transportadora}
                      onChange={(e) => setTransportadora(e.target.value)}
                      className={styles.logo}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '14px' }}
                    >
                      <option>DHL Express</option>
                      <option>FedEx Ground</option>
                      <option>UPS Standard</option>
                      <option>Correios</option>
                    </select>
                    <span className={styles.frameIcon}>▼</span>
                  </div>
                </div>

                <div className={styles.frame20}>
                  <button
                    className={styles.frame21}
                    onClick={() => navigate(`/despacho-item/${troca.id_troca}?transportadora=${encodeURIComponent(transportadora)}`)}
                    style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
                  >
                    <b className={styles.logo}>Enviar Solicitação</b>
                  </button>
                  <Link
                    to="/pedidos"
                    className={styles.frame22}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className={styles.informarDespachoDepois}>Informar Despacho Depois</div>
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className={styles.frame23}>
            <b className={styles.progressoDaTroca}>Item sendo Trocado</b>
            <img src={coverUrl(troca)} alt="Capa" className={styles.coverWrapperIcon} />
            <div className={styles.frame24}>
              <b className={styles.solicitarTrocaDe}>{livro?.titulo || 'Livro'}</b>
              <div className={styles.johannesItten}>{livro?.autor?.nome}</div>
              <b className={styles.r11990}>
                {livro ? `R$ ${Number(livro.valor_venda).toFixed(2).replace('.', ',')}` : ''}
              </b>
            </div>
            <div className={styles.line} />
            <div className={styles.trocasSoAceitas}>
              Trocas são aceitas em até 30 dias após a entrega. O item deve ser devolvido em suas
              condições originais.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRequest;
