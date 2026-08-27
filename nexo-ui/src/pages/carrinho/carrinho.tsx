import type { FunctionComponent } from 'react';
import styles from './ShoppingCart.module.css';


const ShoppingCart: FunctionComponent = () => {
  	return (
    		<div className={styles.shoppingCart}>
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
      			<div className={styles.cartBody}>
        				<div className={styles.cartLeft}>
          					<b className={styles.seuCarrinhoDe}>Seu Carrinho de Compras</b>
          					<div className={styles.itemsList}>
            						<div className={styles.item0}>
              							<img className={styles.itemCoverIcon} alt="" />
              							<div className={styles.itemDetails}>
                								<b className={styles.aOrdemDo}>A Ordem do Tempo</b>
                								<div className={styles.porCarloRovelli}>por Carlo Rovelli</div>
              							</div>
              							<div className={styles.quantity}>
                								<div className={styles.minus}>
                  									<div className={styles.div}>-</div>
                								</div>
                								<b className={styles.b2}>1</b>
                								<div className={styles.minus}>
                  									<div className={styles.div}>+</div>
                								</div>
              							</div>
              							<div className={styles.priceCol}>
                								<div className={styles.div}>R$ 94,90</div>
              							</div>
              							<div className={styles.removeBtn}>
                								<img className={styles.searchIcon} alt="" />
              							</div>
            						</div>
            						<div className={styles.item0}>
              							<img className={styles.itemCoverIcon} alt="" />
              							<div className={styles.itemDetails}>
                								<b className={styles.aOrdemDo}>A República</b>
                								<div className={styles.porCarloRovelli}>por Platão</div>
              							</div>
              							<div className={styles.quantity}>
                								<div className={styles.minus}>
                  									<div className={styles.div}>-</div>
                								</div>
                								<b className={styles.b2}>2</b>
                								<div className={styles.minus}>
                  									<div className={styles.div}>+</div>
                								</div>
              							</div>
              							<div className={styles.priceCol2}>
                								<div className={styles.div}>R$ 119,80</div>
                								<div className={styles.r5990Cada}>(R$ 59,90 cada)</div>
              							</div>
              							<div className={styles.removeBtn}>
                								<img className={styles.searchIcon} alt="" />
              							</div>
            						</div>
          					</div>
          					<div className={styles.backToShop}>
            						<img className={styles.arrowLeftIcon} alt="" />
            						<div className={styles.div}>Continuar Comprando</div>
          					</div>
        				</div>
        				<div className={styles.cartRight}>
          					<div className={styles.summaryCard}>
            						<b className={styles.seuCarrinhoDe}>Resumo do Pedido</b>
            						<div className={styles.calculations}>
              							<div className={styles.frame}>
                								<div className={styles.logo}>Subtotal</div>
                								<div className={styles.r21470}>R$ 214,70</div>
              							</div>
              							<div className={styles.frame}>
                								<div className={styles.logo}>Descontos Aplicados</div>
                								<div className={styles.r2500}>-R$ 25,00</div>
              							</div>
              							<div className={styles.frame}>
                								<div className={styles.logo}>Frete Estimado</div>
                								<div className={styles.r21470}>R$ 22,50</div>
              							</div>
            						</div>
            						<div className={styles.line} />
            						<div className={styles.frame4}>
              							<b className={styles.logo}>Total</b>
              							<b className={styles.r21220}>R$ 212,20</b>
            						</div>
            						<div className={styles.couponForm}>
              							<b className={styles.cupomPromocional}>Cupom Promocional</b>
              							<div className={styles.inputCoupon}>
                								<div className={styles.field}>
                  									<div className={styles.logo}>WELCOME5</div>
                								</div>
                								<div className={styles.apply}>
                  									<div className={styles.div}>Aplicar</div>
                								</div>
              							</div>
              							<div className={styles.dropdown}>
                								<div className={styles.logo}>Cupom de Troca: Nenhum Selecionado</div>
                								<img className={styles.chevronDownIcon} alt="" />
              							</div>
            						</div>
            						<div className={styles.checkoutCta}>
              							<b className={styles.logo}>Finalizar Compra</b>
            						</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.footer}>
        				<div className={styles.frame}>
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

export default ShoppingCart ;
