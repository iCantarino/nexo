import { useState, useEffect, type FunctionComponent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api, { carrinhoApi } from '../../services/api';
import type { Livro } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import styles from './HomeCatalog.module.css';

const POR_PAGINA = 8;
const POR_LINHA = 4;

const filters = [
  'Todos os Assuntos', 'Filosofia', 'Ciência & Tecnologia',
  'Arte & Arquitetura', 'Literatura Clássica', 'História & Sociologia',
];

const formatarPreco = (valor: string | number) =>
  'R$ ' + Number(valor).toFixed(2).replace('.', ',');

const HomeCatalog: FunctionComponent = () => {
  useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [qtdCarrinho, setQtdCarrinho] = useState(0);
  const [pagina, setPagina] = useState(1);

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

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [livrosRes, cartRes] = await Promise.all([
          api.get<Livro[]>('/livros?ativo=true'),
          carrinhoApi.listar(),
        ]);
        setLivros(livrosRes.data);
        const total = cartRes.data.itens
          .filter((i) => !i.removido_por_expiracao)
          .reduce((acc, i) => acc + i.quantidade, 0);
        setQtdCarrinho(total);
      } catch {
        setMensagem('Erro ao carregar o catálogo.');
        setQtdCarrinho(0);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  const handleAdicionar = async (idLivro: number) => {
    try {
      await carrinhoApi.adicionarItem(idLivro, 1);
      setMensagem('Item adicionado ao carrinho!');
      atualizarBadge();
    } catch (e: any) {
      setMensagem(e.response?.data?.detail || 'Erro ao adicionar ao carrinho.');
    }
  };

  const termo = searchTerm.trim().toLowerCase();
  const filtrados = livros.filter((l) =>
    !termo ||
    l.titulo.toLowerCase().includes(termo) ||
    (l.autor?.nome || '').toLowerCase().includes(termo)
  );
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const linhas: Livro[][] = [];
  for (let i = 0; i < visiveis.length; i += POR_LINHA) {
    linhas.push(visiveis.slice(i, i + POR_LINHA));
  }

  const renderCard = (livro: Livro) => (
    <div className={styles.bookCard} key={livro.id_livro} data-testid={`card-livro-${livro.id_livro}`}>
      <div className={styles.coverWrapperIcon}
        style={{ background: 'linear-gradient(135deg, #1e3a5f, #d97706)' }} />
      <div className={styles.metadata}>
        <div className={styles.stars}>
          {[0, 1, 2, 3, 4].map((n) => <span className={styles.starIcon} key={n} />)}
        </div>
        <b className={styles.title}>{livro.titulo}</b>
        <div className={styles.author}>{livro.autor?.nome || ''}</div>
      </div>
      <div className={styles.actionRow}>
        <b>{formatarPreco(livro.valor_venda)}</b>
        <button type="button" className={styles.addBtn}
          style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          data-testid={`adicionar-${livro.id_livro}`}
          onClick={() => handleAdicionar(livro.id_livro)}>
          + Adicionar
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.homeCatalog}>
      <Navbar
        activeItem="catalogo"
        searchValue={searchTerm}
        onSearchChange={(value) => { setSearchTerm(value); setPagina(1); }}
        cartBadge={qtdCarrinho}
      />

      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <b className={styles.edioExclusivaDo} style={{ color: '#fff' }}>Edição exclusiva do curador</b>
          </div>
          <b className={styles.sabedoriaCincia}>Sabedoria, Ciência &amp; Arte. Selecionados à mão.</b>
          <div className={styles.exploreNossaNova}>
            Explore nossa nova coleção de edições limitadas e traduções premium de obras fundamentais do conhecimento. Para os que buscam cultura atemporal.
          </div>
          <div className={styles.heroCta} style={{ color: '#fff' }}>
            <b className={styles.explorarColeo}>Explorar Coleção</b>
          </div>
        </div>
      </div>

      <div className={styles.mainSection}>
        <div className={styles.browseHeader}>
          <b className={styles.diretrioDoConhecimento}>Diretório do Conhecimento</b>
          <div className={styles.filtersRow}>
            {filters.map((f, i) => (
              <button type="button" key={f}
                className={selectedFilter === i ? styles.subj0 : styles.subj1}
                onClick={() => setSelectedFilter(i)}>
                {f}
              </button>
            ))}
          </div>
          {mensagem && <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#475569' }}>{mensagem}</div>}
        </div>

        <div className={styles.grid}>
          {loading && <div style={{ fontFamily: 'Inter', fontSize: 14 }}>Carregando catálogo...</div>}
          {!loading && filtrados.length === 0 && (
            <div style={{ fontFamily: 'Inter', fontSize: 14 }}>Nenhum livro encontrado.</div>
          )}
          {linhas.map((linha, idx) => (
            <div className={styles.row1} key={idx}>
              {linha.map(renderCard)}
              {Array.from({ length: POR_LINHA - linha.length }).map((_, k) => (
                <div key={`vazio-${k}`} style={{ flex: 1 }} />
              ))}
            </div>
          ))}
        </div>

        <div className={styles.pagination}>
          <div>Exibindo {visiveis.length} de {filtrados.length} itens</div>
          <div className={styles.pages}>
            {Array.from({ length: totalPaginas }).map((_, i) => (
              <button type="button" key={i}
                className={paginaAtual === i + 1 ? styles.pageActive : styles.page}
                style={{ cursor: 'pointer', font: 'inherit' }}
                onClick={() => setPagina(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <b>Nexo</b>
            <div className={styles.nexoUma}>Nexo é uma livraria virtual curada, dedicada a obras culturais de alta qualidade, filosofia clássica, ciência de vanguarda e edições raras de arte.</div>
          </div>
          <div className={styles.footerLinksRow}>
            <div className={styles.colHelp}>
              <b className={styles.atendimento}>Atendimento</b>
              <div>Fale Conosco</div>
              <div>Entregas &amp; Devoluções</div>
              <div>Perguntas Frequentes</div>
              <div>Encontre uma Loja</div>
            </div>
            <div className={styles.colHelp}>
              <b className={styles.atendimento}>Jurídico</b>
              <div>Política de Privacidade</div>
              <div>Termos de Uso</div>
              <div>Aviso de Direitos Autorais</div>
              <div>Mapa do Site</div>
            </div>
          </div>
        </div>
        <div className={styles.line} />
        <div className={styles.footerBottom}>
          <div>© 2026 Nexo Inc. Conhecimento curado para mentes curiosas.</div>
          <div className={styles.socials}>
            <img src="/images/icons/instagram.svg" width={18} height={18} alt="Instagram" />
            <img src="/images/icons/twitter.svg" width={18} height={18} alt="Twitter" />
            <img src="/images/icons/linkedin.svg" width={18} height={18} alt="LinkedIn" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCatalog;
