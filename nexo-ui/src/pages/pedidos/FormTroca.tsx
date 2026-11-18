import { useState, type FunctionComponent } from 'react';
import type { Pedido, ItemPedido } from '../../services/api';
import { card, btn } from './PedidoCard';

interface Props {
  pedido: Pedido;
  onEnviar: (dados: { motivo: string; compraInteira: boolean; itens: { id_item_pedido: number; quantidade: number }[] }) => void;
  onCancelar: () => void;
}

const saldo = (i: ItemPedido) => i.quantidade - (i.quantidade_trocada || 0);

/** RF0040: troca de itens selecionados ou de toda a compra. */
const FormTroca: FunctionComponent<Props> = ({ pedido, onEnviar, onCancelar }) => {
  const [motivo, setMotivo] = useState('');
  const [quantidades, setQuantidades] = useState<Record<number, number>>({});

  const itens = Object.entries(quantidades).filter(([, q]) => q > 0)
    .map(([id, quantidade]) => ({ id_item_pedido: Number(id), quantidade }));

  return (
    <div style={{ ...card, borderColor: '#0f172a' }} data-testid="form-troca">
      <b>Solicitar troca — {pedido.codigo_pedido}</b>
      {pedido.itens?.map((i) => (
        <div key={i.id_item_pedido} style={{ margin: '8px 0', fontSize: 14 }}>
          Livro #{i.id_livro} — comprado {i.quantidade}, trocável {saldo(i)}{' '}
          <input type="number" min={0} max={saldo(i)} value={quantidades[i.id_item_pedido] || 0} style={{ width: 60 }}
            onChange={(e) => setQuantidades({ ...quantidades, [i.id_item_pedido]: Number(e.target.value) })} />
        </div>
      ))}
      <textarea placeholder="Motivo da troca" value={motivo} onChange={(e) => setMotivo(e.target.value)} style={{ width: '100%', margin: '8px 0' }} />
      <span style={btn} onClick={() => onEnviar({ motivo, compraInteira: false, itens })} role="button">Trocar itens selecionados</span>{' '}
      <span style={btn} onClick={() => onEnviar({ motivo, compraInteira: true, itens: [] })} role="button">Trocar a compra inteira</span>{' '}
      <span onClick={onCancelar} style={{ cursor: 'pointer', textDecoration: 'underline' }}>cancelar</span>
    </div>
  );
};

export default FormTroca;
