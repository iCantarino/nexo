import type { FunctionComponent } from 'react';
import styles from './ItemDispatch.module.css';


const ItemDispatch: FunctionComponent = () => {
  	return (
    		<div className={styles.itemDispatch}>
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
        				<b className={styles.logo}>Confirmar Despacho</b>
        				<div className={styles.frame}>
          					<div className={styles.frame2}>
            						<b className={styles.reciboEDetalhes}>Recibo e Detalhes do Envio</b>
            						<div className={styles.frame3}>
              							<b className={styles.logo}>Selecionar Transportadora *</b>
              							<div className={styles.frame4}>
                								<div className={styles.logo}>FedEx Ground</div>
                								<img className={styles.frameIcon} alt="" />
              							</div>
            						</div>
            						<div className={styles.frame3}>
              							<b className={styles.logo}>Código de Rastreio *</b>
              							<div className={styles.frame6}>
                								<div className={styles.logo}>FX-988172901-US</div>
              							</div>
            						</div>
            						<div className={styles.frame7}>
              							<div className={styles.frame8}>
                								<b className={styles.logo}>Data de Despacho *</b>
                								<div className={styles.frame9}>
                  									<div className={styles.logo}>2026-10-16</div>
                								</div>
              							</div>
              							<div className={styles.frame8}>
                								<b className={styles.logo}>Previsão de Entrega *</b>
                								<div className={styles.frame9}>
                  									<div className={styles.logo}>2026-10-21</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.frame12}>
              							<div className={styles.frame13}>
                								<b className={styles.logo}>Confirmar Despacho</b>
              							</div>
              							<div className={styles.frame14}>
                								<b className={styles.aprovadoPelaNexo}>Aprovado pela Nexo</b>
              							</div>
            						</div>
          					</div>
          					<div className={styles.frame15}>
            						<b className={styles.aprovadoPelaNexo}>Resumo da Troca</b>
            						<div className={styles.frame16}>
              							<img className={styles.rectangleIcon} alt="" />
              							<div className={styles.frame17}>
                								<b className={styles.logo}>Design e Forma</b>
                								<div className={styles.johannesItten}>Johannes Itten</div>
              							</div>
            						</div>
            						<div className={styles.line} />
            						<div className={styles.frame18}>
              							<div className={styles.logo}>Motivo da Devolução:</div>
              							<div className={styles.logo}>ID da Solicitação:</div>
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

export default ItemDispatch ;
