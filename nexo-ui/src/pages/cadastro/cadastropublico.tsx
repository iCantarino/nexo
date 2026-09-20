import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clientesApi } from "../../services/api";
import styles from "./CadastroPublico.module.css";

export default function CadastroPublico() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    dataNascimento: "",
    senha: "",
    confirmarSenha: "",
    aceitoTermos: false,
  });
  
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formatarData = (data: string) => {
    const partes = data.split("/");
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (formData.senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres");
      return;
    }

// RNF0031: Senha forte — letras maiúsculas, minúsculas e caracteres especiais
    if (!/(?=.*[a-z])/.test(formData.senha)) {
      setErro("A senha deve conter pelo menos uma letra minúscula");
      return;
    }
    if (!/(?=.*[A-Z])/.test(formData.senha)) {
      setErro("A senha deve conter pelo menos uma letra maiúscula");
      return;
    }
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.senha)) {
      setErro("A senha deve conter pelo menos um caractere especial (!@#$%^&* etc.)");
      return;
    }
    if (!formData.aceitoTermos) {
      setErro("Você deve aceitar os termos de serviço");
      return;
    }

    setCarregando(true);

    try {
      const telefoneLimpo = formData.telefone.replace(/\D/g, "");
      const telefone_ddd = telefoneLimpo.substring(0, 2);
      const telefone_numero = telefoneLimpo.substring(2);

      await clientesApi.criar({
        nome: formData.nome,
        genero: "Não informado",
        data_nascimento: formatarData(formData.dataNascimento),
        cpf: formData.cpf,
        telefone_tipo: "Celular",
        telefone_ddd,
        telefone_numero,
        email: formData.email,
        senha: formData.senha,
      });

      setSucesso("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      setErro(error.response?.data?.message || "Erro ao criar conta");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.cadastroPublico}>
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
            <b className={styles.nexo}>Crie sua conta</b>
            <div className={styles.junteSeComunidade}>Junte-se à comunidade Nexo.</div>
          </div>

          <form onSubmit={handleSubmit} className={styles.frame8}>
            <div className={styles.frame7}>
              <div className={styles.nomeCompleto}>Nome Completo</div>
              <div className={styles.frame10}>
                <input className={styles.seuNome} type="text" name="nome" placeholder="Seu nome" value={formData.nome} onChange={handleChange} required />
              </div>
            </div>
            <div className={styles.frame7}>
              <div className={styles.nomeCompleto}>E-mail</div>
              <div className={styles.frame10}>
                <input className={styles.seuNome} type="email" name="email" placeholder="seu.email@exemplo.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>
            <div className={styles.frame13}>
              <div className={styles.frame14}>
                <div className={styles.nomeCompleto}>CPF</div>
                <div className={styles.frame10}>
                  <input className={styles.seuNome} type="text" name="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} required />
                </div>
              </div>
              <div className={styles.frame14}>
                <div className={styles.nomeCompleto}>Telefone</div>
                <div className={styles.frame10}>
                  <input className={styles.seuNome} type="tel" name="telefone" placeholder="(11) 99999-0000" value={formData.telefone} onChange={handleChange} required />
                </div>
              </div>
            </div>
            <div className={styles.frame7}>
              <div className={styles.nomeCompleto}>Data de Nascimento</div>
              <div className={styles.frame10}>
                <input className={styles.seuNome} type="text" name="dataNascimento" placeholder="DD/MM/AAAA" value={formData.dataNascimento} onChange={handleChange} required />
              </div>
            </div>
            <div className={styles.frame13}>
              <div className={styles.frame14}>
                <div className={styles.nomeCompleto}>Senha</div>
                <div className={styles.frame10}>
                  <input className={styles.seuNome} type="password" name="senha" placeholder="Sua senha" value={formData.senha} onChange={handleChange} required />
                </div>
              </div>
              <div className={styles.frame14}>
                <div className={styles.nomeCompleto}>Confirmar Senha</div>
                <div className={styles.frame10}>
                  <input className={styles.seuNome} type="password" name="confirmarSenha" placeholder="Repita a senha" value={formData.confirmarSenha} onChange={handleChange} required />
                </div>
              </div>
            </div>
            <div className={styles.frame25}>
              <div className={styles.frame26}>
                <input type="checkbox" name="aceitoTermos" checked={formData.aceitoTermos} onChange={handleChange} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
              </div>
              <div className={styles.nexo}>Aceito os termos de serviço e privacidade.</div>
            </div>

            {erro && <div style={{ color: "#e94560", fontSize: "0.875rem", marginBottom: "1rem" }}>{erro}</div>}
            {sucesso && <div style={{ color: "#28a745", fontSize: "0.875rem", marginBottom: "1rem" }}>{sucesso}</div>}

            <div className={styles.frame27}>
              <button type="submit" className={styles.frame28} disabled={carregando} style={{ cursor: carregando ? "not-allowed" : "pointer", opacity: carregando ? 0.7 : 1 }}>
                <div className={styles.nomeCompleto}>{carregando ? "Criando..." : "Criar Conta"}</div>
              </button>
              <div className={styles.frame29}>
                <div className={styles.nexo}>
                  <span>{`Já tem uma conta? `}</span>
                  <a className={styles.entrar} href="/login"><span className={styles.entrar2}>Entrar</span></a>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

