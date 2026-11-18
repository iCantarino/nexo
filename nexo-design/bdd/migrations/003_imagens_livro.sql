-- Migration 003: suporte a imagens de livros (capa e galeria)

SET NAMES utf8mb4;

-- Adiciona coluna de capa no livro se ainda não existir
SET @existe_coluna = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'livro' AND column_name = 'imagem_principal_url'
);
SET @sql = IF(@existe_coluna = 0,
    'ALTER TABLE livro ADD COLUMN imagem_principal_url VARCHAR(500) NULL AFTER justificativa_status',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tabela de imagens
CREATE TABLE IF NOT EXISTS livro_imagem (
    id_imagem       INT AUTO_INCREMENT PRIMARY KEY,
    id_livro        INT NOT NULL,
    tipo            ENUM('CAPA', 'GALERIA') NOT NULL DEFAULT 'GALERIA',
    ordem           INT NOT NULL DEFAULT 0,
    url_imagem      VARCHAR(500) NOT NULL,
    nome_arquivo    VARCHAR(255) NOT NULL,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_livroimg_livro FOREIGN KEY (id_livro)
        REFERENCES livro (id_livro) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Cria índice se ainda não existir
SET @existe_idx = (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'livro_imagem' AND index_name = 'idx_livroimg_livro'
);
SET @sql2 = IF(@existe_idx = 0,
    'CREATE INDEX idx_livroimg_livro ON livro_imagem (id_livro)',
    'SELECT 1'
);
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
