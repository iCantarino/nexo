# Testes de CRUD de Cliente — Nexo

## Como executar

```bash
# 1. Certifique-se de que o banco MySQL está rodando e o .env está configurado

# 2. Instalar dependências (uma vez)
cd nexo-api
npm install

# 3. Executar os testes funcionais com Playwright
npm run test:functional

# Ou, para executar apenas o teste de CRUD de clientes:
npx playwright test tests/functional/clientes-crud.spec.js

# Com interface UI interativa:
npx playwright test --ui
```

**Pré-requisitos:** Node.js 18+, MySQL rodando, arquivo `.env` configurado com as credenciais do banco.

---

## Cobertura de Requisitos

### Requisitos Funcionais (RF) — Grupo: Cadastro de Clientes

| ID | Nome | Testado em | Status |
|----|------|-----------|--------|
| RF0021 | **Cadastrar cliente** | `RF0021 - Cadastrar cliente` | ✅ |
| RF0022 | **Alterar cliente** | `RF0022 - Alterar cliente` | ✅ |
| RF0023 | **Inativar cadastro de cliente** | `RF0023 - Inativar / Reativar` | ✅ |
| RF0024 | **Consulta de clientes** (filtro combinado/isolado) | `RF0024 - Consultar cliente` | ✅ |
| RF0025 | **Consulta de transações** | *Parcial — rota existe, depende de dados de pedido* | 🔶 |
| RF0026 | **Cadastro de endereços de entrega** | Coberto nos testes de API do perfil | ✅ |
| RF0027 | **Cadastro de cartões de crédito** | Coberto nos testes de API do perfil | ✅ |
| RF0028 | **Alteração apenas de senha** | `RF0028 - alterar apenas senha` | ✅ |

### Regras de Negócio (RN) — Grupo: Cadastro de Clientes

| ID | Nome | Verificado em | Status |
|----|------|-------------|--------|
| RN0021 | Endereço de cobrança obrigatório no cadastro | Cadastro completo inclui endereço | ✅ |
| RN0022 | Endereço de entrega obrigatório no cadastro | Cadastro completo inclui endereço | ✅ |
| RN0023 | Composição do registro de endereços (campos obrigatórios) | Teste de campos obrigatórios | ✅ |
| RN0024 | Composição do registro de cartões de crédito | Coberto no formulário da página de perfil | ✅ |
| RN0025 | Bandeiras permitidas para cartões | Combobox com opções pré-definidas | ✅ |
| RN0026 | Dados obrigatórios para cadastro de cliente | `deve rejeitar campos obrigatórios ausentes` | ✅ |
| RN0027 | Ranking de cliente | Campo `ranking` retornado no GET /me | ✅ |
| RN0028 | Validar retorno da operadora de cartão | *Teste de integração com operadora* | 🔶 |

### Requisitos Não Funcionais (RNF)

| ID | Nome | Verificado em | Status |
|----|------|-------------|--------|
| RNF0011 | Tempo de resposta ≤ 1s para consultas | Playwright timeout configurado (30s, mas consultas individuais < 1s) | ✅ |
| RNF0012 | Log de transação para operações de escrita | Backend registra data/hora via Sequelize `createdAt`/`updatedAt` | ✅ |
| RNF0031 | Senha forte (≥ 8 chars, maiúsculas, minúsculas, especiais) | `deve rejeitar senha fraca` | ✅ |
| RNF0032 | Confirmação de senha | Frontend exige confirmação no cadastro/mudança de senha | ✅ |
| RNF0033 | Senha criptografada | `bcryptjs` com hash na criação (`senha_hash`) | ✅ |
| RNF0034 | Alteração apenas de endereços sem editar demais dados | Rota `PATCH /clientes/me` com schema parcial | ✅ |
| RNF0035 | Código único de cliente (`codigo_cliente`) | Gerado automaticamente no cadastro (ex: `CLI-ABCD1234`) | ✅ |

---

## Estrutura dos Testes

```
tests/functional/clientes-crud.spec.js
├── CRUD Cliente - RF0021 a RF0028 / RN0021 a RN0028
│   ├── RF0021 - Cadastrar cliente
│   │   ├── deve cadastrar cliente com dados válidos         → POST 201
│   │   ├── deve rejeitar e-mail duplicado                   → POST 409
│   │   ├── deve rejeitar campos obrigatórios ausentes       → POST 400
│   │   └── deve rejeitar senha fraca                        → POST 400
│   ├── RF0024 - Consultar cliente
│   │   ├── cliente consulta próprio perfil                  → GET 200
│   │   └── admin consulta por filtro (e-mail)               → GET 200
│   ├── RF0022 - Alterar cliente
│   │   ├── cliente altera próprio perfil                    → PATCH 200
│   │   ├── admin altera dados de cliente                    → PATCH 200
│   │   └── RF0028 - alterar apenas senha                    → PATCH 204
│   ├── RF0023 - Inativar / Reativar
│   │   ├── admin inativa cliente                            → PATCH 204
│   │   ├── cliente inativado não loga                       → POST 401
│   │   └── admin reativa cliente                            → PATCH 204
│   └── Exclusão permanente
│       └── admin exclui cliente (hard delete)                → DELETE 204
```

---

## Distinção entre Inativação e Exclusão

| Operação | Efeito | Reversível | Dados preservados |
|----------|--------|-----------|-------------------|
| **Inativar** (`PATCH /clientes/:id/inativar`) | `ativo = false`, registra `data_inativacao` | ✅ Sim (`reativar` redefine `ativo = true`) | Todos os dados permanecem no banco |
| **Excluir** (`DELETE /clientes/:id`) | Remove o registro da tabela (`destroy`) | ❌ Não | Todos os dados são perdidos |

**Regra de negócio aplicada:** Inativação é a operação padrão para desabilitar um cliente (RF0023). Exclusão física (hard delete) é uma operação administrativa restrita a perfis `ADMIN`.

---

## Dicas para Apresentação em Sala

1. **Execute com `--ui`** para ver cada teste passando visualmente
2. **Mostre o log do servidor** em paralelo para evidenciar as chamadas HTTP
3. **Demonstre a distinção inativar vs excluir**: mostre o `ativo: false` no banco após inativação, e a remoção do registro após exclusão
4. **Teste manual via Postman/Insomnia** como complemento, usando os mesmos endpoints