import { useEffect, useState, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { pedidosApi, trocasApi, notificacoesApi, cuponsApi } from '../../services/api';
import type { Pedido, Troca, Notificacao, Cupom } from '../../services/api';
import PedidoCard, { card, brl } from './PedidoCard';
import FormTroca from './FormTroca';

/**
 * Cliente: consulta de pedidos e status, solicitação de troca (RF0040), notificações (RNF0046)
 * e cupons de troca (RF0044).
 */
const MyOrders: FunctionComponent = () => {
  const { user, logout } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [trocando, setTrocando] = useState<Pedido | null>(null);
  const [mensagem, setMensagem] = useState('');

  const carregar = async () => {
    try {
      const [p, t, n, c] = await Promise.all([
        pedidosApi.meusPedidos(), trocasApi.minhas(), notificacoesApi.listar(), cuponsApi.meusCupons(),
      ]);
      setPedidos(p.data); setTrocas(t.data); setNotificacoes(n.data);
      setCupons(c.data.filter((x) => x.origem !== 'CATALOGO' && x.tipo === 'TROCA' && !x.utilizado));
    } catch {
      setMensagem('Erro ao carregar seus pedidos.');
    }
  };
  useEffect(() => { carregar(); }, []);

  const enviarTroca = async (d: { motivo: string; compraInteira: boolean; itens: { id_item_pedido: number; quantidade: number }[] }) => {
    if (!trocando) return;
    if (!d.motivo.trim()) { setMensagem('Informe o motivo da troca.'); return; }
    if (!d.compraInteira && d.itens.length === 0) { setMensagem('Selecione ao menos um item.'); return; }
    try {
      await trocasApi.solicitar({ id_pedido: trocando.id_pedido, motivo: d.motivo, compra_inteira: d.compraInteira, itens: d.itens });
      setTrocando(null);
      setMensagem('Troca solicitada. Aguarde a autorização.');
      carregar();
    } catch (e: any) {
      setMensagem(e.response?.data?.detail || 'Erro ao solicitar a troca.');
    }
  };

  const lerNotificacao = async (n: Notificacao) => { await notificacoesApi.marcarLida(n.id_notificacao); carregar(); };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <b style={{ fontSize: 22 }}>Meus Pedidos &amp; Trocas</b>
        <div style={{ fontSize: 14 }}>
          <Link to="/home" style={{ marginRight: 12 }}>Catálogo</Link>
          <Link to="/carrinho" style={{ marginRight: 12 }}>Carrinho</Link>
          <Link to="/ai-chatbot" style={{ marginRight: 12 }}>Nexo IA</Link>
          {user?.nome} <span onClick={logout} style={{ cursor: 'pointer', marginLeft: 8, textDecoration: 'underline' }}>Sair</span>
        </div>
      </div>
      {mensagem && <div style={{ ...card, background: '#fef3c7' }}>{mensagem}</div>}

      {notificacoes.filter((n) => !n.lida).map((n) => (
        <div key={n.id_notificacao} data-testid="notificacao" style={{ ...card, background: '#ecfeff', borderColor: '#67e8f9' }}>
          🔔 {n.mensagem}{' '}
          <span onClick={() => lerNotificacao(n)} style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: 8 }}>marcar como lida</span>
        </div>
      ))}

      <b>Cupons de troca disponíveis</b>
      <div style={{ ...card, marginTop: 8 }} data-testid="cupons-troca">
        {cupons.length === 0 && <span style={{ color: '#94a3b8' }}>Nenhum cupom de troca disponível.</span>}
        {cupons.map((c) => (
          <div key={c.id_cupom}>{c.codigo_cupom} — {brl(c.valor)} (válido até {c.valido_ate}) — use no carrinho</div>
        ))}
      </div>

      <b>Pedidos</b>
      {pedidos.length === 0 && <div style={{ ...card, marginTop: 8, color: '#94a3b8' }}>Você ainda não fez pedidos.</div>}
      {pedidos.map((p) => (
        <PedidoCard key={p.id_pedido} pedido={p} trocas={trocas.filter((t) => t.id_pedido === p.id_pedido)}
          onTrocar={(ped) => { setTrocando(ped); setMensagem(''); }} />
      ))}

      {trocando && <FormTroca pedido={trocando} onEnviar={enviarTroca} onCancelar={() => setTrocando(null)} />}
    </div>
  );
};

export default MyOrders;
