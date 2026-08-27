import type { FunctionComponent } from 'react';
import styles from './Registration.module.css';


const Registration: FunctionComponent = () => {
  	return (
    		<div className={styles.registration}>
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
              							<b className={styles.logo}>0</b>
            						</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.registrationBody}>
        				<div className={styles.registrationCard}>
          					<div className={styles.regHeader}>
            						<b className={styles.junteSeAoCrculo}>Junte-se ao Círculo Nexo</b>
            						<div className={styles.crieUmaConta}>Crie uma conta para acompanhar pedidos e configurar insights personalizados de leitura com IA.</div>
          					</div>
          					<div className={styles.regForm}>
            						<div className={styles.fieldFullName}>
              							<div className={styles.frame}>
                								<div className={styles.nomeCompleto}>Nome Completo</div>
                								<div className={styles.div}>*</div>
              							</div>
              							<div className={styles.inputBox}>
                								<div className={styles.exArthurSchopenhauer}>ex: Arthur Schopenhauer</div>
              							</div>
            						</div>
            						<div className={styles.fieldFullName}>
              							<div className={styles.frame}>
                								<div className={styles.nomeCompleto}>Endereço de E-mail</div>
                								<div className={styles.div}>*</div>
              							</div>
              							<div className={styles.inputBox}>
                								<div className={styles.exArthurSchopenhauer}>ex: arthur@nexo.com</div>
              							</div>
            						</div>
            						<div className={styles.frame3}>
              							<div className={styles.fieldPassword}>
                								<div className={styles.frame}>
                  									<div className={styles.nomeCompleto}>Senha</div>
                  									<div className={styles.div}>*</div>
                								</div>
                								<div className={styles.inputBox}>
                  									<div className={styles.exArthurSchopenhauer}>Mínimo de 8 caracteres</div>
                								</div>
              							</div>
              							<div className={styles.fieldPassword}>
                								<div className={styles.frame}>
                  									<div className={styles.nomeCompleto}>Confirmar Senha</div>
                  									<div className={styles.div}>*</div>
                								</div>
                								<div className={styles.inputBox}>
                  									<div className={styles.exArthurSchopenhauer}>Repita sua senha</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.frame3}>
              							<div className={styles.fieldPassword}>
                								<div className={styles.frame}>
                  									<div className={styles.nomeCompleto}>CPF</div>
                  									<div className={styles.div}>*</div>
                								</div>
                								<div className={styles.inputBox}>
                  									<div className={styles.exArthurSchopenhauer}>000.000.000-00</div>
                								</div>
              							</div>
              							<div className={styles.fieldPassword}>
                								<div className={styles.frame}>
                  									<div className={styles.nomeCompleto}>Telefone</div>
                  									<div className={styles.div}>*</div>
                								</div>
                								<div className={styles.inputBox}>
                  									<div className={styles.exArthurSchopenhauer}>+55 (11) 99999-9999</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.frame3}>
              							<div className={styles.fieldPassword}>
                								<div className={styles.frame}>
                  									<div className={styles.nomeCompleto}>Data de Nascimento</div>
                  									<div className={styles.div}>*</div>
                								</div>
                								<div className={styles.inputBox}>
                  									<div className={styles.exArthurSchopenhauer}>DD/MM/YYYY</div>
                								</div>
              							</div>
              							<div className={styles.fieldPassword}>
                								<div className={styles.nomeCompleto}>Gênero</div>
                								<div className={styles.frame12}>
                  									<div className={styles.logo}>Prefiro não informar</div>
                  									<img className={styles.chevronDownIcon} alt="" />
                								</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.preferencesSection}>
            						<b className={styles.junteSeAoCrculo}>Preferências de Leitura (Personalização IA)</b>
            						<div className={styles.prefsCheckboxes}>
              							<div className={styles.pref0}>
                								<div className={styles.checkbox}>
                  									<img className={styles.checkIcon} alt="" />
                								</div>
                								<div className={styles.userName}>Filosofia</div>
              							</div>
              							<div className={styles.pref0}>
                								<div className={styles.checkbox}>
                  									<img className={styles.checkIcon} alt="" />
                								</div>
                								<div className={styles.userName}>Ciência de Vanguarda</div>
              							</div>
              							<div className={styles.pref2}>
                								<div className={styles.checkbox3} />
                								<div className={styles.userName}>Artes Plásticas</div>
              							</div>
              							<div className={styles.pref2}>
                								<div className={styles.checkbox3} />
                								<div className={styles.userName}>Poesia Clássica</div>
              							</div>
              							<div className={styles.pref0}>
                								<div className={styles.checkbox}>
                  									<img className={styles.checkIcon} alt="" />
                								</div>
                								<div className={styles.userName}>{`História & Antiguidade`}</div>
              							</div>
              							<div className={styles.pref2}>
                								<div className={styles.checkbox3} />
                								<div className={styles.userName}>{`Ficção & Romances`}</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.termsAcceptance}>
            						<div className={styles.checkbox7}>
              							<img className={styles.checkIcon} alt="" />
            						</div>
            						<div className={styles.aceitoOsTermos}>Aceito os Termos e Condições da Rede de Curadores Nexo e autorizo o processamento das preferências de leitura para recomendações curadas.</div>
          					</div>
          					<div className={styles.registerCta}>
            						<b className={styles.logo}>Criar Conta</b>
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

export default Registration ;
