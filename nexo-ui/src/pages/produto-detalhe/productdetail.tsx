import { useState, useEffect, type FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import api, { carrinhoApi, avaliacoesApi, type Livro, type Avaliacao } from '../../services/api';
import styles from './ProductDetail.module.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

const formatarPreco = (valor: string | number) =>
  'R$ ' + Number(valor).toFixed(2).replace('.', ',');

const formatarData = (data?: string | null) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const calcularMedia = (avaliacoes: Avaliacao[]) => {
  if (!avaliacoes.length) return 0;
  const soma = avaliacoes.reduce((acc, a) => acc + a.estrelas, 0);
  return soma / avaliacoes.length;
};

const StarDisplay: FunctionComponent<{ nota: number; tamanho?: number }> = ({ nota, tamanho = 14 }) => (
  <div className={styles.stars}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        style={{
          fontSize: tamanho,
          color: n <= Math.round(nota) ? '#d97706' : '#cbd5e1',
          lineHeight: 1,
        }}
      >
        ★
      </span>
    ))}
  </div>
);

const StarInput: FunctionComponent<{ nota: number; onChange: (n: number) => void }> = ({ nota, onChange }) => (
  <div className={styles.stars} style={{ cursor: 'pointer' }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        onClick={() => onChange(n)}
        style={{
          fontSize: 24,
          color: n <= nota ? '#d97706' : '#cbd5e1',
          lineHeight: 1,
        }}
      >
        ★
      </span>
    ))}
  </div>
);

const ProductDetail: FunctionComponent = () => {
  const { idLivro } = useParams<{ idLivro: string }>();
  const { user } = useAuth();

  const [livro, setLivro] = useState<Livro | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [adicionando, setAdicionando] = useState(false);

  const [novaNota, setNovaNota] = useState(5);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoReview, setEnviandoReview] = useState(false);

  const carregarDados = async () => {
    if (!idLivro) return;
    setLoading(true);
    setErro('');
    try {
      const [livroRes, avaliacoesRes] = await Promise.all([
        api.get<Livro>(`/livros/${idLivro}`),
        avaliacoesApi.listar(Number(idLivro)),
      ]);
      setLivro(livroRes.data);
      setAvaliacoes(avaliacoesRes.data);
    } catch (e: any) {
      setErro(e.response?.data?.detail || 'Erro ao carregar o livro.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [idLivro]);

  const handleAdicionar = async () => {
    if (!livro) return;
    setAdicionando(true);
    setMensagem('');
    try {
      await carrinhoApi.adicionarItem(livro.id_livro, quantidade);
      setMensagem(`${quantidade} item(s) adicionado(s) ao carrinho!`);
    } catch (e: any) {
      setErro(e.response?.data?.detail || 'Erro ao adicionar ao carrinho.');
    } finally {
      setAdicionando(false);
    }
  };

  const handleEnviarReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idLivro || !novoComentario.trim()) return;
    setEnviandoReview(true);
    setErro('');
    setMensagem('');
    try {
      await avaliacoesApi.criar(Number(idLivro), {
        estrelas: novaNota,
        comentario: novoComentario.trim(),
      });
      setNovoComentario('');
      setNovaNota(5);
      setMensagem('Avaliação enviada com sucesso!');
      await carregarDados();
    } catch (e: any) {
      setErro(e.response?.data?.detail || 'Erro ao enviar avaliação.');
    } finally {
      setEnviandoReview(false);
    }
  };

  const media = calcularMedia(avaliacoes);
  const categoria = livro?.categorias?.[0]?.nome || 'Literatura';

  if (loading) {
    return (
      <div className={styles.productDetail}>
        <Navbar />
        <div style={{ padding: 80 }}>Carregando...</div>
      </div>
    );
  }

  if (!livro) {
    return (
      <div className={styles.productDetail}>
        <Navbar />
        <div style={{ padding: 80 }}>{erro || 'Livro não encontrado.'}</div>
      </div>
    );
  }

  return (
    <div className={styles.productDetail}>
      <Navbar activeItem="catalogo" />

      {(mensagem || erro) && (
        <div
          style={{
            alignSelf: 'stretch',
            padding: '16px 80px',
            backgroundColor: mensagem ? '#dcfce7' : '#fee2e2',
            color: mensagem ? '#166534' : '#991b1b',
            fontFamily: 'Inter',
            fontSize: 14,
          }}
        >
          {mensagem || erro}
        </div>
      )}

      <div className={styles.productCore}>
        <img
          className={styles.mainCoverIcon}
          src={livro.imagem_principal_url ? `${API_BASE}${livro.imagem_principal_url}` : '/book-placeholder.png'}
          alt={livro.titulo}
        />
        <div className={styles.infoAndBuy}>
          <div className={styles.headerMeta}>
            <div className={styles.categoryBadge}>
              <b className={styles.cinciaFilosofia}>{categoria}</b>
            </div>
            <b className={styles.aOrdemDo}>{livro.titulo}</b>
            <div className={styles.porCarloRovelli}>
              por {livro.autor?.nome || 'Autor desconhecido'}
            </div>
            <div className={styles.ratingsRow}>
              <StarDisplay nota={media} />
              <div className={styles.div}>{media.toFixed(1)}</div>
              <div className={styles.avaliaesDeLeitores}>
                ({avaliacoes.length} avaliação{avaliacoes.length !== 1 ? 'ões' : ' de leitores'})
              </div>
            </div>
          </div>

          <div className={styles.line} />

          <div className={styles.pricingPanel}>
            <div className={styles.priceLeft}>
              <div className={styles.cinciaFilosofia}>Preço</div>
              <b className={styles.r9490}>{formatarPreco(livro.valor_venda)}</b>
            </div>
            <div className={styles.qtyAndCta}>
              <div className={styles.qtySelector}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
                  onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <b className={styles.logo}>{quantidade}</b>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
                  onClick={() => setQuantidade((q) => Math.min(livro.quantidade_estoque || 99, q + 1))}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className={styles.addCta}
                onClick={handleAdicionar}
                disabled={adicionando}
                style={{ border: 'none', cursor: adicionando ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {adicionando ? 'Adicionando...' : 'Adicionar ao Carrinho'}
              </button>
            </div>
          </div>

          <div className={styles.synopsis}>
            <b className={styles.logo}>Sinopse</b>
            <div className={styles.porQueLembramos}>
              {livro.sinopse || 'Sinopse não disponível.'}
            </div>
          </div>

          <div className={styles.specsGrid}>
            <div className={styles.specsCol1}>
              <div className={styles.logo}>Editora: {livro.editora?.nome || 'Não informada'}</div>
              <div className={styles.logo}>Publicação: {livro.ano_publicacao || 'Não informada'}</div>
            </div>
            <div className={styles.specsCol1}>
              <div className={styles.logo}>ISBN: {livro.isbn || 'Não informado'}</div>
              <div className={styles.logo}>
                Formato: {livro.num_paginas ? `${livro.num_paginas}p.` : 'Não informado'}
                {livro.edicao ? ` · ${livro.edicao}` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.reviewsSection}>
        <b className={styles.avaliaesDosLeitores}>Avaliações dos Leitores</b>

        <div className={styles.reviewsList}>
          {avaliacoes.length === 0 && (
            <div style={{ color: '#475569', fontFamily: 'Inter' }}>
              Ainda não há avaliações para este livro. Seja o primeiro a avaliar!
            </div>
          )}

          {avaliacoes.map((avaliacao) => (
            <div className={styles.review0} key={avaliacao.id_avaliacao}>
              <div className={styles.recHeader}>
                <div className={styles.priceLeft}>
                  <div className={styles.div}>{avaliacao.cliente?.nome || 'Leitor'}</div>
                  <div className={styles.deFevereiroDe}>{formatarData(avaliacao.data_avaliacao)}</div>
                </div>
                <StarDisplay nota={avaliacao.estrelas} />
              </div>
              <div className={styles.umaConquistaAbsolutamente}>
                {avaliacao.comentario || 'Avaliação sem comentário.'}
              </div>
            </div>
          ))}
        </div>

        {user && (
          <form
            onSubmit={handleEnviarReview}
            style={{
              alignSelf: 'stretch',
              borderRadius: 8,
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              fontFamily: 'Inter',
            }}
          >
            <b style={{ fontSize: 18 }}>Deixe sua avaliação</b>
            <div>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>Sua nota</div>
              <StarInput nota={novaNota} onChange={setNovaNota} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>Comentário</div>
              <textarea
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="Conte o que achou do livro..."
                rows={4}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  fontFamily: 'Inter',
                  fontSize: 14,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={enviandoReview || !novoComentario.trim()}
              style={{
                alignSelf: 'flex-start',
                borderRadius: 6,
                backgroundColor: '#0f172a',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                fontSize: 14,
                cursor: enviandoReview ? 'not-allowed' : 'pointer',
              }}
            >
              {enviandoReview ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </form>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <b className={styles.logo}>Nexo</b>
            <div className={styles.nexoUma}>Nexo é uma livraria virtual curada, dedicada a obras culturais de alta qualidade, filosofia clássica, ciência de vanguarda e edições raras de arte.</div>
          </div>
          <div className={styles.footerLinksRow}>
            <div className={styles.colHelp}>
              <b className={styles.atendimento}>Atendimento</b>
              <div className={styles.logo}>Fale Conosco</div>
              <div className={styles.logo}>{`Entregas & Devoluções`}</div>
              <div className={styles.logo}>Perguntas Frequentes</div>
              <div className={styles.logo}>Encontre uma Loja</div>
            </div>
            <div className={styles.colHelp}>
              <b className={styles.atendimento}>Jurídico</b>
              <div className={styles.logo}>Política de Privacidade</div>
              <div className={styles.logo}>Termos de Uso</div>
              <div className={styles.logo}>Aviso de Direitos Autorais</div>
              <div className={styles.logo}>Mapa do Site</div>
            </div>
          </div>
        </div>
        <div className={styles.line2} />
        <div className={styles.footerBottom}>
          <div className={styles.logo}>© 2026 Nexo Inc. Conhecimento curado para mentes curiosas.</div>
          <div className={styles.socials}>
            <span style={{ fontSize: 18, cursor: 'pointer' }}>📘</span>
            <span style={{ fontSize: 18, cursor: 'pointer' }}>🐦</span>
            <span style={{ fontSize: 18, cursor: 'pointer' }}>📸</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
