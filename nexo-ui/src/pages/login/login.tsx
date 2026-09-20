import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resultado = await login(email, senha);
      
      if (resultado.success) {
        if (resultado.isAdmin) {
          navigate('/admin-dashboard');
        } else {
          navigate('/home');
        }
      } else {
        setErro(resultado.error || 'Erro ao fazer login');
      }
    } catch (error) {
      setErro('Erro inesperado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.frame}>
        <div className={styles.frame2}>
          <div className={styles.frame3}>
            <b className={styles.nexo}>Nexo</b>
            <div className={styles.rectangle} />
          </div>
          <div className={styles.line} />
          <div className={styles.conhecimentoCuradoPara}>"Conhecimento curado para mentes curiosas."</div>
        </div>
      </div>
      <div className={styles.frame4}>
        <div className={styles.frame5}>
          <div className={styles.frame6}>
            <b className={styles.nexo}>Nexo</b>
            <div className={styles.rectangle2} />
          </div>
          <div className={styles.frame7}>
            <b className={styles.nexo}>Bem-vindo de volta</b>
            <div className={styles.entreNaSua}>Entre na sua conta para continuar explorando.</div>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.frame8}>
            <div className={styles.frame9}>
              <div className={styles.eMail}>E-mail</div>
              <div className={styles.frame10}>
                <input 
                  className={styles.seuemailexemplocom} 
                  type="email" 
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className={styles.frame11}>
              <div className={styles.frame9}>
                <div className={styles.eMail}>Senha</div>
                <div className={styles.frame10}>
                  <input 
                    className={styles.seuemailexemplocom} 
                    type="password" 
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={styles.frame14}>
                <a className={styles.esqueceuASenha} href="/recuperar-senha">Esqueceu a senha?</a>
              </div>
            </div>
            
            {erro && (
              <div style={{ color: '#e94560', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {erro}
              </div>
            )}
            
            <button 
              type="submit" 
              className={styles.frame15}
              disabled={carregando}
              style={{ cursor: carregando ? 'not-allowed' : 'pointer', opacity: carregando ? 0.7 : 1 }}
            >
              <div className={styles.eMail}>
                {carregando ? 'Entrando...' : 'Entrar'}
              </div>
            </button>
          </form>
          
          <div className={styles.frame16}>
            <div className={styles.nexo}>
              <span>{`Não tem conta? `}</span>
              <a className={styles.cadastreSe} href="/cadastro">
                <span className={styles.cadastreSe2}>Cadastre-se</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

