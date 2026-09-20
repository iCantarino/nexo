# 📚 Nexo — E-commerce de Livros

**Projeto de faculdade** — E-commerce de livros com React + TypeScript (frontend) e Node.js + Express + Sequelize + MySQL (backend).

## 🐳 Rodar com Docker (local)

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- WSL 2 habilitado (Windows) ou Docker Engine (Linux)

### Passo a passo

```powershell
# 1. Entre na pasta do projeto
cd nexo

# 2. Copie o .env.example para .env e ajuste se necessário
cp .env.example .env

# 3. Suba os containers (com MySQL local)
docker compose --profile local up --build
```

**Acessar:**
| Serviço | URL |
|---------|-----|
| Frontend (Nginx) | http://localhost |
| API (Health check) | http://localhost:8000/health |
| API (Rotas) | http://localhost:8000/api/v1/... |
| MySQL | localhost:3306 |

### Parar os containers

```powershell
docker compose down
# Para apagar também o volume do banco (dados):
docker compose down -v
```

---

## 🌐 Deploy no Railway.app (grátis)

### 1. Criar conta no [Railway.app](https://railway.app)

### 2. Criar repositório no GitHub

```powershell
# Na raiz do projeto (nexo/)
git init
git add .
git commit -m "feat: docker + railway setup"
# Cria um repo no GitHub e:
git remote add origin https://github.com/seuusuario/nexo.git
git push -u origin main
```

### 3. Conectar no Railway

1. **New Project** → **Deploy from GitHub repo**
2. Selecione o repositório `nexo`
3. Railway detecta o `docker-compose.yml` automaticamente

### 4. Adicionar MySQL

1. No projeto Railway, clique **New** → **Database** → **MySQL**
2. Railway cria um banco MySQL grátis
3. No painel do MySQL, copie as credenciais:

| Variável | Onde encontrar |
|----------|---------------|
| `DB_HOST` | Internal Hostname (ex: `roundhouse.proxy.rlwy.net`) |
| `DB_USER` | User |
| `DB_PASSWORD` | Password |
| `DB_NAME` | Database name (ex: `railway`) |

### 5. Configurar variáveis de ambiente

No serviço **nexo-api** no Railway, adicione:

| Variável | Valor |
|----------|-------|
| `DB_HOST` | Internal Hostname do MySQL |
| `DB_PORT` | 3306 |
| `DB_USER` | User do MySQL |
| `DB_PASSWORD` | Password do MySQL |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Um segredo forte (use: `openssl rand -hex 64`) |
| `JWT_EXPIRES_IN` | 1h |
| `NODE_ENV` | production |
| `APP_PORT` | 8000 |
| `CORS_ORIGINS` | URL do serviço nexo-ui (ex: `https://nexo-ui-production-xxxx.up.railway.app`) |

### 6. Inicializar o banco de dados

No Railway, abra o **MySQL** → **Connect** → copie o comando de conexão. Depois:

```bash
# Baixe o schema.sql e importe manualmente
mysql -h <host> -u <user> -p <database> < nexo-design/bdd/schema.sql

# Opcional: dados de exemplo
mysql -h <host> -u <user> -p <database> --default-character-set=utf16 < nexo-design/backup.sql
```

### 7. Pronto! 🎉

Railway gera URLs automaticamente:
- **Frontend:** `https://nexo-ui-production-xxxx.up.railway.app`
- **API:** `https://nexo-api-production-xxxx.up.railway.app`

---

## 📁 Estrutura de arquivos Docker

```
nexo/
├── docker-compose.yml            # Orquestrador (3 serviços)
├── Dockerfile.api                # Build do backend (Node.js)
├── Dockerfile.ui.prod            # Build do frontend (Node → Nginx)
├── nginx.conf                    # Proxy reverso + SPA fallback
├── .env.example                  # Template de variáveis de ambiente
├── .dockerignore                 # Arquivos ignorados no build
├── railway.json                  # Config opcional para Railway
├── docker-entrypoint-initdb/
│   └── 01-init.sh                # Script de inicialização do MySQL
├── nexo-api/                     # Código do backend
├── nexo-ui/                      # Código do frontend
└── nexo-design/                  # Documentação, schema SQL e mocks
```

---

## 🔄 Arquitetura

```
Navegador → http://localhost:80 (Nginx)
  ├── / → arquivos estáticos (React SPA)
  ├── /api/* → proxy → nexo-api:8000 → mysql:3306
  └── /health → proxy → nexo-api:8000
```
