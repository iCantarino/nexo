import type { CSSProperties, FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { rotuloStatus, API_BASE } from '../../services/api';
import type { Pedido, Troca, ItemPedido } from '../../services/api';
import styles from './MyOrders.module.css';

export const card: CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: 16,
  marginBottom: 12,
};
export const btn: CSSProperties = {
  cursor: 'pointer',
  padding: '8px 14px',
  borderRadius: 6,
  border: '1px solid #0f172a',
  background: '#0f172a',
  color: '#fff',
  fontSize: 13,
};
export const brl = (v: string | number) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

const COR: Record<string, string> = {
  EM_PROCESSAMENTO: '#64748b',
  APROVADA: '#15803d',
  REPROVADA: '#b91c1c',
  EM_TRANSITO: '#1d4ed8',
  ENTREGUE: '#0f766e',
  EM_TROCA: '#b45309',
  TROCA_AUTORIZADA: '#7c3aed',
  TROCADO: '#334155',
};

const statusTroca = (s: string) =>
  s === 'SOLICITADA' ? 'aguardando autorização' : s === 'ACEITA' ? 'autorizada' : 'concluída';

const coverUrl = (item: ItemPedido) => {
  if (item.livro?.imagem_principal_url) {
    return item.livro.imagem_principal_url.startsWith('http')
      ? item.livro.imagem_principal_url
      : `${API_BASE}${item.livro.imagem_principal_url}`;
  }
  return '/images/book-placeholder.png';
};

/** Pedido do cliente com status, trocas associadas e o atalho "Solicitar troca" (somente ENTREGUE — RN0043). */
const PedidoCard: FunctionComponent<{
  pedido: Pedido;
  trocas: Troca[];
  onTrocar: (p: Pedido) => void;
}> = ({ pedido, trocas, onTrocar }) => {
  const itens = pedido.itens || [];
  const primeiroItem = itens[0];
  const qtdeExtra = itens.length - 1;

  return (
    <div className={styles.orderCard} data-testid={`pedido-${pedido.id_pedido}`}>
      <div className={styles.cardTop}>
        <div className={styles.frame7}>
          <div>
            <b style={{ fontSize: '16px', color: '#0f172a' }}>{pedido.codigo_pedido}</b>
            <div className={styles.realizadoEm14}>
              {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')} — {itens.length}{' '}
              {itens.length === 1 ? 'item' : 'itens'}
            </div>
          </div>
        </div>
        <div className={styles.frame8}>
          <div
            className={styles.entregue}
            style={{ color: COR[pedido.status] || '#0f172a' }}
          >
            {rotuloStatus(pedido.status)}
          </div>
        </div>
        <div className={styles.r21220}>{brl(pedido.valor_total)}</div>
      </div>

      <div className={styles.line} />

      <div className={styles.cardMiddle}>
        {primeiroItem ? (
          <>
            <img
              src={coverUrl(primeiroItem)}
              alt={primeiroItem.livro?.titulo || 'Capa'}
              className={styles.itemCoverIcon}
            />
            <div className={styles.frame9}>
              <div className={styles.aOrdemDo}>
                {primeiroItem.livro?.titulo || `Livro #${primeiroItem.id_livro}`}
              </div>
              <div className={styles.porCarloRovelli}>
                {primeiroItem.livro?.autor?.nome || ''}
              </div>
              <div className={styles.quantidade1}>
                Qtd: {primeiroItem.quantidade}
                {qtdeExtra > 0 && ` +${qtdeExtra} outro(s)`}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.porCarloRovelli}>Sem itens</div>
        )}
      </div>

      {trocas.length > 0 && (
        <div className={styles.porCarloRovelli}>
          {trocas.map((t) => (
            <div key={t.id_troca}>
              Troca #{t.id_troca}
              {t.compra_inteira ? ' (compra inteira)' : ''}: {statusTroca(t.status)}
            </div>
          ))}
        </div>
      )}

      {pedido.status === 'REPROVADA' && pedido.observacao && (
        <div className={styles.porCarloRovelli}>{pedido.observacao}</div>
      )}

      <div className={styles.cardActions}>
        <Link
          to={`/pedido-detalhe/${pedido.id_pedido}`}
          className={styles.frame11}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className={styles.rastrearPacote}>Ver detalhes</div>
        </Link>
        {pedido.status === 'ENTREGUE' && (
          <button
            className={styles.frame12}
            onClick={() => onTrocar(pedido)}
            style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
          >
            <div className={styles.rastrearPacote}>Solicitar troca</div>
          </button>
        )}
      </div>
    </div>
  );
};

export default PedidoCard;
