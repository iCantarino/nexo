import { useEffect, useState, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { pedidosApi, rotuloStatus } from '../../services/api';
import type { Pedido } from '../../services/api';

const FILTROS = ['', 'EM_PROCESSAMENTO', 'APROVADA', 'REPROVADA', 'EM_TRANSITO', 'ENTREGUE', 'EM_TROCA', 'TROCA_AUTORIZADA', 'TROCADO'];
const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, marginBottom: 10 } as const;
const btn = { cursor: 'pointer', padding: '6px 12px', borderRadius: 6, background: '#0f172a', color: '#fff', fontSize: 13 } as const;
const brl = (v: string) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

/**
 * Administrador: consulta os pedidos, despacha vendas APROVADAS (-> EM TRANSPORTE, RF0038/RN0039)
 * e confirma a entrega (-> ENTREGUE, RF0039/RN0040).
 */
const AdminCustomersOrders: FunctionComponent = () => {
  const { logout } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtro, setFiltro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const carregar = async (f = filtro) => {
    try {
      setPedidos((await pedidosApi.adminTodos(f || undefined)).data);
    } catch {
      setMensagem('Erro ao carregar os pedidos.');
    }
  };
  useEffect(() => { carregar(); }, []);

  const executar = async (acao: () => Promise<unknown>, ok: string) => {
    try { await acao(); setMensagem(ok); carregar(); }
    catch (e: any) { setMensagem(e.response?.data?.detail || 'Operação não permitida.'); }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <b style={{ fontSize: 22 }}>Pedidos</b>
        <div style={{ fontSize: 14 }}>
          <Link to="/admin-dashboard" style={{ marginRight: 12 }}>Dashboard</Link>
          <Link to="/admin-trocas" style={{ marginRight: 12 }}>Trocas</Link>
          <span onClick={logout} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Sair</span>
        </div>
      </div>
      {mensagem && <div style={{ ...card, background: '#fef3c7' }}>{mensagem}</div>}
      <select value={filtro} data-testid="filtro-status" style={{ marginBottom: 12, padding: 6 }}
        onChange={(e) => { setFiltro(e.target.value); carregar(e.target.value); }}>
        {FILTROS.map((f) => <option key={f} value={f}>{f ? rotuloStatus(f) : 'Todos os status'}</option>)}
      </select>
      {pedidos.length === 0 && <div style={{ ...card, color: '#94a3b8' }}>Nenhum pedido encontrado.</div>}
      {pedidos.map((p) => (
        <div key={p.id_pedido} style={card} data-testid={`admin-pedido-${p.id_pedido}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b>{p.codigo_pedido} — cliente #{p.id_cliente}</b>
            <b>{rotuloStatus(p.status)}</b>
          </div>
          <div style={{ fontSize: 13, color: '#475569', margin: '6px 0' }}>
            {new Date(p.data_pedido).toLocaleString('pt-BR')} — {brl(p.valor_total)} — {p.itens?.length ?? 0} item(ns)
          </div>
          {p.status === 'APROVADA' && (
            <span style={btn} role="button" onClick={() => executar(() => pedidosApi.despachar(p.id_pedido), 'Pedido despachado: EM TRANSPORTE.')}>Despachar</span>
          )}
          {p.status === 'EM_TRANSITO' && (
            <span style={btn} role="button" onClick={() => executar(() => pedidosApi.confirmarEntrega(p.id_pedido), 'Entrega confirmada.')}>Confirmar entrega</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminCustomersOrders;
