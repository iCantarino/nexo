import type { FunctionComponent } from 'react';
import styles from './Profile.module.css';


const Profile: FunctionComponent = () => {
  	return (
    		<div className={styles.profile}>
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
      			<div className={styles.profileBody}>
        				<div className={styles.profileLeft}>
          					<div className={styles.frame}>
            						<b className={styles.logo}>Seu Perfil</b>
            						<div className={styles.frame2}>
              							<div className={styles.statusDot} />
              							<b className={styles.curadorPremium}>Curador Premium</b>
            						</div>
          					</div>
          					<div className={styles.personalInfoForm}>
            						<b className={styles.dadosPessoais}>Dados Pessoais</b>
            						<div className={styles.fieldFullName}>
              							<div className={styles.frame3}>
                								<div className={styles.nomeCompleto}>Nome Completo</div>
              							</div>
              							<div className={styles.inputBox}>
                								<div className={styles.searchPlaceholder}>Arthur Schopenhauer</div>
              							</div>
            						</div>
            						<div className={styles.fieldFullName}>
              							<div className={styles.frame3}>
                								<div className={styles.nomeCompleto}>Endereço de E-mail</div>
              							</div>
              							<div className={styles.inputBox}>
                								<div className={styles.searchPlaceholder}>arthur@nexo.com</div>
              							</div>
            						</div>
            						<div className={styles.frame5}>
              							<div className={styles.fieldCpf}>
                								<div className={styles.frame3}>
                  									<div className={styles.nomeCompleto}>CPF</div>
                								</div>
                								<div className={styles.inputBox}>
                  									<div className={styles.searchPlaceholder}>123.456.789-00</div>
                								</div>
              							</div>
              							<div className={styles.fieldCpf}>
                								<div className={styles.frame3}>
                  									<div className={styles.nomeCompleto}>Telefone</div>
                								</div>
                								<div className={styles.inputBox}>
                  									<div className={styles.searchPlaceholder}>+55 (11) 99999-9999</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.frame5}>
              							<div className={styles.fieldCpf}>
                								<div className={styles.frame3}>
                  									<div className={styles.nomeCompleto}>Data de Nascimento</div>
                								</div>
                								<div className={styles.inputBox}>
                  									<div className={styles.searchPlaceholder}>22/02/1988</div>
                								</div>
              							</div>
              							<div className={styles.fieldCpf}>
                								<div className={styles.frame3}>
                  									<div className={styles.nomeCompleto}>Gênero</div>
                								</div>
                								<div className={styles.inputBox}>
                  									<div className={styles.searchPlaceholder}>Prefiro não informar</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.saveDetailsCta}>
              							<div className={styles.nomeCompleto}>Salvar Dados</div>
                								</div>
              							</div>
              							<div className={styles.line} />
              							<div className={styles.readingPrefsToggles}>
                								<b className={styles.dadosPessoais}>{`Preferências de Leitura & IA`}</b>
                								<div className={styles.configureQuaisTipos}>Configure quais tipos de livros alimentam o agente de recomendação IA.</div>
                								<div className={styles.togglesGrid}>
                  									<div className={styles.toggleRow0}>
                    										<div className={styles.nomeCompleto}>{`Filosofia & Metafísica`}</div>
                    										<div className={styles.pillToggle}>
                      											<div className={styles.knob} />
                    										</div>
                  									</div>
                  									<div className={styles.toggleRow0}>
                    										<div className={styles.nomeCompleto}>Antiguidade Clássica</div>
                    										<div className={styles.pillToggle}>
                      											<div className={styles.knob} />
                    										</div>
                  									</div>
                  									<div className={styles.toggleRow0}>
                    										<div className={styles.nomeCompleto}>{`Física & Ciência de Vanguarda`}</div>
                    										<div className={styles.pillToggle}>
                      											<div className={styles.knob} />
                    										</div>
                  									</div>
                  									<div className={styles.toggleRow0}>
                    										<div className={styles.nomeCompleto}>Poesia Modernista</div>
                    										<div className={styles.pillToggle4}>
                      											<div className={styles.knob} />
                    										</div>
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.profileRight}>
              							<div className={styles.savedAddresses}>
                								<b className={styles.endereosSalvos}>Endereços Salvos</b>
                								<div className={styles.frame11}>
                  									<b className={styles.casaPadro}>Casa (Padrão)</b>
                  									<div className={styles.endereosSalvos}>Av. Paulista, 1000 - Apt 42</div>
                  									<div className={styles.endereosSalvos}>São Paulo, SP</div>
                  									<div className={styles.frame12}>
                    										<div className={styles.nomeCompleto}>Editar</div>
                    										<div className={styles.excluir}>Excluir</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.savedAddresses}>
                								<b className={styles.endereosSalvos}>Pagamentos Salvos</b>
                								<div className={styles.frame13}>
                  									<div className={styles.frame14}>
                    										<img className={styles.creditCardIcon} alt="" />
                    										<div className={styles.logo}>Final 4321</div>
                  									</div>
                  									<div className={styles.excluir2}>Excluir</div>
                								</div>
              							</div>
              							<div className={styles.dangerZone}>
                								<b className={styles.zonaDeRisco}>Zona de Risco</b>
                								<div className={styles.desativarSuaConta}>Desativar sua conta é permanente. Você perderá acesso ao histórico de pedidos e ao seu perfil curado por IA.</div>
                  									<div className={styles.deactivateCta}>
                    										<b className={styles.logo}>Desativar Conta</b>
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
                    										
                    										export default Profile ;
                    										