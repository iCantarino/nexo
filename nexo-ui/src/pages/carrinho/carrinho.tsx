import { useState, useEffect, useRef, type FunctionComponent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { carrinhoApi, cuponsApi, valorDoCupom } from '../../services/api';
import type { CarrinhoData, CarrinhoItem, Cupom } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';

import styles from './ShoppingCart.module.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

const ShoppingCart: FunctionComponent = () => {
  useAuth();
  const navigate = useNavigate();
  const [carrinho, setCarrinho] = useState<CarrinhoData | null>(null);
  const [cuponsDisponiveis, setCuponsDisponiveis] = useState<Cupom[]>([]);
  const [cupomPromocional, setCupomPromocional] = useState<string>('');
  const [campoCupom, setCampoCupom] = useState<string>('');
  const [cupomTrocaSelecionado, setCupomTrocaSelecionado] = useState<string>('');
  const [cupomTrocaAberto, setCupomTrocaAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setCupomTrocaAberto(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const loadData = async () => {
    setLoading(true);
    try {
      const [cartRes, cuponsRes] = await Promise.all([
        carrinhoApi.listar(),
        cuponsApi.meusCupons(),
      ]);
      setCarrinho(cartRes.data);
      const naoUtilizados = cuponsRes.data.filter(c => !c.utilizado);
      setCuponsDisponiveis(naoUtilizados);
    } catch (e: any) {
      console.error(e);
      setMensagem('Erro ao carregar carrinho.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAtualizarQuantidade = async (item: CarrinhoItem, novaQtd: number) => {
    if (novaQtd < 1) return;
    try {
      const res = await carrinhoApi.atualizarItem(item.id_item_carrinho, novaQtd);
      setCarrinho(res.data);
    } catch (e: any) {
      setMensagem(e.response?.data?.detail || 'Erro ao atualizar quantidade.');
    }
  };

  const handleRemoverItem = async (item: CarrinhoItem) => {
    try {
      await carrinhoApi.removerItem(item.id_item_carrinho);
      loadData();
    } catch (e: any) {
      setMensagem(e.response?.data?.detail || 'Erro ao remover item.');
    }
  };

  const itensValidos = carrinho?.itens.filter(i => !i.removido_por_expiracao) || [];
  const subtotal = itensValidos.reduce((acc, item) => {
    const valor = Number(item.livro?.valor_venda || 0);
    return acc + valor * item.quantidade;
  }, 0);

  const cupomPromoObj = cuponsDisponiveis.find(c => c.codigo_cupom === cupomPromocional && c.tipo === 'PROMOCIONAL');
  const cupomTrocaObj = cuponsDisponiveis.find(c => c.codigo_cupom === cupomTrocaSelecionado && c.tipo === 'TROCA');
  const qtdeItens = itensValidos.reduce((acc, i) => acc + i.quantidade, 0);
  const freteEstimado = 5 + 2 * qtdeItens;
  const descontoBruto = (cupomPromoObj ? valorDoCupom(cupomPromoObj, subtotal) : 0) + (cupomTrocaObj ? valorDoCupom(cupomTrocaObj, subtotal) : 0);
  // Os cupons abatem itens + frete; o que passar do total vira cupom de troca (RN0036).
  const valorDesconto = Math.min(descontoBruto, subtotal + freteEstimado);
  const total = Math.max(subtotal + freteEstimado - valorDesconto, 0);
  const cuponsPromocionais = cuponsDisponiveis.filter(c => c.tipo === 'PROMOCIONAL');
  const cuponsTroca = cuponsDisponiveis.filter(c => c.tipo === 'TROCA');
  const rotuloCupom = (c: Cupom) =>
    c.percentual ? `${c.codigo_cupom} - ${Number(c.percentual)}% de desconto` : `${c.codigo_cupom} - R$ ${Number(c.valor).toFixed(2).replace('.', ',')}`;

  const aplicarCupomPromocional = () => {
    const codigo = campoCupom.trim().toUpperCase();
    if (!codigo) return;
    const c = cuponsPromocionais.find(cp => cp.codigo_cupom === codigo);
    if (!c) { setMensagem('Cupom promocional inválido, já utilizado ou indisponível para você.'); return; }
    setCupomPromocional(c.codigo_cupom);
    setMensagem('');
  };

  // RNF0042: itens removidos por expiração do bloqueio desabilitam a compra até serem reincluídos.
  const itensExpirados = carrinho?.itens.filter(i => i.removido_por_expiracao) || [];
  const podeComprar = itensValidos.length > 0 && itensExpirados.length === 0;

  const handleReincluirExpirados = async () => {
    try {
      const res = await carrinhoApi.reincluirExpirados();
      setCarrinho(res.data);
      setMensagem((res.data.alertas || []).join(' '));
    } catch (e: any) {
      setMensagem(e.response?.data?.detail || 'Erro ao reincluir itens.');
    }
  };

  const handleFinalizar = () => {
    if (!podeComprar) return;
    const params = new URLSearchParams();
    if (cupomPromocional) params.set('cupom_promo', cupomPromocional);
    if (cupomTrocaSelecionado) params.set('cupom_troca', cupomTrocaSelecionado);
    navigate(`/checkout?${params.toString()}`);
  };

  if (loading) {
    return <div className={styles.shoppingCart}><div className={styles.cartBody}><b className={styles.seuCarrinhoDe}>Carregando...</b></div></div>;
  }

  return (
    <div className={styles.shoppingCart}>
      <Navbar cartBadge={qtdeItens} />

<div className={styles.cartBody}>
        <div className={styles.cartLeft}>
          <b className={styles.seuCarrinhoDe}>Seu Carrinho de Compras</b>
          {mensagem && <div data-testid="mensagem-carrinho" style={{ color: '#dc2626', fontSize: '14px', marginBottom: '8px' }}>{mensagem}</div>}
          {itensExpirados.length > 0 && (
            <div data-testid="itens-expirados" style={{ padding: 12, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, marginBottom: 12, fontSize: 14 }}>
              <b>O prazo de {carrinho?.minutos_bloqueio ?? 15} minutos de bloqueio acabou para estes itens:</b>
              <ul style={{ margin: '8px 0' }}>
                {itensExpirados.map(i => (
                  <li key={i.id_item_carrinho}>{i.livro?.titulo || 'Livro'} (x{i.quantidade})</li>
                ))}
              </ul>
              <div onClick={handleReincluirExpirados} role="button" tabIndex={0}
                style={{ display: 'inline-block', cursor: 'pointer', padding: '6px 12px', background: '#0f172a', color: '#fff', borderRadius: 6 }}>
                Adicionar novamente ao carrinho
              </div>
            </div>
          )}
          {itensValidos.length === 0 ? (
            <div style={{ padding: '40px 0', fontSize: '16px', color: '#94a3b8' }}>
              Seu carrinho está vazio.{' '}
              <Link to="/home" style={{ color: '#d97706', textDecoration: 'underline' }}>Continuar comprando</Link>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {itensValidos.map((item) => {
                const valorUnit = Number(item.livro?.valor_venda || 0);
                const totalItem = valorUnit * item.quantidade;
                return (
                  <div className={styles.item0} key={item.id_item_carrinho} data-testid={`item-carrinho-${item.id_item_carrinho}`}>
                    {item.livro?.imagem_principal_url ? (
                      <img
                        src={`${API_BASE}${item.livro.imagem_principal_url}`}
                        alt={item.livro?.titulo || 'Capa'}
                        style={{ width: 64, height: 96, borderRadius: 4, flexShrink: 0, objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: 64, height: 96, background: '#e2e8f0', borderRadius: 4, flexShrink: 0 }} />
                    )}
                    <div className={styles.itemDetails}>
                      <b className={styles.aOrdemDo}>{item.livro?.titulo || 'Livro'}</b>
                      <div className={styles.porCarloRovelli}>{item.livro?.autor?.nome || ''}</div>
                    </div>
                    <div className={styles.quantity}>
                      <div className={styles.minus} onClick={() => handleAtualizarQuantidade(item, item.quantidade - 1)} role="button" tabIndex={0} data-testid={`qtd-menos-${item.id_item_carrinho}`}>
                        <div className={styles.div}>-</div>
                      </div>
                      <b className={styles.b2} data-testid={`qtd-valor-${item.id_item_carrinho}`}>{item.quantidade}</b>
                      <div className={styles.minus} onClick={() => handleAtualizarQuantidade(item, item.quantidade + 1)} role="button" tabIndex={0} data-testid={`qtd-mais-${item.id_item_carrinho}`}>
                        <div className={styles.div}>+</div>
                      </div>
                    </div>
                    <div className={styles.priceCol}>
                      <div className={styles.div}>R$ {totalItem.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div className={styles.removeBtn} onClick={() => handleRemoverItem(item)} role="button" tabIndex={0} data-testid={`remover-${item.id_item_carrinho}`}>
                      <span style={{ fontSize: 18, color: '#94a3b8' }}>✕</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {itensValidos.length > 0 && (
            <Link to="/home" className={styles.backToShop} style={{ color: '#0f172a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 14, fontFamily: 'Inter' }}>
              <span>←</span> Continuar Comprando
            </Link>
          )}
        </div>
<div className={styles.cartRight}>
          <b className={styles.resumoDoPedido}>Resumo do Pedido</b>
          <div className={styles.orderSummary}>
            <div className={styles.frame}>
              <div className={styles.logo}>Subtotal</div>
              <div className={styles.r21470} data-testid="subtotal">R$ {subtotal.toFixed(2).replace('.', ',')}</div>
            </div>
            {valorDesconto > 0 && (
              <div className={styles.frame}>
                <div className={styles.logo}>Descontos Aplicados</div>
                <div className={styles.r2500} data-testid="desconto">-R$ {valorDesconto.toFixed(2).replace('.', ',')}</div>
              </div>
            )}
            <div className={styles.frame}>
              <div className={styles.logo}>Frete Estimado</div>
              <div className={styles.r21470} data-testid="frete">R$ {freteEstimado.toFixed(2).replace('.', ',')}</div>
            </div>
            <div className={styles.line} />
            <div className={styles.frame4}>
              <b className={styles.logo}>Total</b>
              <b className={styles.r21220} data-testid="total">R$ {total.toFixed(2).replace('.', ',')}</b>
            </div>
            <div className={styles.couponForm}>
              <b className={styles.cupomPromocional}>Cupom Promocional</b>
              <div className={styles.inputCoupon}>
                <div className={styles.field} style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="text" value={campoCupom} onChange={(e) => setCampoCupom(e.target.value.toUpperCase())}
                    placeholder="Digite o código" data-testid="cupom-input"
                    style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '13px', color: '#475569' }} />
                </div>
                <div className={styles.apply} onClick={aplicarCupomPromocional} role="button" tabIndex={0} data-testid="cupom-aplicar">
                  <b style={{ color: '#fff', fontSize: 13 }}>Aplicar</b>
                </div>
              </div>
              {cupomPromocional && (
                <div style={{ fontSize: 12, color: '#15803d', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Aplicado: {cupomPromocional}</span>
                  <span style={{ cursor: 'pointer', color: '#dc2626' }}
                    onClick={() => { setCupomPromocional(''); setCampoCupom(''); }}>remover</span>
                </div>
              )}
              {cuponsPromocionais.length > 0 && (
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  Disponíveis: {cuponsPromocionais.map(c => (
                    <span key={c.id_cupom} style={{ cursor: 'pointer', textDecoration: 'underline', marginRight: 8 }}
                      title={rotuloCupom(c)}
                      onClick={() => { setCampoCupom(c.codigo_cupom); setCupomPromocional(c.codigo_cupom); setMensagem(''); }}>
                      {c.codigo_cupom}
                    </span>
                  ))}
                </div>
              )}
              <b className={styles.cupomPromocional} style={{ marginTop: 8 }}>Cupom de Troca</b>
              <div className={styles.dropdown} ref={dropdownRef} onClick={() => setCupomTrocaAberto(!cupomTrocaAberto)}
                role="button" tabIndex={0} data-testid="dropdown-cupom-troca" style={{ position: 'relative', cursor: 'pointer' }}>
                <div className={styles.logo}>{cupomTrocaSelecionado || 'Nenhum Selecionado'}</div>
                <span style={{ fontSize: 10 }}>▼</span>
                {cupomTrocaAberto && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                    <div style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid #e2e8f0' }}
                      onClick={() => { setCupomTrocaSelecionado(''); setCupomTrocaAberto(false); }}>Nenhum</div>
                    {cuponsTroca.map(cupom => (
                      <div key={cupom.id_cupom} data-testid={`troca-item-${cupom.codigo_cupom}`} style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid #e2e8f0' }}
                        onClick={() => { setCupomTrocaSelecionado(cupom.codigo_cupom); setCupomTrocaAberto(false); }}>
                        {rotuloCupom(cupom)}
                      </div>
                    ))}
                    {cuponsTroca.length === 0 && (
                      <div style={{ padding: '8px 12px', fontSize: 13, color: '#94a3b8' }}>Nenhum cupom de troca disponível</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.checkoutCta} onClick={handleFinalizar} role="button" tabIndex={0}
              aria-disabled={!podeComprar} data-testid="btn-finalizar"
              style={{ cursor: podeComprar ? 'pointer' : 'not-allowed', opacity: podeComprar ? 1 : 0.5 }}>
              <b style={{ color: '#fff', fontSize: 16 }}>Finalizar Compra</b>
            </div>
          </div>
        </div>
      </div>
<div className={styles.footer}>
        <div className={styles.frame}>
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
        <div className={styles.line2} />
        <div className={styles.footerBottom}>
          <div className={styles.logo}>© 2026 Nexo Inc. Conhecimento curado para mentes curiosas.</div>
          <div className={styles.socials}>
            <span style={{ fontSize: 18, cursor: 'pointer' }}>📷</span>
            <span style={{ fontSize: 18, cursor: 'pointer' }}>🐦</span>
            <span style={{ fontSize: 18, cursor: 'pointer' }}>💼</span>
          </div>
        </div>
      </div>
    </div>);
};

export default ShoppingCart;