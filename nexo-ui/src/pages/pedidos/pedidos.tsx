import type { FunctionComponent } from 'react';
import styles from './MyOrders.module.css';


const MyOrders: FunctionComponent = () => {
  	return (
    		<div className={styles.myOrders}>
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
          					<b className={styles.logo}>{`Meus Pedidos & Trocas`}</b>
          					<div className={styles.arthurS}>Arthur S. • Conta #NX-88291</div>
        				</div>
        				<div className={styles.filtersRow}>
          					<div className={styles.frame}>
            						<div className={styles.userName}>Todos os Pedidos</div>
          					</div>
          					<div className={styles.frame2}>
            						<div className={styles.userName}>Em Aberto</div>
          					</div>
          					<div className={styles.frame2}>
            						<div className={styles.userName}>Em Trânsito</div>
          					</div>
          					<div className={styles.frame2}>
            						<div className={styles.userName}>Entregues</div>
          					</div>
          					<div className={styles.frame2}>
            						<div className={styles.userName}>Cancelados</div>
          					</div>
          					<div className={styles.frame2}>
            						<div className={styles.userName}>Trocas</div>
          					</div>
        				</div>
        				<div className={styles.ordersList}>
          					<div className={styles.orderCard}>
            						<div className={styles.cardTop}>
              							<div className={styles.frame7}>
                								<b className={styles.logo}>Order #NX-2981A</b>
                								<div className={styles.realizadoEm14}>Realizado em 14 Out 2026</div>
                								<div className={styles.frame8}>
                  									<b className={styles.entregue}>Em Trânsito</b>
                								</div>
              							</div>
              							<b className={styles.r21220}>R$ 212,20</b>
            						</div>
            						<div className={styles.line} />
            						<div className={styles.cardMiddle}>
              							<img className={styles.itemCoverIcon} alt="" />
              							<div className={styles.frame9}>
                								<b className={styles.aOrdemDo}>A Ordem do Tempo</b>
                								<div className={styles.porCarloRovelli}>por Carlo Rovelli • Edição Ciência Clássica</div>
                								<div className={styles.quantidade1}>Quantidade: 1</div>
              							</div>
              							<img className={styles.itemCoverIcon} alt="" />
              							<div className={styles.frame9}>
                								<b className={styles.aOrdemDo}>Além do Bem e do Mal</b>
                								<div className={styles.porCarloRovelli}>por Friedrich Nietzsche • Tradução de Filosofia</div>
                								<div className={styles.quantidade1}>Quantidade: 2</div>
              							</div>
            						</div>
            						<div className={styles.line} />
            						<div className={styles.cardActions}>
              							<div className={styles.frame11}>
                								<div className={styles.rastrearPacote}>Rastrear Pacote</div>
              							</div>
              							<div className={styles.frame12}>
                								<div className={styles.rastrearPacote}>Ver Detalhes</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.orderCard}>
            						<div className={styles.cardTop}>
              							<div className={styles.frame7}>
                								<b className={styles.logo}>Order #NX-1928B</b>
                								<div className={styles.realizadoEm14}>Realizado em 29 Set 2026</div>
                								<div className={styles.frame14}>
                  									<b className={styles.entregue}>Entregue</b>
                								</div>
              							</div>
              							<b className={styles.r21220}>R$ 269,90</b>
            						</div>
            						<div className={styles.line} />
            						<div className={styles.cardMiddle}>
              							<img className={styles.itemCoverIcon} alt="" />
              							<div className={styles.frame9}>
                								<b className={styles.aOrdemDo}>Mimesis</b>
                								<div className={styles.porCarloRovelli}>por Erich Auerbach • Literatura Clássica Rara</div>
                								<div className={styles.quantidade1}>Quantidade: 1</div>
              							</div>
            						</div>
            						<div className={styles.line} />
            						<div className={styles.cardActions}>
              							<div className={styles.frame11}>
                								<div className={styles.rastrearPacote}>Nota Fiscal PDF</div>
              							</div>
              							<div className={styles.frame17}>
                								<div className={styles.rastrearPacote}>Solicitar Troca</div>
              							</div>
              							<div className={styles.frame12}>
                								<div className={styles.rastrearPacote}>Comprar Novamente</div>
              							</div>
            						</div>
          					</div>
        				</div>
        				<div className={styles.pagination}>
          					<div className={styles.logo}>Exibindo 2 de 28 pedidos no histórico</div>
          					<div className={styles.pages}>
            						<div className={styles.frame19}>
              							<div className={styles.rastrearPacote}>1</div>
            						</div>
            						<div className={styles.frame20}>
              							<div className={styles.userName}>2</div>
            						</div>
            						<div className={styles.frame20}>
              							<div className={styles.userName}>3</div>
            						</div>
            						<div className={styles.frame20}>
              							<div className={styles.userName}>...</div>
            						</div>
            						<div className={styles.frame20}>
              							<div className={styles.userName}>6</div>
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

export default MyOrders ;
