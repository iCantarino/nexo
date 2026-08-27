import type { FunctionComponent } from 'react';
import styles from './ExchangeRequest.module.css';


const ExchangeRequest: FunctionComponent = () => {
  	return (
    		<div className={styles.exchangeRequest}>
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
        				<b className={styles.solicitarTrocaDe}>Solicitar Troca de Item</b>
        				<div className={styles.stepperCard}>
          					<b className={styles.progressoDaTroca}>Progresso da Troca</b>
          					<div className={styles.frame}>
            						<div className={styles.frame2}>
              							<div className={styles.frame3}>
                								<b className={styles.logo}>1</b>
              							</div>
              							<div className={styles.solicitaoCriada}>Solicitação Criada</div>
            						</div>
            						<div className={styles.frame4}>
              							<div className={styles.frame5}>
                								<b className={styles.logo}>2</b>
              							</div>
              							<div className={styles.aprovadaPelaNexo}>Aprovada pela Nexo</div>
            						</div>
            						<div className={styles.frame4}>
              							<div className={styles.frame5}>
                								<b className={styles.logo}>3</b>
              							</div>
              							<div className={styles.aprovadaPelaNexo}>Aguardando Despacho</div>
            						</div>
            						<div className={styles.frame4}>
              							<div className={styles.frame5}>
                								<b className={styles.logo}>4</b>
              							</div>
              							<div className={styles.aprovadaPelaNexo}>Item Recebido</div>
            						</div>
            						<div className={styles.frame4}>
              							<div className={styles.frame5}>
                								<b className={styles.logo}>5</b>
              							</div>
              							<div className={styles.aprovadaPelaNexo}>Crédito/Troca Concluída</div>
            						</div>
          					</div>
        				</div>
        				<div className={styles.frame12}>
          					<div className={styles.frame13}>
            						<b className={styles.detalhesDaTroca}>Detalhes da Troca</b>
            						<div className={styles.frame14}>
              							<b className={styles.logo}>Motivo da Troca *</b>
              							<div className={styles.frame15}>
                								<div className={styles.logo}>Selecione um motivo válido...</div>
                								<img className={styles.frameIcon} alt="" />
              							</div>
            						</div>
            						<div className={styles.frame14}>
              							<b className={styles.logo}>Detalhes / Condições do Item</b>
              							<div className={styles.frame17}>
                								<div className={styles.searchPlaceholder}>Descreva o estado do livro (lombada danificada, versão impressa errada, dano na capa, etc.)</div>
              							</div>
            						</div>
            						<div className={styles.frame14}>
              							<b className={styles.logo}>Transportadora de Devolução Preferida</b>
              							<div className={styles.frame15}>
                								<div className={styles.logo}>DHL Express</div>
                								<img className={styles.frameIcon} alt="" />
              							</div>
            						</div>
            						<div className={styles.frame20}>
              							<div className={styles.frame21}>
                								<b className={styles.logo}>Enviar Solicitação</b>
              							</div>
              							<div className={styles.frame22}>
                								<div className={styles.informarDespachoDepois}>Informar Despacho Depois</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.frame23}>
            						<b className={styles.progressoDaTroca}>Item sendo Trocado</b>
            						<img className={styles.coverWrapperIcon} alt="" />
            						<div className={styles.frame24}>
              							<b className={styles.solicitarTrocaDe}>Design e Forma</b>
              							<div className={styles.johannesItten}>Johannes Itten</div>
              							<b className={styles.r11990}>R$ 119,90</b>
            						</div>
            						<div className={styles.line} />
            						<div className={styles.trocasSoAceitas}>Trocas são aceitas em até 30 dias após a entrega. O item deve ser devolvido em suas condições originais.</div>
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

export default ExchangeRequest ;
