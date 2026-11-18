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
---

# UC Gerenciar Vendas Eletrônicas — rastreabilidade

```bash
cd nexo-api
npm run migrate:vendas        # uma vez (idempotente): colunas/tabelas novas, preserva os dados
npx playwright test tests/functional/vendas-eletronicas.spec.js tests/functional/checkout.spec.js
```

Parâmetro: `CART_LOCK_MINUTES` (padrão 15) — prazo do bloqueio do carrinho (RN0044/RNF0045).
Operadora de cartão simulada (RN0028/RN0037): cartão com número terminado em `0000` é **recusado**; os demais são autorizados.
O nome interno `EM_TRANSITO` é exibido como **EM TRANSPORTE**.

| Roteiro | Cenário (teste em `vendas-eletronicas.spec.js`) | Requisitos |
|---|---|---|
| 1 | 01 compra aprovada com um cartão (EM_PROCESSAMENTO -> APROVADA, baixa de estoque) | RF0037, RN0037, RN0038, RF0053 |
| 2 | 02 dois cartões; R$ 5,00 em um deles é bloqueado | RN0034 |
| 3 | 03 cupom promocional + cartão < R$ 10,00 permitido; 2 promocionais bloqueados | RN0033, RN0035 |
| 4 | 04 cupons de troca > compra: cupom `TROCO-` com a diferença; 3º cupom desnecessário recusado | RN0036 |
| 5 | 05 compra REPROVADA: sem baixa, sem movimentação, cupom preservado | RN0038, RN0028, RF0053 |
| 6 | 06 expiração do bloqueio: itens removidos, `pode_comprar=false`, compra negada, reinclusão | RN0044, RN0045, RNF0045, RNF0042 |
| 7 | 07 admin: APROVADA -> EM_TRANSITO -> ENTREGUE (cliente não pode) | RF0038, RN0039, RF0039, RN0040 |
| 8 | 08 troca de pedido não ENTREGUE bloqueada | RN0043, RN0041 |
| 9 | 09 troca de um item e da compra inteira | RF0040, RN0041 |
| 10 | 10 solicitação, visualização, autorização + notificação, recebimento, cupom, reentrada | RF0041-RF0044, RN0042, RF0054, RNF0046 |
| 11 | 11 cupom de troca gerado usado em nova compra (uso único) | RF0044, RF0037 |
| — | 12 revalidação de estoque na finalização (ajusta/remove + alerta) | RN0032, RN0031 |

Transversais: RNF0012 (histórico de status e `movimentacao_estoque`), RNF0011 (respostas em milissegundos nos testes).
Foram retiradas as rotas do cliente `confirmar-recebimento`/`cancelar` e o `PATCH /pedidos/:id/status` genérico: as transições agora seguem o ciclo de vida do DRS.
Não implementados (fora de escopo): estorno financeiro no cartão e recusa de troca pelo administrador.

---

# Análise de vendas por categoria — gráfico de linhas (RF0055, RNF0043, RNF0011)

Arquivo: `tests/functional/analise-vendas.spec.js` (API) e `tests/ui/analise-ui.spec.js` (tela).
Critérios: comparação por categoria; só ADMIN; eixo por mês (MM/AAAA); só compras ENTREGUE; valor total em R$.
A venda é datada pela compra (`pedido.data_pedido`); frete não entra.

| # | Cenário do roteiro | Teste | Requisito |
|---|---|---|---|
| 1 | Uma categoria no período; mensal = soma ENTREGUE na base | `01` (compara com SQL direto) | RF0055, RN0071 |
| 2 | Duas ou mais categorias | `02` | RF0055 |
| 3 | Gráfico de linhas, R$ por mês | `03` (API) e UI "compara categorias, vê o gráfico de linhas" (`.recharts-line` por categoria) | RNF0043 |
| 4 | Alterar início/fim muda o resultado | `04` e UI | RF0055 |
| 5 | Status != ENTREGUE não conta | `05` (6 status diferentes) | RN0074 |
| 6 | Compra passa a ENTREGUE e entra na consulta seguinte | `06` (compra real + despachar + entregar) | RN0040, RN0074 |
| 7 | Admin permitido; demais negados | `07` (sem token, cliente, gerente) e UI sem sessão | critério b |
| 8 | Resposta ≤ 1 s | `08` (24 meses, todas as categorias, 5 medições) | RNF0011 |
| - | Validações (categoria obrigatória, fim >= início, 1 a 24 meses) | `09` | RN0072, RN0073 |

Execução: `npx playwright test tests/functional/analise-vendas.spec.js` e `npm run test:analise-ui`.
Os testes de API criam categorias e pedidos de 2020 próprios e os removem ao final.

Testes pela interface com Selenium (mesmos cenários): ver 	ests/selenium/README.md (
pm run test:selenium).
