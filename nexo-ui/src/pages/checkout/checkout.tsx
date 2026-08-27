import type { FunctionComponent } from 'react';
import styles from './Checkout.module.css';


const Checkout: FunctionComponent = () => {
  	return (
    		<div className={styles.checkout}>
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
      			<div className={styles.checkoutBody}>
        				<div className={styles.checkoutLeft}>
          					<b className={styles.checkoutSeguro}>Checkout Seguro</b>
          					<div className={styles.deliveryAddress}>
            						<b className={styles.checkoutSeguro}>1. Endereço de Entrega</b>
            						<div className={styles.addressGrid}>
              							<div className={styles.addrCard1}>
                								<div className={styles.frame}>
                  									<b className={styles.logo}>Casa (Padrão)</b>
                  									<img className={styles.searchIcon} alt="" />
                								</div>
                								<div className={styles.arthurSchopenhauer}>Arthur Schopenhauer</div>
                								<div className={styles.arthurSchopenhauer}>Av. Paulista, 1000 - Apt 42</div>
                								<div className={styles.arthurSchopenhauer}>São Paulo, SP - 01310-100</div>
              							</div>
              							<div className={styles.addrCard2}>
                								<div className={styles.frame2}>
                  									<div className={styles.escritrio}>Escritório</div>
                								</div>
                								<div className={styles.arthurSchopenhauer}>Arthur Schopenhauer</div>
                								<div className={styles.arthurSchopenhauer}>Rua Augusta, 450 - Sl 12</div>
                								<div className={styles.arthurSchopenhauer}>São Paulo, SP - 01304-000</div>
              							</div>
            						</div>
            						<div className={styles.newAddrBox}>
              							<div className={styles.frame3}>
                								<img className={styles.plusIcon} alt="" />
                								<div className={styles.escritrio}>Adicionar Novo Endereço de Entrega</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.line} />
          					<div className={styles.paymentMethod}>
            						<b className={styles.formaDePagamento}>2. Forma de Pagamento</b>
            						<div className={styles.cardsList}>
              							<div className={styles.cardOption1}>
                								<div className={styles.frame4}>
                  									<img className={styles.creditCardIcon} alt="" />
                  									<div className={styles.frame5}>
                    										<b className={styles.logo}>Visa Final 4321</b>
                    										<div className={styles.val1230}>Val: 12/30</div>
                  									</div>
                								</div>
                								<img className={styles.searchIcon} alt="" />
              							</div>
              							<div className={styles.cardOption2}>
                								<div className={styles.frame4}>
                  									<img className={styles.creditCardIcon} alt="" />
                  									<div className={styles.frame5}>
                    										<div className={styles.escritrio}>Mastercard Final 8899</div>
                    										<div className={styles.val1230}>Val: 08/29</div>
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.splitPayment}>
              							<div className={styles.frame8}>
                								<div className={styles.checkbox}>
                  									<img className={styles.checkIcon} alt="" />
                								</div>
                								<div className={styles.escritrio}>Dividir pagamento entre vários cartões de crédito</div>
              							</div>
              							<div className={styles.frame9}>
                								<div className={styles.fieldCard1Amount}>
                  									<div className={styles.frame10}>
                    										<div className={styles.escritrio}>Valor Cartão 1 (R$)</div>
                  									</div>
                  									<div className={styles.inputBox}>
                    										<div className={styles.searchPlaceholder}>75,00</div>
                  									</div>
                								</div>
                								<div className={styles.fieldCard1Amount}>
                  									<div className={styles.frame10}>
                    										<div className={styles.escritrio}>Valor Cartão 2 (R$)</div>
                  									</div>
                  									<div className={styles.inputBox}>
                    										<div className={styles.searchPlaceholder}>112,20</div>
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.newCardBox}>
              							<img className={styles.tagIcon} alt="" />
              							<div className={styles.escritrio}>Adicionar Novo Cartão de Crédito</div>
            						</div>
          					</div>
        				</div>
        				<div className={styles.checkoutRight}>
          					<div className={styles.checkoutSummary}>
            						<b className={styles.checkoutSeguro}>Resumo do Pedido</b>
            						<div className={styles.itemsMini}>
              							<div className={styles.frame12}>
                								<div className={styles.aOrdemDo}>A Ordem do Tempo (x1)</div>
                								<div className={styles.escritrio}>R$ 94,90</div>
              							</div>
              							<div className={styles.frame12}>
                								<div className={styles.aOrdemDo}>A República (x2)</div>
                								<div className={styles.escritrio}>R$ 119,80</div>
              							</div>
            						</div>
            						<div className={styles.line} />
            						<div className={styles.appliedCoupons}>
              							<b className={styles.cuponsAplicados}>Cupons Aplicados</b>
              							<div className={styles.frame14}>
                								<div className={styles.frame15}>
                  									<img className={styles.tagIcon} alt="" />
                  									<div className={styles.escritrio}>WELCOME5</div>
                								</div>
                								<div className={styles.escritrio}>-R$ 25,00</div>
              							</div>
            						</div>
            						<div className={styles.line} />
            						<div className={styles.totalsColumn}>
              							<div className={styles.footerTop}>
                								<div className={styles.logo}>Subtotal dos Itens</div>
                								<div className={styles.r21470}>R$ 214,70</div>
              							</div>
              							<div className={styles.footerTop}>
                								<div className={styles.logo}>Desconto</div>
                								<div className={styles.r25002}>-R$ 25,00</div>
              							</div>
              							<div className={styles.footerTop}>
                								<div className={styles.logo}>Frete</div>
                								<div className={styles.r21470}>R$ 22,50</div>
              							</div>
              							<div className={styles.line} />
              							<div className={styles.frame19}>
                								<b className={styles.logo}>Total Geral</b>
                								<b className={styles.r21220}>R$ 212,20</b>
              							</div>
            						</div>
            						<div className={styles.confirmCta}>
              							<b className={styles.logo}>{`Confirmar Pedido & Pagar`}</b>
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
        				<div className={styles.line5} />
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

export default Checkout ;
