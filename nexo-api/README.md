# Nexo API

Backend do e-commerce de livros **Nexo**, construído em **Node.js + Express +
Sequelize**, integrado ao MySQL a partir do schema definido em
`../nexo-design/bdd/schema.sql` e às regras de negócio descritas em
`../nexo-design/REGRAS_DE_NEGOCIO.md`.

## Stack

- **Express** — framework HTTP.
- **Sequelize** — ORM, mapeado 1:1 às tabelas do `schema.sql`, com driver `mysql2`.
- **zod** — validação de payloads das requisições.
- **jsonwebtoken + bcryptjs** — autenticação JWT e hash de senha.
- **cors / morgan** — CORS liberado para o `nexo-ui` e log de requisições.
- **@playwright/test** — testes funcionais end-to-end contra a API real.

## Estrutura de pastas

```
nexo-api/
├── src/
│   ├── server.js              # bootstrap: testa conexão MySQL e inicia o Express
│   ├── app.js                  # cria o app Express, CORS, monta as rotas
│   ├── config/
│   │   ├── env.js              # carrega/valida variáveis do .env
│   │   └── database.js         # instância Sequelize
│   ├── middlewares/
│   │   ├── auth.js             # requireCliente / requireFuncionario / requirePerfil
│   │   └── errorHandler.js
│   ├── models/                 # Sequelize — um arquivo por domínio (28 tabelas) + index.js (associações)
│   ├── modules/                 # routers por módulo de negócio
│   └── utils/
├── scripts/
│   └── setupDb.js               # (re)executa nexo-design/bdd/schema.sql no MySQL configurado
├── tests/functional/             # testes Playwright contra a API real
├── playwright.config.js
├── package.json
└── .env / .env.example
```

## Configuração inicial

### 1. Instalar dependências

```powershell
cd nexo-api
npm install
npx playwright install chromium
```

### 2. Configurar o `.env`

Copie `.env.example` para `.env` e ajuste as credenciais do seu MySQL local:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<sua-senha>
DB_NAME=nexo_db
```

### 3. Criar o banco de dados

O banco pode já existir (criado via `mysql < ../nexo-design/bdd/schema.sql`).
Para (re)criar/atualizar o schema a qualquer momento:

```powershell
npm run setup-db
```

Isso executa `nexo-design/bdd/schema.sql`, criando o banco `nexo_db`, todas as
tabelas, a view `vw_vendas_por_categoria_mes` e os seeds de domínio (bandeiras,
categorias, grupos de precificação, motivos de status, usuário admin inicial).

### 4. Rodar a API

```powershell
npm run dev     # com reload automático (nodemon)
npm start        # produção
```

- Health check: http://127.0.0.1:8000/health

## Autenticação

- `POST /api/v1/auth/cliente/login` — login de cliente (retorna JWT com `tipo=cliente`).
- `POST /api/v1/auth/funcionario/login` — login de funcionário/admin (JWT com `tipo=funcionario` e `perfil`).

Envie o token nas rotas protegidas via header `Authorization: Bearer <token>`.

## Principais módulos de negócio

| Módulo | Rotas | Regras de negócio |
|---|---|---|
| Clientes | `/api/v1/clientes` | RF002x, RN0021-28 |
| Endereços | `/api/v1/enderecos` | RN0021-23, RF0026 |
| Cartões | `/api/v1/cartoes` | RN0024-25, RF0027 |
| Livros | `/api/v1/livros` | RF001x, RN0011-17 |
| Estoque | `/api/v1/estoque` | RF0051-54, RN0050-51 |
| Carrinho | `/api/v1/carrinho` | RF0031-32, RN0031-32, RN0044-45 |
| Pedidos | `/api/v1/pedidos` | RF0033-40, RN0033-40 |
| Cupons | `/api/v1/cupons` | RN0033-36 |
| Trocas | `/api/v1/trocas` | RF0041-45, RN0041-43, RN0046 |
| Avaliações | `/api/v1/livros/{id}/avaliacoes` | página de detalhe do livro |
| Chatbot / IA | `/api/v1/chatbot` | RNF0044 |
| Análise | `/api/v1/analise` | RF0055-58, RN0071-74 |

## Testes funcionais (Playwright)

Os testes sobem a API real (via `webServer` do Playwright) e a exercitam com
requisições HTTP, validando a integração completa com o banco MySQL.

```powershell
npm run test:functional
```

## Integração com o front-end (nexo-ui)

O CORS já está liberado por padrão para `http://localhost:5173` (porta padrão
do Vite). Ajuste `CORS_ORIGINS` no `.env` caso o front rode em outra porta.
