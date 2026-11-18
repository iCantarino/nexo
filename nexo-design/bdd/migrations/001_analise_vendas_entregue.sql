-- =====================================================================
-- Migration 001 — Análise de vendas por categoria (RF0055 / RNF0043 / RNF0011)
-- Idempotente: pode ser executada várias vezes sem efeitos colaterais.
--   1. Recria a view vw_vendas_por_categoria_mes contando somente ENTREGUE.
--   2. Cria índices que sustentam a consulta em até 1 segundo (RNF0011).
-- =====================================================================

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
WHERE p.status = 'ENTREGUE'
GROUP BY c.id_categoria, c.nome, DATE_FORMAT(p.data_pedido, '%Y-%m');

SET @ddl = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.statistics
            WHERE table_schema = DATABASE() AND table_name = 'pedido'
              AND index_name = 'idx_pedido_status_data'),
    'SELECT 1',
    'CREATE INDEX idx_pedido_status_data ON pedido (status, data_pedido)'));
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @ddl = (SELECT IF(
    EXISTS (SELECT 1 FROM information_schema.statistics
            WHERE table_schema = DATABASE() AND table_name = 'livro_categoria'
              AND index_name = 'idx_livrocat_categoria_livro'),
    'SELECT 1',
    'CREATE INDEX idx_livrocat_categoria_livro ON livro_categoria (id_categoria, id_livro)'));
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
