-- =====================================================
-- NEXO — Seed de dados para demonstração do Chatbot IA (RNF0044)
-- Execute após npm run setup-db e seed-livros.sql:
--   mysql -u root -p nexo_db < "nexo-design/bdd/seeds/004_seed_chatbot.sql"
-- =====================================================

USE nexo_db;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO autor (nome) VALUES
  ('Friedrich Nietzsche'),
  ('Erich Auerbach'),
  ('Johannes Itten'),
  ('E.H. Gombrich'),
  ('Aristóteles');

INSERT INTO editora (nome) VALUES
  ('WMF Martins Fontes'),
  ('Perspectiva'),
  ('Gustavo Gili'),
  ('Phaidon'),
  ('Editora 34');


INSERT INTO livro (codigo_livro, titulo, isbn, id_autor, id_editora,
  ano_publicacao, edicao, num_paginas, sinopse, altura, largura, peso, profundidade,
  codigo_barras, id_grupo_precificacao, valor_custo, valor_venda, quantidade_estoque, ativo)
VALUES
  ('LIV-005', 'Além do Bem e do Mal', '978-85-5', 5, 5,
   2001, '1ª', 320, 'Uma das obras mais importantes de Nietzsche, examinando a moral, a religião e a filosofia ocidental.',
   23.00, 15.50, 0.380, 2.50, 'BAR-005', 1, 42.00, 72.50, 40, TRUE),
  ('LIV-006', 'Mimesis', '978-85-6', 6, 6,
   2013, '1ª', 576, 'Erich Auerbach analisa a representação da realidade na literatura ocidental.',
   24.00, 16.50, 0.650, 3.00, 'BAR-006', 2, 95.00, 149.90, 25, TRUE),
  ('LIV-007', 'Design e Forma', '978-85-7', 7, 7,
   2015, 'Revisada', 128, 'Johannes Itten apresenta os fundamentos do design e da cor, base do ensino da Bauhaus.',
   28.00, 21.00, 0.520, 1.50, 'BAR-007', 2, 78.00, 119.90, 30, TRUE),
  ('LIV-008', 'A História da Arte', '978-85-8', 8, 8,
   2012, '16ª', 688, 'Clássico de E.H. Gombrich, apresenta a história da arte de forma acessível.',
   26.00, 19.00, 1.200, 3.50, 'BAR-008', 2, 110.00, 179.90, 20, TRUE),
  ('LIV-009', 'Ética a Nicômaco', '978-85-9', 9, 5,
   2019, '3ª', 432, 'Aristóteles desenvolve sua teoria da virtude, da felicidade e da vida boa.',
   22.00, 14.00, 0.320, 2.00, 'BAR-009', 1, 32.00, 59.90, 50, TRUE);

INSERT INTO livro_categoria (id_livro, id_categoria) VALUES
  (5, 1),
  (6, 4), (6, 5),
  (7, 3), (7, 1),
  (8, 3), (8, 4),
  (9, 1);

INSERT INTO entrada_estoque (id_livro, id_fornecedor, id_funcionario, quantidade, valor_custo, data_entrada)
VALUES
  (5, 1, 1, 40, 42.00, CURDATE()),
  (6, 1, 1, 25, 95.00, CURDATE()),
  (7, 1, 1, 30, 78.00, CURDATE()),
  (8, 1, 1, 20, 110.00, CURDATE()),
  (9, 1, 1, 50, 32.00, CURDATE());

INSERT INTO cliente (codigo_cliente, nome, genero, data_nascimento, cpf, telefone_tipo, telefone_ddd, telefone_numero, email, senha_hash, ativo)
VALUES
  ('CLI-ARTHUR', 'Arthur Silva', 'Masculino', '1995-03-15', '111.222.333-44', 'CELULAR', '11', '91234-5678', 'arthur@nexo.com', '$2a$10$gH/FnKWHN8eF6OCL/5EoQe/8dLLSnT3sxXLQQAbFiGU/FDEsGmRoe', TRUE),
  ('CLI-MARINA', 'Marina Lopes', 'Feminino', '1992-07-22', '555.666.777-88', 'CELULAR', '21', '98765-4321', 'marina@nexo.com', '$2a$10$gH/FnKWHN8eF6OCL/5EoQe/8dLLSnT3sxXLQQAbFiGU/FDEsGmRoe', TRUE);

INSERT INTO endereco (id_cliente, nome_identificador, tipo, tipo_residencia, tipo_logradouro, logradouro, numero, bairro, cep, cidade, estado, pais, padrao)
VALUES
  (1, 'Casa', 'ENTREGA', 'Casa', 'Rua', 'Av. Paulista', '1000', 'Bela Vista', '01310-100', 'São Paulo', 'SP', 'Brasil', TRUE),
  (2, 'Apartamento', 'ENTREGA', 'Apartamento', 'Rua', 'Rua do Ouvidor', '50', 'Centro', '20040-030', 'Rio de Janeiro', 'RJ', 'Brasil', TRUE);

INSERT INTO pedido (codigo_pedido, id_cliente, id_endereco_entrega, status, valor_total, valor_frete, data_pedido, data_entrega)
VALUES
  ('PED-001', 1, 1, 'ENTREGUE', 184.80, 15.00, '2026-01-10 10:00:00', '2026-01-15 14:00:00'),
  ('PED-002', 1, 1, 'ENTREGUE', 89.90, 10.00, '2026-02-05 16:30:00', '2026-02-10 11:00:00'),
  ('PED-003', 2, 2, 'ENTREGUE', 299.80, 20.00, '2026-01-20 09:00:00', '2026-01-25 17:00:00'),
  ('PED-004', 2, 2, 'ENTREGUE', 119.90, 12.00, '2026-03-08 13:45:00', '2026-03-12 10:00:00');

INSERT INTO item_pedido (id_pedido, id_livro, quantidade, valor_unitario, valor_total_item)
VALUES
  (1, 1, 1, 94.90, 94.90),
  (1, 9, 1, 59.90, 59.90),
  (1, 4, 1, 49.90, 49.90),
  (2, 3, 1, 89.90, 89.90),
  (3, 7, 1, 119.90, 119.90),
  (3, 8, 1, 179.90, 179.90),
  (4, 6, 1, 149.90, 149.90);


INSERT INTO avaliacao (id_livro, id_cliente, estrelas, comentario)
VALUES
  (1, 1, 5, 'Lindo mergulho na física e no tempo.'),
  (9, 2, 5, 'Texto fundamental para quem estuda filosofia.'),
  (3, 1, 4, 'Acessível e inspirador.'),
  (7, 3, 5, 'Base essencial para estudantes de design.'),
  (8, 3, 5, 'Referência obrigatória para história da arte.'),
  (6, 2, 4, 'Obra erudita e fascinante.');

INSERT INTO preferencia_cliente (id_cliente, categoria, origem)
VALUES
  (1, 'Mecânica Quântica', 'EXPLICITO'),
  (1, 'Filosofia', 'EXPLICITO'),
  (1, 'Estoicismo', 'EXPLICITO'),
  (2, 'Design Bauhaus', 'EXPLICITO'),
  (2, 'Idealismo Alemão', 'EXPLICITO'),
  (2, 'Estética', 'EXPLICITO');

INSERT INTO interacao_chatbot (id_cliente, mensagem_cliente, resposta_ia, livros_sugeridos, feedback, feedback_data, data_interacao)
VALUES
  (1, 'Tem algo de física quântica?', 'Recomendo "A Ordem do Tempo" de Carlo Rovelli. {"livros_recomendados": [1]}', '[1]', 'UTIL', '2026-02-12 10:00:00', '2026-02-12 09:55:00'),
  (1, 'E algo de filosofia clássica?', 'Sugiro a "Ética a Nicômaco" de Aristóteles. {"livros_recomendados": [9]}', '[9]', 'UTIL', '2026-02-12 10:05:00', '2026-02-12 10:00:00'),
  (2, 'Você indica livros sobre design?', 'Recomendo "Design e Forma" de Johannes Itten. {"livros_recomendados": [7]}', '[7]', 'UTIL', '2026-03-15 14:00:00', '2026-03-15 13:50:00'),
  (2, 'Algo sobre história da arte?', 'Sugiro "A História da Arte" de E.H. Gombrich. {"livros_recomendados": [8]}', '[8]', 'NAO_UTIL', '2026-03-15 14:10:00', '2026-03-15 14:05:00');

SET FOREIGN_KEY_CHECKS = 1;
