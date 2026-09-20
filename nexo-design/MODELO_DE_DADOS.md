# MODELO DE DADOS — NEXO (E-COMMERCE DE LIVROS)

Este documento apresenta o modelo de dados da plataforma **Nexo**, um e-commerce
especializado em livros e produtos culturais, com recomendação personalizada via
Inteligência Artificial. O modelo foi elaborado com base no documento
`REGRAS_DE_NEGOCIO.md` (Requisitos Funcionais - RF, Requisitos Não Funcionais - RNF
e Regras de Negócio - RN) e cobre os módulos de:

- Cadastro de Clientes (RF002x / RN002x)
- Cadastro de Livros (RF001x / RN001x)
- Gestão de Vendas Eletrônicas: carrinho, pedido, pagamento combinado, cupons (RF003x / RN003x)
- Controle de Estoque (RF005x / RN005x)
- Trocas (RF004x)
- Análise Gerencial (RF005x-8 / RN007x)
- Avaliações de produto (estrelas + comentário) — página de detalhe do livro
- Recomendação personalizada por IA e Chatbot (RNF0044)
- Auditoria de escrita (RNF0012)

---

## 1. Diagrama Entidade-Relacionamento (Mermaid)

```mermaid
erDiagram
    CLIENTE ||--o{ ENDERECO : possui
    CLIENTE ||--o{ CARTAO_CREDITO : possui
    BANDEIRA_CARTAO ||--o{ CARTAO_CREDITO : classifica
    CLIENTE ||--o| CARRINHO : mantem
    CARRINHO ||--o{ ITEM_CARRINHO : contem
    LIVRO ||--o{ ITEM_CARRINHO : referenciado_em

    CLIENTE ||--o{ PEDIDO : realiza
    ENDERECO ||--o{ PEDIDO : entrega_em
    PEDIDO ||--o{ ITEM_PEDIDO : contem
    LIVRO ||--o{ ITEM_PEDIDO : referenciado_em
    PEDIDO ||--o{ PEDIDO_STATUS_HISTORICO : registra
    FUNCIONARIO ||--o{ PEDIDO_STATUS_HISTORICO : altera

    PEDIDO ||--o{ PEDIDO_CARTAO : pago_com
    CARTAO_CREDITO ||--o{ PEDIDO_CARTAO : usado_em

    PEDIDO ||--o{ PEDIDO_CUPOM : pago_com
    CUPOM ||--o{ PEDIDO_CUPOM : usado_em
    CLIENTE ||--o{ CUPOM : possui
    PEDIDO ||--o| CUPOM : gera_cupom_troco

    PEDIDO ||--o{ TROCA : origina
    CLIENTE ||--o{ TROCA : solicita
    FUNCIONARIO ||--o{ TROCA : autoriza
    TROCA ||--o{ ITEM_TROCA : contem
    ITEM_PEDIDO ||--o{ ITEM_TROCA : referenciado_em
    TROCA ||--o| CUPOM : gera

    AUTOR ||--o{ LIVRO : escreve
    EDITORA ||--o{ LIVRO : publica
    GRUPO_PRECIFICACAO ||--o{ LIVRO : precifica
    MOTIVO_STATUS_LIVRO ||--o{ LIVRO : justifica_status
    LIVRO ||--o{ LIVRO_CATEGORIA : classificado_em
    CATEGORIA ||--o{ LIVRO_CATEGORIA : agrupa

    FORNECEDOR ||--o{ ENTRADA_ESTOQUE : fornece
    LIVRO ||--o{ ENTRADA_ESTOQUE : recebe
    FUNCIONARIO ||--o{ ENTRADA_ESTOQUE : registra

    LIVRO ||--o{ AVALIACAO : recebe
    CLIENTE ||--o{ AVALIACAO : escreve

    CLIENTE ||--o{ INTERACAO_CHATBOT : conversa
    CLIENTE ||--o{ RECOMENDACAO_IA : recebe
    LIVRO ||--o{ RECOMENDACAO_IA : recomendado_em

    CLIENTE {
        int id_cliente PK
        string codigo_cliente
        string nome
        string genero
        date data_nascimento
        string cpf
        string telefone_tipo
        string telefone_ddd
        string telefone_numero
        string email
        string senha_hash
        decimal ranking
        boolean ativo
        datetime data_cadastro
        datetime data_inativacao
    }

    ENDERECO {
        int id_endereco PK
        int id_cliente FK
        string nome_identificador
        string tipo
        string tipo_residencia
        string tipo_logradouro
        string logradouro
        string numero
        string bairro
        string cep
        string cidade
        string estado
        string pais
        string observacoes
        boolean padrao
    }

    BANDEIRA_CARTAO {
        int id_bandeira PK
        string nome
    }

    CARTAO_CREDITO {
        int id_cartao PK
        int id_cliente FK
        int id_bandeira FK
        string numero_cartao
        string nome_impresso
        string codigo_seguranca
        boolean preferencial
        boolean ativo
    }

    FUNCIONARIO {
        int id_funcionario PK
        string nome
        string email
        string senha_hash
        string perfil
        boolean ativo
        datetime data_cadastro
    }
    AUTOR {
        int id_autor PK
        string nome
    }

    EDITORA {
        int id_editora PK
        string nome
    }

    CATEGORIA {
        int id_categoria PK
        string nome
    }

    LIVRO_CATEGORIA {
        int id_livro FK
        int id_categoria FK
    }

    GRUPO_PRECIFICACAO {
        int id_grupo PK
        string nome
        decimal margem_lucro_percentual
    }

    MOTIVO_STATUS_LIVRO {
        int id_motivo PK
        string descricao
        string tipo
        boolean automatico
    }

    LIVRO {
        int id_livro PK
        string codigo_livro
        string titulo
        string isbn
        int id_autor FK
        int id_editora FK
        int ano_publicacao
        string edicao
        int num_paginas
        text sinopse
        decimal altura
        decimal largura
        decimal peso
        decimal profundidade
        string codigo_barras
        int id_grupo_precificacao FK
        decimal valor_custo
        decimal valor_venda
        int quantidade_estoque
        boolean ativo
        int id_motivo_status FK
        text justificativa_status
        datetime data_cadastro
    }

    FORNECEDOR {
        int id_fornecedor PK
        string nome
        string cnpj
        string contato
    }

    ENTRADA_ESTOQUE {
        int id_entrada PK
        int id_livro FK
        int id_fornecedor FK
        int id_funcionario FK
        int quantidade
        decimal valor_custo
        date data_entrada
    }

    CARRINHO {
        int id_carrinho PK
        int id_cliente FK
        datetime data_criacao
        datetime data_atualizacao
    }

    ITEM_CARRINHO {
        int id_item_carrinho PK
        int id_carrinho FK
        int id_livro FK
        int quantidade
        datetime data_bloqueio
        datetime data_expiracao_bloqueio
        boolean notificado_expiracao
        boolean removido_por_expiracao
    }

    PEDIDO {
        int id_pedido PK
        string codigo_pedido
        int id_cliente FK
        int id_endereco_entrega FK
        string status
        decimal valor_total
        decimal valor_frete
        datetime data_pedido
        datetime data_processamento
        datetime data_transporte
        datetime data_entrega
        string observacao
    }

    ITEM_PEDIDO {
        int id_item_pedido PK
        int id_pedido FK
        int id_livro FK
        int quantidade
        decimal valor_unitario
        decimal valor_total_item
    }

    PEDIDO_STATUS_HISTORICO {
        int id_historico PK
        int id_pedido FK
        int id_funcionario FK
        string status_anterior
        string status_novo
        datetime data_alteracao
    }

    PEDIDO_CARTAO {
        int id_pedido_cartao PK
        int id_pedido FK
        int id_cartao FK
        decimal valor_pago
    }

    CUPOM {
        int id_cupom PK
        string codigo_cupom
        string tipo
        decimal valor
        int id_cliente FK
        int id_pedido_origem FK
        boolean utilizado
        date valido_de
        date valido_ate
    }

    PEDIDO_CUPOM {
        int id_pedido_cupom PK
        int id_pedido FK
        int id_cupom FK
        decimal valor_utilizado
    }

    TROCA {
        int id_troca PK
        int id_pedido FK
        int id_cliente FK
        int id_funcionario_autorizacao FK
        int id_cupom_gerado FK
        string status
        text motivo
        boolean retorna_estoque
        datetime data_solicitacao
        datetime data_autorizacao
        datetime data_processamento
    }

    ITEM_TROCA {
        int id_item_troca PK
        int id_troca FK
        int id_item_pedido FK
        int quantidade
    }

    AVALIACAO {
        int id_avaliacao PK
        int id_livro FK
        int id_cliente FK
        int estrelas
        text comentario
        datetime data_avaliacao
    }

    INTERACAO_CHATBOT {
        int id_interacao PK
        int id_cliente FK
        text mensagem_cliente
        text resposta_ia
        datetime data_interacao
    }

    RECOMENDACAO_IA {
        int id_recomendacao PK
        int id_cliente FK
        int id_livro FK
        decimal score
        string origem
        datetime data_geracao
    }
```

---

## 2. Dicionário de Dados

### 2.1 CLIENTE (RF002x / RN002x / RN0026 / RNF0031-35)
| Campo | Tipo | Descrição |
|---|---|---|
| id_cliente | PK | Identificador interno |
| codigo_cliente | string único | Código único de negócio (RNF0035) |
| nome | string | Nome completo (obrigatório - RN0026) |
| genero | string | Obrigatório - RN0026 |
| data_nascimento | date | Obrigatório - RN0026 |
| cpf | string único | Obrigatório - RN0026 |
| telefone_tipo/ddd/numero | string | Telefone composto (RN0026) |
| email | string único | Obrigatório - RN0026 |
| senha_hash | string | Senha criptografada (RNF0033), forte (RNF0031) |
| ranking | decimal | Ranking numérico do cliente (RN0027) |
| ativo | boolean | Suporta inativação (RF0023) |
| data_cadastro / data_inativacao | datetime | Auditoria |

### 2.2 ENDERECO (RN0021-23 / RF0026 / RNF0034)
Tipo `ENTREGA`, `COBRANCA` ou `AMBOS`. Todo cliente deve ter ao menos um endereço de
cada tipo (RN0021/RN0022). Campos obrigatórios: tipo de residência, tipo de
logradouro, logradouro, número, bairro, CEP, cidade, estado, país (RN0023);
`observacoes` é opcional. `nome_identificador` é a frase curta exigida em RF0026.

### 2.3 BANDEIRA_CARTAO / CARTAO_CREDITO (RN0024-25 / RF0027)
Domínio de bandeiras cadastradas no sistema. Cada cliente pode ter vários cartões,
um marcado como `preferencial` (RF0027). Campos obrigatórios do cartão: número,
nome impresso, bandeira e código de segurança (RN0024).

### 2.4 FUNCIONARIO
Representa usuários administradores/operadores (perfis: `ADMIN`, `GERENTE_VENDAS`,
`OPERADOR_ESTOQUE`). O perfil `GERENTE_VENDAS` é exigido para autorizar alterações
de preço fora da margem de lucro (RN0014).

### 2.5 Catálogo — AUTOR, EDITORA, CATEGORIA, LIVRO_CATEGORIA, GRUPO_PRECIFICACAO, MOTIVO_STATUS_LIVRO, LIVRO (RF001x / RN001x / RNF0021)
- `LIVRO_CATEGORIA` implementa o relacionamento N:N de RN0012 (um livro pode ter
  mais de uma categoria).
- `GRUPO_PRECIFICACAO` define a margem de lucro usada para calcular `valor_venda`
  a partir de `valor_custo` (RN0013/RF0052); alterações abaixo da margem exigem
  autorização de gerente (RN0014).
- `MOTIVO_STATUS_LIVRO` guarda os motivos de ativação/inativação manual e a
  categoria fixa `FORA DE MERCADO` usada na inativação automática (RN0015-17 /
  RF0013).
- Campos obrigatórios do livro: autor, categoria, ano, título, editora, edição,
  ISBN, número de páginas, sinopse, dimensões, grupo de precificação e código de
  barras (RN0011). `codigo_livro` é o código único de negócio (RNF0021).
  `quantidade_estoque` é um saldo derivado, atualizado pelas entradas de estoque e
  pela baixa em vendas aprovadas (RF0053).

### 2.6 FORNECEDOR / ENTRADA_ESTOQUE (RF0051 / RN0050-51 / RN0061-62 / RNF0064)
Toda entrada de estoque exige livro, quantidade (> 0 — RN0061), valor de custo
(RN0062), fornecedor e data de entrada (obrigatória — RNF0064). Quando há
diferentes custos, o cálculo de venda considera o maior custo (RN0051).

### 2.7 CARRINHO / ITEM_CARRINHO (RF0031-32 / RN0031-32 / RN0044-45 / RNF0042)
Um carrinho por cliente. Cada `ITEM_CARRINHO` guarda `data_bloqueio` e
`data_expiracao_bloqueio` para implementar o bloqueio temporário do item (RN0044),
com notificação 5 minutos antes de expirar (`notificado_expiracao`) e remoção
automática (`removido_por_expiracao`) exibida na listagem (RNF0042). A validação
de estoque na adição e na finalização é responsabilidade da camada de aplicação
(RN0031/RN0032), usando `LIVRO.quantidade_estoque`.

### 2.8 PEDIDO / ITEM_PEDIDO / PEDIDO_STATUS_HISTORICO (RF0033-40 / RN0038-40 / RNF0012)
`status` segue o fluxo: `EM_ABERTO` → `EM_PROCESSAMENTO` → `APROVADA`
(pagamento realizado) ou `REPROVADA` → `EM_TRANSITO` → `ENTREGUE` → (opcional)
`EM_TROCA` → `TROCADO`. `PEDIDO_STATUS_HISTORICO` registra cada transição
(usuário/funcionário responsável, data/hora) atendendo ao log de transação
exigido em RNF0012.

### 2.9 PEDIDO_CARTAO / CUPOM / PEDIDO_CUPOM (RF0036-38 / RN0033-37)
- `PEDIDO_CARTAO` permite pagar um pedido com **vários cartões**; cada linha deve
  ter `valor_pago >= 10.00`, exceto quando cupons cobrem o restante (RN0034/RN0035
  — validado na aplicação, pois é uma regra condicional).
- `CUPOM.tipo` é `PROMOCIONAL` ou `TROCA`. Apenas um cupom promocional por compra
  (RN0033), controlado na aplicação/trigger sobre `PEDIDO_CUPOM`.
- Quando o total de cupons usados excede o valor do pedido, gera-se um novo
  `CUPOM` do tipo `TROCA` com a diferença, referenciando `id_pedido_origem`
  (RN0036).

### 2.10 TROCA / ITEM_TROCA (RF0041-45 / RN0041-43 / RN0046)
Somente itens de pedidos `ENTREGUE` podem gerar solicitação de troca (RN0043).
`status`: `SOLICITADA` → `ACEITA`/`NEGADA` → `ITEM_ENVIADO` → `ITEM_RECEBIDO` →
`PROCESSADA`. Ao confirmar recebimento, `retorna_estoque` indica se os itens
voltam ao estoque (gera nova `ENTRADA_ESTOQUE`) e um `CUPOM` do tipo `TROCA` é
gerado para o cliente (RF0045). A autorização gera notificação ao cliente
(RN0046, tratado na camada de aplicação/serviço de notificações).

### 2.11 AVALIACAO (Página de Detalhe do Livro)
Comentário e nota de estrelas (1 a 5) que um cliente registra sobre um livro,
exibidos na página de detalhe do produto, e utilizados como insumo de feedback
para o motor de recomendação por IA (RNF0044-3).

### 2.12 INTERACAO_CHATBOT / RECOMENDACAO_IA (RNF0044 / Recomendação Personalizada)
`INTERACAO_CHATBOT` registra o histórico de conversas do cliente com o assistente
de IA. `RECOMENDACAO_IA` registra as sugestões geradas para cada cliente/livro,
com um `score` de relevância e a `origem` da recomendação
(`HISTORICO_COMPRA`, `PREFERENCIA`, `CHATBOT`, `FEEDBACK`), alimentando o
treinamento contínuo do modelo (RNF0044-3).

---

## 3. Domínios (ENUM) utilizados

| Domínio | Valores |
|---|---|
| `endereco.tipo` | ENTREGA, COBRANCA, AMBOS |
| `funcionario.perfil` | ADMIN, GERENTE_VENDAS, OPERADOR_ESTOQUE |
| `motivo_status_livro.tipo` | ATIVACAO, INATIVACAO |
| `pedido.status` | EM_ABERTO, EM_PROCESSAMENTO, APROVADA, REPROVADA, EM_TRANSITO, ENTREGUE, EM_TROCA, TROCA_AUTORIZADA, TROCADO, CANCELADO |
| `cupom.tipo` | PROMOCIONAL, TROCA |
| `troca.status` | SOLICITADA, ACEITA, NEGADA, ITEM_ENVIADO, ITEM_RECEBIDO, PROCESSADA |
| `recomendacao_ia.origem` | HISTORICO_COMPRA, PREFERENCIA, CHATBOT, FEEDBACK |

O DDL correspondente a este modelo está disponível em `bdd/schema.sql`, pronto
para execução em MySQL 8+.




