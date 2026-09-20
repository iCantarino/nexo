-- =====================================================================
-- NEXO — E-COMMERCE DE LIVROS
-- Schema MySQL 8+ baseado em MODELO_DE_DADOS.md / REGRAS_DE_NEGOCIO.md
-- =====================================================================

DROP DATABASE IF EXISTS nexo_db;
CREATE DATABASE nexo_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE nexo_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 1. TABELAS DE DOMÍNIO (RNF0013 - script de implantação com domínios)
-- =====================================================================

CREATE TABLE bandeira_cartao (
    id_bandeira     INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE autor (
    id_autor        INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE editora (
    id_editora      INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE categoria (
    id_categoria    INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE grupo_precificacao (
    id_grupo                    INT AUTO_INCREMENT PRIMARY KEY,
    nome                        VARCHAR(100) NOT NULL UNIQUE,
    margem_lucro_percentual     DECIMAL(6,2) NOT NULL CHECK (margem_lucro_percentual >= 0)
) ENGINE=InnoDB;

-- RN0015-17 / RF0013: motivos de ativação/inativação (manual ou automática)
CREATE TABLE motivo_status_livro (
    id_motivo       INT AUTO_INCREMENT PRIMARY KEY,
    descricao       VARCHAR(150) NOT NULL,
    tipo            ENUM('ATIVACAO', 'INATIVACAO') NOT NULL,
    automatico      BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

CREATE TABLE fornecedor (
    id_fornecedor   INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(150) NOT NULL,
    cnpj            VARCHAR(18) NOT NULL UNIQUE,
    contato         VARCHAR(150)
) ENGINE=InnoDB;

-- =====================================================================
-- 2. FUNCIONÁRIO (perfil ADMIN / GERENTE_VENDAS / OPERADOR_ESTOQUE)
-- =====================================================================

CREATE TABLE funcionario (
    id_funcionario  INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    senha_hash      VARCHAR(255) NOT NULL,
    perfil          ENUM('ADMIN', 'GERENTE_VENDAS', 'OPERADOR_ESTOQUE') NOT NULL,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- 3. CLIENTE, ENDEREÇO, CARTÃO DE CRÉDITO
-- =====================================================================

-- RN0026 / RNF0031-35: dados obrigatórios, senha forte/criptografada, código único
CREATE TABLE cliente (
    id_cliente          INT AUTO_INCREMENT PRIMARY KEY,
    codigo_cliente      VARCHAR(20) NOT NULL UNIQUE,
    nome                VARCHAR(150) NOT NULL,
    genero              VARCHAR(30) NOT NULL,
    data_nascimento     DATE NOT NULL,
    cpf                 VARCHAR(14) NOT NULL UNIQUE,
    telefone_tipo       VARCHAR(20) NOT NULL,
    telefone_ddd        VARCHAR(3) NOT NULL,
    telefone_numero     VARCHAR(15) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    senha_hash          VARCHAR(255) NOT NULL,
    ranking             DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    ativo               BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_inativacao     DATETIME NULL
) ENGINE=InnoDB;

-- RN0021-23 / RF0026 / RNF0034: cada cliente pode ter vários endereços
CREATE TABLE endereco (
    id_endereco         INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente          INT NOT NULL,
    nome_identificador  VARCHAR(100) NOT NULL,
    tipo                ENUM('ENTREGA', 'COBRANCA', 'AMBOS') NOT NULL,
    tipo_residencia     VARCHAR(50) NOT NULL,
    tipo_logradouro     VARCHAR(50) NOT NULL,
    logradouro          VARCHAR(150) NOT NULL,
    numero              VARCHAR(20) NOT NULL,
    bairro              VARCHAR(100) NOT NULL,
    cep                 VARCHAR(10) NOT NULL,
    cidade              VARCHAR(100) NOT NULL,
    estado              VARCHAR(50) NOT NULL,
    pais                VARCHAR(60) NOT NULL,
    observacoes         VARCHAR(255) NULL,
    padrao              BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_endereco_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_endereco_cliente ON endereco (id_cliente);

-- RN0024-25 / RF0027: cartões associados ao cliente, com bandeira e preferencial
CREATE TABLE cartao_credito (
    id_cartao           INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente          INT NOT NULL,
    id_bandeira         INT NOT NULL,
    numero_cartao       VARCHAR(25) NOT NULL,
    nome_impresso       VARCHAR(150) NOT NULL,
    codigo_seguranca    VARCHAR(4) NOT NULL,
    preferencial        BOOLEAN NOT NULL DEFAULT FALSE,
    ativo               BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_cartao_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cartao_bandeira FOREIGN KEY (id_bandeira)
        REFERENCES bandeira_cartao (id_bandeira) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_cartao_cliente ON cartao_credito (id_cliente);

-- =====================================================================
-- 4. CATÁLOGO DE LIVROS (RF001x / RN001x / RNF0021)
-- =====================================================================

-- RN0011: campos obrigatórios do livro
CREATE TABLE livro (
    id_livro                INT AUTO_INCREMENT PRIMARY KEY,
    codigo_livro            VARCHAR(20) NOT NULL UNIQUE,
    titulo                  VARCHAR(200) NOT NULL,
    isbn                    VARCHAR(20) NOT NULL UNIQUE,
    id_autor                INT NOT NULL,
    id_editora              INT NOT NULL,
    ano_publicacao          SMALLINT NOT NULL,
    edicao                  VARCHAR(30) NOT NULL,
    num_paginas             INT NOT NULL CHECK (num_paginas > 0),
    sinopse                 TEXT NOT NULL,
    altura                  DECIMAL(6,2) NOT NULL,
    largura                 DECIMAL(6,2) NOT NULL,
    peso                    DECIMAL(6,3) NOT NULL,
    profundidade            DECIMAL(6,2) NOT NULL,
    codigo_barras           VARCHAR(30) NOT NULL UNIQUE,
    id_grupo_precificacao   INT NOT NULL,
    valor_custo             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    valor_venda             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quantidade_estoque      INT NOT NULL DEFAULT 0,
    ativo                   BOOLEAN NOT NULL DEFAULT TRUE,
    id_motivo_status        INT NULL,
    justificativa_status    TEXT NULL,
    data_cadastro           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_livro_autor FOREIGN KEY (id_autor)
        REFERENCES autor (id_autor) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_livro_editora FOREIGN KEY (id_editora)
        REFERENCES editora (id_editora) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_livro_grupo_precificacao FOREIGN KEY (id_grupo_precificacao)
        REFERENCES grupo_precificacao (id_grupo) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_livro_motivo_status FOREIGN KEY (id_motivo_status)
        REFERENCES motivo_status_livro (id_motivo) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_livro_titulo ON livro (titulo);
CREATE INDEX idx_livro_autor ON livro (id_autor);
CREATE INDEX idx_livro_editora ON livro (id_editora);
CREATE INDEX idx_livro_ativo ON livro (ativo);

-- RN0012: um livro pode estar associado a mais de uma categoria (N:N)
CREATE TABLE livro_categoria (
    id_livro        INT NOT NULL,
    id_categoria    INT NOT NULL,
    PRIMARY KEY (id_livro, id_categoria),
    CONSTRAINT fk_livrocat_livro FOREIGN KEY (id_livro)
        REFERENCES livro (id_livro) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_livrocat_categoria FOREIGN KEY (id_categoria)
        REFERENCES categoria (id_categoria) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- RF0051 / RN0050-51 / RN0061-62 / RNF0064: entrada em estoque
CREATE TABLE entrada_estoque (
    id_entrada      INT AUTO_INCREMENT PRIMARY KEY,
    id_livro        INT NOT NULL,
    id_fornecedor   INT NOT NULL,
    id_funcionario  INT NOT NULL,
    quantidade      INT NOT NULL CHECK (quantidade > 0),
    valor_custo     DECIMAL(10,2) NOT NULL CHECK (valor_custo >= 0),
    data_entrada    DATE NOT NULL,
    CONSTRAINT fk_entrada_livro FOREIGN KEY (id_livro)
        REFERENCES livro (id_livro) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_entrada_fornecedor FOREIGN KEY (id_fornecedor)
        REFERENCES fornecedor (id_fornecedor) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_entrada_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario (id_funcionario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_entrada_livro ON entrada_estoque (id_livro);

-- =====================================================================
-- 5. CARRINHO DE COMPRAS (RF0031-32 / RN0031-32 / RN0044-45 / RNF0042)
-- =====================================================================

CREATE TABLE carrinho (
    id_carrinho         INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente          INT NOT NULL UNIQUE,
    data_criacao        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_carrinho_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- RN0044-45: bloqueio temporário de item no carrinho, com expiração e notificação
CREATE TABLE item_carrinho (
    id_item_carrinho            INT AUTO_INCREMENT PRIMARY KEY,
    id_carrinho                 INT NOT NULL,
    id_livro                    INT NOT NULL,
    quantidade                  INT NOT NULL CHECK (quantidade > 0),
    data_bloqueio                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_expiracao_bloqueio      DATETIME NOT NULL,
    notificado_expiracao         BOOLEAN NOT NULL DEFAULT FALSE,
    removido_por_expiracao       BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_itemcarrinho_carrinho FOREIGN KEY (id_carrinho)
        REFERENCES carrinho (id_carrinho) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_itemcarrinho_livro FOREIGN KEY (id_livro)
        REFERENCES livro (id_livro) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_itemcarrinho_carrinho ON item_carrinho (id_carrinho);
CREATE INDEX idx_itemcarrinho_expiracao ON item_carrinho (data_expiracao_bloqueio);

-- =====================================================================
-- 6. PEDIDO / ITEM_PEDIDO / HISTÓRICO DE STATUS (RF0033-40 / RN0038-40 / RNF0012)
-- =====================================================================

-- Fluxo de status: EM_ABERTO -> EM_PROCESSAMENTO -> APROVADA/REPROVADA ->
-- EM_TRANSITO -> ENTREGUE -> EM_TROCA -> TROCA_AUTORIZADA -> TROCADO
CREATE TABLE pedido (
    id_pedido               INT AUTO_INCREMENT PRIMARY KEY,
    codigo_pedido           VARCHAR(20) NOT NULL UNIQUE,
    id_cliente              INT NOT NULL,
    id_endereco_entrega     INT NOT NULL,
    status                  ENUM('EM_ABERTO', 'EM_PROCESSAMENTO', 'APROVADA', 'REPROVADA',
                                  'EM_TRANSITO', 'ENTREGUE', 'EM_TROCA', 'TROCA_AUTORIZADA',
                                  'TROCADO', 'CANCELADO') NOT NULL DEFAULT 'EM_ABERTO',
    valor_total             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    valor_frete             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    data_pedido             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_processamento      DATETIME NULL,
    data_transporte         DATETIME NULL,
    data_entrega            DATETIME NULL,
    observacao              VARCHAR(255) NULL,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pedido_endereco FOREIGN KEY (id_endereco_entrega)
        REFERENCES endereco (id_endereco) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_pedido_cliente ON pedido (id_cliente);
CREATE INDEX idx_pedido_status ON pedido (status);
CREATE INDEX idx_pedido_data ON pedido (data_pedido);

CREATE TABLE item_pedido (
    id_item_pedido      INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido           INT NOT NULL,
    id_livro            INT NOT NULL,
    quantidade          INT NOT NULL CHECK (quantidade > 0),
    valor_unitario      DECIMAL(10,2) NOT NULL,
    valor_total_item    DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_itempedido_pedido FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_itempedido_livro FOREIGN KEY (id_livro)
        REFERENCES livro (id_livro) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_itempedido_pedido ON item_pedido (id_pedido);
CREATE INDEX idx_itempedido_livro ON item_pedido (id_livro);

-- RNF0012: log de transação de mudança de status do pedido
CREATE TABLE pedido_status_historico (
    id_historico        INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido           INT NOT NULL,
    id_funcionario      INT NULL,
    status_anterior     VARCHAR(30) NULL,
    status_novo         VARCHAR(30) NOT NULL,
    data_alteracao      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historico_pedido FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_historico_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario (id_funcionario) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_historico_pedido ON pedido_status_historico (id_pedido);

-- =====================================================================
-- 7. PAGAMENTO COMBINADO: CARTÕES + CUPONS (RF0036-38 / RN0033-37)
-- =====================================================================

-- RF0037 / RN0034: uma compra pode ser paga com vários cartões (mínimo R$10,00
-- por cartão, exceto quando cupons cobrem o restante — validado na aplicação)
CREATE TABLE pedido_cartao (
    id_pedido_cartao    INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido           INT NOT NULL,
    id_cartao           INT NOT NULL,
    valor_pago          DECIMAL(10,2) NOT NULL CHECK (valor_pago > 0),
    CONSTRAINT fk_pedidocartao_pedido FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pedidocartao_cartao FOREIGN KEY (id_cartao)
        REFERENCES cartao_credito (id_cartao) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_pedidocartao_pedido ON pedido_cartao (id_pedido);

-- RN0033 / RN0036: cupom promocional (1 por compra) ou cupom de troca (gerado
-- quando o valor de cupons usados excede o valor da compra)
CREATE TABLE cupom (
    id_cupom            INT AUTO_INCREMENT PRIMARY KEY,
    codigo_cupom        VARCHAR(30) NOT NULL UNIQUE,
    tipo                ENUM('PROMOCIONAL', 'TROCA') NOT NULL,
    valor               DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    id_cliente          INT NOT NULL,
    id_pedido_origem    INT NULL,
    utilizado           BOOLEAN NOT NULL DEFAULT FALSE,
    valido_de           DATE NOT NULL,
    valido_ate          DATE NOT NULL,
    CONSTRAINT fk_cupom_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cupom_pedido_origem FOREIGN KEY (id_pedido_origem)
        REFERENCES pedido (id_pedido) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_cupom_validade CHECK (valido_ate >= valido_de)
) ENGINE=InnoDB;

CREATE INDEX idx_cupom_cliente ON cupom (id_cliente);

-- RF0037 / RN0035-36: cupons utilizados no pagamento de um pedido
CREATE TABLE pedido_cupom (
    id_pedido_cupom     INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido           INT NOT NULL,
    id_cupom            INT NOT NULL,
    valor_utilizado     DECIMAL(10,2) NOT NULL CHECK (valor_utilizado > 0),
    CONSTRAINT fk_pedidocupom_pedido FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pedidocupom_cupom FOREIGN KEY (id_cupom)
        REFERENCES cupom (id_cupom) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_pedido_cupom UNIQUE (id_pedido, id_cupom)
) ENGINE=InnoDB;

CREATE INDEX idx_pedidocupom_pedido ON pedido_cupom (id_pedido);

-- =====================================================================
-- 8. TROCAS (RF0041-45 / RN0041-43 / RN0046)
-- =====================================================================

-- RN0043: somente itens de pedidos ENTREGUE podem gerar solicitação de troca
CREATE TABLE troca (
    id_troca                        INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido                       INT NOT NULL,
    id_cliente                      INT NOT NULL,
    id_funcionario_autorizacao      INT NULL,
    id_cupom_gerado                 INT NULL,
    status                          ENUM('SOLICITADA', 'ACEITA', 'NEGADA', 'ITEM_ENVIADO',
                                          'ITEM_RECEBIDO', 'PROCESSADA') NOT NULL DEFAULT 'SOLICITADA',
    motivo                          TEXT NOT NULL,
    retorna_estoque                 BOOLEAN NULL,
    data_solicitacao                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_autorizacao                DATETIME NULL,
    data_processamento               DATETIME NULL,
    CONSTRAINT fk_troca_pedido FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_troca_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_troca_funcionario FOREIGN KEY (id_funcionario_autorizacao)
        REFERENCES funcionario (id_funcionario) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_troca_cupom FOREIGN KEY (id_cupom_gerado)
        REFERENCES cupom (id_cupom) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_troca_pedido ON troca (id_pedido);
CREATE INDEX idx_troca_cliente ON troca (id_cliente);
CREATE INDEX idx_troca_status ON troca (status);

CREATE TABLE item_troca (
    id_item_troca       INT AUTO_INCREMENT PRIMARY KEY,
    id_troca            INT NOT NULL,
    id_item_pedido       INT NOT NULL,
    quantidade          INT NOT NULL CHECK (quantidade > 0),
    CONSTRAINT fk_itemtroca_troca FOREIGN KEY (id_troca)
        REFERENCES troca (id_troca) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_itemtroca_itempedido FOREIGN KEY (id_item_pedido)
        REFERENCES item_pedido (id_item_pedido) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_itemtroca_troca ON item_troca (id_troca);

-- =====================================================================
-- 9. AVALIAÇÕES (página de detalhe do livro: comentários e estrelas)
-- =====================================================================

CREATE TABLE avaliacao (
    id_avaliacao    INT AUTO_INCREMENT PRIMARY KEY,
    id_livro        INT NOT NULL,
    id_cliente      INT NOT NULL,
    estrelas        TINYINT NOT NULL CHECK (estrelas BETWEEN 1 AND 5),
    comentario      TEXT NULL,
    data_avaliacao  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_avaliacao_livro FOREIGN KEY (id_livro)
        REFERENCES livro (id_livro) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_avaliacao_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_avaliacao_livro_cliente UNIQUE (id_livro, id_cliente)
) ENGINE=InnoDB;

CREATE INDEX idx_avaliacao_livro ON avaliacao (id_livro);

-- =====================================================================
-- 10. RECOMENDAÇÃO PERSONALIZADA POR IA / CHATBOT (RNF0044)
-- =====================================================================

CREATE TABLE interacao_chatbot (
    id_interacao        INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente          INT NOT NULL,
    mensagem_cliente    TEXT NOT NULL,
    resposta_ia         TEXT NOT NULL,
    data_interacao      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interacao_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_interacao_cliente ON interacao_chatbot (id_cliente);

CREATE TABLE recomendacao_ia (
    id_recomendacao     INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente          INT NOT NULL,
    id_livro            INT NOT NULL,
    score               DECIMAL(5,4) NOT NULL CHECK (score BETWEEN 0 AND 1),
    origem              ENUM('HISTORICO_COMPRA', 'PREFERENCIA', 'CHATBOT', 'FEEDBACK') NOT NULL,
    data_geracao        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recomendacao_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_recomendacao_livro FOREIGN KEY (id_livro)
        REFERENCES livro (id_livro) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_recomendacao_cliente ON recomendacao_ia (id_cliente);

-- =====================================================================
-- 11. LOG DE AUDITORIA (RNF0012 — toda escrita registra usuário/dados alterados)
-- =====================================================================

CREATE TABLE log_auditoria (
    id_log              INT AUTO_INCREMENT PRIMARY KEY,
    tabela_afetada      VARCHAR(60) NOT NULL,
    id_registro         INT NOT NULL,
    operacao            ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    id_funcionario      INT NULL,
    id_cliente          INT NULL,
    dados_alterados     JSON NULL,
    data_hora           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario (id_funcionario) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_log_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_log_tabela ON log_auditoria (tabela_afetada, id_registro);

-- =====================================================================
-- 12. VIEW DE ANÁLISE GERENCIAL (RF0055-58 / RN0071-74)
-- =====================================================================
-- Agrupa o valor de vendas por categoria e mês, considerando somente pedidos
-- com status APROVADA, EM_TRANSITO ou ENTREGUE (RN0074).
CREATE OR REPLACE VIEW vw_vendas_por_categoria_mes AS
SELECT
    c.id_categoria,
    c.nome AS categoria,
    DATE_FORMAT(p.data_pedido, '%Y-%m') AS ano_mes,
    SUM(ip.valor_total_item) AS valor_total_vendas
FROM pedido p
JOIN item_pedido ip ON ip.id_pedido = p.id_pedido
JOIN livro l ON l.id_livro = ip.id_livro
JOIN livro_categoria lc ON lc.id_livro = l.id_livro
JOIN categoria c ON c.id_categoria = lc.id_categoria
WHERE p.status IN ('APROVADA', 'EM_TRANSITO', 'ENTREGUE')
GROUP BY c.id_categoria, c.nome, DATE_FORMAT(p.data_pedido, '%Y-%m');

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 13. SEEDS DE DOMÍNIO (RNF0013 — script de implantação com tabelas de domínio)
-- =====================================================================

INSERT INTO bandeira_cartao (nome) VALUES
    ('Visa'), ('Mastercard'), ('Elo'), ('American Express'), ('Hipercard');

INSERT INTO categoria (nome) VALUES
    ('Filosofia'), ('Ciência'), ('Arte'), ('História'), ('Literatura'), ('Biografia');

INSERT INTO grupo_precificacao (nome, margem_lucro_percentual) VALUES
    ('Padrão', 40.00),
    ('Premium', 60.00),
    ('Promocional', 20.00);

INSERT INTO motivo_status_livro (descricao, tipo, automatico) VALUES
    ('Fora de mercado', 'INATIVACAO', TRUE),
    ('Baixa demanda', 'INATIVACAO', FALSE),
    ('Erro de cadastro', 'INATIVACAO', FALSE),
    ('Reposição de estoque', 'ATIVACAO', FALSE),
    ('Reavaliação editorial', 'ATIVACAO', FALSE);

-- Usuário administrador inicial para acesso ao painel administrativo
-- (senha de exemplo já hasheada — deve ser trocada em produção)
INSERT INTO funcionario (nome, email, senha_hash, perfil) VALUES
    ('Administrador Nexo', 'admin@nexo.com', '$2y$10$examplehashvalueonly1234567890abcdef', 'ADMIN');

-- =====================================================================
-- FIM DO SCRIPT
-- =====================================================================
