import { useState, useEffect, useRef, type FunctionComponent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { chatbotApi, carrinhoApi } from '../../services/api';
import type { PerfilLeitura, Livro } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import styles from './AiChatbot.module.css';

interface Mensagem {
  id_interacao?: number;
  tipo: 'usuario' | 'assistente';
  texto: string;
  livros?: { id_livro: number; titulo: string; valor_venda: string }[];
  feedback?: 'UTIL' | 'NAO_UTIL' | null;
}

const formatarPreco = (valor: string | number) =>
  'R$ ' + Number(valor).toFixed(2).replace('.', ',');

const corPorCategoria: Record<string, string> = {
  Filosofia: '#1e3a5f',
  Ciência: '#0f766e',
  Arte: '#7c2d12',
  História: '#3f3f46',
  Literatura: '#581c87',
  Biografia: '#92400e',
};

const AiChatbot: FunctionComponent = () => {
  useAuth();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [perfil, setPerfil] = useState<PerfilLeitura | null>(null);
  const [recomendacoes, setRecomendacoes] = useState<{ livro: Livro }[]>([]);
  const [qtdCarrinho, setQtdCarrinho] = useState(0);
  const [erro, setErro] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const atualizarBadge = async () => {
    try {
      const res = await carrinhoApi.listar();
      const total = res.data.itens
        .filter((i) => !i.removido_por_expiracao)
        .reduce((acc, i) => acc + i.quantidade, 0);
      setQtdCarrinho(total);
    } catch {
      setQtdCarrinho(0);
    }
  };

  const carregarDados = async () => {
    try {
      const [hist, perf, rec] = await Promise.all([
        chatbotApi.listarHistorico(),
        chatbotApi.obterPerfil(),
        chatbotApi.obterRecomendacoes(),
      ]);

      const historicoFormatado: Mensagem[] = [];
      for (const h of hist.data) {
        historicoFormatado.push({
          id_interacao: h.id_interacao,
          tipo: 'usuario',
          texto: h.mensagem_cliente,
        });
        historicoFormatado.push({
          id_interacao: h.id_interacao,
          tipo: 'assistente',
          texto: h.resposta_ia,
          livros: [],
          feedback: h.feedback,
        });
      }

      if (historicoFormatado.length === 0) {
        historicoFormatado.push({
          tipo: 'assistente',
          texto: `Olá ${perf.data.cliente}! Analisei seu perfil de leitura. Com base nos seus interesses, selecionei algumas edições exclusivas. O que acha?`,
          livros: [],
        });
      }

      setMensagens(historicoFormatado);
      setPerfil(perf.data);
      setRecomendacoes(rec.data.recomendacoes.map((r) => ({ livro: r.livro })));
      await atualizarBadge();
    } catch (e: any) {
      setErro(e.response?.data?.message || 'Erro ao carregar o chatbot.');
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const enviarMensagem = async () => {
    if (!input.trim() || carregando) return;
    const texto = input.trim();
    setInput('');
    setErro('');
    setMensagens((prev) => [...prev, { tipo: 'usuario', texto }]);
    setCarregando(true);

    try {
      const res = await chatbotApi.enviarMensagem(texto);
      setMensagens((prev) => [
        ...prev,
        {
          id_interacao: res.data.id_interacao,
          tipo: 'assistente',
          texto: res.data.resposta,
          livros: res.data.livros_recomendados,
          feedback: null,
        },
      ]);
      const rec = await chatbotApi.obterRecomendacoes();
      setRecomendacoes(rec.data.recomendacoes.map((r) => ({ livro: r.livro })));
    } catch (e: any) {
      setErro(e.response?.data?.message || 'Erro ao obter resposta da IA.');
    } finally {
      setCarregando(false);
    }
  };

  const enviarFeedback = async (idInteracao: number, feedback: 'UTIL' | 'NAO_UTIL') => {
    try {
      await chatbotApi.enviarFeedback(idInteracao, feedback);
      setMensagens((prev) =>
        prev.map((m) =>
          m.id_interacao === idInteracao && m.tipo === 'assistente'
            ? { ...m, feedback }
            : m
        )
      );
    } catch (e: any) {
      setErro(e.response?.data?.message || 'Erro ao registrar feedback.');
    }
  };

  const adicionarAoCarrinho = async (idLivro: number) => {
    try {
      await carrinhoApi.adicionarItem(idLivro, 1);
      await atualizarBadge();
    } catch (e: any) {
      setErro(e.response?.data?.message || 'Erro ao adicionar ao carrinho.');
    }
  };

  const coverStyle = (categorias?: string[]) => {
    const cor = categorias?.length ? corPorCategoria[categorias[0]] || '#1e3a5f' : '#1e3a5f';
    return { background: `linear-gradient(135deg, ${cor}, #d97706)` };
  };

  return (
    <div className={styles.aiChatbot}>
      <Navbar activeItem="nexo-ia" cartBadge={qtdCarrinho} />

      <main className={styles.body}>
        <section className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.assistantAvatar}>N</div>
            <div className={styles.assistantInfo}>
              <span className={styles.assistantName}>Nexo IA Assistente</span>
              <span className={styles.assistantStatus}>Online • Curador Virtual</span>
            </div>
          </div>

          {erro && <div className={styles.error}>{erro}</div>}

          <div className={styles.messages}>
            {mensagens.map((m, idx) => (
              <div
                key={idx}
                className={`${styles.messageRow} ${m.tipo === 'usuario' ? styles.messageRowUser : ''}`}
              >
                <div
                  className={`${styles.messageBubble} ${m.tipo === 'usuario' ? styles.messageBubbleUser : ''}`}
                >
                  {m.texto}
                  {m.livros && m.livros.length > 0 && (
                    <div className={styles.bookCards}>
                      {m.livros.map((livro) => (
                        <div key={livro.id_livro} className={styles.bookCard}>
                          <div
                            className={styles.bookCover}
                            style={coverStyle(livro.titulo.includes('Design') ? ['Arte'] : undefined)}
                          />
                          <div className={styles.bookInfo}>
                            <span className={styles.bookTitle}>{livro.titulo}</span>
                            <span className={styles.bookPrice}>{formatarPreco(livro.valor_venda)}</span>
                          </div>
                          <button
                            className={styles.addBtn}
                            onClick={() => adicionarAoCarrinho(livro.id_livro)}
                          >
                            + Adicionar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.tipo === 'assistente' && m.id_interacao && (
                    <div className={styles.feedbackRow}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Essa resposta foi útil?</span>
                      <button
                        className={`${styles.feedbackBtn} ${m.feedback === 'UTIL' ? styles.feedbackBtnActive : ''}`}
                        onClick={() => enviarFeedback(m.id_interacao!, 'UTIL')}
                      >
                        👍 Sim
                      </button>
                      <button
                        className={`${styles.feedbackBtn} ${m.feedback === 'NAO_UTIL' ? styles.feedbackBtnActiveNegative : ''}`}
                        onClick={() => enviarFeedback(m.id_interacao!, 'NAO_UTIL')}
                      >
                        👎 Não
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {carregando && <div className={styles.loading}>Nexo IA está digitando...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              className={styles.input}
              type="text"
              placeholder="Pergunte à Nexo IA sobre livros de metafísica, história da arte, física..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
              disabled={carregando}
            />
            <button className={styles.sendBtn} onClick={enviarMensagem} disabled={carregando}>
              Enviar
            </button>
          </div>
        </section>

        <aside className={styles.sidePanel}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Seu Perfil de Leitura</h2>
            <div>
              <div className={styles.sectionTitle}>Interesses Principais</div>
              <div className={styles.tags}>
                {perfil?.categorias.map((c) => (
                  <span key={`${c.nome}-${c.origem}`} className={styles.tag}>
                    {c.nome}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className={styles.sectionTitle}>Últimas Compras</div>
              <div className={styles.recommendationList}>
                {perfil?.livrosComprados.slice(0, 3).map((l) => (
                  <div key={l.id_livro} className={styles.recommendationItem}>
                    <div className={styles.recCover} style={coverStyle(l.categorias)} />
                    <div className={styles.recInfo}>
                      <span className={styles.recTitle}>{l.titulo}</span>
                      <span className={styles.recMeta}>{l.preco}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Recomendados para Você</h2>
            <div className={styles.recommendationList}>
              {recomendacoes.map((r) => (
                <div key={r.livro.id_livro} className={styles.recommendationItem}>
                  <div
                    className={styles.recCover}
                    style={coverStyle(r.livro.categorias?.map((c: any) => c.nome))}
                  />
                  <div className={styles.recInfo}>
                    <span className={styles.recTitle}>{r.livro.titulo}</span>
                    <span className={styles.recMeta}>{formatarPreco(r.livro.valor_venda)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.footerBrandTitle}>Nexo</span>
            <p className={styles.footerBrandText}>
              Nexo é uma livraria virtual curada, dedicada a obras culturais de alta qualidade, filosofia clássica, ciência de vanguarda e edições raras de arte.
            </p>
          </div>
          <div className={styles.footerLinksRow}>
            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>Atendimento</span>
              <a className={styles.footerLink} href="#">Fale Conosco</a>
              <a className={styles.footerLink} href="#">Entregas & Devoluções</a>
              <a className={styles.footerLink} href="#">Perguntas Frequentes</a>
              <a className={styles.footerLink} href="#">Encontre uma Loja</a>
            </div>
            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>Jurídico</span>
              <a className={styles.footerLink} href="#">Política de Privacidade</a>
              <a className={styles.footerLink} href="#">Termos de Uso</a>
              <a className={styles.footerLink} href="#">Aviso de Direitos Autorais</a>
              <a className={styles.footerLink} href="#">Mapa do Site</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 Nexo Inc. Conhecimento curado para mentes curiosas.</span>
          <div className={styles.socials}>
            <span>📷</span>
            <span>🐦</span>
            <span>💼</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AiChatbot;
