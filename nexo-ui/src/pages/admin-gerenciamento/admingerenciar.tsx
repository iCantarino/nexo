import type { FunctionComponent } from 'react';
import styles from './AdminOrderManagement.module.css';


const AdminOrderManagement: FunctionComponent = () => {
  	return (
    		<div className={styles.adminOrderManagement}>
      			<div className={styles.sidebar}>
        				<div className={styles.brand}>
          					<b className={styles.logo}>Nexo</b>
          					<div className={styles.brandDot} />
          					<div className={styles.adminTag}>
            						<b className={styles.logo}>ADMIN</b>
          					</div>
        				</div>
        				<div className={styles.navList}>
          					<div className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Dashboard</div>
          					</div>
          					<div className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Clientes</div>
          					</div>
          					<div className={styles.navItemPedidos}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.pedidos}>Pedidos</div>
          					</div>
          					<div className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Trocas</div>
          					</div>
          					<div className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Análises</div>
          					</div>
        				</div>
        				<div className={styles.sidebarFooter}>
          					<div className={styles.line} />
          					<div className={styles.userProfile}>
            						<div className={styles.avatar}>
              							<b className={styles.logo}>AS</b>
            						</div>
            						<div className={styles.userInfo}>
              							<div className={styles.arthurSchopenhauer}>Arthur Schopenhauer</div>
              							<div className={styles.curadorMaster}>Curador Master</div>
            						</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.contentArea}>
        				<div className={styles.header}>
          					<div className={styles.headerTitles}>
            						<b className={styles.logo}>Fluxo e Gestão de Pedidos</b>
            						<div className={styles.supervisoDeStatus}>Supervisão de status operacionais, envios e trocas de produtos.</div>
          					</div>
          					<div className={styles.headerActions}>
            						<div className={styles.notificationBell}>
              							<div className={styles.iconWrapper6}>
                								<img className={styles.badgeAlertIcon} alt="" />
              							</div>
            						</div>
            						<div className={styles.adminBadge}>
              							<div className={styles.liveIndicator} />
              							<div className={styles.sessoAtiva}>Sessão Ativa</div>
            						</div>
          					</div>
        				</div>
        				<div className={styles.workspace}>
          					<div className={styles.statusTransitionBoard}>
            						<b className={styles.filaDeTransies}>Fila de Transições de Status</b>
            						<div className={styles.filterPills}>
              							<div className={styles.frame}>
                								<div className={styles.sessoAtiva}>Todos (4)</div>
              							</div>
              							<div className={styles.frame2}>
                								<div className={styles.logo}>Aguardando Processamento</div>
              							</div>
              							<div className={styles.frame2}>
                								<div className={styles.logo}>Aguardando Envio</div>
              							</div>
            						</div>
            						<div className={styles.ordersWorkflowTable}>
              							<div className={styles.tableHeader}>
                								<b className={styles.pedido}>PEDIDO</b>
                								<b className={styles.cliente}>CLIENTE</b>
                								<b className={styles.pedido}>DATA</b>
                								<b className={styles.itens}>ITENS</b>
                								<b className={styles.pedido}>TOTAL</b>
                								<b className={styles.statusAtual}>STATUS ATUAL</b>
                								<b className={styles.aoDeFluxo}>AÇÃO DE FLUXO DISPONÍVEL</b>
              							</div>
              							<div className={styles.workflowRow0}>
                								<b className={styles.pedido}>NX-2981A</b>
                								<div className={styles.marianaLLima}>Mariana L. Lima</div>
                								<div className={styles.fev2026}>12 Fev 2026</div>
                								<div className={styles.div}>2</div>
                								<b className={styles.pedido}>R$ 42,40</b>
                								<div className={styles.statusContainer}>
                  									<div className={styles.frame4}>
                    										<b className={styles.logo}>EM ABERTO</b>
                  									</div>
                								</div>
                								<div className={styles.actionButtonContainer}>
                  									<div className={styles.frame5}>
                    										<b className={styles.logo}>Avançar para: EM PROCESSAMENTO</b>
                    										<div className={styles.iconWrapper7}>
                      											<img className={styles.arrowRightIcon} alt="" />
                    										</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.workflowRow0}>
                								<b className={styles.pedido}>NX-2977B</b>
                								<div className={styles.marianaLLima}>Arthur S. Ribeiro</div>
                								<div className={styles.fev2026}>11 Fev 2026</div>
                								<div className={styles.div}>1</div>
                								<b className={styles.pedido}>R$ 18,90</b>
                								<div className={styles.statusContainer2}>
                  									<div className={styles.frame6}>
                    										<b className={styles.logo}>EM PROCESSAMENTO</b>
                  									</div>
                								</div>
                								<div className={styles.actionButtonContainer2}>
                  									<div className={styles.frame7}>
                    										<b className={styles.logo}>Avançar para: PAGAMENTO REALIZADO</b>
                    										<div className={styles.iconWrapper7}>
                      											<img className={styles.arrowRightIcon} alt="" />
                    										</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.workflowRow0}>
                								<b className={styles.pedido}>NX-2965C</b>
                								<div className={styles.marianaLLima}>Juliana K. Schmidt</div>
                								<div className={styles.fev2026}>10 Fev 2026</div>
                								<div className={styles.div}>4</div>
                								<b className={styles.pedido}>R$ 112,50</b>
                								<div className={styles.statusContainer3}>
                  									<div className={styles.frame8}>
                    										<b className={styles.logo}>PAGAMENTO REALIZADO</b>
                  									</div>
                								</div>
                								<div className={styles.actionButtonContainer}>
                  									<div className={styles.frame5}>
                    										<b className={styles.logo}>Avançar para: EM TRÂNSITO</b>
                    										<div className={styles.iconWrapper7}>
                      											<img className={styles.arrowRightIcon} alt="" />
                    										</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.workflowRow0}>
                								<b className={styles.pedido}>NX-2950D</b>
                								<div className={styles.marianaLLima}>Erich Auerbach</div>
                								<div className={styles.fev2026}>09 Fev 2026</div>
                								<div className={styles.div}>3</div>
                								<b className={styles.pedido}>R$ 84,00</b>
                								<div className={styles.statusContainer4}>
                  									<div className={styles.frame10}>
                    										<b className={styles.logo}>EM TRÂNSITO</b>
                  									</div>
                								</div>
                								<div className={styles.actionButtonContainer}>
                  									<div className={styles.frame5}>
                    										<b className={styles.logo}>Avançar para: ENTREGUE</b>
                    										<div className={styles.iconWrapper7}>
                      											<img className={styles.arrowRightIcon} alt="" />
                    										</div>
                  									</div>
                								</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.exchangeWorkflow}>
            						<b className={styles.logo}>Solicitações de Troca em Aberto</b>
            						<div className={styles.exchangeItem}>
              							<div className={styles.frame12}>
                								<div className={styles.frame13}>
                  									<b className={styles.logo}>Pedido #NX-2900X</b>
                  									<div className={styles.frame14}>
                    										<b className={styles.logo}>TROCA SOLICITADA</b>
                  									</div>
                								</div>
                								<div className={styles.solicitadoPorErich}>Solicitado por Erich Auerbach em 02 Fev 2026. Motivo: Livro com dano na capa.</div>
              							</div>
              							<div className={styles.exchangeActions}>
                								<div className={styles.frame15}>
                  									<div className={styles.sessoAtiva}>Aceitar Troca</div>
                								</div>
                								<div className={styles.frame16}>
                  									<div className={styles.sessoAtiva}>Recusar Troca</div>
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.modalBackdrop}>
        				<div className={styles.modalContainer}>
          					<div className={styles.modalHeader}>
            						<div className={styles.frame17}>
              							<div className={styles.iconWrapper6}>
                								<img className={styles.badgeAlertIcon} alt="" />
              							</div>
            						</div>
            						<b className={styles.logo}>Confirmar alteração de status?</b>
              							</div>
              							<div className={styles.vocEstPrestesContainer}>
                								<span className={styles.vocEstPrestes}>{`Você está prestes a atualizar o status do Pedido `}</span>
                								<b className={styles.nx2981a2}>#NX-2981A</b>
                								<span className={styles.vocEstPrestes}>{` de `}</span>
                								<span className={styles.emAberto2}>EM ABERTO</span>
                								<span className={styles.vocEstPrestes}>{` para `}</span>
                								<span className={styles.emProcessamento2}>EM PROCESSAMENTO</span>
                								<span className={styles.vocEstPrestes}>. Esta ação enviará uma notificação ao e-mail cadastrado do cliente.</span>
              							</div>
              							<div className={styles.modalButtons}>
                								<div className={styles.frame18}>
                  									<div className={styles.sessoAtiva}>Cancelar</div>
                								</div>
                								<div className={styles.frame19}>
                  									<div className={styles.sessoAtiva}>Confirmar Transição</div>
                								</div>
              							</div>
              							</div>
              							</div>
              							</div>);
            						};
            						
            						export default AdminOrderManagement ;
            						