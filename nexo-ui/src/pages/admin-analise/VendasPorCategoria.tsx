import { useEffect, useMemo, useState, type FunctionComponent } from 'react';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { analiseApi } from '../../services/api';
import TabelaValores from './TabelaValores';
import { brl, rotuloMes, type Serie } from './formatadores';
import styles from './VendasPorCategoria.module.css';

// RF0055 / RNF0043: histórico de vendas (ENTREGUE) por categoria, em R$, agrupado por mês.

interface Categoria { id_categoria: number; nome: string }
interface Resultado { periodo: { inicio: string; fim: string }; meses: string[]; series: Serie[] }

const CORES = ['#d97706', '#2563eb', '#16a34a', '#9333ea', '#dc2626', '#0891b2', '#ca8a04', '#be185d'];

const dataIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function periodoPadrao() {
  const hoje = new Date();
  return { inicio: dataIso(new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1)), fim: dataIso(hoje) };
}

const VendasPorCategoria: FunctionComponent = () => {
  const [dataInicio, setDataInicio] = useState(() => periodoPadrao().inicio);
  const [dataFim, setDataFim] = useState(() => periodoPadrao().fim);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selecionadas, setSelecionadas] = useState<number[]>([]);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    analiseApi.categorias()
      .then((r) => setCategorias(r.data))
      .catch(() => setErro('Não foi possível carregar as categorias.'));
  }, []);

  const alternar = (id: number) =>
    setSelecionadas((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));

  async function consultar() {
    setErro('');
    if (!dataInicio || !dataFim) return setErro('Informe a data de início e a data de fim.');
    if (dataFim < dataInicio) return setErro('A data de fim não pode ser anterior à data de início.');
    if (!selecionadas.length) return setErro('Selecione ao menos uma categoria.');
    setCarregando(true);
    try {
      const r = await analiseApi.vendasPorCategoria({
        data_inicio: dataInicio,
        data_fim: dataFim,
        categorias: selecionadas,
      });
      setResultado(r.data as Resultado);
    } catch (e: any) {
      setResultado(null);
      setErro(e?.response?.data?.detail || 'Erro ao consultar o histórico de vendas.');
    } finally {
      setCarregando(false);
    }
  }

  // Formato exigido pelo LineChart: um objeto por mês, uma chave por categoria.
  const dados = useMemo(
    () =>
      resultado?.meses.map((m, i) => ({
        mes: rotuloMes(m),
        ...Object.fromEntries(resultado.series.map((s) => [s.categoria, s.valores[i]])),
      })) ?? [],
    [resultado]
  );

  return (
    <section className={styles.painel} data-testid="analise-vendas">
      <h2 className={styles.titulo}>Histórico de vendas por categoria</h2>
      <p className={styles.sub}>Valor total de compras entregues, em reais, agrupado por mês.</p>

      <div className={styles.filtros}>
        <label className={styles.campo}>
          Data de início
          <input type="date" value={dataInicio} data-testid="data-inicio" onChange={(e) => setDataInicio(e.target.value)} />
        </label>
        <label className={styles.campo}>
          Data de fim
          <input type="date" value={dataFim} data-testid="data-fim" onChange={(e) => setDataFim(e.target.value)} />
        </label>
        <button type="button" className={styles.botao} data-testid="consultar" onClick={consultar} disabled={carregando}>
          {carregando ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      <fieldset className={styles.categorias}>
        <legend>Categorias a comparar</legend>
        {categorias.map((c) => (
          <label key={c.id_categoria} className={styles.opcao}>
            <input
              type="checkbox"
              checked={selecionadas.includes(c.id_categoria)}
              data-testid={`categoria-${c.id_categoria}`}
              onChange={() => alternar(c.id_categoria)}
            />
            {c.nome}
          </label>
        ))}
      </fieldset>

      {erro && <div className={styles.erro} role="alert" data-testid="erro-analise">{erro}</div>}
      {!resultado && !erro && (
        <div className={styles.vazio}>Escolha o período e as categorias e clique em Consultar.</div>
      )}

      {resultado && (
        <div className={styles.grafico} data-testid="grafico-linhas">
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={dados} margin={{ top: 10, right: 24, left: 16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(v: number) => brl.format(v)} width={96} />
              <Tooltip formatter={(v) => brl.format(Number(v))} />
              <Legend />
              {resultado.series.map((s, i) => (
                <Line
                  key={s.id_categoria}
                  type="monotone"
                  dataKey={s.categoria}
                  stroke={CORES[i % CORES.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <TabelaValores meses={resultado.meses} series={resultado.series} />
        </div>
      )}
    </section>
  );
};

export default VendasPorCategoria;
