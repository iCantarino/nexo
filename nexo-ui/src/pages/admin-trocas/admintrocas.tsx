import { useEffect, useState, type FunctionComponent } from 'react';
import { trocasApi } from '../../services/api';
import type { Troca } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import styles from './AdminTrocas.module.css';

const STATUS_FILTROS = [
  { key: '', label: 'Todas' },
  { key: 'SOLICITADA', label: 'Troca Solicitada' },
  { key: 'ACEITA', label: 'Troca Aceita' },
  { key: 'NEGADA', label: 'Troca Negada' },
  { key: 'ITEM_ENVIADO', label: 'Item Enviado' },
  { key: 'ITEM_RECEBIDO', label: 'Item Recebido' },
  { key: 'PROCESSADA', label: 'Troca Processada' },
];

const rotuloStatusTroca = (s: string) => {
  const map: Record<string, string> = {
    SOLICITADA: 'Troca Solicitada',
    ACEITA: 'Troca Aceita',
    NEGADA: 'Troca Negada',
    ITEM_ENVIADO: 'Item Enviado',
    ITEM_RECEBIDO: 'Item Recebido',
    PROCESSADA: 'Troca Processada',
  };
  return map[s] || s;
};

const corStatus = (s: string) => {
  switch (s) {
    case 'SOLICITADA': return styles.statusSolicitada;
    case 'ACEITA': return styles.statusAceita;
    case 'NEGADA': return styles.statusNegada;
    case 'ITEM_ENVIADO': return styles.statusEnviado;
    case 'ITEM_RECEBIDO': return styles.statusRecebido;
    case 'PROCESSADA': return styles.statusProcessada;
    default: return styles.statusPadrao;
  }
};

const AdminTrocas: FunctionComponent = () => {
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [filtro, setFiltro] = useState('');
  const [selecionada, setSelecionada] = useState<Troca | null>(null);
  const [mensagem, setMensagem] = useState('');

  const carregar = async () => {
    try { setTrocas((await trocasApi.adminTodas()).data); }
    catch { setMensagem('Erro ao carregar as trocas.'); }
  };
  useEffect(() => { carregar(); }, []);

  const executar = async (acao: () => Promise<unknown>, ok: string) => {
    try { await acao(); setMensagem(ok); carregar(); }
    catch (e: any) { setMensagem(e.response?.data?.detail || 'Operação não permitida.'); }
  };

  const trocasFiltradas = filtro ? trocas.filter((t) => t.status === filtro) : trocas;

  return (
    <div className={styles.adminTrocas}>
      <AdminSidebar />
      <div className={styles.contentArea}>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <b className={styles.titulo}>Gestão de Trocas</b>
            <div className={styles.subtitulo}>Acompanhamento e aprovação de solicitações de troca de clientes.</div>
          </div>
        </div>
        <div className={styles.workspace}>
          {mensagem && <div className={styles.mensagem}>{mensagem}</div>}

          <div className={styles.filtros}>
            {STATUS_FILTROS.map((f) => (
              <button
                key={f.key}
                className={filtro === f.key ? styles.filtroAtivo : styles.filtro}
                onClick={() => setFiltro(f.key)}
              >
                {f.label} {f.key === '' && `(${trocas.length})`}
              </button>
            ))}
          </div>

          <div className={styles.conteudo}>
            <div className={styles.painelEsquerdo}>
              <b className={styles.secaoTitulo}>Fila de Solicitações</b>
              <div className={styles.tabela}>
                <div className={styles.tabelaHeader}>
                  <span>ID Troca</span>
                  <span>Pedido Orig.</span>
                  <span>Cliente</span>
                  <span>Status</span>
                  <span>Ações</span>
                </div>
                {trocasFiltradas.length === 0 && <div className={styles.vazio}>Nenhuma troca encontrada.</div>}
                {trocasFiltradas.map((t) => (
                  <div
                    key={t.id_troca}
                    className={`${styles.tabelaRow} ${selecionada?.id_troca === t.id_troca ? styles.rowSelecionada : ''}`}
                    onClick={() => setSelecionada(t)}
                    data-testid={`troca-${t.id_troca}`}
                  >
                    <span><b>EX-{t.id_troca}</b></span>
                    <span>{t.pedido?.codigo_pedido || `#${t.id_pedido}`}</span>
                    <span>Cliente #{t.id_cliente}</span>
                    <span><span className={`${styles.badge} ${corStatus(t.status)}`}>{rotuloStatusTroca(t.status)}</span></span>
                    <span>
                      {t.status === 'SOLICITADA' && (
                        <>
                          <button className={styles.botaoAceitar} onClick={(e) => { e.stopPropagation(); executar(() => trocasApi.autorizar(t.id_troca), 'Troca autorizada; o cliente foi notificado.'); }}>Aceitar Troca</button>
                          <button className={styles.botaoRecusar} onClick={(e) => { e.stopPropagation(); executar(() => trocasApi.negar(t.id_troca), 'Troca recusada.'); }} style={{ marginLeft: 8 }}>Recusar Troca</button>
                        </>
                      )}
                      {t.status === 'ACEITA' && (
                        <button className={styles.botaoAcao} onClick={(e) => { e.stopPropagation(); executar(() => trocasApi.enviar(t.id_troca), 'Item marcado como enviado.'); }}>Marcar como Enviado</button>
                      )}
                      {t.status === 'ITEM_ENVIADO' && (
                        <button className={styles.botaoAcao} onClick={(e) => { e.stopPropagation(); executar(() => trocasApi.receber(t.id_troca), 'Recebimento confirmado.'); }}>Confirmar Recebimento</button>
                      )}
                      {t.status === 'ITEM_RECEBIDO' && (
                        <button className={styles.botaoProcessar} onClick={(e) => { e.stopPropagation(); executar(() => trocasApi.processar(t.id_troca), 'Troca processada; cupom gerado e estoque atualizado.'); }}>Processar Troca</button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.painelDireito}>
              {selecionada ? (
                <>
                  <div className={styles.detalheHeader}>
                    <div className={styles.detalheLabel}>Detalhes da Solicitação Selecionada</div>
                    <b className={styles.detalheTitulo}>Troca #EX-{selecionada.id_troca}</b>
                    <div className={styles.detalheCliente}>Cliente: Cliente #{selecionada.id_cliente}</div>
                  </div>

                  <div className={styles.detalheLivro}>
                    <div className={styles.livroCapa} />
                    <div>
                      <b>A Ordem do Tempo</b>
                      <div className={styles.livroMeta}>Autor: Carlo Rovelli</div>
                      <div className={styles.livroMeta}>Valor Original: R$ 42,40</div>
                    </div>
                  </div>

                  <div className={styles.detalheSecao}>
                    <b className={styles.detalheSecaoTitulo}>Motivo Real da Solicitação</b>
                    <p className={styles.detalheTexto}>{selecionada.motivo}</p>
                  </div>

                  <div className={styles.detalheSecao}>
                    <b className={styles.detalheSecaoTitulo}>Código de Rastreio (Reverso)</b>
                    <div className={styles.rastreio}>BR87625129990X</div>
                  </div>

                  <div className={styles.detalheSecao}>
                    <b className={styles.detalheSecaoTitulo}>Histórico do Fluxo</b>
                    <div className={styles.historicoItem}>
                      <div className={styles.historicoDot} />
                      <div>
                        <div className={styles.historicoTitulo}>Solicitação Criada</div>
                        <div className={styles.historicoMeta}>{new Date(selecionada.data_solicitacao).toLocaleDateString('pt-BR')} por Cliente</div>
                      </div>
                    </div>
                    {selecionada.data_autorizacao && (
                      <div className={styles.historicoItem}>
                        <div className={styles.historicoDot} />
                        <div>
                          <div className={styles.historicoTitulo}>Aguardando Análise</div>
                          <div className={styles.historicoMeta}>Pendente de Curador Master</div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className={styles.vazio}>Selecione uma troca para ver os detalhes.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTrocas;
