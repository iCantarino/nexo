import { useEffect, useState, type FunctionComponent } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { trocasApi, API_BASE } from '../../services/api';
import type { Troca } from '../../services/api';
import styles from './ItemDispatch.module.css';

const coverUrl = (troca: Troca) => {
  const item = troca.itens?.[0]?.item_pedido;
  if (item?.livro?.imagem_principal_url) {
    return item.livro.imagem_principal_url.startsWith('http')
      ? item.livro.imagem_principal_url
      : `${API_BASE}${item.livro.imagem_principal_url}`;
  }
  return '/images/book-placeholder.png';
};

const ItemDispatch: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [troca, setTroca] = useState<Troca | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [transportadora, setTransportadora] = useState(searchParams.get('transportadora') || 'FedEx Ground');
  const [codigoRastreio, setCodigoRastreio] = useState('');
  const [dataDespacho, setDataDespacho] = useState(new Date().toISOString().split('T')[0]);
  const [previsaoEntrega, setPrevisaoEntrega] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!id) return;
    trocasApi
      .detalhe(Number(id))
      .then((r) => setTroca(r.data))
      .catch(() => setErro('Troca não encontrada.'))
      .finally(() => setLoading(false));
  }, [id]);

  const confirmar = async () => {
    if (!codigoRastreio.trim()) {
      setErro('Informe o código de rastreio.');
      return;
    }
    if (!previsaoEntrega) {
      setErro('Informe a previsão de entrega.');
      return;
    }
    setEnviando(true);
    try {
      await trocasApi.enviar(Number(id));
      alert('Despacho confirmado! Aguarde o recebimento do item pela Nexo.');
      navigate('/pedidos');
    } catch (e: any) {
      setErro(e.response?.data?.detail || 'Erro ao confirmar despacho.');
    } finally {
      setEnviando(false);
    }
  };

  if (loading)
    return (
      <div className={styles.itemDispatch}>
        <Navbar />
        <div className={styles.body}>Carregando...</div>
      </div>
    );

  if (erro || !troca)
    return (
      <div className={styles.itemDispatch}>
        <Navbar />
        <div className={styles.body}>{erro || 'Erro ao carregar troca.'}</div>
      </div>
    );

  const livro = troca.itens?.[0]?.item_pedido?.livro;

  return (
    <div className={styles.itemDispatch}>
      <Navbar />
      <div className={styles.body}>
        <b className={styles.logo}>Confirmar Despacho</b>

        <div className={styles.frame}>
          <div className={styles.frame2}>
            <b className={styles.reciboEDetalhes}>Recibo e Detalhes do Envio</b>

            <div className={styles.frame3}>
              <b className={styles.logo}>Selecionar Transportadora *</b>
              <div className={styles.frame4}>
                <select
                  value={transportadora}
                  onChange={(e) => setTransportadora(e.target.value)}
                  className={styles.logo}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '14px' }}
                >
                  <option>FedEx Ground</option>
                  <option>DHL Express</option>
                  <option>UPS Standard</option>
                  <option>Correios</option>
                </select>
                <span className={styles.frameIcon}>▼</span>
              </div>
            </div>

            <div className={styles.frame3}>
              <b className={styles.logo}>Código de Rastreio *</b>
              <input
                value={codigoRastreio}
                onChange={(e) => setCodigoRastreio(e.target.value)}
                placeholder="FX-988172901-US"
                className={styles.frame6}
                style={{ border: 'none', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div className={styles.frame7}>
              <div className={styles.frame8}>
                <b className={styles.logo}>Data de Despacho *</b>
                <input
                  type="date"
                  value={dataDespacho}
                  onChange={(e) => setDataDespacho(e.target.value)}
                  className={styles.frame9}
                  style={{ border: 'none', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <div className={styles.frame8}>
                <b className={styles.logo}>Previsão de Entrega *</b>
                <input
                  type="date"
                  value={previsaoEntrega}
                  onChange={(e) => setPrevisaoEntrega(e.target.value)}
                  className={styles.frame9}
                  style={{ border: 'none', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {erro && <div style={{ color: '#b91c1c', fontSize: '13px' }}>{erro}</div>}

            <div className={styles.frame12}>
              <button
                className={styles.frame13}
                onClick={confirmar}
                disabled={enviando}
                style={{ cursor: enviando ? 'not-allowed' : 'pointer', border: 'none', fontFamily: 'inherit' }}
              >
                <b className={styles.logo}>{enviando ? 'Confirmando...' : 'Confirmar Despacho'}</b>
              </button>
              <div className={styles.frame14}>
                <b className={styles.aprovadoPelaNexo}>Status: {troca.status.replace(/_/g, ' ')}</b>
              </div>
            </div>
          </div>

          <div className={styles.frame15}>
            <b className={styles.aprovadoPelaNexo}>Resumo da Troca</b>
            <div className={styles.frame16}>
              <img src={coverUrl(troca)} alt="Capa" className={styles.rectangleIcon} />
              <div className={styles.frame17}>
                <b className={styles.logo}>{livro?.titulo || 'Livro'}</b>
                <div className={styles.johannesItten}>{livro?.autor?.nome}</div>
              </div>
            </div>
            <div className={styles.line} />
            <div className={styles.frame18}>
              <div className={styles.logo}>
                <b>Motivo da Devolução:</b> {troca.motivo}
              </div>
              <div className={styles.logo}>
                <b>ID da Solicitação:</b> #{troca.id_troca}
              </div>
              <div className={styles.logo}>
                <b>Pedido:</b> {troca.pedido?.codigo_pedido}
              </div>
            </div>
            <Link to={`/solicitar-troca/${troca.id_troca}`} style={{ color: '#d97706', fontSize: '13px' }}>
              Voltar para solicitação
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDispatch;
