import type { CSSProperties, FunctionComponent } from 'react';
import { rotuloStatus } from '../../services/api';
import type { Pedido, Troca } from '../../services/api';

export const card: CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 12 };
export const btn: CSSProperties = { cursor: 'pointer', padding: '8px 14px', borderRadius: 6, border: '1px solid #0f172a', background: '#0f172a', color: '#fff', fontSize: 13 };
export const brl = (v: string | number) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

const COR: Record<string, string> = {
  EM_PROCESSAMENTO: '#64748b', APROVADA: '#15803d', REPROVADA: '#b91c1c', EM_TRANSITO: '#1d4ed8',
  ENTREGUE: '#0f766e', EM_TROCA: '#b45309', TROCA_AUTORIZADA: '#7c3aed', TROCADO: '#334155',
};

const statusTroca = (s: string) => (s === 'SOLICITADA' ? 'aguardando autorização' : s === 'ACEITA' ? 'autorizada' : 'concluída');

/** Pedido do cliente com status, trocas associadas e o atalho "Solicitar troca" (somente ENTREGUE — RN0043). */
const PedidoCard: FunctionComponent<{ pedido: Pedido; trocas: Troca[]; onTrocar: (p: Pedido) => void }> = ({ pedido, trocas, onTrocar }) => (
  <div style={{ ...card, marginTop: 8 }} data-testid={`pedido-${pedido.id_pedido}`}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <b>{pedido.codigo_pedido}</b>
      <b style={{ color: COR[pedido.status] || '#0f172a' }}>{rotuloStatus(pedido.status)}</b>
    </div>
    <div style={{ fontSize: 13, color: '#475569', margin: '6px 0' }}>
      {new Date(pedido.data_pedido).toLocaleString('pt-BR')} — total {brl(pedido.valor_total)} (frete {brl(pedido.valor_frete)})
      {pedido.status === 'REPROVADA' && pedido.observacao ? ` — ${pedido.observacao}` : ''}
    </div>
    {trocas.map((t) => (
      <div key={t.id_troca} style={{ fontSize: 13 }}>
        Troca #{t.id_troca}{t.compra_inteira ? ' (compra inteira)' : ''}: {statusTroca(t.status)}
      </div>
    ))}
    {pedido.status === 'ENTREGUE' && (
      <div style={{ marginTop: 8 }}><span style={btn} onClick={() => onTrocar(pedido)} role="button">Solicitar troca</span></div>
    )}
  </div>
);

export default PedidoCard;
