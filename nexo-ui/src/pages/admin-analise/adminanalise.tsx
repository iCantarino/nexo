import { useState, useRef, useEffect, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminAnalytics.module.css';


const AdminAnalytics: FunctionComponent = () => {
  const { user, logout } = useAuth();
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuPerfilAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    		<div className={styles.adminAnalytics}>
      			<div className={styles.sidebar}>
        				<div className={styles.brand}>
          					<b className={styles.logo}>Nexo</b>
          					<div className={styles.brandDot} />
          					<div className={styles.adminTag}>
            						<b className={styles.logo}>ADMIN</b>
          					</div>
        				</div>
        				<div className={styles.navList}>
          					<Link to="/admin-dashboard" className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img src="/images/icons/layout-grid.svg" className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Dashboard</div>
          					</Link>
          					<Link to="/admin-usuarios" className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img src="/images/icons/users.svg" className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Clientes</div>
          					</Link>
          					<Link to="/admin-pedidos" className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img src="/images/icons/shopping-bag.svg" className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Pedidos</div>
          					</Link>
          					<Link to="/admin-trocas" className={styles.navItemDashboard}>
            						<div className={styles.iconWrapper}>
              							<img src="/images/icons/arrow-right-left.svg" className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.dashboard}>Trocas</div>
          					</Link>
          					<Link to="/admin-analise" className={styles.navItemAnalises}>
            						<div className={styles.iconWrapper}>
              							<img src="/images/icons/chart-line.svg" className={styles.layoutGridIcon} alt="" />
            						</div>
            						<div className={styles.anlises}>Análises</div>
          					</Link>
        				</div>
        				<div className={styles.sidebarFooter}>
          					<div className={styles.line} />
          					<div className={styles.userProfile} onClick={() => setMenuPerfilAberto(!menuPerfilAberto)} style={{ cursor: 'pointer', position: 'relative' }} ref={menuRef}>
            						<div className={styles.avatar}>
              							<b className={styles.logo}>{(user as any)?.nome?.charAt(0)?.toUpperCase() || 'A'}</b>
            						</div>
            						<div className={styles.userInfo}>
              							<div className={styles.arthurSchopenhauer}>{(user as any)?.nome || 'Administrador'}</div>
              							<div className={styles.curadorMaster}>{(user as any)?.perfil || 'ADMIN'}</div>
            						</div>
            						{menuPerfilAberto && (
              							<div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', zIndex: 50, boxShadow: '0 -4px 6px rgba(0,0,0,0.1)' }}>
                							<div onClick={logout} style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', color: '#ef4444', fontWeight: 500 }}>
                  								Sair
                							</div>
              							</div>
            						)}
          					</div>
        				</div>
      			</div>
      			<div className={styles.contentArea}>
        				<div className={styles.headerRow}>
          					<div className={styles.headerTitles}>
            						<b className={styles.logo}>{`Métricas & Desempenho`}</b>
            						<div className={styles.anliseEmTempo}>Análise em tempo real de vendas, acervo e retenção de usuários.</div>
          					</div>
          					<div className={styles.datePicker}>
            						<div className={styles.iconWrapper6}>
              							<img className={styles.calendarIcon} alt="" />
            						</div>
            						<div className={styles.div}>01/01/2026 - 31/01/2026</div>
            						<div className={styles.iconWrapper7}>
              							<img className={styles.chevronDownIcon} alt="" />
            						</div>
          					</div>
        				</div>
        				<div className={styles.workspace}>
          					<div className={styles.kpiStrip}>
            						<div className={styles.kpiCard0}>
              							<div className={styles.totalDePedidos}>Total de Pedidos</div>
              							<b className={styles.b}>1.842</b>
              							<div className={styles.kpiTrend}>
                								<div className={styles.iconWrapper6}>
                  									<img className={styles.calendarIcon} alt="" />
                								</div>
                								<b className={styles.logo}>+12.4%</b>
                								<div className={styles.vsMsAnt}>vs mês ant.</div>
              							</div>
            						</div>
            						<div className={styles.kpiCard0}>
              							<div className={styles.faturamentoLquido}>Faturamento Líquido</div>
              							<b className={styles.r142850}>R$ 142.850</b>
              							<div className={styles.kpiTrend2}>
                								<div className={styles.iconWrapper6}>
                  									<img className={styles.calendarIcon} alt="" />
                								</div>
                								<b className={styles.logo}>+8.2%</b>
                								<div className={styles.vsMsAnt}>vs mês ant.</div>
              							</div>
            						</div>
            						<div className={styles.kpiCard0}>
              							<div className={styles.totalDePedidos}>Clientes Ativos</div>
              							<b className={styles.b}>8.420</b>
              							<div className={styles.kpiTrend}>
                								<div className={styles.iconWrapper6}>
                  									<img className={styles.calendarIcon} alt="" />
                								</div>
                								<b className={styles.logo}>+14.1%</b>
                								<div className={styles.vsMsAnt}>vs mês ant.</div>
              							</div>
            						</div>
            						<div className={styles.kpiCard0}>
              							<div className={styles.totalDePedidos}>Ticket Médio</div>
              							<b className={styles.b}>R$ 77,55</b>
              							<div className={styles.kpiTrend4}>
                								<div className={styles.iconWrapper6}>
                  									<img className={styles.calendarIcon} alt="" />
                								</div>
                								<b className={styles.logo}>-2.1%</b>
                								<div className={styles.vsMsAnt}>vs mês ant.</div>
              							</div>
            						</div>
            						<div className={styles.kpiCard0}>
              							<div className={styles.totalDePedidos}>Taxa de Devolução</div>
              							<b className={styles.b}>2.4%</b>
              							<div className={styles.kpiTrend}>
                								<div className={styles.iconWrapper6}>
                  									<img className={styles.calendarIcon} alt="" />
                								</div>
                								<b className={styles.logo}>-0.5%</b>
                								<div className={styles.vsMsAnt}>vs mês ant.</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.chartsRow1}>
            						<div className={styles.lineChartPanel}>
              							<div className={styles.chartHeader}>
                								<b className={styles.logo}>Pedidos Realizados</b>
                								<div className={styles.chartToggles}>
                  									<div className={styles.frame}>
                    										<div className={styles.div}>Diário</div>
                  									</div>
                  									<div className={styles.frame2}>
                    										<div className={styles.logo}>Semanal</div>
                  									</div>
                  									<div className={styles.frame2}>
                    										<div className={styles.logo}>Mensal</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.graphPlot}>
                								<div className={styles.line2} />
                								<div className={styles.line3} />
                								<div className={styles.line4} />
                								<img className={styles.lineIcon} alt="" />
                								<img className={styles.lineIcon2} alt="" />
                								<img className={styles.lineIcon3} alt="" />
                								<img className={styles.lineIcon4} alt="" />
                								<img className={styles.lineIcon5} alt="" />
                								<div className={styles.ellipse} />
                								<div className={styles.ellipse2} />
                								<div className={styles.ellipse3} />
                								<div className={styles.ellipse4} />
                								<div className={styles.ellipse5} />
                								<div className={styles.xAxisLabels}>
                  									<div className={styles.logo}>Semana 1</div>
                  									<div className={styles.logo}>Semana 2</div>
                  									<div className={styles.logo}>Semana 3</div>
                  									<div className={styles.logo}>Semana 4</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.categoriesPanel}>
              							<b className={styles.logo}>Categorias Populares</b>
              							<div className={styles.categoriesBars}>
                								<div className={styles.catBar0}>
                  									<div className={styles.frame4}>
                    										<div className={styles.div}>Filosofia</div>
                    										<div className={styles.vsMsAnt}>850 exemplares (45%)</div>
                  									</div>
                  									<div className={styles.frame5}>
                    										<div className={styles.rectangle} />
                  									</div>
                								</div>
                								<div className={styles.catBar0}>
                  									<div className={styles.frame4}>
                    										<div className={styles.div}>{`Ciência & Tech`}</div>
                    										<div className={styles.vsMsAnt}>540 exemplares (28%)</div>
                  									</div>
                  									<div className={styles.frame5}>
                    										<div className={styles.rectangle2} />
                  									</div>
                								</div>
                								<div className={styles.catBar0}>
                  									<div className={styles.frame4}>
                    										<div className={styles.div}>Clássicos Lit.</div>
                    										<div className={styles.vsMsAnt}>320 exemplares (17%)</div>
                  									</div>
                  									<div className={styles.frame5}>
                    										<div className={styles.rectangle3} />
                  									</div>
                								</div>
                								<div className={styles.catBar0}>
                  									<div className={styles.frame4}>
                    										<div className={styles.div}>{`Arte & Arq.`}</div>
                    										<div className={styles.vsMsAnt}>180 exemplares (10%)</div>
                  									</div>
                  									<div className={styles.frame5}>
                    										<div className={styles.rectangle4} />
                  									</div>
                								</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.chartsRow1}>
            						<div className={styles.categoriesPanel}>
              							<b className={styles.logo}>Distribuição de Status</b>
              							<div className={styles.donutRow}>
                								<div className={styles.donutChartSymbol}>
                  									<div className={styles.ellipse6} />
                  									<div className={styles.ellipse7} />
                  									<div className={styles.ellipse8} />
                  									<div className={styles.ellipse9} />
                  									<div className={styles.ellipse10} />
                								</div>
                								<div className={styles.donutLegend}>
                  									<div className={styles.frame12}>
                    										<div className={styles.rectangle5} />
                    										<div className={styles.logo}>Entregues:</div>
                    										<b className={styles.b9}>65%</b>
                  									</div>
                  									<div className={styles.frame12}>
                    										<div className={styles.rectangle6} />
                    										<div className={styles.logo}>Processando:</div>
                    										<b className={styles.b9}>20%</b>
                  									</div>
                  									<div className={styles.frame12}>
                    										<div className={styles.rectangle7} />
                    										<div className={styles.logo}>Em Trânsito:</div>
                    										<b className={styles.b9}>12%</b>
                  									</div>
                  									<div className={styles.frame12}>
                    										<div className={styles.rectangle8} />
                    										<div className={styles.logo}>Cancelados:</div>
                    										<b className={styles.b9}>3%</b>
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.lineChartPanel}>
              							<b className={styles.logo}>Exemplares Mais Vendidos</b>
              							<div className={styles.booksList}>
                								<div className={styles.frame16}>
                  									<div className={styles.frame17}>
                    										<div className={styles.frame18}>
                      											<b className={styles.logo}>1</b>
                    										</div>
                    										<div className={styles.frame19}>
                      											<div className={styles.div}>A Ordem do Tempo</div>
                      											<div className={styles.porCarloRovelli}>por Carlo Rovelli</div>
                    										</div>
                  									</div>
                  									<b className={styles.vendas}>242 vendas</b>
                								</div>
                								<div className={styles.frame16}>
                  									<div className={styles.frame17}>
                    										<div className={styles.frame18}>
                      											<b className={styles.logo}>2</b>
                    										</div>
                    										<div className={styles.frame19}>
                      											<div className={styles.div}>Além do Bem e do Mal</div>
                      											<div className={styles.porCarloRovelli}>por Friedrich Nietzsche</div>
                    										</div>
                  									</div>
                  									<b className={styles.vendas}>189 vendas</b>
                								</div>
                								<div className={styles.frame16}>
                  									<div className={styles.frame17}>
                    										<div className={styles.frame18}>
                      											<b className={styles.logo}>3</b>
                    										</div>
                    										<div className={styles.frame19}>
                      											<div className={styles.div}>Mimesis</div>
                      											<div className={styles.porCarloRovelli}>por Erich Auerbach</div>
                    										</div>
                  									</div>
                  									<b className={styles.vendas}>154 vendas</b>
                								</div>
                								<div className={styles.frame16}>
                  									<div className={styles.frame17}>
                    										<div className={styles.frame18}>
                      											<b className={styles.logo}>4</b>
                    										</div>
                    										<div className={styles.frame19}>
                      											<div className={styles.div}>Design e Forma</div>
                      											<div className={styles.porCarloRovelli}>por Johannes Itten</div>
                    										</div>
                  									</div>
                  									<b className={styles.vendas}>120 vendas</b>
                								</div>
                								<div className={styles.frame16}>
                  									<div className={styles.frame17}>
                    										<div className={styles.frame18}>
                      											<b className={styles.logo}>5</b>
                    										</div>
                    										<div className={styles.frame19}>
                      											<div className={styles.div}>A República</div>
                      											<div className={styles.porCarloRovelli}>por Platão</div>
                    										</div>
                  									</div>
                  									<b className={styles.vendas}>98 vendas</b>
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
      			</div>
    		</div>);
};

export default AdminAnalytics ;
