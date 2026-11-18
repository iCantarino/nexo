# Testes Selenium — Análise de vendas por categoria (gráfico de linhas)

Requisitos: **RF0055**, **RNF0043**, **RNF0011**. Critérios: comparação por categoria, só ADMIN,
eixo por mês/ano, só compras ENTREGUE, valor total em R$.

Os testes controlam o Chrome pela tela (login, datas, categorias, botão Consultar) e conferem
o gráfico e a tabela de valores. A massa de 2020 é criada e removida pelo próprio teste, então não
depende do seed.

## Pré-requisitos
- Node compatível com `selenium-webdriver` 4.x (testado no Node 24) e `npm install` feito em `nexo-api`.
- MySQL rodando com o banco criado (`npm run setup-db` e `npm run migrate`; ver README da API).
- Google Chrome instalado. O Selenium Manager baixa o `chromedriver` correto na primeira execução
  (precisa de internet nessa vez). Não é preciso instalar o driver à mão.
- `nexo-ui` com dependências instaladas (`npm install` em `nexo-ui`).

## Como executar
```powershell
cd nexo-api
npm run test:selenium                      # headless
$env:HEADLESS='false'; npm run test:selenium   # mostra o navegador (útil na demonstração)
```
O teste sobe a API (porta 8010) e a UI (porta 5174) sozinho, se não estiverem no ar. Para trocar as portas:
`TEST_API_PORT` e `TEST_UI_PORT`. Capturas de tela de cada cenário ficam em `tests/selenium/screenshots/`.

## Cenários do roteiro × teste
| # | Cenário | Teste | Requisito |
|---|---|---|---|
| 1 | Uma categoria; valores mensais = soma ENTREGUE na base | `01` (confere com SQL direto) | RF0055 |
| 2 | Duas ou mais categorias | `02` | RF0055 |
| 3 | Gráfico de linhas, R$ agrupado por mês | `03` (`.recharts-line` por categoria, meses `MM/AAAA`, `R$ 130,50`) | RNF0043 |
| 4 | Alterar data de início ou de fim | `04` | RF0055 |
| 5 | Status diferente de ENTREGUE não conta | `05` (6 pedidos de R$ 990,00 ignorados) | RN0074 |
| 6 | Compra passa a ENTREGUE e aparece na consulta seguinte | `06` (despacha e entrega pela API do admin) | RN0040, RN0074 |
| 7 | Admin permitido; demais negados | `07` (cliente, gerente, sem sessão; e API 401/403/200) | critério b |
| 8 | Resposta em até 1 s | `08` (24 meses, todas as categorias, 5 medições da chamada HTTP no navegador) | RNF0011 |
| - | Validação na tela (categoria obrigatória) | `09` | RF0055 |

## Observações
- O tempo do cenário 8 é o da requisição HTTP medido pelo navegador (`performance` API), sem contar a
  renderização do gráfico.
- Usuários `GERENTE_VENDAS` não têm área própria no app: após o login o app os devolve ao `/login`.
  Por isso o teste instala a sessão deles diretamente e verifica que `/admin-analise` não exibe o painel.
