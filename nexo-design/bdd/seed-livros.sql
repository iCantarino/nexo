-- =====================================================
-- NEXO — Seed de livros para demonstração
-- Execute após npm run setup-db:
--   mysql -u root -p nexo_db < "nexo-design/bdd/seed-livros.sql"
-- =====================================================

USE nexo_db;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 1. Autores
-- =============================================
INSERT INTO autor (nome) VALUES
  ('Carlo Rovelli'),
  ('Yuval Noah Harari'),
  ('Stephen Hawking'),
  ('Mia Couto');

-- =============================================
-- 2. Editoras
-- =============================================
INSERT INTO editora (nome) VALUES
  ('Companhia das Letras'),
  ('Intrínseca'),
  ('Objetiva'),
  ('Editora Moçambique');

-- =============================================
-- 3. Fornecedor (para entrada em estoque)
-- =============================================
INSERT INTO fornecedor (nome, cnpj) VALUES
  ('Distribuidora Cultural Ltda', '12.345.678/0001-00');

-- =============================================
-- 4. Livros
-- =============================================
INSERT INTO livro (codigo_livro, titulo, isbn, id_autor, id_editora,
  ano_publicacao, edicao, num_paginas, sinopse, altura, largura, peso, profundidade,
  codigo_barras, id_grupo_precificacao, valor_custo, valor_venda, quantidade_estoque, ativo)
VALUES
  ('LIV-001', 'A Ordem do Tempo', '978-85-1', 1, 1,
   2020, '1ª', 224, 'Uma reflexão fascinante sobre a natureza do tempo e do universo, mesclando física quântica com filosofia.',
   24.00, 16.00, 0.300, 2.00, 'BAR-001', 1, 45.00, 94.90, 50, TRUE),

  ('LIV-002', 'Sapiens - Uma Breve História da Humanidade', '978-85-2', 2, 2,
   2016, '1ª', 464, 'Neste livro magistral, Yuval Noah Harari traça a história da humanidade desde a Idade da Pedra até o século XXI.',
   23.50, 15.50, 0.450, 3.00, 'BAR-002', 2, 55.00, 119.90, 30, TRUE),

  ('LIV-003', 'Uma Breve História do Tempo', '978-85-3', 3, 3,
   2018, '2ª', 256, 'Stephen Hawking explica as teorias do Big Bang, buracos negros e raios de luz em linguagem acessível.',
   23.00, 15.00, 0.320, 2.50, 'BAR-003', 1, 38.00, 89.90, 40, TRUE),

  ('LIV-004', 'Sete Breves Lições de Física', '978-85-4', 1, 1,
   2019, '1ª', 88, 'O físico Carlo Rovelli apresenta sete lições essenciais sobre a revolução científica em andamento.',
   20.00, 13.00, 0.150, 1.50, 'BAR-004', 3, 25.00, 49.90, 60, TRUE);

-- =============================================
-- 5. Categorias dos livros
-- =============================================
INSERT INTO livro_categoria (id_livro, id_categoria) VALUES
  (1, 2), (1, 1),  -- A Ordem do Tempo: Ciência + Filosofia
  (2, 5), (2, 4),  -- Sapiens: Literatura + História
  (3, 2), (3, 1),  -- Breve História: Ciência + Filosofia
  (4, 2), (4, 1);  -- Sete Lições: Ciência + Filosofia

-- =============================================
-- 6. Entrada em estoque
-- =============================================
INSERT INTO entrada_estoque (id_livro, id_fornecedor, id_funcionario, quantidade, valor_custo, data_entrada)
VALUES
  (1, 1, 1, 50, 45.00, CURDATE()),
  (2, 1, 1, 30, 55.00, CURDATE()),
  (3, 1, 1, 40, 38.00, CURDATE()),
  (4, 1, 1, 60, 25.00, CURDATE());

SET FOREIGN_KEY_CHECKS = 1;