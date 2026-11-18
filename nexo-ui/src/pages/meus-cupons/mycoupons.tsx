import { useState, useEffect, type FunctionComponent } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { cuponsApi, type Cupom } from '../../services/api';
import styles from './MyCoupons.module.css';

type Tab = 'disponiveis' | 'historico' | 'expirados';

const MyCoupons: FunctionComponent = () => {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<Tab>('disponiveis');

  useEffect(() => {
    cuponsApi
      .meusCupons()
      .then((r) => setCupons(r.data))
      .catch(() => setCupons([]))
      .finally(() => setLoading(false));
  }, []);

  const hoje = new Date();
  const isExpirado = (c: Cupom) => {
    if (c.utilizado) return false;
    if (!c.valido_ate) return false;
    return new Date(c.valido_ate) < hoje;
  };

  const disponiveis = cupons.filter((c) => !c.utilizado && !isExpirado(c));
  const historico = cupons.filter((c) => c.utilizado);
  const expirados = cupons.filter((c) => !c.utilizado && isExpirado(c));

  const saldoCredito = cupons
    .filter((c) => c.tipo === 'TROCA' && !c.utilizado && !isExpirado(c))
    .reduce((acc, c) => acc + Number(c.valor || 0), 0);

  const formatarValor = (c: Cupom) => {
    if (c.percentual) return `${c.percentual}% de desconto`;
    return `R$ ${Number(c.valor || 0).toFixed(2).replace('.', ',')} de crédito`;
  };

  const formatarValidade = (c: Cupom) => {
    if (!c.valido_ate) return 'Sem validade';
    return `Válido até ${new Date(c.valido_ate).toLocaleDateString('pt-BR')}`;
  };

  const itensAtuais = aba === 'disponiveis' ? disponiveis : aba === 'historico' ? historico : expirados;

  return (
    <div className={styles.myCoupons}>
      <Navbar />

      <div className={styles.body}>
        <div className={styles.headerRow}>
          <b className={styles.logo}>Meus Vouchers & Cupons</b>
          <div className={styles.saldoDeCrdito}>
            Saldo de Crédito Ativo: R$ {saldoCredito.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <div className={styles.frame}>
          <button
            className={aba === 'disponiveis' ? styles.frame2 : styles.frame3}
            onClick={() => setAba('disponiveis')}
            style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
          >
            <div className={styles.userName}>Cupons Disponíveis ({disponiveis.length})</div>
          </button>
          <button
            className={aba === 'historico' ? styles.frame2 : styles.frame3}
            onClick={() => setAba('historico')}
            style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
          >
            <div className={styles.userName}>Histórico de Uso ({historico.length})</div>
          </button>
          <button
            className={aba === 'expirados' ? styles.frame2 : styles.frame3}
            onClick={() => setAba('expirados')}
            style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
          >
            <div className={styles.userName}>Cupons Expirados ({expirados.length})</div>
          </button>
        </div>

        {loading ? (
          <div className={styles.vlidoEmQualquer}>Carregando cupons...</div>
        ) : itensAtuais.length === 0 ? (
          <div className={styles.vlidoEmQualquer}>
            Nenhum cupom {aba === 'disponiveis' ? 'disponível' : aba === 'historico' ? 'usado' : 'expirado'}.
          </div>
        ) : (
          <div className={styles.frame5}>
            <div className={styles.frame6}>
              <b className={styles.cuponsPromocionais}>
                {aba === 'disponiveis' ? 'Cupons Promocionais' : aba === 'historico' ? 'Usados' : 'Expirados'}
              </b>
              {itensAtuais
                .filter((c) => aba !== 'disponiveis' || c.tipo !== 'TROCA')
                .map((c) => (
                  <CouponCard
                    key={c.id_cupom}
                    cupom={c}
                    formatarValor={formatarValor}
                    formatarValidade={formatarValidade}
                    aba={aba}
                  />
                ))}
            </div>

            {aba === 'disponiveis' && (
              <div className={styles.frame15}>
                <b className={styles.logo}>Cupons de Troca (Créditos de Troca)</b>
                {disponiveis.filter((c) => c.tipo === 'TROCA').length === 0 ? (
                  <div className={styles.aplicvelApenasPara}>Nenhum crédito de troca ativo.</div>
                ) : (
                  disponiveis
                    .filter((c) => c.tipo === 'TROCA')
                    .map((c) => (
                      <CouponCard
                        key={c.id_cupom}
                        cupom={c}
                        formatarValor={formatarValor}
                        formatarValidade={formatarValidade}
                        aba={aba}
                      />
                    ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function CouponCard({
  cupom,
  formatarValor,
  formatarValidade,
  aba,
}: {
  cupom: Cupom;
  formatarValor: (c: Cupom) => string;
  formatarValidade: (c: Cupom) => string;
  aba: Tab;
}) {
  const expirado = aba === 'expirados';
  const usado = aba === 'historico';
  return (
    <div className={styles.frame7}>
      <div className={styles.frame8}>
        <div className={styles.frame9}>
          <div className={cupom.tipo === 'TROCA' ? styles.frame19 : styles.frame10}>
            <b className={styles.logo}>{cupom.codigo_cupom}</b>
          </div>
          <b className={styles.ativo} style={{ color: usado ? '#64748b' : expirado ? '#b91c1c' : '#15803d' }}>
            {usado ? 'Utilizado' : expirado ? 'Expirado' : 'Ativo'}
          </b>
        </div>
      </div>
      <b className={styles.r2500De}>{formatarValor(cupom)}</b>
      {cupom.descricao && (
        <div className={styles.aplicvelApenasPara}>{cupom.descricao}</div>
      )}
      <div className={styles.line2} />
      <div className={styles.expiraEm15}>{formatarValidade(cupom)}</div>
    </div>
  );
}

export default MyCoupons;
