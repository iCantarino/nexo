import { useState, useEffect, useRef, type FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { clientesApi, enderecosApi, cartoesApi } from '../../services/api';
import styles from './Profile.module.css';

const Profile: FunctionComponent = () => {
  const { user, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const [senhaMenuAberto, setSenhaMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [enderecos, setEnderecos] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEnd, setModalEnd] = useState(false);
  const [modalCart, setModalCart] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState({nome:'',email:'',telefone_ddd:'',telefone_numero:''});
  const [pwForm, setPwForm] = useState({atual:'',nova:'',confirmar:''});

  useEffect(() => {
    function h(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) { setMenuAberto(false); setSenhaMenuAberto(false); } }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [cr, er, cr2] = await Promise.all([clientesApi.meuPerfil(), enderecosApi.listar(), cartoesApi.listar()]);
      setCliente(cr.data); setEnderecos(er.data); setCartoes(cr2.data);
      setEditForm({nome:cr.data.nome||'',email:cr.data.email||'',telefone_ddd:cr.data.telefone_ddd||'',telefone_numero:cr.data.telefone_numero||''});
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fmtTel = (d: string, n: string) => !d||!n?'-':'('+d+') '+n.slice(0,4)+'-'+n.slice(4);
  const fmtCpf = (c: string) => !c?'-':c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'..-');
  const maskCard = (n: string) => !n?'-':'Final '+n.slice(-4);

  const salvarPerfil = async () => {
    setSaving(true);
    try { await clientesApi.atualizarMe({nome:editForm.nome,email:editForm.email,telefone_ddd:editForm.telefone_ddd,telefone_numero:editForm.telefone_numero}); setEditando(false); loadData(); }
    catch(x:any) { alert(x.response?.data?.message||'Erro ao salvar'); } finally { setSaving(false); }
  };

  const alterarSenha = async () => {
    if(pwForm.nova!==pwForm.confirmar) { alert('Nova senha e confirmacao nao conferem'); return; }
    setSaving(true);
    try { await clientesApi.alterarSenha({senha_atual:pwForm.atual,nova_senha:pwForm.nova}); setPwForm({atual:'',nova:'',confirmar:''}); setSenhaMenuAberto(false); alert('Senha alterada com sucesso!'); }
    catch(x:any) { alert(x.response?.data?.message||'Erro ao alterar senha'); } finally { setSaving(false); }
  };

  const deactivate = async () => {
    if(!cliente) return;
    if(!confirm('DESATIVAR CONTA permanentemente?')) return;
    try { await clientesApi.inativar(cliente.id_cliente); logout(); }
    catch(x) { alert('Erro ao desativar conta'); }
  };


  if(loading) return <div className={styles.profile}><div className={styles.profileBody}><div className={styles.profileLeft}><div className={styles.frame}><b className={styles.logo}>Carregando...</b></div></div></div></div>;

  return (
    <div className={styles.profile}>
      <div className={styles.navbar}>
        <div className={styles.brand}>
          <b className={styles.logo}>Nexo</b>
          <div className={styles.brandDot} />
        </div>
        <div className={styles.navLinks}>
          <div className={styles.navItemCatalog}><div className={styles.catlogo}>catalogo</div><div className={styles.activeLine} /></div>
          <div className={styles.navItemPhilosophy}><div className={styles.filosofia}>filosofia</div></div>
          <div className={styles.navItemPhilosophy}><div className={styles.filosofia}>ciencia</div></div>
          <div className={styles.navItemPhilosophy}><div className={styles.filosofia}>arte</div></div>
          <div className={styles.navItemPhilosophy}><div className={styles.filosofia}>historia</div></div>
        </div>
        <div className={styles.navActions}>
          <div className={styles.searchBar}>
            <img className={styles.searchIcon} alt='' />
            <input className={styles.searchInput} type='text' placeholder='Buscar titulos, autores, editoras...' />
          </div>
          <div className={styles.userMenu} onClick={()=>setMenuAberto(!menuAberto)} style={{cursor:'pointer',position:'relative'}} ref={menuRef}>
            <img className={styles.userRoundIcon} alt='' />
            <div className={styles.userName}>{(user as any)?.nome||'Usuario'}</div>
            {menuAberto&&(
              <div style={{position:'absolute',top:'calc(100% + 10px)',right:0,minWidth:'120px',padding:'8px 0',border:'1px solid #e2e8f0',borderRadius:'6px',background:'#fff',boxShadow:'0 8px 20px rgba(15,23,42,0.12)',zIndex:10}}>
                <Link to='/perfil' onClick={e=>e.stopPropagation()} style={{display:'block',padding:'8px 14px',color:'#0f172a',fontSize:'14px',textDecoration:'none'}}>Perfil</Link>
                <div onClick={e=>{e.stopPropagation();logout();}} style={{display:'block',padding:'8px 14px',color:'#0f172a',fontSize:'14px',cursor:'pointer'}}>Sair</div>
              </div>
            )}
          </div>
          <div className={styles.cartBtn}>
            <img className={styles.shoppingBagIcon} alt='' />
            <div className={styles.badge}><b className={styles.logo}>3</b></div>
          </div>
        </div>
      </div>

      <div className={styles.profileBody}>
        <div className={styles.profileLeft}>
          <div className={styles.frame}>
            <b className={styles.logo}>Seu Perfil</b>
            <div className={styles.frame2}>
              <div className={styles.statusDot} />
              <b className={styles.curadorPremium}>Curador Premium</b>
            </div>
          </div>
          <div className={styles.personalInfoForm}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <b className={styles.dadosPessoais}>Dados Pessoais</b>
              <button onClick={()=>editando?setEditando(false):setEditando(true)} style={{cursor:'pointer',padding:'6px 12px',fontSize:'12px',border:'1px solid #e2e8f0',borderRadius:'6px',background:'#fff'}}>{editando?'Cancelar':'Editar'}</button>
            </div>
            {editando?(
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <input value={editForm.nome} onChange={e=>setEditForm({...editForm,nome:e.target.value})} style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
                <input value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})} style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
                <div style={{display:'grid',gridTemplateColumns:'80px 1fr',gap:'8px'}}>
                  <input value={editForm.telefone_ddd} onChange={e=>setEditForm({...editForm,telefone_ddd:e.target.value})} placeholder='DDD' style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
                  <input value={editForm.telefone_numero} onChange={e=>setEditForm({...editForm,telefone_numero:e.target.value})} placeholder='Numero' style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
                </div>
                <button onClick={salvarPerfil} disabled={saving} style={{cursor:saving?'not-allowed':'pointer',padding:'8px 16px',borderRadius:'6px',background:'#0f172a',color:'#fff',fontSize:'14px',border:'none',opacity:saving?0.7:1}}>{saving?'Salvando...':'Salvar Alteracoes'}</button>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                <div><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>Nome</div><div style={{padding:'8px 12px',background:'#faf9f6',borderRadius:'6px',fontSize:'14px'}}>{cliente?.nome||'-'}</div></div>
                <div><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>Email</div><div style={{padding:'8px 12px',background:'#faf9f6',borderRadius:'6px',fontSize:'14px'}}>{cliente?.email||'-'}</div></div>
                <div><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>CPF</div><div style={{padding:'8px 12px',background:'#faf9f6',borderRadius:'6px',fontSize:'14px'}}>{fmtCpf(cliente?.cpf)}</div></div>
                <div><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>Telefone</div><div style={{padding:'8px 12px',background:'#faf9f6',borderRadius:'6px',fontSize:'14px'}}>{fmtTel(cliente?.telefone_ddd,cliente?.telefone_numero)}</div></div>
                <div><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>Nascimento</div><div style={{padding:'8px 12px',background:'#faf9f6',borderRadius:'6px',fontSize:'14px'}}>{cliente?.data_nascimento||'-'}</div></div>
              </div>
            )}
          </div>
          <div className={styles.personalInfoForm}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <b className={styles.dadosPessoais}>Seguranca</b>
              <button onClick={()=>setSenhaMenuAberto(!senhaMenuAberto)} style={{cursor:'pointer',padding:'6px 12px',fontSize:'12px',border:'1px solid #e2e8f0',borderRadius:'6px',background:'#fff'}}>Mudar Senha</button>
            </div>
            {senhaMenuAberto&&(
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <input type='password' value={pwForm.atual} onChange={e=>setPwForm({...pwForm,atual:e.target.value})} placeholder='Senha atual' style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
                <input type='password' value={pwForm.nova} onChange={e=>setPwForm({...pwForm,nova:e.target.value})} placeholder='Nova senha' style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
                <input type='password' value={pwForm.confirmar} onChange={e=>setPwForm({...pwForm,confirmar:e.target.value})} placeholder='Confirmar nova senha' style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
                <button onClick={alterarSenha} disabled={saving} style={{cursor:saving?'not-allowed':'pointer',padding:'8px 16px',borderRadius:'6px',background:'#0f172a',color:'#fff',fontSize:'14px',border:'none',opacity:saving?0.7:1}}>{saving?'Alterando...':'Alterar Senha'}</button>
              </div>
            )}
          </div>

          <div className={styles.personalInfoForm}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <b className={styles.dadosPessoais}>Enderecos</b>
              <button onClick={()=>setModalEnd(true)} style={{cursor:'pointer',padding:'6px 12px',fontSize:'12px',border:'1px solid #e2e8f0',borderRadius:'6px',background:'#fff'}}>+ Adicionar</button>
            </div>
            {enderecos.length===0?<div className={styles.searchPlaceholder}>Nenhum endereco.</div>:enderecos.map(e=><div key={e.id_endereco} style={{padding:'12px',marginBottom:'8px',border:'1px solid #e2e8f0',borderRadius:'8px'}}><b>{e.nome_identificador}</b><div>{e.logradouro},{e.numero}-{e.bairro},{e.cidade}-{e.estado}</div><div>{e.cep}</div></div>)}
          </div>
        </div>
        <div className={styles.profileRight}>
          <div className={styles.personalInfoForm}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <b className={styles.dadosPessoais}>Cartoes</b>
              <button onClick={()=>setModalCart(true)} style={{cursor:'pointer',padding:'6px 12px',fontSize:'12px',border:'1px solid #e2e8f0',borderRadius:'6px',background:'#fff'}}>+ Adicionar</button>
            </div>
            {cartoes.length===0?<div className={styles.searchPlaceholder}>Nenhum cartao.</div>:cartoes.map(c=><div key={c.id_cartao} style={{padding:'12px',marginBottom:'8px',border:'1px solid #e2e8f0',borderRadius:'8px'}}><b>{maskCard(c.numero_cartao)} {c.preferencial?'(Preferencial)':''}</b></div>)}
          </div>
          <div className={styles.dangerZone}>
            <b className={styles.zonaDeRisco}>Zona de Risco</b>
            <div className={styles.desativarSuaConta}>Desativar sua conta e permanente.</div>
            <div className={styles.deactivateCta} onClick={deactivate} style={{cursor:'pointer'}}><b>Desativar Conta</b></div>
          </div>
        </div>
      </div>


      {modalEnd&&(
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}}>
          <form onSubmit={async e=>{e.preventDefault();setSaving(true);try{await enderecosApi.criar({nome_identificador:e.target.ni.value,tipo:e.target.ti.value,logradouro:e.target.lo.value,numero:e.target.nu.value,bairro:e.target.ba.value,cep:e.target.ce.value,cidade:e.target.ci.value,estado:e.target.es.value});setModalEnd(false);loadData();}catch(x){alert('Erro')}finally{setSaving(false)}}} style={{background:'#fff',borderRadius:'12px',padding:'24px',width:'480px',boxShadow:'0 10px 20px rgba(0,0,0,0.1)'}}>
            <b style={{fontSize:'18px',marginBottom:'20px',display:'block'}}>Adicionar Endereco</b>
            <input name='ni' placeholder='Nome (Casa, Trabalho)' required style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',marginBottom:'8px',fontSize:'14px',boxSizing:'border-box'}} />
            <select name='ti' style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',marginBottom:'8px',fontSize:'14px',background:'#fff'}}><option value='ENTREGA'>Entrega</option><option value='COBRANCA'>Cobranca</option><option value='AMBOS'>Ambos</option></select>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              <input name='lo' placeholder='Logradouro' required style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
              <input name='nu' placeholder='Numero' required style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
              <input name='ba' placeholder='Bairro' required style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
              <input name='ce' placeholder='CEP' required style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
              <input name='ci' placeholder='Cidade' required style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
              <input name='es' placeholder='Estado (SP)' required style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'14px',boxSizing:'border-box'}} />
            </div>
            <div style={{display:'flex',gap:'12px',marginTop:'16px',justifyContent:'flex-end'}}>
              <button type='button' onClick={()=>setModalEnd(false)} style={{cursor:'pointer',padding:'8px 16px',borderRadius:'6px',border:'1px solid #e2e8f0',fontSize:'14px',background:'#fff',color:'#475569'}}>Cancelar</button>
              <button type='submit' disabled={saving} style={{cursor:saving?'not-allowed':'pointer',padding:'8px 16px',borderRadius:'6px',background:'#0f172a',color:'#fff',fontSize:'14px',border:'none',opacity:saving?0.7:1}}>{saving?'Salvando...':'Salvar'}</button>
            </div>
          </form>
        </div>
      )}


      {modalCart&&(
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}}>
          <form onSubmit={async e=>{e.preventDefault();setSaving(true);try{await cartoesApi.criar({id_bandeira:Number(e.target.ib.value),numero_cartao:e.target.nc.value,nome_impresso:e.target.nm.value,codigo_seguranca:e.target.cs.value,preferencial:e.target.pr.checked});setModalCart(false);loadData();}catch(x){alert('Erro')}finally{setSaving(false)}}} style={{background:'#fff',borderRadius:'12px',padding:'24px',width:'420px',boxShadow:'0 10px 20px rgba(0,0,0,0.1)'}}>
            <b style={{fontSize:'18px',marginBottom:'20px',display:'block'}}>Adicionar Cartao</b>
            <select name='ib' style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',marginBottom:'8px',fontSize:'14px',background:'#fff'}}><option value='1'>Visa</option><option value='2'>Mastercard</option><option value='3'>Amex</option></select>
            <input name='nc' placeholder='Numero do cartao' required style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',marginBottom:'8px',fontSize:'14px',boxSizing:'border-box'}} />
            <input name='nm' placeholder='Nome impresso' required style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',marginBottom:'8px',fontSize:'14px',boxSizing:'border-box'}} />
            <input name='cs' placeholder='CVV' maxLength={4} required style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'6px',marginBottom:'8px',fontSize:'14px',boxSizing:'border-box'}} />
            <label style={{fontSize:'14px',display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}><input name='pr' type='checkbox' /> Preferencial</label>
            <div style={{display:'flex',gap:'12px',justifyContent:'flex-end'}}>
              <button type='button' onClick={()=>setModalCart(false)} style={{cursor:'pointer',padding:'8px 16px',borderRadius:'6px',border:'1px solid #e2e8f0',fontSize:'14px',background:'#fff',color:'#475569'}}>Cancelar</button>
              <button type='submit' disabled={saving} style={{cursor:saving?'not-allowed':'pointer',padding:'8px 16px',borderRadius:'6px',background:'#0f172a',color:'#fff',fontSize:'14px',border:'none',opacity:saving?0.7:1}}>{saving?'Salvando...':'Salvar'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;


