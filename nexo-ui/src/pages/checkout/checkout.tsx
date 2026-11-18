import { useState, useEffect, type FunctionComponent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  carrinhoApi, enderecosApi, cartoesApi, cuponsApi,
  pedidosApi, bandeirasApi, valorDoCupom, rotuloStatus,
} from '../../services/api';
import type {
  CarrinhoData, Endereco, CartaoCredito, Cupom, Bandeira, Pedido, CreateEnderecoData, CreateCartaoData,
} from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import styles from './Checkout.module.css';

const Checkout: FunctionComponent = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [carrinho, setCarrinho] = useState<CarrinhoData | null>(null);
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [cuponsDisponiveis, setCuponsDisponiveis] = useState<Cupom[]>([]);
  const [bandeiras, setBandeiras] = useState<Bandeira[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // Seleções
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<number | null>(null);
  const [cartoesSelecionados, setCartoesSelecionados] = useState<{ id_cartao: number; valor_pago: number }[]>([]);
  const [cupomPromoCheckout, setCupomPromoCheckout] = useState<string>(searchParams.get('cupom_promo') || '');
  const [cupomTrocaCheckout, setCupomTrocaCheckout] = useState<string>(searchParams.get('cupom_troca') || '');
  const [valorFrete, setValorFrete] = useState(0);
  const [usarPix, setUsarPix] = useState(false);
  const [valorPix, setValorPix] = useState(0);
  const [pedidoCriado, setPedidoCriado] = useState<Pedido | null>(null);

  // Modais
  const [modalNovoEndereco, setModalNovoEndereco] = useState(false);
  const [modalNovoCartao, setModalNovoCartao] = useState(false);
  const [salvarEndereco, setSalvarEndereco] = useState(true);
  const [salvarCartao, setSalvarCartao] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cartRes, endRes, cartaoRes, cuponsRes, bandRes] = await Promise.all([
          carrinhoApi.listar(),
          enderecosApi.listar(),
          cartoesApi.listar(),
          cuponsApi.meusCupons(),
          bandeirasApi.listar(),
        ]);
        setCarrinho(cartRes.data);
        setEnderecos(endRes.data);
        setCartoes(cartaoRes.data);
        setCuponsDisponiveis(cuponsRes.data.filter(c => !c.utilizado));
        setBandeiras(bandRes.data);

        const padrao = endRes.data.find(e => e.padrao);
        const enderecoId = padrao ? padrao.id_endereco : (endRes.data.length > 0 ? endRes.data[0].id_endereco : null);
        if (enderecoId) {
          setEnderecoSelecionado(enderecoId);
          try {
            const freteRes = await pedidosApi.calcularFrete(enderecoId);
            setValorFrete(freteRes.data.valor_frete);
          } catch (e: any) {
            setMensagem(e.response?.data?.detail || 'Erro ao calcular frete.');
          }
        }
      } catch (e: any) {
        console.error(e);
        setMensagem('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const itensValidos = carrinho?.itens.filter(i => !i.removido_por_expiracao) || [];
  const subtotal = itensValidos.reduce((acc, i) => acc + Number(i.livro?.valor_venda || 0) * i.quantidade, 0);
  const arred = (n: number) => Math.round(n * 100) / 100;
  const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',');

  const cupomPromoObj = cuponsDisponiveis.find(c => c.codigo_cupom === cupomPromoCheckout && c.tipo === 'PROMOCIONAL');
  const cupomTrocaObj = cuponsDisponiveis.find(c => c.codigo_cupom === cupomTrocaCheckout && c.tipo === 'TROCA');
  const totalGeral = arred(subtotal + valorFrete);
  const descontoBruto = (cupomPromoObj ? valorDoCupom(cupomPromoObj, subtotal) : 0) + (cupomTrocaObj ? valorDoCupom(cupomTrocaObj, subtotal) : 0);
  // Cupons abatem itens + frete; o que passar do total vira cupom de troca (RN0036).
  const valorDesconto = arred(Math.min(descontoBruto, totalGeral));
  const trocoCupom = arred(Math.max(descontoBruto - totalGeral, 0));
  const aPagar = arred(Math.max(totalGeral - valorDesconto, 0));
  const totalCartoes = arred(cartoesSelecionados.reduce((acc, c) => acc + (c.valor_pago || 0), 0));
  const totalPix = usarPix ? arred(valorPix || 0) : 0;
  const faltaPagar = arred(aPagar - totalCartoes - totalPix);
  const rotuloCupom = (c: Cupom) =>
    c.percentual ? `${c.codigo_cupom} - ${Number(c.percentual)}% de desconto` : `${c.codigo_cupom} - ${fmt(Number(c.valor))}`;

  // O frete faz parte do total, então é recalculado sempre que o endereço muda.
  const handleSelecionarEndereco = async (idEndereco: number) => {
    setEnderecoSelecionado(idEndereco);
    try {
      const res = await pedidosApi.calcularFrete(idEndereco);
      setValorFrete(res.data.valor_frete);
    } catch (e: any) {
      setMensagem(e.response?.data?.detail || 'Erro ao calcular frete.');
    }
  };

  // Atalho: coloca o que falta pagar no cartão informado.
  const preencherRestante = (id_cartao: number) => {
    const outros = cartoesSelecionados.filter(c => c.id_cartao !== id_cartao).reduce((a, c) => a + (c.valor_pago || 0), 0);
    handleValorCartao(id_cartao, Math.max(arred(aPagar - outros - totalPix), 0));
  };

  const handleAdicionarCartao = (id_cartao: number) => {
    if (cartoesSelecionados.some(c => c.id_cartao === id_cartao)) return;
    setCartoesSelecionados([...cartoesSelecionados, { id_cartao, valor_pago: 0 }]);
  };

  const handleRemoverCartao = (id_cartao: number) => {
    setCartoesSelecionados(cartoesSelecionados.filter(c => c.id_cartao !== id_cartao));
  };

  const handleValorCartao = (id_cartao: number, valor: number) => {
    setCartoesSelecionados(cartoesSelecionados.map(c =>
      c.id_cartao === id_cartao ? { ...c, valor_pago: valor } : c
    ));
  };

  const handleFinalizar = async () => {
    if (!enderecoSelecionado) { setMensagem('Selecione um endereço.'); return; }
    setFinalizando(true);
    setMensagem('');
    try {
      const codigos_cupom: string[] = [];
      if (cupomPromoCheckout) codigos_cupom.push(cupomPromoCheckout);
      if (cupomTrocaCheckout) codigos_cupom.push(cupomTrocaCheckout);
      const payload: any = {
        id_endereco_entrega: enderecoSelecionado,
        cartoes: cartoesSelecionados.filter(c => c.valor_pago > 0),
        codigos_cupom,
      };
      if (usarPix && valorPix > 0) payload.pix = { valor_pago: valorPix };
      const res = await pedidosApi.finalizar(payload);
      setPedidoCriado(res.data);
    } catch (e: any) {
      // RN0032: estoque alterado -> o carrinho foi atualizado; avisa o usuário.
      const alertas: string[] | undefined = e.response?.data?.alertas;
      setMensagem(alertas?.length ? `Atenção: ${alertas.join(' ')} Revise o carrinho.` : e.response?.data?.detail || 'Erro ao finalizar compra.');
    } finally {
      setFinalizando(false);
    }
  };

  const handleCriarEndereco = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = e.currentTarget;
      const val = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement)?.value;
      const data: CreateEnderecoData = {
        nome_identificador: val('nome_identificador'),
        tipo: val('tipo') as 'ENTREGA' | 'COBRANCA' | 'AMBOS',
        tipo_residencia: val('tipo_residencia'),
        tipo_logradouro: val('tipo_logradouro'),
        logradouro: val('logradouro'),
        numero: val('numero'),
        bairro: val('bairro'),
        cep: val('cep'),
        cidade: val('cidade'),
        estado: val('estado'),
        pais: val('pais'),
        observacoes: val('observacoes') || null,
      };
      const res = salvarEndereco
        ? await enderecosApi.criar(data)
        : { data: { id_endereco: 0, ...data, padrao: false } };
      setEnderecoSelecionado(res.data.id_endereco);
      if (salvarEndereco) setEnderecos([...enderecos, res.data as Endereco]);
      setModalNovoEndereco(false);
    } catch (x: any) { alert(x.response?.data?.detail || 'Erro'); }
    finally { setSaving(false); }
  };
  const handleCriarCartao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = e.currentTarget;
      const val = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement)?.value;
      const data: CreateCartaoData = {
        id_bandeira: Number(val('id_bandeira')),
        numero_cartao: val('numero_cartao'),
        nome_impresso: val('nome_impresso'),
        codigo_seguranca: val('codigo_seguranca'),
        preferencial: (form.elements.namedItem('preferencial') as HTMLInputElement)?.checked,
      };
      const res = salvarCartao
        ? await cartoesApi.criar(data)
        : { data: { id_cartao: 0, ...data } };
      handleAdicionarCartao(res.data.id_cartao);
      if (salvarCartao) setCartoes([...cartoes, res.data as CartaoCredito]);
      setModalNovoCartao(false);
    } catch (x: any) { alert(x.response?.data?.detail || 'Erro'); }
    finally { setSaving(false); }
  };

if (pedidoCriado) {
    return (
      <div className={styles.checkout}>
        <Navbar />
        <div className={styles.checkoutBody}>
          <div className={styles.checkoutLeft}>
            {(() => {
              const reprovado = pedidoCriado.status === 'REPROVADA';
              return (
                <>
                  <b className={styles.checkoutSeguro}>{reprovado ? 'Pagamento não aprovado' : 'Pedido Confirmado!'}</b>
                  {reprovado && (
                    <div style={{ padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 12, fontSize: 14, color: '#b91c1c' }}>
                      {pedidoCriado.observacao || 'O pagamento foi recusado.'} Os itens foram desbloqueados e seus cupons foram preservados.
                    </div>
                  )}
                </>
              );
            })()}
            <div style={{ padding: '24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
              <b style={{ fontSize: 16, color: '#15803d' }} data-testid="codigo-pedido">Código: {pedidoCriado.codigo_pedido}</b>
              <div style={{ marginTop: 8, fontSize: 14, color: '#475569' }}>
                Status: <b data-testid="status-pedido">{rotuloStatus(pedidoCriado.status)}</b>
              </div>
              <div style={{ marginTop: 4, fontSize: 14, color: '#475569' }}>
                Valor Total: R$ {Number(pedidoCriado.valor_total).toFixed(2).replace('.', ',')}
              </div>
              {Number(pedidoCriado.valor_pix || 0) > 0 && (
                <div style={{ marginTop: 4, fontSize: 14, color: '#475569' }}>
                  Pago via PIX: R$ {Number(pedidoCriado.valor_pix).toFixed(2).replace('.', ',')} (simulado)
                </div>
              )}
            </div>
            <Link to="/home" style={{ marginTop: 16, display: 'inline-block', padding: '10px 20px', background: '#0f172a', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 14 }}>
              Voltar ao Catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className={styles.checkout}><div className={styles.checkoutBody}><b className={styles.checkoutSeguro}>Carregando...</b></div></div>;
  }

  return (
    <div className={styles.checkout}>
      <Navbar />
<div className={styles.checkoutBody}>
        <div className={styles.checkoutLeft}>
          <b className={styles.checkoutSeguro}>Checkout Seguro</b>
          {mensagem && <div data-testid="mensagem-checkout" style={{ color: '#dc2626', fontSize: 14, padding: '8px 0' }}>{mensagem}</div>}

          {/* 1. Endereço de Entrega */}
          <div className={styles.deliveryAddress}>
            <b className={styles.checkoutSeguro}>1. Endereço de Entrega</b>
            <div className={styles.addressGrid}>
              {enderecos.map(addr => (
                <div key={addr.id_endereco}
                  data-testid={`endereco-${addr.id_endereco}`}
                  className={enderecoSelecionado === addr.id_endereco ? styles.addrCard1 : styles.addrCard2}
                  onClick={() => handleSelecionarEndereco(addr.id_endereco)}
                  role="button" tabIndex={0}
                  style={{ cursor: 'pointer', border: enderecoSelecionado === addr.id_endereco ? '2px solid #d97706' : '1px solid #e2e8f0', position: 'relative' }}>
                  {enderecoSelecionado === addr.id_endereco && (
                    <span style={{ position: 'absolute', top: 12, right: 12, color: '#d97706', fontSize: 16 }}>✓</span>
                  )}
                  <div className={styles.frame}>
                    <b className={styles.logo}>{addr.nome_identificador}{addr.padrao ? ' (Padrão)' : ''}</b>
                  </div>
                  <div className={styles.arthurSchopenhauer}>{user?.nome || 'Cliente'}</div>
                  <div className={styles.arthurSchopenhauer}>{addr.logradouro}, {addr.numero}{addr.observacoes ? ` - ${addr.observacoes}` : ''}</div>
                  <div className={styles.arthurSchopenhauer}>{addr.cidade}, {addr.estado} - {addr.cep}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setModalNovoEndereco(true)} data-testid="novo-endereco"
                style={{ cursor: 'pointer', padding: '10px 16px', borderRadius: 6, border: '1px dashed #cbd5e1', background: 'transparent', color: '#0f172a', fontSize: 14, fontWeight: 600 }}>
                + Adicionar Novo Endereço de Entrega
              </button>
            </div>
            {valorFrete > 0 && (
              <div style={{ marginTop: 8, fontSize: 14, color: '#15803d' }}>
                Frete: {fmt(valorFrete)}
              </div>
            )}
          </div>

          {/* 2. Forma de Pagamento */}
          <div className={styles.paymentMethod} style={{ marginTop: 24 }}>
            <b className={styles.checkoutSeguro}>2. Forma de Pagamento</b>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cartoes.filter(c => c.ativo !== false).map(cartao => {
                const selecionado = cartoesSelecionados.some(c => c.id_cartao === cartao.id_cartao);
                const cs = cartoesSelecionados.find(c => c.id_cartao === cartao.id_cartao);
                return (
                  <div
                    key={cartao.id_cartao}
                    data-testid={`chip-cartao-${cartao.id_cartao}`}
                    onClick={() => { if (selecionado) handleRemoverCartao(cartao.id_cartao); else handleAdicionarCartao(cartao.id_cartao); }}
                    role="button"
                    tabIndex={0}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 8,
                      border: selecionado ? '2px solid #d97706' : '1px solid #e2e8f0',
                      background: '#fff',
                      padding: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      position: 'relative',
                    }}
                  >
                    {selecionado && <span style={{ position: 'absolute', top: 12, right: 12, color: '#d97706', fontSize: 16 }}>✓</span>}
                    <span style={{ fontSize: 20 }}>💳</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                        {cartao.bandeira?.nome || 'Cartão'} Final {(cartao.numero_cartao || '').slice(-4)}
                        {cartao.preferencial && <span style={{ color: '#d97706', marginLeft: 6 }}>★</span>}
                      </div>
                      <div style={{ fontSize: 13, color: '#475569' }}>Val: 12/30</div>
                    </div>
                    {selecionado && cs && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                        <span style={{ fontSize: 13, color: '#475569' }}>R$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={cs.valor_pago}
                          data-testid={`cartao-valor-${cs.id_cartao}`}
                          onChange={(e) => handleValorCartao(cs.id_cartao, Number(e.target.value))}
                          style={{ width: 80, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13 }}
                        />
                        <span onClick={(e) => { e.stopPropagation(); preencherRestante(cs.id_cartao); }} role="button" tabIndex={0}
                          style={{ cursor: 'pointer', color: '#d97706', fontSize: 12, textDecoration: 'underline' }}>restante</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <button onClick={() => setModalNovoCartao(true)} data-testid="novo-cartao"
                style={{ cursor: 'pointer', padding: '10px 16px', borderRadius: 6, border: '1px dashed #cbd5e1', background: 'transparent', color: '#0f172a', fontSize: 14, fontWeight: 600, alignSelf: 'flex-start' }}>
                + Adicionar Novo Cartão de Crédito
              </button>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                <input type="checkbox" checked={usarPix} data-testid="pix-checkbox"
                  onChange={(e) => { setUsarPix(e.target.checked); if (!e.target.checked) setValorPix(0); }} />
                <b style={{ textTransform: 'uppercase' }}>Pagar parte com PIX</b>
              </label>
              {usarPix && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span>R$</span>
                  <input type="number" min="0" step="0.01" value={valorPix} data-testid="pix-valor"
                    onChange={(e) => setValorPix(Number(e.target.value))}
                    style={{ width: 90, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13 }} />
                  <span role="button" tabIndex={0} style={{ cursor: 'pointer', color: '#d97706', fontSize: 12, textDecoration: 'underline' }}
                    onClick={() => setValorPix(Math.max(arred(aPagar - totalCartoes), 0))}>usar restante</span>
                </div>
              )}

              <div data-testid="pagamento-status"
                style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: Math.abs(faltaPagar) < 0.005 ? '#15803d' : '#dc2626' }}>
                {Math.abs(faltaPagar) < 0.005
                  ? 'Pagamento completo.'
                  : faltaPagar > 0
                    ? `Falta pagar ${fmt(faltaPagar)}`
                    : `Pagamento excede o total em ${fmt(-faltaPagar)}`}
              </div>
            </div>
          </div>

          {/* 3. Cupons */}
          <div style={{ marginTop: 24 }}>
            <b className={styles.checkoutSeguro}>3. Cupons</b>
            <div style={{ marginTop: 8, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cuponsDisponiveis.filter(c => c.tipo === 'PROMOCIONAL').map(c => (
                <label key={c.id_cupom} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" name="cupom_promo" checked={cupomPromoCheckout === c.codigo_cupom}
                    onChange={() => setCupomPromoCheckout(c.codigo_cupom)} />
                  {rotuloCupom(c)}
                </label>
              ))}
              {cuponsDisponiveis.filter(c => c.tipo === 'PROMOCIONAL').length === 0 && (
                <div style={{ color: '#94a3b8' }}>Nenhum cupom promocional disponível</div>
              )}
              {cupomPromoCheckout && (
                <span style={{ cursor: 'pointer', color: '#dc2626', fontSize: 12 }}
                  onClick={() => setCupomPromoCheckout('')}>remover cupom promocional</span>
              )}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8 }} />
              {cuponsDisponiveis.filter(c => c.tipo === 'TROCA').map(c => (
                <label key={c.id_cupom} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" name="cupom_troca" checked={cupomTrocaCheckout === c.codigo_cupom}
                    onChange={() => setCupomTrocaCheckout(c.codigo_cupom)} />
                  {rotuloCupom(c)}
                </label>
              ))}
              {cuponsDisponiveis.filter(c => c.tipo === 'TROCA').length === 0 && (
                <div style={{ color: '#94a3b8' }}>Nenhum cupom de troca disponível</div>
              )}
              {cupomTrocaCheckout && (
                <span style={{ cursor: 'pointer', color: '#dc2626', fontSize: 12 }}
                  onClick={() => setCupomTrocaCheckout('')}>remover cupom de troca</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.checkoutRight}>
          <b className={styles.checkoutSeguro}>Resumo do Pedido</b>
          <div className={styles.orderSummary}>
            <div className={styles.orderedItems}>
              {itensValidos.map(item => (
                <div key={item.id_item_carrinho} className={styles.frame12}>
                  <div className={styles.aOrdemDo}>{item.livro?.titulo || 'Livro'} (x{item.quantidade})</div>
                  <div className={styles.arthurSchopenhauer}>R$ {(Number(item.livro?.valor_venda || 0) * item.quantidade).toFixed(2).replace('.', ',')}</div>
                </div>
              ))}
            </div>
            {(cupomPromoCheckout || cupomTrocaCheckout) && (
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Cupons Aplicados</div>
                {cupomPromoCheckout && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#15803d' }}>
                    <span>{cupomPromoCheckout}</span>
                    <span>-{fmt(valorDoCupom(cuponsDisponiveis.find(c => c.codigo_cupom === cupomPromoCheckout && c.tipo === 'PROMOCIONAL')!, subtotal) || 0)}</span>
                  </div>
                )}
                {cupomTrocaCheckout && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#15803d' }}>
                    <span>{cupomTrocaCheckout}</span>
                    <span>-{fmt(valorDoCupom(cuponsDisponiveis.find(c => c.codigo_cupom === cupomTrocaCheckout && c.tipo === 'TROCA')!, subtotal) || 0)}</span>
                  </div>
                )}
              </div>
            )}
            <div className={styles.totalsColumn}>
              <div className={styles.footerTop}>
                <div className={styles.logo}>Subtotal dos Itens</div>
                <div className={styles.r21470} data-testid="resumo-subtotal">R$ {subtotal.toFixed(2).replace('.', ',')}</div>
              </div>
              {valorDesconto > 0 && (
                <div className={styles.footerTop}>
                  <div className={styles.logo}>Desconto</div>
                  <div className={styles.r25002} data-testid="resumo-desconto">-{fmt(valorDesconto)}</div>
                </div>
              )}
              <div className={styles.footerTop}>
                <div className={styles.logo}>Frete</div>
                <div className={styles.r21470} data-testid="resumo-frete">{fmt(valorFrete)}</div>
              </div>
              <div className={styles.line} />
              <div className={styles.frame19}>
                <b className={styles.logo}>Total Geral</b>
                <b className={styles.r21220} data-testid="resumo-total">{fmt(aPagar)}</b>
              </div>
              {trocoCupom > 0 && (
                <div data-testid="troco-notice" style={{ fontSize: 12, color: '#15803d' }}>
                  Os cupons superam a compra: um cupom de troca de {fmt(trocoCupom)} será gerado.
                </div>
              )}
            </div>
            <div className={styles.confirmCta} onClick={handleFinalizar} role="button" tabIndex={0} data-testid="confirmar-pedido"
              style={{ cursor: finalizando ? 'not-allowed' : 'pointer', opacity: finalizando ? 0.7 : 1 }}>
              <b className={styles.logo} style={{ color: '#fff' }}>{finalizando ? 'Finalizando...' : 'Confirmar Pedido & Pagar'}</b>
            </div>
          </div>
        </div>
      </div>
      {modalNovoEndereco && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <form onSubmit={handleCriarEndereco} style={{ background: '#fff', borderRadius: 12, padding: 24, width: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
            <b style={{ fontSize: 18, marginBottom: 16, display: 'block' }}>Novo Endereço</b>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input name="nome_identificador" placeholder="Identificador (ex: Casa)" required style={{ gridColumn: '1 / -1', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              <select name="tipo" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, background: '#fff' }}>
                <option value="ENTREGA">Entrega</option>
                <option value="COBRANCA">Cobrança</option>
                <option value="AMBOS">Ambos</option>
              </select>
              <select name="tipo_residencia" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, background: '#fff' }}>
                <option value="Casa">Casa</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Comercial">Comercial</option>
              </select>
              <select name="tipo_logradouro" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, background: '#fff' }}>
                <option value="Rua">Rua</option>
                <option value="Avenida">Avenida</option>
                <option value="Praça">Praça</option>
                <option value="Estrada">Estrada</option>
              </select>
              <input name="logradouro" placeholder="Logradouro" required style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              <input name="numero" placeholder="Número" required style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              <input name="bairro" placeholder="Bairro" required style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              <input name="cep" placeholder="CEP" required style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              <input name="cidade" placeholder="Cidade" required style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              <input name="estado" placeholder="Estado (ex: SP)" required style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              <input name="pais" placeholder="País" defaultValue="Brasil" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              <input name="observacoes" placeholder="Observações (opcional)" style={{ gridColumn: '1 / -1', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 14 }}>
              <input type="checkbox" checked={salvarEndereco} onChange={(e) => setSalvarEndereco(e.target.checked)} />
              Salvar endereço no perfil
            </label>
            <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModalNovoEndereco(false)} style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, background: '#fff', color: '#475569' }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{ cursor: saving ? 'not-allowed' : 'pointer', padding: '8px 16px', borderRadius: 6, background: '#0f172a', color: '#fff', fontSize: 14, border: 'none', opacity: saving ? 0.7 : 1 }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        </div>
      )}
{modalNovoCartao && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <form onSubmit={handleCriarCartao} style={{ background: '#fff', borderRadius: 12, padding: 24, width: 420, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
            <b style={{ fontSize: 18, marginBottom: 16, display: 'block' }}>Novo Cartão</b>
            <select name="id_bandeira" required style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 8, fontSize: 14, background: '#fff' }}>
              {bandeiras.map(b => <option key={b.id_bandeira} value={b.id_bandeira}>{b.nome}</option>)}
            </select>
            <input name="numero_cartao" placeholder="Número do cartão" required style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 8, fontSize: 14, boxSizing: 'border-box' }} />
            <input name="nome_impresso" placeholder="Nome impresso" required style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 8, fontSize: 14, boxSizing: 'border-box' }} />
            <input name="codigo_seguranca" placeholder="CVV" maxLength={4} required style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 8, fontSize: 14, boxSizing: 'border-box' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 14 }}>
              <input type="checkbox" name="preferencial" checked={salvarCartao} onChange={(e) => setSalvarCartao(e.target.checked)} />
              Salvar cartão no perfil
            </label>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModalNovoCartao(false)} style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, background: '#fff', color: '#475569' }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{ cursor: saving ? 'not-allowed' : 'pointer', padding: '8px 16px', borderRadius: 6, background: '#0f172a', color: '#fff', fontSize: 14, border: 'none', opacity: saving ? 0.7 : 1 }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        </div>
      )}
<div className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <b className={styles.logo}>Nexo</b>
            <div className={styles.nexoUma}>Nexo é uma livraria virtual curada, dedicada a obras culturais de alta qualidade, filosofia clássica, ciência de vanguarda e edições raras de arte.</div>
          </div>
          <div className={styles.footerLinksRow}>
            <div className={styles.colHelp}>
              <b className={styles.atendimento}>Atendimento</b>
              <div className={styles.logo}>Fale Conosco</div>
              <div className={styles.logo}>{`Entregas & Devoluções`}</div>
              <div className={styles.logo}>Perguntas Frequentes</div>
              <div className={styles.logo}>Encontre uma Loja</div>
            </div>
            <div className={styles.colHelp}>
              <b className={styles.atendimento}>Jurídico</b>
              <div className={styles.logo}>Política de Privacidade</div>
              <div className={styles.logo}>Termos de Uso</div>
              <div className={styles.logo}>Aviso de Direitos Autorais</div>
              <div className={styles.logo}>Mapa do Site</div>
            </div>
          </div>
        </div>
        <div className={styles.line5} />
        <div className={styles.footerBottom}>
          <div className={styles.logo}>© 2026 Nexo Inc. Conhecimento curado para mentes curiosas.</div>
          <div className={styles.socials}>
            <span className={styles.shoppingBagIcon} />
            <span className={styles.shoppingBagIcon} />
            <span className={styles.shoppingBagIcon} />
          </div>
        </div>
      </div>
    </div>);
};

export default Checkout;