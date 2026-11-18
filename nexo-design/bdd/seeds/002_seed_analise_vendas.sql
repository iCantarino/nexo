-- =====================================================================
-- Seed 002 — Massa de dados da análise de vendas por categoria
-- (RF0055 / RNF0043). Determinística e idempotente: os registros são
-- identificados por chaves naturais (codigo_livro, codigo_pedido, email),
-- então rodar de novo, em qualquer máquina, produz o mesmo banco.
--
-- Este arquivo cria cliente, endereço, livros e categorias; os pedidos estão
-- em 003_seed_analise_pedidos.sql.
-- Pré-requisito: schema.sql aplicado (categorias de domínio já existem).
-- Vendas de várias categorias, em meses distintos (jan–jun/2025) e com
-- status variados (ENTREGUE e não ENTREGUE).
--
-- Totais esperados (somente ENTREGUE, valor_total_item):
--   mês      Filosofia  Ciência    Arte   História
--   2025-01     100,00     0,00    0,00      0,00
--   2025-02      50,00   120,00    0,00      0,00
--   2025-03       0,00    80,00   80,00      0,00
--   2025-04     200,00     0,00    0,00      0,00
--   2025-05       0,00     0,00  160,00     60,00
--   2025-06       0,00     0,00    0,00    180,00
-- =====================================================================

INSERT INTO autor (nome)
SELECT 'Autor Seed Análise'
WHERE NOT EXISTS (SELECT 1 FROM autor WHERE nome = 'Autor Seed Análise');

INSERT INTO editora (nome)
SELECT 'Editora Seed Análise'
WHERE NOT EXISTS (SELECT 1 FROM editora WHERE nome = 'Editora Seed Análise');

INSERT INTO cliente (codigo_cliente, nome, genero, data_nascimento, cpf,
                     telefone_tipo, telefone_ddd, telefone_numero, email, senha_hash)
SELECT 'CLI-SEEDANL', 'Cliente Seed Análise', 'Outro', '1990-01-01', '000.000.001-91',
       'Celular', '11', '999999999', 'seed.analise@nexo.com',
       '$2a$10$seedanalise.hash.nao.autentica.0000000000000000000000'
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE email = 'seed.analise@nexo.com');

INSERT INTO endereco (id_cliente, nome_identificador, tipo, tipo_residencia, tipo_logradouro,
                      logradouro, numero, bairro, cep, cidade, estado, pais, padrao)
SELECT c.id_cliente, 'Seed Análise', 'ENTREGA', 'Casa', 'Rua',
       'Seed', '1', 'Centro', '01000-000', 'São Paulo', 'SP', 'Brasil', TRUE
FROM cliente c
WHERE c.email = 'seed.analise@nexo.com'
  AND NOT EXISTS (SELECT 1 FROM endereco e WHERE e.id_cliente = c.id_cliente AND e.nome_identificador = 'Seed Análise');

-- Um livro por categoria
INSERT INTO livro (codigo_livro, titulo, isbn, id_autor, id_editora, ano_publicacao, edicao,
                   num_paginas, sinopse, altura, largura, peso, profundidade, codigo_barras,
                   id_grupo_precificacao, valor_custo, valor_venda, quantidade_estoque, ativo)
SELECT v.codigo, v.titulo, v.isbn, a.id_autor, e.id_editora, 2020, '1ª', 200, 'Livro de massa de teste.',
       21.00, 14.00, 0.400, 2.00, v.isbn,
       (SELECT MIN(id_grupo) FROM grupo_precificacao), v.valor, v.valor, 100, TRUE
FROM (
    SELECT 'SEED-LIV-FIL' AS codigo, 'Seed Filosofia' AS titulo, '9990000000011' AS isbn, 50.00 AS valor
    UNION ALL SELECT 'SEED-LIV-CIE', 'Seed Ciência',   '9990000000012', 40.00
    UNION ALL SELECT 'SEED-LIV-ART', 'Seed Arte',      '9990000000013', 80.00
    UNION ALL SELECT 'SEED-LIV-HIS', 'Seed História',  '9990000000014', 60.00
) v
JOIN autor a ON a.nome = 'Autor Seed Análise'
JOIN editora e ON e.nome = 'Editora Seed Análise'
WHERE NOT EXISTS (SELECT 1 FROM livro l WHERE l.codigo_livro = v.codigo);

INSERT IGNORE INTO livro_categoria (id_livro, id_categoria)
SELECT l.id_livro, c.id_categoria
FROM (
    SELECT 'SEED-LIV-FIL' AS codigo, 'Filosofia' AS categoria
    UNION ALL SELECT 'SEED-LIV-CIE', 'Ciência'
    UNION ALL SELECT 'SEED-LIV-ART', 'Arte'
    UNION ALL SELECT 'SEED-LIV-HIS', 'História'
) m
JOIN livro l ON l.codigo_livro = m.codigo
JOIN categoria c ON c.nome = m.categoria;
