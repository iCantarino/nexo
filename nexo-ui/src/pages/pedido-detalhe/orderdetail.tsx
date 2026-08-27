import type { FunctionComponent } from 'react';
import styles from './OrderDetail.module.css';


const OrderDetail: FunctionComponent = () => {
  	return (
    		<div className={styles.orderDetail}>
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
        				<div className={styles.backToList}>
          					<img className={styles.frameIcon} alt="" />
          					<div className={styles.voltarParaMeus}>Voltar para Meus Pedidos</div>
        				</div>
        				<div className={styles.stepperCard}>
          					<div className={styles.frame}>
            						<b className={styles.logo}>Detalhe do Status do Pedido</b>
            						<div className={styles.pedidoNx2981a}>Pedido #NX-2981A • 14 de Outubro de 2026</div>
          					</div>
          					<div className={styles.stepper}>
            						<div className={styles.frame2}>
              							<div className={styles.backToList}>
                								<div className={styles.frame4}>
                  									<b className={styles.logo}>1</b>
                								</div>
                								<b className={styles.emAberto}>EM ABERTO</b>
              							</div>
              							<div className={styles.line} />
            						</div>
            						<div className={styles.frame2}>
              							<div className={styles.backToList}>
                								<div className={styles.frame4}>
                  									<b className={styles.logo}>2</b>
                								</div>
                								<b className={styles.emAberto}>EM PROCESSAMENTO</b>
              							</div>
              							<div className={styles.line} />
            						</div>
            						<div className={styles.frame2}>
              							<div className={styles.backToList}>
                								<div className={styles.frame4}>
                  									<b className={styles.logo}>3</b>
                								</div>
                								<b className={styles.emAberto}>PAGAMENTO REALIZADO</b>
              							</div>
              							<div className={styles.line} />
            						</div>
            						<div className={styles.frame2}>
              							<div className={styles.backToList}>
                								<div className={styles.frame13}>
                  									<b className={styles.logo}>4</b>
                								</div>
                								<b className={styles.emTrnsito}>EM TRÂNSITO</b>
              							</div>
              							<div className={styles.line} />
            						</div>
            						<div className={styles.frame14}>
              							<div className={styles.backToList}>
                								<div className={styles.frame16}>
                  									<b className={styles.logo}>5</b>
                								</div>
                								<b className={styles.entregue}>ENTREGUE</b>
              							</div>
            						</div>
          					</div>
        				</div>
        				<div className={styles.detailsSplit}>
          					<div className={styles.leftCol}>
            						<div className={styles.addressPayment}>
              							<div className={styles.address}>
                								<b className={styles.endereoDeEntrega}>Endereço de Entrega</b>
                								<div className={styles.arthurSchopenhauer}>Arthur Schopenhauer</div>
                								<div className={styles.avPaulista1000}>Av. Paulista, 1000 - Apt 42, São Paulo, SP 01310-100</div>
              							</div>
              							<div className={styles.address}>
                								<b className={styles.formaDePagamento}>Forma de Pagamento</b>
                								<div className={styles.pagamentoDivididoEntre}>Pagamento dividido entre cartões:</div>
                								<div className={styles.frame17}>
                  									<div className={styles.logo}>• Visa final 4921:</div>
                  									<div className={styles.logo}>• Mastercard final 8832:</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.itemsBreakdown}>
              							<b className={styles.produtosDoPedido}>Produtos do Pedido</b>
              							<div className={styles.itemRow}>
                								<img className={styles.rectangleIcon} alt="" />
                								<div className={styles.frame18}>
                  									<b className={styles.aOrdemDo}>A Ordem do Tempo</b>
                  									<div className={styles.porCarloRovelli}>por Carlo Rovelli</div>
                  									<div className={styles.entregue}>Qtd: 1</div>
                								</div>
                								<div className={styles.frame19}>
                  									<div className={styles.voltarParaMeus}>R$ 94,90</div>
                  									<div className={styles.frame20}>
                    										<div className={styles.frame21}>
                      											<div className={styles.voltarParaMeus}>Entregue</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.itemRow}>
                								<img className={styles.rectangleIcon} alt="" />
                								<div className={styles.frame18}>
                  									<b className={styles.aOrdemDo}>Além do Bem e do Mal</b>
                  									<div className={styles.porCarloRovelli}>por Friedrich Nietzsche</div>
                  									<div className={styles.entregue}>Qtd: 2</div>
                								</div>
                								<div className={styles.frame19}>
                  									<div className={styles.voltarParaMeus}>R$ 119,80 (R$ 59,90 cada)</div>
                  									<div className={styles.frame24}>
                    										<div className={styles.frame25}>
                      											<div className={styles.voltarParaMeus}>Solicitar Troca</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.rightCol}>
            						<div className={styles.summaryCard}>
              							<b className={styles.logo}>Resumo</b>
              							<div className={styles.frame26}>
                								<div className={styles.footerTop}>
                  									<div className={styles.logo}>Subtotal</div>
                  									<div className={styles.r21470}>R$ 214,70</div>
                								</div>
                								<div className={styles.footerTop}>
                  									<div className={styles.logo}>Cupom Aplicado (WELCOME5)</div>
                  									<div className={styles.r2500}>-R$ 25,00</div>
                								</div>
                								<div className={styles.footerTop}>
                  									<div className={styles.logo}>Frete</div>
                  									<div className={styles.r21470}>R$ 22,50</div>
                								</div>
              							</div>
              							<div className={styles.line5} />
              							<div className={styles.frame30}>
                								<b className={styles.logo}>Total Pago</b>
                								<b className={styles.r21220}>R$ 212,20</b>
              							</div>
              							<div className={styles.line5} />
              							<div className={styles.frame31}>
                								<div className={styles.frame32}>
                  									<b className={styles.logo}>Confirmar Recebimento</b>
                								</div>
                								<div className={styles.frame33}>
                  									<b className={styles.logo}>Cancelar Pedido</b>
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
        				<div className={styles.line7} />
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

export default OrderDetail ;
