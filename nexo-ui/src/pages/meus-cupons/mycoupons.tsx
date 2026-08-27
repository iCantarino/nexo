import type { FunctionComponent } from 'react';
import styles from './MyCoupons.module.css';


const MyCoupons: FunctionComponent = () => {
  	return (
    		<div className={styles.myCoupons}>
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
        				<div className={styles.headerRow}>
          					<b className={styles.logo}>{`Meus Vouchers & Cupons`}</b>
          					<div className={styles.saldoDeCrdito}>Saldo de Crédito Ativo:</div>
        				</div>
        				<div className={styles.frame}>
          					<div className={styles.frame2}>
            						<div className={styles.userName}>Cupons Disponíveis (3)</div>
          					</div>
          					<div className={styles.frame3}>
            						<div className={styles.userName}>Histórico de Uso</div>
          					</div>
          					<div className={styles.frame3}>
            						<div className={styles.userName}>Cupons Expirados</div>
          					</div>
        				</div>
        				<div className={styles.frame5}>
          					<div className={styles.frame6}>
            						<b className={styles.cuponsPromocionais}>Cupons Promocionais</b>
            						<div className={styles.frame7}>
              							<div className={styles.frame8}>
                								<div className={styles.frame9}>
                  									<div className={styles.frame10}>
                    										<b className={styles.logo}>WELCOME5</b>
                  									</div>
                  									<b className={styles.ativo}>Ativo</b>
                								</div>
                								<b className={styles.r2500De}>R$ 25,00 de Desconto</b>
              							</div>
              							<div className={styles.vlidoEmQualquer}>Válido em qualquer compra a partir de R$ 150,00. Exclusivo para novos curadores da plataforma.</div>
              							<div className={styles.line} />
              							<div className={styles.expiraEm31}>Expira em 31 Dez 2026</div>
            						</div>
            						<div className={styles.frame7}>
              							<div className={styles.frame12}>
                								<div className={styles.frame9}>
                  									<div className={styles.frame10}>
                    										<b className={styles.logo}>TIMELESSTHOUGHTS</b>
                  									</div>
                  									<b className={styles.ativo}>Ativo</b>
                								</div>
                								<b className={styles.r2500De}>10% de Desconto</b>
              							</div>
              							<div className={styles.aplicvelApenasPara}>Aplicável apenas para itens das categorias Filosofia ou Literatura Clássica.</div>
              							<div className={styles.line2} />
              							<div className={styles.expiraEm15}>Expira em 15 Nov 2026</div>
            						</div>
          					</div>
          					<div className={styles.frame15}>
            						<b className={styles.logo}>Cupons de Troca (Créditos de Troca)</b>
            						<div className={styles.frame16}>
              							<div className={styles.frame12}>
                								<div className={styles.frame9}>
                  									<div className={styles.frame19}>
                    										<b className={styles.logo}>EXCH-DESIGN44</b>
                  									</div>
                  									<b className={styles.ativo}>Ativo</b>
                								</div>
                								<b className={styles.r7500De}>R$ 75,00 de Crédito</b>
              							</div>
              							<div className={styles.aplicvelApenasPara}>Resultante da solicitação de troca #EX-998A12. Sem limite mínimo de pedido.</div>
              							<div className={styles.line2} />
              							<div className={styles.expiraEm15}>Expira em 14 Out 2027</div>
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
        				<div className={styles.line4} />
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

export default MyCoupons ;
