# Nexo — Ambiente de Desenvolvimento Local

Este guia explica como subir o banco MySQL, a API e o frontend na máquina local.

## Pré-requisitos

- Node.js 22 (use `nvm use 22`)
- Docker + Docker Compose
- MySQL client (`mysql` no terminal)

## 1. Banco de dados (MySQL no Docker)

O MySQL nativo da máquina já ocupa a porta 3306, então o container do Nexo foi configurado para usar a porta **3307**.

Subir o banco:

```bash
cd /home/v2saude/workspace/nexo/nexo
docker compose --profile local up mysql -d
```

Conectar pelo terminal:

```bash
mysql -h 127.0.0.1 -P 3307 -u root -pnexo_root_pass nexo_db
```

Credenciais:
- host: `127.0.0.1`
- porta: `3307`
- usuário: `root`
- senha: `nexo_root_pass`
- banco: `nexo_db`

## 2. API (nexo-api)

```bash
cd /home/v2saude/workspace/nexo/nexo/nexo-api
nvm use 22
npm install
npm start
```

A API estará em: http://localhost:8000

## 3. Frontend (nexo-ui)

```bash
cd /home/v2saude/workspace/nexo/nexo/nexo-ui
nvm use 22
npm install
npm run dev
```

O frontend estará em: http://localhost:5173

## Comandos úteis

```bash
# Ver logs do MySQL
docker logs -f nexo-mysql

# Parar o banco
docker compose --profile local down

# Recriar o banco do zero (apaga todos os dados!)
docker compose --profile local down mysql -v
docker compose --profile local up mysql -d

# Rodar testes da API
cd nexo-api && npm test

# Build do frontend
cd nexo-ui && npm run build
```

## Variáveis de ambiente

As configurações estão no arquivo `.env` na raiz do projeto. Ele já foi criado a partir do `.env.example`.

Principais variáveis:
- `DB_HOST=127.0.0.1`
- `DB_PORT=3307`
- `DB_PASSWORD=nexo_root_pass`
- `JWT_SECRET=nexo-dev-secret-256-bits-super-seguro`
- `VITE_API_URL=http://localhost:8000/api/v1`
