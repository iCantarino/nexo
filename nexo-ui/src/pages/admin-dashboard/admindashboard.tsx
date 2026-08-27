import type { FunctionComponent } from 'react';
import styles from './AdminDashboard.module.css';


const AdminDashboard: FunctionComponent = () => {
  	return (
    		<div className={styles.adminDashboard}>
      			<div className={styles.sidebar}>
        				<div className={styles.brand}>
          					<b className={styles.nexo}>Nexo</b>
          					<div className={styles.brandDot} />
          					<div className={styles.adminTag}>
            						<b className={styles.nexo}>ADMIN</b>
          					</div>
        				</div>
        				<div className={styles.navList}>
          					<div className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.frameIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Dashboard</div>
          					</div>
          					<div className={styles.navItemClientes}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.frameIcon} alt="" />
            						</div>
            						<div className={styles.clientes}>Clientes</div>
          					</div>
          					<div className={styles.navItemClientes}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.frameIcon} alt="" />
            						</div>
            						<div className={styles.clientes}>Pedidos</div>
          					</div>
          					<div className={styles.navItemClientes}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.frameIcon} alt="" />
            						</div>
            						<div className={styles.clientes}>Trocas</div>
          					</div>
          					<div className={styles.navItemClientes}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.frameIcon} alt="" />
            						</div>
            						<div className={styles.clientes}>Análises</div>
          					</div>
        				</div>
        				<div className={styles.sidebarFooter}>
          					<div className={styles.line} />
          					<div className={styles.userProfile}>
            						<div className={styles.avatar}>
              							<b className={styles.nexo}>AS</b>
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
            						<b className={styles.nexo}>Painel de Controle</b>
            						<div className={styles.visoGeralDa}>Visão geral da operação Nexo em tempo real.</div>
          					</div>
          					<div className={styles.headerActions}>
            						<div className={styles.notificationBell}>
              							<div className={styles.iconWrapper6}>
                								<img className={styles.frameIcon6} alt="" />
              							</div>
            						</div>
            						<div className={styles.adminBadge}>
              							<div className={styles.liveIndicator} />
              							<div className={styles.dashboard}>Sessão Ativa</div>
            						</div>
          					</div>
        				</div>
        				<div className={styles.workspace}>
          					<div className={styles.kpiStrip}>
            						<div className={styles.kpiCard}>
              							<div className={styles.pedidosHoje}>Pedidos Hoje</div>
              							<b className={styles.b}>34</b>
              							<div className={styles.trend}>
                								<div className={styles.iconWrapper7}>
                  									<img className={styles.frameIcon7} alt="" />
                								</div>
                								<b className={styles.nexo}>+18.5%</b>
                								<div className={styles.vsOntem}>vs ontem</div>
              							</div>
            						</div>
            						<div className={styles.kpiCard}>
              							<div className={styles.pedidosHoje}>Receita do Dia</div>
              							<b className={styles.b}>R$ 4.280</b>
              							<div className={styles.trend}>
                								<div className={styles.iconWrapper7}>
                  									<img className={styles.frameIcon7} alt="" />
                								</div>
                								<b className={styles.nexo}>+24.1%</b>
                								<div className={styles.vsOntem}>vs ontem</div>
              							</div>
            						</div>
            						<div className={styles.kpiCard}>
              							<div className={styles.pedidosHoje}>Novos Clientes</div>
              							<b className={styles.b}>12</b>
              							<div className={styles.trend}>
                								<div className={styles.iconWrapper7}>
                  									<img className={styles.frameIcon7} alt="" />
                								</div>
                								<b className={styles.nexo}>+5.0%</b>
                								<div className={styles.vsOntem}>média diária</div>
              							</div>
            						</div>
            						<div className={styles.kpiCard}>
              							<div className={styles.pedidosHoje}>Itens em Trânsito</div>
              							<b className={styles.b}>87</b>
              							<div className={styles.trend4}>
                								<div className={styles.dashboard}>Envio prioritário</div>
              							</div>
            						</div>
            						<div className={styles.kpiCard}>
              							<div className={styles.pedidosHoje}>Trocas Pendentes</div>
              							<b className={styles.b}>5</b>
              							<div className={styles.trend5}>
                								<div className={styles.iconWrapper7}>
                  									<img className={styles.frameIcon7} alt="" />
                								</div>
                								<b className={styles.nexo}>Ação req.</b>
              							</div>
            						</div>
          					</div>
          					<div className={styles.dashboardSplit}>
            						<div className={styles.mainPanel}>
              							<b className={styles.nexo}>Últimos Pedidos</b>
              							<div className={styles.tableContainer}>
                								<div className={styles.tableHeader}>
                  									<b className={styles.pedido}>PEDIDO</b>
                  									<b className={styles.cliente}>CLIENTE</b>
                  									<b className={styles.pedido}>DATA</b>
                  									<b className={styles.valor}>VALOR</b>
                  									<b className={styles.nexo}>STATUS</b>
                								</div>
                								<div className={styles.tableBody}>
                  									<div className={styles.row0}>
                    										<b className={styles.pedido}>NX-3012</b>
                    										<div className={styles.felipeSantos}>Felipe Santos</div>
                    										<div className={styles.hoje1432}>Hoje, 14:32</div>
                    										<b className={styles.valor}>R$ 124,90</b>
                    										<div className={styles.frame}>
                      											<div className={styles.badgeStatus}>
                        												<b className={styles.emAberto}>Em aberto</b>
                      											</div>
                    										</div>
                  									</div>
                  									<div className={styles.row0}>
                    										<b className={styles.pedido}>NX-3011</b>
                    										<div className={styles.felipeSantos}>Mariana L. Lima</div>
                    										<div className={styles.hoje1432}>Hoje, 11:15</div>
                    										<b className={styles.valor}>R$ 42,40</b>
                    										<div className={styles.frame2}>
                      											<div className={styles.badgeStatus2}>
                        												<b className={styles.emAberto}>Em trânsito</b>
                      											</div>
                    										</div>
                  									</div>
                  									<div className={styles.row0}>
                    										<b className={styles.pedido}>NX-3010</b>
                    										<div className={styles.felipeSantos}>Erich Auerbach</div>
                    										<div className={styles.hoje1432}>Ontem, 18:20</div>
                    										<b className={styles.valor}>R$ 89,90</b>
                    										<div className={styles.frame3}>
                      											<div className={styles.badgeStatus3}>
                        												<b className={styles.emAberto}>Entregue</b>
                      											</div>
                    										</div>
                  									</div>
                  									<div className={styles.row0}>
                    										<b className={styles.pedido}>NX-3009</b>
                    										<div className={styles.felipeSantos}>Douglas Hofstadter</div>
                    										<div className={styles.hoje1432}>Ontem, 09:45</div>
                    										<b className={styles.valor}>R$ 153,00</b>
                    										<div className={styles.frame4}>
                      											<div className={styles.badgeStatus4}>
                        												<b className={styles.emAberto}>Em Processamento</b>
                      											</div>
                    										</div>
                  									</div>
                  									<div className={styles.row0}>
                    										<b className={styles.pedido}>NX-3008</b>
                    										<div className={styles.felipeSantos}>Oscar Wilde</div>
                    										<div className={styles.hoje1432}>12 Fev, 15:10</div>
                    										<b className={styles.valor}>R$ 29,99</b>
                    										<div className={styles.frame3}>
                      											<div className={styles.badgeStatus3}>
                        												<b className={styles.emAberto}>Entregue</b>
                      											</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.sidePanel}>
              							<div className={styles.activityPanel}>
                								<b className={styles.nexo}>Atividade Recente</b>
                								<div className={styles.timeline}>
                  									<div className={styles.activityItem0}>
                    										<div className={styles.frame6}>
                      											<div className={styles.ellipse} />
                      											<div className={styles.line} />
                    										</div>
                    										<div className={styles.frame7}>
                      											<div className={styles.pedidoNx3012Avanou}>Pedido #NX-3012 avançou para EM PROCESSAMENTO</div>
                      											<div className={styles.h5Minutos}>Há 5 minutos</div>
                    										</div>
                  									</div>
                  									<div className={styles.activityItem0}>
                    										<div className={styles.frame6}>
                      											<div className={styles.ellipse} />
                      											<div className={styles.line} />
                    										</div>
                    										<div className={styles.frame7}>
                      											<div className={styles.pedidoNx3012Avanou}>Troca #EX-112 aceita para cliente Mariana L.</div>
                      											<div className={styles.h5Minutos}>Há 2 horas</div>
                    										</div>
                  									</div>
                  									<div className={styles.activityItem0}>
                    										<div className={styles.frame6}>
                      											<div className={styles.ellipse} />
                      											<div className={styles.line} />
                    										</div>
                    										<div className={styles.frame7}>
                      											<div className={styles.pedidoNx3012Avanou}>Novo cliente cadastrado: Felipe Santos</div>
                      											<div className={styles.h5Minutos}>Há 3 horas</div>
                    										</div>
                  									</div>
                  									<div className={styles.activityItem0}>
                    										<div className={styles.frame6}>
                      											<div className={styles.ellipse} />
                    										</div>
                    										<div className={styles.frame7}>
                      											<div className={styles.pedidoNx3012Avanou}>Pedido #NX-2998 entregue com sucesso</div>
                      											<div className={styles.h5Minutos}>Há 1 dia</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.alertsPanel}>
                								<b className={styles.alertasCrticos}>Alertas Críticos</b>
                								<div className={styles.alertCard1}>
                  									<div className={styles.iconWrapper}>
                    										<img className={styles.frameIcon} alt="" />
                  									</div>
                  									<div className={styles.pedidosAguardandoProcessamen}>3 pedidos aguardando processamento há mais de 24h</div>
                								</div>
                								<div className={styles.alertCard2}>
                  									<div className={styles.iconWrapper}>
                    										<img className={styles.frameIcon} alt="" />
                  									</div>
                  									<div className={styles.pedidosAguardandoProcessamen}>2 trocas pendentes de aprovação urgente</div>
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
      			</div>
    		</div>);
};

export default AdminDashboard ;
