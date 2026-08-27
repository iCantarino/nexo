import type { FunctionComponent } from 'react';
import styles from './AdminTrocas.module.css';


const AdminTrocas: FunctionComponent = () => {
  	return (
    		<div className={styles.adminTrocas}>
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
          					<div className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.frameIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Clientes</div>
          					</div>
          					<div className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.frameIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Pedidos</div>
          					</div>
          					<div className={styles.navItemTrocas}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.frameIcon} alt="" />
            						</div>
            						<div className={styles.trocas}>Trocas</div>
          					</div>
          					<div className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img className={styles.frameIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Análises</div>
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
            						<b className={styles.nexo}>Gestão de Trocas</b>
            						<div className={styles.acompanhamentoEAprovao}>Acompanhamento e aprovação de solicitações de troca de clientes.</div>
          					</div>
          					<div className={styles.headerActions}>
            						<div className={styles.notificationBell}>
              							<div className={styles.iconWrapper6}>
                								<img className={styles.frameIcon6} alt="" />
              							</div>
            						</div>
            						<div className={styles.adminBadge}>
              							<div className={styles.liveIndicator} />
              							<div className={styles.trocas}>Sessão Ativa</div>
            						</div>
          					</div>
        				</div>
        				<div className={styles.workspace}>
          					<div className={styles.filtersRow}>
            						<div className={styles.frame}>
              							<div className={styles.trocas}>Todas (14)</div>
            						</div>
            						<div className={styles.frame2}>
              							<div className={styles.trocas}>Troca Solicitada</div>
            						</div>
            						<div className={styles.frame2}>
              							<div className={styles.trocas}>Troca Aceita</div>
            						</div>
            						<div className={styles.frame2}>
              							<div className={styles.trocas}>Troca Negada</div>
            						</div>
            						<div className={styles.frame2}>
              							<div className={styles.trocas}>Item Enviado</div>
            						</div>
            						<div className={styles.frame2}>
              							<div className={styles.trocas}>Item Recebido</div>
            						</div>
            						<div className={styles.frame2}>
              							<div className={styles.trocas}>Troca Processada</div>
            						</div>
          					</div>
          					<div className={styles.trocasSplit}>
            						<div className={styles.mainPanel}>
              							<b className={styles.nexo}>Fila de Solicitações</b>
              							<div className={styles.tableContainer}>
                								<div className={styles.tableHeader}>
                  									<b className={styles.idTroca}>ID TROCA</b>
                  									<b className={styles.pedidoOrig}>PEDIDO ORIG.</b>
                  									<b className={styles.cliente}>CLIENTE</b>
                  									<b className={styles.cliente}>STATUS</b>
                  									<b className={styles.aes}>AÇÕES</b>
                								</div>
                								<div className={styles.tableBody}>
                  									<div className={styles.row0}>
                    										<b className={styles.idTroca}>EX-112</b>
                    										<div className={styles.nx2981a}>NX-2981A</div>
                    										<div className={styles.marianaLLima}>Mariana L. Lima</div>
                    										<div className={styles.frame8}>
                      											<div className={styles.badgeStatus}>
                        												<b className={styles.detalhesDaSolicitao}>Troca Solicitada</b>
                      											</div>
                    										</div>
                    										<div className={styles.frame9}>
                      											<div className={styles.frame10}>
                        												<div className={styles.frame11}>
                          													<div className={styles.trocas}>Aceitar Troca</div>
                        												</div>
                        												<div className={styles.frame12}>
                          													<div className={styles.trocas}>Recusar</div>
                        												</div>
                      											</div>
                    										</div>
                  									</div>
                  									<div className={styles.row0}>
                    										<b className={styles.idTroca}>EX-111</b>
                    										<div className={styles.nx2981a}>NX-2950D</div>
                    										<div className={styles.marianaLLima}>Arthur S. Ribeiro</div>
                    										<div className={styles.frame13}>
                      											<div className={styles.badgeStatus2}>
                        												<b className={styles.detalhesDaSolicitao}>Troca Aceita</b>
                      											</div>
                    										</div>
                    										<div className={styles.frame14}>
                      											<div className={styles.aguardandoEnvioDo}>Aguardando Envio do Cliente</div>
                    										</div>
                  									</div>
                  									<div className={styles.row0}>
                    										<b className={styles.idTroca}>EX-110</b>
                    										<div className={styles.nx2981a}>NX-2940F</div>
                    										<div className={styles.marianaLLima}>Juliana K. Schmidt</div>
                    										<div className={styles.frame15}>
                      											<div className={styles.badgeStatus3}>
                        												<b className={styles.detalhesDaSolicitao}>Item Enviado</b>
                      											</div>
                    										</div>
                    										<div className={styles.frame16}>
                      											<div className={styles.frame17}>
                        												<div className={styles.trocas}>Confirmar Recebimento</div>
                      											</div>
                    										</div>
                  									</div>
                  									<div className={styles.row0}>
                    										<b className={styles.idTroca}>EX-109</b>
                    										<div className={styles.nx2981a}>NX-2920K</div>
                    										<div className={styles.marianaLLima}>Erich Auerbach</div>
                    										<div className={styles.frame18}>
                      											<div className={styles.badgeStatus4}>
                        												<b className={styles.detalhesDaSolicitao}>Item Recebido</b>
                      											</div>
                    										</div>
                    										<div className={styles.frame16}>
                      											<div className={styles.frame20}>
                        												<div className={styles.trocas}>Processar Troca (Gerar Cupom)</div>
                      											</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.sidePanel}>
              							<div className={styles.detailHeader}>
                								<b className={styles.detalhesDaSolicitao}>DETALHES DA SOLICITAÇÃO SELECIONADA</b>
                								<b className={styles.trocaEx112}>Troca #EX-112</b>
                								<div className={styles.clienteMarianaL}>Cliente: Mariana L. Lima</div>
              							</div>
              							<div className={styles.line} />
              							<div className={styles.bookDetailStrip}>
                								<img className={styles.bookCoverIcon} alt="" />
                								<div className={styles.frame21}>
                  									<b className={styles.aOrdemDo}>A Ordem do Tempo</b>
                  									<div className={styles.autorCarloRovelli}>Autor: Carlo Rovelli</div>
                  									<div className={styles.valorOriginalR}>Valor Original: R$ 42,40</div>
                								</div>
              							</div>
              							<div className={styles.line} />
              							<div className={styles.frame22}>
                								<b className={styles.detalhesDaSolicitao}>Motivo Real da Solicitação</b>
                								<div className={styles.oLivroChegou}>"O livro chegou com a capa bastante danificada e amassada na ponta superior direita devido ao transporte."</div>
              							</div>
              							<div className={styles.frame23}>
                								<b className={styles.detalhesDaSolicitao}>Código de Rastreio (Reverso)</b>
                								<div className={styles.frame24}>
                  									<b className={styles.nexo}>BR87625129990X</b>
                								</div>
              							</div>
              							<div className={styles.frame22}>
                								<b className={styles.detalhesDaSolicitao}>Histórico do Fluxo</b>
                								<div className={styles.frame26}>
                  									<div className={styles.frame27}>
                    										<div className={styles.ellipse} />
                    										<div className={styles.frame28}>
                      											<div className={styles.trocas}>Solicitação Criada</div>
                      											<div className={styles.fev2026Por}>12 Fev 2026 por Cliente</div>
                    										</div>
                  									</div>
                  									<div className={styles.frame27}>
                    										<div className={styles.ellipse} />
                    										<div className={styles.frame28}>
                      											<div className={styles.trocas}>Aguardando Análise</div>
                      											<div className={styles.fev2026Por}>Pendente de Curador Master</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
      			</div>
    		</div>);
};

export default AdminTrocas ;
