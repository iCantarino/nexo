import { useEffect, useState, useMemo, type FunctionComponent } from 'react';
import { livrosApi, catalogoApi } from '../../services/api';
import type { Livro, Autor, Editora, Categoria, GrupoPrecificacao } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import styles from './AdminLivros.module.css';

const brl = (v: string | number) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

const STATUS_MOTIVO_PADRAO = 1;
const JUSTIFICATIVA_PADRAO = 'Alteração realizada pela área administrativa.';

const AdminLivros: FunctionComponent = () => {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [busca, setBusca] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [modal, setModal] = useState<{ aberto: boolean; livro?: Livro }>({ aberto: false });
  const [carregando, setCarregando] = useState(false);

  const [autores, setAutores] = useState<Autor[]>([]);
  const [editoras, setEditoras] = useState<Editora[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [grupos, setGrupos] = useState<GrupoPrecificacao[]>([]);

  const [aba, setAba] = useState<'geral' | 'dimensoes' | 'preco' | 'imagens'>('geral');
  const [previewCapa, setPreviewCapa] = useState<string | null>(null);
  const [arquivoCapa, setArquivoCapa] = useState<File | null>(null);

  const [form, setForm] = useState<Record<string, any>>({
    titulo: '', isbn: '', id_autor: '', novo_autor: '', id_editora: '', nova_editora: '',
    ano_publicacao: new Date().getFullYear(), edicao: '1ª', num_paginas: 0, sinopse: '',
    altura: 0, largura: 0, peso: 0, profundidade: 0, codigo_barras: '',
    id_grupo_precificacao: '', valor_custo: 0, categorias: [] as number[],
  });

  const carregar = async () => {
    try {
      const [l, a, e, c, g] = await Promise.all([
        livrosApi.adminTodos(),
        catalogoApi.autores(),
        catalogoApi.editoras(),
        catalogoApi.categorias(),
        catalogoApi.gruposPrecificacao(),
      ]);
      setLivros(l.data);
      setAutores(a.data);
      setEditoras(e.data);
      setCategorias(c.data);
      setGrupos(g.data);
    } catch (err: any) {
      setMensagem(err.response?.data?.detail || 'Erro ao carregar dados.');
    }
  };
  useEffect(() => { carregar(); }, []);

  const livrosFiltrados = useMemo(() => {
    if (!busca.trim()) return livros;
    const termo = busca.toLowerCase();
    return livros.filter((l) =>
      l.titulo.toLowerCase().includes(termo) ||
      l.codigo_livro.toLowerCase().includes(termo) ||
      l.autor?.nome.toLowerCase().includes(termo)
    );
  }, [livros, busca]);

  const abrirModal = (livro?: Livro) => {
    setAba('geral');
    setPreviewCapa(livro?.imagem_principal_url || null);
    setArquivoCapa(null);
    if (livro) {
      setForm({
        titulo: livro.titulo,
        isbn: livro.isbn,
        id_autor: livro.id_autor || '',
        novo_autor: '',
        id_editora: livro.id_editora || '',
        nova_editora: '',
        ano_publicacao: livro.ano_publicacao,
        edicao: livro.edicao,
        num_paginas: livro.num_paginas,
        sinopse: livro.sinopse,
        altura: Number(livro.altura),
        largura: Number(livro.largura),
        peso: Number(livro.peso),
        profundidade: Number(livro.profundidade),
        codigo_barras: livro.codigo_barras,
        id_grupo_precificacao: livro.id_grupo_precificacao,
        valor_custo: Number(livro.valor_custo),
        categorias: (livro.categorias || []).map((c) => c.id_categoria),
      });
    } else {
      setForm({
        titulo: '', isbn: '', id_autor: '', novo_autor: '', id_editora: '', nova_editora: '',
        ano_publicacao: new Date().getFullYear(), edicao: '1ª', num_paginas: 0, sinopse: '',
        altura: 0, largura: 0, peso: 0, profundidade: 0, codigo_barras: '',
        id_grupo_precificacao: '', valor_custo: 0, categorias: [],
      });
    }
    setModal({ aberto: true, livro });
  };

  const fecharModal = () => setModal({ aberto: false });

  const handleChange = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const toggleCategoria = (id: number) => {
    setForm((f) => {
      const lista = f.categorias as number[];
      return { ...f, categorias: lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id] };
    });
  };

  const handleCapa = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivoCapa(file);
      setPreviewCapa(URL.createObjectURL(file));
    }
  };

  const salvar = async () => {
    setCarregando(true);
    try {
      const payload: Record<string, any> = {
        titulo: form.titulo,
        isbn: form.isbn,
        id_autor: form.id_autor || undefined,
        novo_autor: form.novo_autor || undefined,
        id_editora: form.id_editora || undefined,
        nova_editora: form.nova_editora || undefined,
        ano_publicacao: Number(form.ano_publicacao),
        edicao: form.edicao,
        num_paginas: Number(form.num_paginas),
        sinopse: form.sinopse,
        altura: Number(form.altura),
        largura: Number(form.largura),
        peso: Number(form.peso),
        profundidade: Number(form.profundidade),
        codigo_barras: form.codigo_barras,
        id_grupo_precificacao: Number(form.id_grupo_precificacao),
        valor_custo: Number(form.valor_custo),
        quantidade_estoque: Number(form.quantidade_estoque || 0),
        categorias: form.categorias as number[],
      };

      let res;
      if (modal.livro) {
        res = await livrosApi.atualizar(modal.livro.id_livro, payload);
      } else {
        res = await livrosApi.criar(payload);
      }
      const livroSalvo = res.data;

      if (arquivoCapa && livroSalvo.id_livro) {
        const fd = new FormData();
        fd.append('imagem', arquivoCapa);
        fd.append('tipo', 'CAPA');
        await livrosApi.uploadImagem(livroSalvo.id_livro, fd);
      }

      setMensagem(modal.livro ? 'Livro atualizado com sucesso.' : 'Livro criado com sucesso.');
      fecharModal();
      carregar();
    } catch (err: any) {
      setMensagem(err.response?.data?.detail || 'Erro ao salvar o livro.');
    } finally {
      setCarregando(false);
    }
  };

  const executarAcao = async (acao: () => Promise<unknown>, ok: string) => {
    try { await acao(); setMensagem(ok); carregar(); }
    catch (err: any) { setMensagem(err.response?.data?.detail || 'Operação não permitida.'); }
  };

  return (
    <div className={styles.adminLivros}>
      <AdminSidebar />
      <div className={styles.contentArea}>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <b className={styles.titulo}>Gestão de Livros</b>
            <div className={styles.subtitulo}>Cadastro, edição e controle do catálogo de produtos.</div>
          </div>
          <button className={styles.botaoAdicionar} onClick={() => abrirModal()}>+ Adicionar Produto</button>
        </div>
        <div className={styles.workspace}>
          {mensagem && <div className={styles.mensagem}>{mensagem}</div>}

          <input
            type="text"
            className={styles.busca}
            placeholder="Buscar por título, código ou autor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <div className={styles.tabela}>
            <div className={styles.tabelaHeader}>
              <span>Capa</span>
              <span>Código</span>
              <span>Título</span>
              <span>Autor</span>
              <span>Editora</span>
              <span>Preço</span>
              <span>Estoque</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            {livrosFiltrados.length === 0 && <div className={styles.vazio}>Nenhum livro encontrado.</div>}
            {livrosFiltrados.map((l) => (
              <div key={l.id_livro} className={styles.tabelaRow}>
                <span>
                  {l.imagem_principal_url ? (
                    <img src={`http://localhost:8000${l.imagem_principal_url}`} alt="" className={styles.thumb} />
                  ) : (
                    <div className={styles.thumbPlaceholder} />
                  )}
                </span>
                <span>{l.codigo_livro}</span>
                <span><b>{l.titulo}</b></span>
                <span>{l.autor?.nome || '-'}</span>
                <span>{l.editora?.nome || '-'}</span>
                <span>{brl(l.valor_venda)}</span>
                <span>{l.quantidade_estoque}</span>
                <span><span className={l.ativo ? styles.badgeAtivo : styles.badgeInativo}>{l.ativo ? 'Ativo' : 'Inativo'}</span></span>
                <span className={styles.acoes}>
                  <button className={styles.botaoAcao} onClick={() => abrirModal(l)}>Editar</button>
                  {l.ativo ? (
                    <button className={styles.botaoInativar} onClick={() => executarAcao(() => livrosApi.inativar(l.id_livro, STATUS_MOTIVO_PADRAO, JUSTIFICATIVA_PADRAO), 'Livro inativado.')}>Inativar</button>
                  ) : (
                    <button className={styles.botaoAtivar} onClick={() => executarAcao(() => livrosApi.ativar(l.id_livro, STATUS_MOTIVO_PADRAO, JUSTIFICATIVA_PADRAO), 'Livro ativado.')}>Ativar</button>
                  )}
                  <button className={styles.botaoExcluir} onClick={() => { if (confirm(`Excluir definitivamente o livro "${l.titulo}"?`)) executarAcao(() => livrosApi.deletar(l.id_livro), 'Livro excluído.'); }}>Excluir</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal.aberto && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <b>{modal.livro ? 'Editar Produto' : 'Adicionar Produto'}</b>
              <button className={styles.botaoFechar} onClick={fecharModal}>×</button>
            </div>

            <div className={styles.abas}>
              {(['geral', 'dimensoes', 'preco', 'imagens'] as const).map((k) => (
                <button key={k} className={aba === k ? styles.abaAtiva : styles.aba} onClick={() => setAba(k)}>
                  {k === 'geral' && 'Geral'}
                  {k === 'dimensoes' && 'Dimensões'}
                  {k === 'preco' && 'Preço/Estoque'}
                  {k === 'imagens' && 'Imagens'}
                </button>
              ))}
            </div>

            <div className={styles.modalBody}>
              {aba === 'geral' && (
                <div className={styles.grid2}>
                  <label className={styles.campo}>
                    Título
                    <input value={form.titulo} onChange={(e) => handleChange('titulo', e.target.value)} />
                  </label>
                  <label className={styles.campo}>
                    ISBN
                    <input value={form.isbn} onChange={(e) => handleChange('isbn', e.target.value)} />
                  </label>
                  <label className={styles.campo}>
                    Autor existente
                    <select value={form.id_autor} onChange={(e) => handleChange('id_autor', Number(e.target.value) || '')}>
                      <option value="">Selecione...</option>
                      {autores.map((a) => <option key={a.id_autor} value={a.id_autor}>{a.nome}</option>)}
                    </select>
                  </label>
                  <label className={styles.campo}>
                    Ou novo autor
                    <input value={form.novo_autor} onChange={(e) => handleChange('novo_autor', e.target.value)} placeholder="Digite para criar" />
                  </label>
                  <label className={styles.campo}>
                    Editora existente
                    <select value={form.id_editora} onChange={(e) => handleChange('id_editora', Number(e.target.value) || '')}>
                      <option value="">Selecione...</option>
                      {editoras.map((e) => <option key={e.id_editora} value={e.id_editora}>{e.nome}</option>)}
                    </select>
                  </label>
                  <label className={styles.campo}>
                    Ou nova editora
                    <input value={form.nova_editora} onChange={(e) => handleChange('nova_editora', e.target.value)} placeholder="Digite para criar" />
                  </label>
                  <label className={styles.campo}>
                    Ano de Publicação
                    <input type="number" value={form.ano_publicacao} onChange={(e) => handleChange('ano_publicacao', Number(e.target.value))} />
                  </label>
                  <label className={styles.campo}>
                    Edição
                    <input value={form.edicao} onChange={(e) => handleChange('edicao', e.target.value)} />
                  </label>
                  <label className={styles.campo}>
                    Nº Páginas
                    <input type="number" value={form.num_paginas} onChange={(e) => handleChange('num_paginas', Number(e.target.value))} />
                  </label>
                  <label className={styles.campoFull}>
                    Sinopse
                    <textarea rows={4} value={form.sinopse} onChange={(e) => handleChange('sinopse', e.target.value)} />
                  </label>
                  <label className={styles.campoFull}>
                    Categorias
                    <div className={styles.checkboxGroup}>
                      {categorias.map((c) => (
                        <label key={c.id_categoria} className={styles.checkbox}>
                          <input type="checkbox" checked={(form.categorias as number[]).includes(c.id_categoria)} onChange={() => toggleCategoria(c.id_categoria)} />
                          {c.nome}
                        </label>
                      ))}
                    </div>
                  </label>
                </div>
              )}

              {aba === 'dimensoes' && (
                <div className={styles.grid2}>
                  <label className={styles.campo}>Altura (cm)<input type="number" step="0.1" value={form.altura} onChange={(e) => handleChange('altura', e.target.value)} /></label>
                  <label className={styles.campo}>Largura (cm)<input type="number" step="0.1" value={form.largura} onChange={(e) => handleChange('largura', e.target.value)} /></label>
                  <label className={styles.campo}>Peso (kg)<input type="number" step="0.001" value={form.peso} onChange={(e) => handleChange('peso', e.target.value)} /></label>
                  <label className={styles.campo}>Profundidade (cm)<input type="number" step="0.1" value={form.profundidade} onChange={(e) => handleChange('profundidade', e.target.value)} /></label>
                  <label className={styles.campoFull}>Código de Barras<input value={form.codigo_barras} onChange={(e) => handleChange('codigo_barras', e.target.value)} /></label>
                </div>
              )}

              {aba === 'preco' && (
                <div className={styles.grid2}>
                  <label className={styles.campo}>
                    Grupo de Precificação
                    <select value={form.id_grupo_precificacao} onChange={(e) => handleChange('id_grupo_precificacao', Number(e.target.value) || '')}>
                      <option value="">Selecione...</option>
                      {grupos.map((g) => <option key={g.id_grupo} value={g.id_grupo}>{g.nome} ({Number(g.margem_lucro_percentual).toFixed(0)}%)</option>)}
                    </select>
                  </label>
                  <label className={styles.campo}>
                    Valor de Custo
                    <input type="number" step="0.01" value={form.valor_custo} onChange={(e) => handleChange('valor_custo', e.target.value)} />
                  </label>
                  <label className={styles.campo}>
                    Quantidade em Estoque
                    <input type="number" value={form.quantidade_estoque || 0} onChange={(e) => handleChange('quantidade_estoque', Number(e.target.value))} />
                  </label>
                  <div className={styles.campo}>
                    <small>O preço de venda será calculado automaticamente pelo grupo de precificação.</small>
                  </div>
                </div>
              )}

              {aba === 'imagens' && (
                <div>
                  <label className={styles.campoFull}>
                    Imagem de Capa
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCapa} />
                  </label>
                  {previewCapa && (
                    <div className={styles.preview}>
                      <img src={previewCapa.startsWith('blob:') ? previewCapa : `http://localhost:8000${previewCapa}`} alt="Preview" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.modalBotoes}>
              <button className={styles.botaoCancelar} onClick={fecharModal}>Cancelar</button>
              <button className={styles.botaoConfirmar} onClick={salvar} disabled={carregando}>
                {carregando ? 'Salvando...' : 'Salvar Produto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLivros;
