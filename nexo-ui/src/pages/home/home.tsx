import { useState, useRef, useEffect, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './HomeCatalog.module.css';

const HomeCatalog: FunctionComponent = () => {
	const { user, logout } = useAuth();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedFilter, setSelectedFilter] = useState(0);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const filters = [
		'Todos os Assuntos',
		'Filosofia',
		'Ciência & Tecnologia',
		'Arte & Arquitetura',
		'Literatura Clássica',
		'História & Sociologia',
	];
	
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsUserMenuOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

  	return (
    		<div className={styles.homeCatalog}>
      			<div className={styles.navbar}>
        				<div className={styles.brand}>
          					<b className={styles.logo}>Nexo</b>
          					<div className={styles.brandDot} />
        				</div>
        				<div className={styles.navLinks}>
          					<div className={styles.navItemCatalog}>
            						<div className={styles.catlogo}>catálogo</div>
            						<div className={styles.activeLine} />
          					</div>
          					<div className={styles.navItemPhilosophy}>
            						<div className={styles.filosofia}>filosofia</div>
          					</div>
          					<div className={styles.navItemPhilosophy}>
            						<div className={styles.filosofia}>ciência</div>
          					</div>
          					<div className={styles.navItemPhilosophy}>
            						<div className={styles.filosofia}>arte</div>
          					</div>
          					<div className={styles.navItemPhilosophy}>
            						<div className={styles.filosofia}>história</div>
          					</div>
        				</div>
        				<div className={styles.navActions}>
          					<div className={styles.searchBar}>
            						<span className={styles.searchIcon} />
            						<input 
										type="text"
										className={styles.searchInput} // Nova classe CSS que vamos usar
										placeholder="Buscar títulos, autores, editoras..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
          					</div>
					<div
						className={styles.userMenu}
						role="button"
						tabIndex={0}
						aria-expanded={isUserMenuOpen}
						onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
						onKeyDown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								setIsUserMenuOpen(!isUserMenuOpen);
							}
						}}
					ref={menuRef}
					style={{ position: 'relative' }}
					>
						<img className={styles.userRoundIcon} alt="" />
						<div className={styles.userName}>{(user as any)?.nome || 'Usuário'}</div>
								{isUserMenuOpen && (
									<div className={styles.userDropdown}>
										<Link to="/perfil" className={styles.userDropdownItem} onClick={(event) => event.stopPropagation()}>Perfil</Link>
										<div className={styles.userDropdownItem} onClick={(event) => { event.stopPropagation(); logout(); }}>Sair</div>
									</div>
								)}
          					</div>
          					<div className={styles.cartBtn}>
            						<img className={styles.shoppingBagIcon} alt="" />
            						<div className={styles.badge}>
              							<b className={styles.logo}>3</b>
            						</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.heroBanner}>
        				<div className={styles.heroContent}>
          					<div className={styles.eyebrow}>
            						<b className={styles.edioExclusivaDo}>Edição Exclusiva do Curador</b>
          					</div>
          					<b className={styles.sabedoriaCincia}>{`Sabedoria, Ciência & Arte. Selecionados à mão.`}</b>
          					<div className={styles.exploreNossaNova}>Explore nossa nova coleção de edições limitadas e traduções premium de obras fundamentais do conhecimento. Para os que buscam cultura atemporal.</div>
          					<div className={styles.heroCta}>
            						<div className={styles.explorarColeo}>Explorar Coleção</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.mainSection}>
        				<div className={styles.browseHeader}>
          					<b className={styles.diretrioDoConhecimento}>Diretório do Conhecimento</b>
          					<div className={styles.filtersRow}>
									{filters.map((filter, index) => (
										<button
											className={index === selectedFilter ? styles.subj0 : styles.subj1}
											type="button"
											onClick={() => setSelectedFilter(index)}
											key={filter}
										>
											<span className={styles.userName}>{filter}</span>
										</button>
									))}
          					</div>
        				</div>
        				<div className={styles.grid}>
          					<div className={styles.row1}>
            						<div className={styles.bookCard}>
              							<img className={styles.coverWrapperIcon} alt="" />
              							<div className={styles.metadata}>
                								<div className={styles.stars}>
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                								</div>
                								<b className={styles.title}>Livro</b>
                								<div className={styles.author}>Autor</div>
              							</div>
              							<div className={styles.actionRow}>
                								<b className={styles.logo}>R$ 94,90</b>
                								<div className={styles.addBtn}>
                  									<div className={styles.explorarColeo}>+ Adicionar</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.bookCard}>
              							<img className={styles.coverWrapperIcon} alt="" />
              							<div className={styles.metadata}>
                								<div className={styles.stars}>
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                								</div>
                								<b className={styles.title}>Livro</b>
                								<div className={styles.author}>Autor</div>
              							</div>
              							<div className={styles.actionRow}>
                								<b className={styles.logo}>R$ 72,50</b>
                								<div className={styles.addBtn}>
                  									<div className={styles.explorarColeo}>+ Adicionar</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.bookCard}>
              							<img className={styles.coverWrapperIcon} alt="" />
              							<div className={styles.metadata}>
                								<div className={styles.stars}>
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                								</div>
                								<b className={styles.title}>Livro</b>
                								<div className={styles.author}>Autor</div>
              							</div>
              							<div className={styles.actionRow}>
                								<b className={styles.logo}>R$ 149,90</b>
                								<div className={styles.addBtn}>
                  									<div className={styles.explorarColeo}>+ Adicionar</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.bookCard}>
              							<img className={styles.coverWrapperIcon} alt="" />
              							<div className={styles.metadata}>
                								<div className={styles.stars}>
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                								</div>
                								<b className={styles.title}>Livro</b>
                								<div className={styles.author}>Autor</div>
              							</div>
              							<div className={styles.actionRow}>
                								<b className={styles.logo}>R$ 119,90</b>
                								<div className={styles.addBtn}>
                  									<div className={styles.explorarColeo}>+ Adicionar</div>
                								</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.row1}>
            						<div className={styles.bookCard}>
              							<img className={styles.coverWrapperIcon} alt="" />
              							<div className={styles.metadata}>
                								<div className={styles.stars}>
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                								</div>
                								<b className={styles.title}>Livro</b>
                								<div className={styles.author}>Autor</div>
              							</div>
              							<div className={styles.actionRow}>
                								<b className={styles.logo}>R$ 99,90</b>
                								<div className={styles.addBtn}>
                  									<div className={styles.explorarColeo}>+ Adicionar</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.bookCard}>
              							<img className={styles.coverWrapperIcon} alt="" />
              							<div className={styles.metadata}>
                								<div className={styles.stars}>
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                								</div>
                								<b className={styles.title}>Livro</b>
                								<div className={styles.author}>Autor</div>
              							</div>
              							<div className={styles.actionRow}>
                								<b className={styles.logo}>R$ 59,90</b>
                								<div className={styles.addBtn}>
                  									<div className={styles.explorarColeo}>+ Adicionar</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.bookCard}>
              							<img className={styles.coverWrapperIcon} alt="" />
              							<div className={styles.metadata}>
                								<div className={styles.stars}>
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                								</div>
                								<b className={styles.title}>Livro</b>
                								<div className={styles.author}>Autor</div>
              							</div>
              							<div className={styles.actionRow}>
                								<b className={styles.logo}>R$ 54,90</b>
                								<div className={styles.addBtn}>
                  									<div className={styles.explorarColeo}>+ Adicionar</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.bookCard}>
              							<img className={styles.coverWrapperIcon} alt="" />
              							<div className={styles.metadata}>
                								<div className={styles.stars}>
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                  									<img className={styles.starIcon} alt="" />
                								</div>
                								<b className={styles.title}>Livro</b>
                								<div className={styles.author}>Autor</div>
              							</div>
              							<div className={styles.actionRow}>
                								<b className={styles.logo}>R$ 172,90</b>
                								<div className={styles.addBtn}>
                  									<div className={styles.explorarColeo}>+ Adicionar</div>
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
        				<div className={styles.pagination}>
          					<div className={styles.logo}>Exibindo 8 de 142 itens</div>
          					<div className={styles.pages}>
            						<div className={styles.pageActive}>
              							<div className={styles.explorarColeo}>1</div>
            						</div>
            						<div className={styles.page}>
              							<div className={styles.userName}>2</div>
            						</div>
            						<div className={styles.page}>
              							<div className={styles.userName}>3</div>
            						</div>
            						<div className={styles.page}>
              							<div className={styles.userName}>...</div>
            						</div>
            						<div className={styles.page}>
              							<div className={styles.userName}>18</div>
            						</div>
          					</div>
        				</div>
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
        				<div className={styles.line} />
        				<div className={styles.footerBottom}>
          					<div className={styles.logo}>© 2026 Nexo Inc. Conhecimento curado para mentes curiosas.</div>
          					<div className={styles.socials}>
            						<img className={styles.shoppingBagIcon} alt="" />
            						<img className={styles.shoppingBagIcon} alt="" />
            						<img className={styles.shoppingBagIcon} alt="" />
          					</div>
        				</div>
      			</div>
    		</div>);
};

export default HomeCatalog ;


