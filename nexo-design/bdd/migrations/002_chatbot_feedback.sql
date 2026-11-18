-- =====================================================================
-- Migration 002 — Chatbot feedback e preferências do cliente (RNF0044)
-- Idempotente: pode ser executada várias vezes sem efeitos colaterais.
-- =====================================================================

SET @ddl = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'interacao_chatbot'
              AND column_name = 'livros_sugeridos'),
    'SELECT 1',
    'ALTER TABLE interacao_chatbot ADD COLUMN livros_sugeridos JSON NULL'));
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'interacao_chatbot'
              AND column_name = 'feedback'),
    'SELECT 1',
    "ALTER TABLE interacao_chatbot ADD COLUMN feedback ENUM('UTIL', 'NAO_UTIL') NULL"));
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'interacao_chatbot'
              AND column_name = 'feedback_data'),
    'SELECT 1',
    'ALTER TABLE interacao_chatbot ADD COLUMN feedback_data DATETIME NULL'));
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = 'preferencia_cliente'),
    'SELECT 1',
    "CREATE TABLE preferencia_cliente (
        id_preferencia      INT AUTO_INCREMENT PRIMARY KEY,
        id_cliente          INT NOT NULL,
        categoria           VARCHAR(100) NOT NULL,
        origem              ENUM('EXPLICITO', 'IMPLICITO') NOT NULL DEFAULT 'EXPLICITO',
        data_cadastro       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_preferencia_cliente FOREIGN KEY (id_cliente)
            REFERENCES cliente (id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT uq_preferencia_cliente_categoria UNIQUE (id_cliente, categoria, origem)
    ) ENGINE=InnoDB"));
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.statistics
            WHERE table_schema = DATABASE() AND table_name = 'preferencia_cliente'
              AND index_name = 'idx_preferencia_cliente'),
    'SELECT 1',
    'CREATE INDEX idx_preferencia_cliente ON preferencia_cliente (id_cliente)'));
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
