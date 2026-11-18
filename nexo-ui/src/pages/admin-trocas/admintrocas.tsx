import { useEffect, useState, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { trocasApi, rotuloStatus } from '../../services/api';
import type { Troca } from '../../services/api';

const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, marginBottom: 10 } as const;
const btn = { cursor: 'pointer', padding: '6px 12px', borderRadius: 6, background: '#0f172a', color: '#fff', fontSize: 13 } as const;

/**
 * Administrador: pedidos de troca (EM TROCA, RF0042), autorização (-> TROCA AUTORIZADA, RF0041)
 * e confirmação do recebimento (-> TROCADO, com cupom e reentrada no estoque, RF0043/RF0044/RF0054).
 */
const AdminTrocas: FunctionComponent = () => {
  const { logout } = useAuth();
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [mensagem, setMensagem] = useState('');

  const carregar = async () => {
    try { setTrocas((await trocasApi.adminPendentes()).data); }
    catch { setMensagem('Erro ao carregar as trocas.'); }
  };
  useEffect(() => { carregar(); }, []);

  const executar = async (acao: () => Promise<unknown>, ok: string) => {
    try { await acao(); setMensagem(ok); carregar(); }
    catch (e: any) { setMensagem(e.response?.data?.detail || 'Operação não permitida.'); }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <b style={{ fontSize: 22 }}>Gestão de Trocas</b>
        <div style={{ fontSize: 14 }}>
          <Link to="/admin-dashboard" style={{ marginRight: 12 }}>Dashboard</Link>
          <Link to="/admin-pedidos" style={{ marginRight: 12 }}>Pedidos</Link>
          <span onClick={logout} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Sair</span>
        </div>
      </div>
      {mensagem && <div style={{ ...card, background: '#fef3c7' }}>{mensagem}</div>}
      {trocas.length === 0 && <div style={{ ...card, color: '#94a3b8' }}>Nenhuma troca pendente.</div>}
      {trocas.map((t) => (
        <div key={t.id_troca} style={card} data-testid={`troca-${t.id_troca}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b>Troca #{t.id_troca} — pedido {t.pedido?.codigo_pedido}{t.compra_inteira ? ' (compra inteira)' : ''}</b>
            <b>{t.pedido ? rotuloStatus(t.pedido.status) : t.status}</b>
          </div>
          <div style={{ fontSize: 13, color: '#475569', margin: '6px 0' }}>
            Motivo: {t.motivo} — {t.itens?.reduce((a, i) => a + i.quantidade, 0) ?? 0} unidade(s)
          </div>
          {t.status === 'SOLICITADA' && (
            <span style={btn} role="button" onClick={() => executar(() => trocasApi.autorizar(t.id_troca), 'Troca autorizada; o cliente foi notificado.')}>Autorizar troca</span>
          )}
          {t.status === 'ACEITA' && (
            <span style={btn} role="button" onClick={() => executar(() => trocasApi.receber(t.id_troca), 'Recebimento confirmado: cupom gerado e itens devolvidos ao estoque.')}>Confirmar recebimento</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminTrocas;
