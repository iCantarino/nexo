import type { FunctionComponent } from 'react';
import { brl, rotuloMes, type Serie } from './formatadores';
import styles from './VendasPorCategoria.module.css';

/** Valores em R$ por mês e categoria (mesmos dados do gráfico, em formato tabular). */
const TabelaValores: FunctionComponent<{ meses: string[]; series: Serie[] }> = ({ meses, series }) => (
  <table className={styles.tabela} data-testid="tabela-valores">
    <thead>
      <tr>
        <th>Mês</th>
        {series.map((s) => <th key={s.id_categoria}>{s.categoria}</th>)}
      </tr>
    </thead>
    <tbody>
      {meses.map((m, i) => (
        <tr key={m}>
          <td>{rotuloMes(m)}</td>
          {series.map((s) => <td key={s.id_categoria}>{brl.format(s.valores[i])}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
);

export default TabelaValores;
