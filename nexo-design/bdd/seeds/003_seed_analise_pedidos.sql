-- =====================================================================
-- Seed 003 — Pedidos e itens da massa de análise (ver 002 para os totais
-- esperados). Idempotente por codigo_pedido. Requer o seed 002.
-- valor_total do pedido = soma dos itens (frete fora da análise).
-- =====================================================================

INSERT INTO pedido (codigo_pedido, id_cliente, id_endereco_entrega, status, valor_total, data_pedido)
SELECT p.codigo, cl.id_cliente, en.id_endereco, p.status, p.qtd * p.valor, p.data_pedido
FROM (
    SELECT 'SEED-ANL-001' AS codigo, 'ENTREGUE' AS status, '2025-01-10 10:00:00' AS data_pedido, 2 AS qtd, 50.00 AS valor
    UNION ALL SELECT 'SEED-ANL-002', 'ENTREGUE',         '2025-02-12 10:00:00', 1, 50.00
    UNION ALL SELECT 'SEED-ANL-003', 'ENTREGUE',         '2025-02-20 10:00:00', 3, 40.00
    UNION ALL SELECT 'SEED-ANL-004', 'ENTREGUE',         '2025-03-05 10:00:00', 2, 40.00
    UNION ALL SELECT 'SEED-ANL-005', 'ENTREGUE',         '2025-03-15 10:00:00', 1, 80.00
    UNION ALL SELECT 'SEED-ANL-006', 'ENTREGUE',         '2025-04-08 10:00:00', 4, 50.00
    UNION ALL SELECT 'SEED-ANL-007', 'ENTREGUE',         '2025-05-02 10:00:00', 2, 80.00
    UNION ALL SELECT 'SEED-ANL-008', 'ENTREGUE',         '2025-05-18 10:00:00', 1, 60.00
    UNION ALL SELECT 'SEED-ANL-009', 'APROVADA',         '2025-02-25 10:00:00', 5, 50.00
    UNION ALL SELECT 'SEED-ANL-010', 'EM_TRANSITO',      '2025-03-20 10:00:00', 5, 40.00
    UNION ALL SELECT 'SEED-ANL-011', 'REPROVADA',        '2025-04-10 10:00:00', 3, 80.00
    UNION ALL SELECT 'SEED-ANL-012', 'CANCELADO',        '2025-05-10 10:00:00', 2, 60.00
    UNION ALL SELECT 'SEED-ANL-013', 'EM_PROCESSAMENTO', '2025-06-03 10:00:00', 1, 50.00
    UNION ALL SELECT 'SEED-ANL-014', 'ENTREGUE',         '2025-06-14 10:00:00', 3, 60.00
) p
JOIN cliente cl ON cl.email = 'seed.analise@nexo.com'
JOIN endereco en ON en.id_cliente = cl.id_cliente AND en.nome_identificador = 'Seed Análise'
WHERE NOT EXISTS (SELECT 1 FROM pedido x WHERE x.codigo_pedido = p.codigo);

INSERT INTO item_pedido (id_pedido, id_livro, quantidade, valor_unitario, valor_total_item)
SELECT pe.id_pedido, l.id_livro, p.qtd, p.valor, p.qtd * p.valor
FROM (
    SELECT 'SEED-ANL-001' AS codigo, 'SEED-LIV-FIL' AS livro, 2 AS qtd, 50.00 AS valor
    UNION ALL SELECT 'SEED-ANL-002', 'SEED-LIV-FIL', 1, 50.00
    UNION ALL SELECT 'SEED-ANL-003', 'SEED-LIV-CIE', 3, 40.00
    UNION ALL SELECT 'SEED-ANL-004', 'SEED-LIV-CIE', 2, 40.00
    UNION ALL SELECT 'SEED-ANL-005', 'SEED-LIV-ART', 1, 80.00
    UNION ALL SELECT 'SEED-ANL-006', 'SEED-LIV-FIL', 4, 50.00
    UNION ALL SELECT 'SEED-ANL-007', 'SEED-LIV-ART', 2, 80.00
    UNION ALL SELECT 'SEED-ANL-008', 'SEED-LIV-HIS', 1, 60.00
    UNION ALL SELECT 'SEED-ANL-009', 'SEED-LIV-FIL', 5, 50.00
    UNION ALL SELECT 'SEED-ANL-010', 'SEED-LIV-CIE', 5, 40.00
    UNION ALL SELECT 'SEED-ANL-011', 'SEED-LIV-ART', 3, 80.00
    UNION ALL SELECT 'SEED-ANL-012', 'SEED-LIV-HIS', 2, 60.00
    UNION ALL SELECT 'SEED-ANL-013', 'SEED-LIV-FIL', 1, 50.00
    UNION ALL SELECT 'SEED-ANL-014', 'SEED-LIV-HIS', 3, 60.00
) p
JOIN pedido pe ON pe.codigo_pedido = p.codigo
JOIN livro l ON l.codigo_livro = p.livro
WHERE NOT EXISTS (SELECT 1 FROM item_pedido ip WHERE ip.id_pedido = pe.id_pedido);
