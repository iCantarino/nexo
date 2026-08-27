import type { FunctionComponent } from 'react';
import styles from './AiChatbot.module.css';


const AiChatbot: FunctionComponent = () => {
  	return (
    		<div className={styles.aiChatbot}>
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
            						<img className={styles.searchIcon} alt="" />
            						<div className={styles.searchPlaceholder}>Buscar no catálogo...</div>
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
      			<div className={styles.body}>
        				<div className={styles.frame}>
          					<div className={styles.frame2}>
            						<div className={styles.frame3}>
              							<b className={styles.logo}>N</b>
            						</div>
            						<div className={styles.frame4}>
              							<b className={styles.logo}>Nexo IA Assistente</b>
              							<div className={styles.onlineCurador}>Online • Curador Virtual</div>
            						</div>
          					</div>
          					<div className={styles.line} />
          					<div className={styles.frame5}>
            						<div className={styles.frame6}>
              							<div className={styles.frame7}>
                								<b className={styles.logo}>N</b>
              							</div>
              							<div className={styles.frame8}>
                								<div className={styles.olArthurAnalisei}>Olá Arthur! Analisei seu perfil de leitura. Com base no seu interesse pela física de Carlo Rovelli e pela filosofia clássica, selecionei estas edições exclusivas. O que acha?</div>
                  									</div>
                  									</div>
                  									<div className={styles.frame9}>
                    										<div className={styles.frame10}>
                      											<img className={styles.rectangleIcon} alt="" />
                      											<div className={styles.frame11}>
                        												<div className={styles.frame12}>
                          													<b className={styles.logo}>A Ordem do Tempo</b>
                          													<div className={styles.carloRovelli}>Carlo Rovelli</div>
                        												</div>
                        												<div className={styles.frame13}>
                          													<b className={styles.logo}>R$ 94,90</b>
                          													<div className={styles.frame14}>
                            														<div className={styles.adicionarAoCarrinho}>+ Adicionar ao Carrinho</div>
                          													</div>
                        												</div>
                      											</div>
                    										</div>
                  									</div>
                  									<div className={styles.frame15}>
                    										<div className={styles.frame16}>
                      											<div className={styles.olArthurAnalisei}>Que maravilha! Você tem algo relacionado a Johannes Itten ou princípios de Design de Vanguarda?</div>
                        												</div>
                        												</div>
                        												<div className={styles.frame6}>
                          													<div className={styles.frame7}>
                            														<b className={styles.logo}>N</b>
                          													</div>
                          													<div className={styles.frame8}>
                            														<div className={styles.olArthurAnalisei}>Excelente escolha! Recomendo muito *Design e Forma* de Johannes Itten. Ele explora técnicas fundamentais da Bauhaus. Aqui está:</div>
                          													</div>
                        												</div>
                        												<div className={styles.frame9}>
                          													<div className={styles.frame10}>
                            														<img className={styles.rectangleIcon} alt="" />
                            														<div className={styles.frame11}>
                              															<div className={styles.frame12}>
                                																<b className={styles.logo}>Design e Forma</b>
                                																<div className={styles.carloRovelli}>Johannes Itten</div>
                              															</div>
                              															<div className={styles.frame13}>
                                																<b className={styles.logo}>R$ 119,90</b>
                                																<div className={styles.frame14}>
                                  																	<div className={styles.adicionarAoCarrinho}>+ Adicionar ao Carrinho</div>
                                																</div>
                              															</div>
                            														</div>
                          													</div>
                        												</div>
                        												</div>
                        												<div className={styles.inputBox}>
                          													<div className={styles.logo}>Pergunte à Nexo IA sobre livros de metafísica, história da arte, física...</div>
                          													<div className={styles.frame26}>
                            														<div className={styles.adicionarAoCarrinho}>Enviar</div>
                          													</div>
                        												</div>
                        												</div>
                        												<div className={styles.frame27}>
                          													<b className={styles.seuPerfilDe}>Seu Perfil de Leitura</b>
                          													<div className={styles.frame28}>
                            														<b className={styles.logo}>Interesses Principais</b>
                            														<div className={styles.frame29}>
                              															<div className={styles.frame30}>
                                																<div className={styles.logo}>Mecânica Quântica</div>
                              															</div>
                              															<div className={styles.frame30}>
                                																<div className={styles.logo}>Filosofia</div>
                              															</div>
                              															<div className={styles.frame30}>
                                																<div className={styles.logo}>Estoicismo</div>
                              															</div>
                              															<div className={styles.frame30}>
                                																<div className={styles.logo}>Idealismo Alemão</div>
                              															</div>
                              															<div className={styles.frame30}>
                                																<div className={styles.logo}>Design Bauhaus</div>
                              															</div>
                              															<div className={styles.frame30}>
                                																<div className={styles.logo}>Estética</div>
                              															</div>
                            														</div>
                          													</div>
                          													<div className={styles.line} />
                          													<div className={styles.frame36}>
                            														<b className={styles.logo}>Recomendados para Você</b>
                            														<div className={styles.frame37}>
                              															<div className={styles.frame38}>
                                																<img className={styles.rectangleIcon3} alt="" />
                                																<div className={styles.frame39}>
                                  																	<b className={styles.almDoBem}>Além do Bem e do Mal</b>
                                  																	<div className={styles.friedrichNietzsche}>Friedrich Nietzsche • R$ 72,50</div>
                                																</div>
                              															</div>
                              															<div className={styles.frame38}>
                                																<img className={styles.rectangleIcon3} alt="" />
                                																<div className={styles.frame39}>
                                  																	<b className={styles.almDoBem}>Mimesis</b>
                                  																	<div className={styles.friedrichNietzsche}>Erich Auerbach • R$ 149,90</div>
                                																</div>
                              															</div>
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
                          													<div className={styles.line3} />
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
                      											
                      											export default AiChatbot ;
                      											