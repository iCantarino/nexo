import type { FunctionComponent } from 'react';
import styles from './AdminCustomersOrders.module.css';


const AdminCustomersOrders: FunctionComponent = () => {
  	return (
    		<div className={styles.adminCustomersOrders}>
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
          					<div className={styles.navItemClientes}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.clientes}>Clientes</div>
          					</div>
          					<div className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Pedidos</div>
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
            						<b className={styles.logo}>{`Clientes & Histórico de Pedidos`}</b>
            						<div className={styles.gestoDePerfis}>Gestão de perfis e consulta de transações da plataforma.</div>
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
          					<div className={styles.customersListPanel}>
            						<div className={styles.panelHeader}>
              							<b className={styles.logo}>Diretório de Clientes</b>
              							<div className={styles.searchBar}>
                								<div className={styles.iconWrapper7}>
                  									<img className={styles.searchIcon} alt="" />
                								</div>
                								<div className={styles.buscarPorNome}>Buscar por nome, e-mail, CPF...</div>
              							</div>
            						</div>
            						<div className={styles.tableContainer}>
              							<div className={styles.tableHeader}>
                								<b className={styles.nome}>NOME</b>
                								<b className={styles.nome}>E-MAIL</b>
                								<b className={styles.cpf}>CPF</b>
                								<b className={styles.status}>STATUS</b>
                								<b className={styles.pedidos2}>PEDIDOS</b>
                								<b className={styles.ltimaCompra}>ÚLTIMA COMPRA</b>
              							</div>
              							<div className={styles.tableBody}>
                								<div className={styles.row0}>
                  									<div className={styles.marianaLLima}>Mariana L. Lima</div>
                  									<div className={styles.marianalimacuriouscom}>mariana.lima@curious.com</div>
                  									<div className={styles.cpf}>123.456.789-00</div>
                  									<div className={styles.badgeStatus}>
                    										<div className={styles.frame}>
                      											<b className={styles.logo}>Ativo</b>
                    										</div>
                  									</div>
                  									<div className={styles.div2}>14</div>
                  									<div className={styles.ltimaCompra}>12 Fev 2026</div>
                								</div>
                								<div className={styles.row1}>
                  									<div className={styles.marianaLLima}>Julian Krause</div>
                  									<div className={styles.marianalimacuriouscom}>julian.k@thermodynamics.org</div>
                  									<div className={styles.cpf}>987.654.321-11</div>
                  									<div className={styles.badgeStatus}>
                    										<div className={styles.frame}>
                      											<b className={styles.logo}>Ativo</b>
                    										</div>
                  									</div>
                  									<div className={styles.div2}>8</div>
                  									<div className={styles.ltimaCompra}>28 Jan 2026</div>
                								</div>
                								<div className={styles.row1}>
                  									<div className={styles.marianaLLima}>Erich Auerbach</div>
                  									<div className={styles.marianalimacuriouscom}>auerbach.mimesis@classic.edu</div>
                  									<div className={styles.cpf}>456.789.123-22</div>
                  									<div className={styles.badgeStatus3}>
                    										<div className={styles.frame3}>
                      											<b className={styles.logo}>Inativo</b>
                    										</div>
                  									</div>
                  									<div className={styles.div2}>23</div>
                  									<div className={styles.ltimaCompra}>15 Dez 2025</div>
                								</div>
                								<div className={styles.row1}>
                  									<div className={styles.marianaLLima}>Oscar Wilde</div>
                  									<div className={styles.marianalimacuriouscom}>dorian@aestheticism.com</div>
                  									<div className={styles.cpf}>321.654.987-99</div>
                  									<div className={styles.badgeStatus}>
                    										<div className={styles.frame}>
                      											<b className={styles.logo}>Ativo</b>
                    										</div>
                  									</div>
                  									<div className={styles.div2}>5</div>
                  									<div className={styles.ltimaCompra}>10 Jan 2026</div>
                								</div>
                								<div className={styles.row1}>
                  									<div className={styles.marianaLLima}>Douglas Hofstadter</div>
                  									<div className={styles.marianalimacuriouscom}>geb@braintree.net</div>
                  									<div className={styles.cpf}>789.123.456-55</div>
                  									<div className={styles.badgeStatus}>
                    										<div className={styles.frame}>
                      											<b className={styles.logo}>Ativo</b>
                    										</div>
                  									</div>
                  									<div className={styles.div2}>19</div>
                  									<div className={styles.ltimaCompra}>05 Fev 2026</div>
                								</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.orderHistoryPanel}>
            						<div className={styles.selectedCustomerHeader}>
              							<b className={styles.clienteSelecionado}>CLIENTE SELECIONADO</b>
              							<b className={styles.marianaLLima2}>Mariana L. Lima</b>
              							<div className={styles.marianalimacuriouscom2}>mariana.lima@curious.com</div>
            						</div>
            						<div className={styles.line} />
            						<div className={styles.ordersSubHeader}>
              							<b className={styles.logo}>Histórico de Compras</b>
              							<div className={styles.registros}>3 registros</div>
            						</div>
            						<div className={styles.ordersMiniList}>
              							<div className={styles.miniOrder0}>
                								<div className={styles.panelHeader}>
                  									<b className={styles.logo}>NX-2981A</b>
                  									<div className={styles.frame6}>
                    										<b className={styles.logo}>Em Trânsito</b>
                  									</div>
                								</div>
                								<div className={styles.aOrdemDo}>A Ordem do Tempo + 1 outro</div>
                								<div className={styles.orderBottom}>
                  									<div className={styles.logo}>12 Fev 2026</div>
                  									<b className={styles.r4240}>R$ 42,40</b>
                								</div>
              							</div>
              							<div className={styles.miniOrder0}>
                								<div className={styles.panelHeader}>
                  									<b className={styles.logo}>NX-1928B</b>
                  									<div className={styles.frame7}>
                    										<b className={styles.logo}>Entregue</b>
                  									</div>
                								</div>
                								<div className={styles.aOrdemDo}>Mimesis (Edição Rara)</div>
                								<div className={styles.orderBottom}>
                  									<div className={styles.logo}>29 Set 2025</div>
                  									<b className={styles.r4240}>R$ 53,99</b>
                								</div>
              							</div>
              							<div className={styles.miniOrder0}>
                								<div className={styles.panelHeader}>
                  									<b className={styles.logo}>NX-1042C</b>
                  									<div className={styles.frame7}>
                    										<b className={styles.logo}>Entregue</b>
                  									</div>
                								</div>
                								<div className={styles.aOrdemDo}>Além do Bem e do Mal</div>
                								<div className={styles.orderBottom}>
                  									<div className={styles.logo}>15 Mai 2025</div>
                  									<b className={styles.r4240}>R$ 29,99</b>
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
      			</div>
    		</div>);
};

export default AdminCustomersOrders ;
