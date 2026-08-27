import type { FunctionComponent } from 'react';
import styles from './ProductDetail.module.css';


const ProductDetail: FunctionComponent = () => {
  	return (
    		<div className={styles.productDetail}>
      			<div className={styles.navbar}>
        				<div className={styles.brand}>
          					<b className={styles.logo}>Nexo</b>
          					<div className={styles.brandDot} />
        				</div>
        				<div className={styles.navLinks}>
          					<div className={styles.navItemCatalog}>
            						<div className={styles.catlogo}>catálogo</div>
          					</div>
          					<div className={styles.navItemCatalog}>
            						<div className={styles.catlogo}>filosofia</div>
          					</div>
          					<div className={styles.navItemScience}>
            						<div className={styles.cincia}>ciência</div>
            						<div className={styles.activeLine} />
          					</div>
          					<div className={styles.navItemCatalog}>
            						<div className={styles.catlogo}>arte</div>
          					</div>
          					<div className={styles.navItemCatalog}>
            						<div className={styles.catlogo}>história</div>
          					</div>
        				</div>
        				<div className={styles.navActions}>
          					<div className={styles.searchBar}>
            						<img className={styles.searchIcon} alt="" />
            						<div className={styles.searchPlaceholder}>Buscar títulos, autores, editoras...</div>
          					</div>
          					<div className={styles.userMenu}>
            						<img className={styles.userRoundIcon} alt="" />
            						<div className={styles.userName}>Arthur S.</div>
          					</div>
          					<div className={styles.cartBtn}>
            						<img className={styles.shoppingBagIcon} alt="" />
            						<div className={styles.badge}>
              							<b className={styles.logo}>3</b>
            						</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.productCore}>
        				<img className={styles.mainCoverIcon} alt="" />
        				<div className={styles.infoAndBuy}>
          					<div className={styles.headerMeta}>
            						<div className={styles.categoryBadge}>
              							<b className={styles.cinciaFilosofia}>{`Ciência & Filosofia da Física`}</b>
            						</div>
            						<b className={styles.aOrdemDo}>A Ordem do Tempo</b>
            						<div className={styles.porCarloRovelli}>por Carlo Rovelli</div>
            						<div className={styles.ratingsRow}>
              							<div className={styles.stars}>
                								<img className={styles.starIcon} alt="" />
                								<img className={styles.starIcon} alt="" />
                								<img className={styles.starIcon} alt="" />
                								<img className={styles.starIcon} alt="" />
                								<img className={styles.starIcon} alt="" />
              							</div>
              							<div className={styles.div}>4,9</div>
              							<div className={styles.avaliaesDeLeitores}>(128 avaliações de leitores)</div>
            						</div>
          					</div>
          					<div className={styles.line} />
          					<div className={styles.pricingPanel}>
            						<div className={styles.priceLeft}>
              							<div className={styles.cinciaFilosofia}>Preço</div>
              							<b className={styles.r9490}>R$ 94,90</b>
            						</div>
            						<div className={styles.qtyAndCta}>
              							<div className={styles.qtySelector}>
                								<div className={styles.div}>-</div>
                								<b className={styles.logo}>1</b>
                								<div className={styles.div}>+</div>
              							</div>
              							<div className={styles.addCta}>
                								<img className={styles.shoppingBagIcon} alt="" />
                								<div className={styles.frame} />
                								<div className={styles.div}>Adicionar ao Carrinho</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.synopsis}>
            						<b className={styles.logo}>Sinopse</b>
            						<div className={styles.porQueLembramos}>Por que lembramos do passado e não do futuro? O que significa o tempo "fluir"? Carlo Rovelli, o brilhante físico teórico, desvenda o mistério do tempo neste livro curto, poético e profundo. Combinando física com bela literatura, ele nos mostra que, no nível mais fundamental, o tempo como o conhecemos simplesmente não existe.</div>
              							</div>
              							<div className={styles.specsGrid}>
                								<div className={styles.specsCol1}>
                  									<div className={styles.logo}>Editora: Objetiva</div>
                  									<div className={styles.logo}>Data de Publicação: Maio 2018</div>
                								</div>
                								<div className={styles.specsCol1}>
                  									<div className={styles.logo}>ISBN: 9780241263150</div>
                  									<div className={styles.logo}>Formato: Capa Dura, 224p.</div>
                								</div>
              							</div>
              							</div>
              							</div>
              							<div className={styles.recommendationsSection}>
                								<div className={styles.recHeader}>
                  									<div className={styles.recTitleGroup}>
                    										<b className={styles.logo}>Recomendados para você</b>
                    										<div className={styles.aiBadge}>
                      											<b className={styles.cinciaFilosofia}>Recomendação IA</b>
                    										</div>
                  									</div>
                  									<div className={styles.verMeuPerfil}>Ver Meu Perfil de Leitura</div>
                								</div>
                								<div className={styles.recRow}>
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
                      											<b className={styles.title}>A Ordem do Tempo</b>
                      											<div className={styles.author}>Carlo Rovelli</div>
                    										</div>
                    										<div className={styles.actionRow}>
                      											<b className={styles.logo}>R$ 94,90</b>
                      											<div className={styles.addBtn}>
                        												<div className={styles.div}>+ Adicionar</div>
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
                      											<b className={styles.title}>Astrofísica para Apressados</b>
                      											<div className={styles.author}>Neil deGrasse Tyson</div>
                    										</div>
                    										<div className={styles.actionRow}>
                      											<b className={styles.logo}>R$ 79,90</b>
                      											<div className={styles.addBtn}>
                        												<div className={styles.div}>+ Adicionar</div>
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
                      											<b className={styles.title}>A Realidade Não É o que Parece</b>
                      											<div className={styles.author}>Carlo Rovelli</div>
                    										</div>
                    										<div className={styles.actionRow}>
                      											<b className={styles.logo}>R$ 87,50</b>
                      											<div className={styles.addBtn}>
                        												<div className={styles.div}>+ Adicionar</div>
                      											</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.reviewsSection}>
                								<b className={styles.avaliaesDosLeitores}>Avaliações dos Leitores</b>
                								<div className={styles.reviewsList}>
                  									<div className={styles.review0}>
                    										<div className={styles.recHeader}>
                      											<div className={styles.priceLeft}>
                        												<div className={styles.div}>Mariana L.</div>
                        												<div className={styles.deFevereiroDe}>12 de Fevereiro de 2026</div>
                      											</div>
                      											<div className={styles.stars}>
                        												<img className={styles.starIcon} alt="" />
                        												<img className={styles.starIcon} alt="" />
                        												<img className={styles.starIcon} alt="" />
                        												<img className={styles.starIcon} alt="" />
                        												<img className={styles.starIcon} alt="" />
                      											</div>
                    										</div>
                    										<div className={styles.umaConquistaAbsolutamente}>Uma conquista absolutamente impressionante. Rovelli consegue fazer conceitos profundos de gravidade quântica parecerem bela poesia. Mudou a forma como penso sobre minha existência diária.</div>
                  									</div>
                  									<div className={styles.review0}>
                    										<div className={styles.recHeader}>
                      											<div className={styles.priceLeft}>
                        												<div className={styles.div}>Julian K.</div>
                        												<div className={styles.deFevereiroDe}>28 de Janeiro de 2026</div>
                      											</div>
                      											<div className={styles.stars}>
                        												<img className={styles.starIcon} alt="" />
                        												<img className={styles.starIcon} alt="" />
                        												<img className={styles.starIcon} alt="" />
                        												<img className={styles.starIcon} alt="" />
                        												<img className={styles.starIcon} alt="" />
                      											</div>
                    										</div>
                    										<div className={styles.umaConquistaAbsolutamente}>Uma exploração muito breve, mas intensa, sobre termodinâmica e gravidade quântica em loop. Explica a mudança de pensar o mundo como 'coisas' para pensá-lo como 'relações'. Envolvente!</div>
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
                								<div className={styles.line2} />
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
            						
            						export default ProductDetail ;
            						