-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: nexo_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `autor`
--

DROP TABLE IF EXISTS `autor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autor` (
  `id_autor` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_autor`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autor`
--

LOCK TABLES `autor` WRITE;
/*!40000 ALTER TABLE `autor` DISABLE KEYS */;
INSERT INTO `autor` VALUES (1,'Carlo Rovelli'),(2,'Yuval Noah Harari'),(3,'Stephen Hawking'),(4,'Mia Couto'),(5,'Friedrich Nietzsche'),(6,'Erich Auerbach'),(7,'Johannes Itten'),(8,'E.H. Gombrich'),(9,'Arist├│teles'),(10,'Autor Seed Análise');
/*!40000 ALTER TABLE `autor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avaliacao`
--

DROP TABLE IF EXISTS `avaliacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avaliacao` (
  `id_avaliacao` int NOT NULL AUTO_INCREMENT,
  `id_livro` int NOT NULL,
  `id_cliente` int NOT NULL,
  `estrelas` tinyint NOT NULL,
  `comentario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `data_avaliacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_avaliacao`),
  UNIQUE KEY `uq_avaliacao_livro_cliente` (`id_livro`,`id_cliente`),
  KEY `fk_avaliacao_cliente` (`id_cliente`),
  KEY `idx_avaliacao_livro` (`id_livro`),
  CONSTRAINT `fk_avaliacao_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_avaliacao_livro` FOREIGN KEY (`id_livro`) REFERENCES `livro` (`id_livro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `avaliacao_chk_1` CHECK ((`estrelas` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacao`
--

LOCK TABLES `avaliacao` WRITE;
/*!40000 ALTER TABLE `avaliacao` DISABLE KEYS */;
INSERT INTO `avaliacao` VALUES (1,1,1,5,'Lindo mergulho na f├¡sica e no tempo.','2026-11-14 19:05:12'),(2,9,2,5,'Texto fundamental para quem estuda filosofia.','2026-11-14 19:05:12'),(3,3,1,4,'Acess├¡vel e inspirador.','2026-11-14 19:05:12'),(4,7,3,5,'Base essencial para estudantes de design.','2026-11-14 19:05:12'),(5,8,3,5,'Refer├¬ncia obrigat├│ria para hist├│ria da arte.','2026-11-14 19:05:12'),(6,6,2,4,'Obra erudita e fascinante.','2026-11-14 19:05:12');
/*!40000 ALTER TABLE `avaliacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bandeira_cartao`
--

DROP TABLE IF EXISTS `bandeira_cartao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bandeira_cartao` (
  `id_bandeira` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_bandeira`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bandeira_cartao`
--

LOCK TABLES `bandeira_cartao` WRITE;
/*!40000 ALTER TABLE `bandeira_cartao` DISABLE KEYS */;
INSERT INTO `bandeira_cartao` VALUES (4,'American Express'),(3,'Elo'),(5,'Hipercard'),(2,'Mastercard'),(1,'Visa');
/*!40000 ALTER TABLE `bandeira_cartao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carrinho`
--

DROP TABLE IF EXISTS `carrinho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrinho` (
  `id_carrinho` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `data_criacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_carrinho`),
  UNIQUE KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `fk_carrinho_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrinho`
--

LOCK TABLES `carrinho` WRITE;
/*!40000 ALTER TABLE `carrinho` DISABLE KEYS */;
/*!40000 ALTER TABLE `carrinho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cartao_credito`
--

DROP TABLE IF EXISTS `cartao_credito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartao_credito` (
  `id_cartao` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `id_bandeira` int NOT NULL,
  `numero_cartao` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_impresso` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_seguranca` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferencial` tinyint(1) NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_cartao`),
  KEY `fk_cartao_bandeira` (`id_bandeira`),
  KEY `idx_cartao_cliente` (`id_cliente`),
  CONSTRAINT `fk_cartao_bandeira` FOREIGN KEY (`id_bandeira`) REFERENCES `bandeira_cartao` (`id_bandeira`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_cartao_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartao_credito`
--

LOCK TABLES `cartao_credito` WRITE;
/*!40000 ALTER TABLE `cartao_credito` DISABLE KEYS */;
/*!40000 ALTER TABLE `cartao_credito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (3,'Arte'),(6,'Biografia'),(2,'Ci├¬ncia'),(1,'Filosofia'),(4,'Hist├│ria'),(5,'Literatura');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `codigo_cliente` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `genero` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_nascimento` date NOT NULL,
  `cpf` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefone_tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefone_ddd` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefone_numero` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ranking` decimal(5,2) NOT NULL DEFAULT '0.00',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `data_cadastro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_inativacao` datetime DEFAULT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `codigo_cliente` (`codigo_cliente`),
  UNIQUE KEY `cpf` (`cpf`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'CLI-ARTHUR','Arthur Silva','Masculino','1995-03-15','111.222.333-44','CELULAR','11','91234-5678','arthur@nexo.com','$2a$10$gH/FnKWHN8eF6OCL/5EoQe/8dLLSnT3sxXLQQAbFiGU/FDEsGmRoe',0.00,1,'2026-11-14 19:05:12',NULL),(2,'CLI-MARINA','Marina Lopes','Feminino','1992-07-22','555.666.777-88','CELULAR','21','98765-4321','marina@nexo.com','$2a$10$gH/FnKWHN8eF6OCL/5EoQe/8dLLSnT3sxXLQQAbFiGU/FDEsGmRoe',0.00,1,'2026-11-14 19:05:12',NULL),(3,'CLI-SEEDANL','Cliente Seed Análise','Outro','1990-01-01','000.000.001-91','Celular','11','999999999','seed.analise@nexo.com','$2a$10$seedanalise.hash.nao.autentica.0000000000000000000000',0.00,1,'2026-11-19 06:59:52',NULL);
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupom`
--

DROP TABLE IF EXISTS `cupom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupom` (
  `id_cupom` int NOT NULL AUTO_INCREMENT,
  `codigo_cupom` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('PROMOCIONAL','TROCA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `id_cliente` int NOT NULL,
  `id_pedido_origem` int DEFAULT NULL,
  `utilizado` tinyint(1) NOT NULL DEFAULT '0',
  `valido_de` date NOT NULL,
  `valido_ate` date NOT NULL,
  PRIMARY KEY (`id_cupom`),
  UNIQUE KEY `codigo_cupom` (`codigo_cupom`),
  KEY `fk_cupom_pedido_origem` (`id_pedido_origem`),
  KEY `idx_cupom_cliente` (`id_cliente`),
  CONSTRAINT `fk_cupom_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cupom_pedido_origem` FOREIGN KEY (`id_pedido_origem`) REFERENCES `pedido` (`id_pedido`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_cupom_validade` CHECK ((`valido_ate` >= `valido_de`)),
  CONSTRAINT `cupom_chk_1` CHECK ((`valor` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupom`
--

LOCK TABLES `cupom` WRITE;
/*!40000 ALTER TABLE `cupom` DISABLE KEYS */;
/*!40000 ALTER TABLE `cupom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupom_catalogo`
--

DROP TABLE IF EXISTS `cupom_catalogo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupom_catalogo` (
  `id_cupom_catalogo` int NOT NULL AUTO_INCREMENT,
  `codigo_cupom` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('PROMOCIONAL','TROCA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `percentual` decimal(5,2) DEFAULT NULL,
  `valor_fixo` decimal(10,2) DEFAULT NULL,
  `apenas_primeira_compra` tinyint(1) NOT NULL DEFAULT '0',
  `uso_unico_por_cliente` tinyint(1) NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_cupom_catalogo`),
  UNIQUE KEY `codigo_cupom` (`codigo_cupom`),
  CONSTRAINT `chk_catalogo_valor` CHECK (((`percentual` is not null) <> (`valor_fixo` is not null)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupom_catalogo`
--

LOCK TABLES `cupom_catalogo` WRITE;
/*!40000 ALTER TABLE `cupom_catalogo` DISABLE KEYS */;
INSERT INTO `cupom_catalogo` VALUES (1,'TESTE','Cupom de teste: 15% de desconto nos itens','PROMOCIONAL',15.00,NULL,0,0,1),(2,'PRIMEIRACOMPRA','20% de desconto nos itens da primeira compra','PROMOCIONAL',20.00,NULL,1,0,1),(3,'TESTETROCA','Cupom de troca de teste: R$ 50,00 (uso ├║nico/cliente)','TROCA',NULL,50.00,0,1,1);
/*!40000 ALTER TABLE `cupom_catalogo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `editora`
--

DROP TABLE IF EXISTS `editora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `editora` (
  `id_editora` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_editora`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `editora`
--

LOCK TABLES `editora` WRITE;
/*!40000 ALTER TABLE `editora` DISABLE KEYS */;
INSERT INTO `editora` VALUES (1,'Companhia das Letras'),(2,'Intr├¡nseca'),(3,'Objetiva'),(4,'Editora Mo├ºambique'),(5,'WMF Martins Fontes'),(6,'Perspectiva'),(7,'Gustavo Gili'),(8,'Phaidon'),(9,'Editora 34'),(10,'Editora Seed Análise');
/*!40000 ALTER TABLE `editora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `endereco`
--

DROP TABLE IF EXISTS `endereco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `endereco` (
  `id_endereco` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `nome_identificador` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('ENTREGA','COBRANCA','AMBOS') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_residencia` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_logradouro` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logradouro` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bairro` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cep` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cidade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pais` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `observacoes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `padrao` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_endereco`),
  KEY `idx_endereco_cliente` (`id_cliente`),
  CONSTRAINT `fk_endereco_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `endereco`
--

LOCK TABLES `endereco` WRITE;
/*!40000 ALTER TABLE `endereco` DISABLE KEYS */;
INSERT INTO `endereco` VALUES (1,1,'Casa','ENTREGA','Casa','Rua','Av. Paulista','1000','Bela Vista','01310-100','S├úo Paulo','SP','Brasil',NULL,1),(2,2,'Apartamento','ENTREGA','Apartamento','Rua','Rua do Ouvidor','50','Centro','20040-030','Rio de Janeiro','RJ','Brasil',NULL,1),(3,3,'Seed Análise','ENTREGA','Casa','Rua','Seed','1','Centro','01000-000','São Paulo','SP','Brasil',NULL,1);
/*!40000 ALTER TABLE `endereco` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entrada_estoque`
--

DROP TABLE IF EXISTS `entrada_estoque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrada_estoque` (
  `id_entrada` int NOT NULL AUTO_INCREMENT,
  `id_livro` int NOT NULL,
  `id_fornecedor` int NOT NULL,
  `id_funcionario` int NOT NULL,
  `quantidade` int NOT NULL,
  `valor_custo` decimal(10,2) NOT NULL,
  `data_entrada` date NOT NULL,
  PRIMARY KEY (`id_entrada`),
  KEY `fk_entrada_fornecedor` (`id_fornecedor`),
  KEY `fk_entrada_funcionario` (`id_funcionario`),
  KEY `idx_entrada_livro` (`id_livro`),
  CONSTRAINT `fk_entrada_fornecedor` FOREIGN KEY (`id_fornecedor`) REFERENCES `fornecedor` (`id_fornecedor`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_entrada_funcionario` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_entrada_livro` FOREIGN KEY (`id_livro`) REFERENCES `livro` (`id_livro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `entrada_estoque_chk_1` CHECK ((`quantidade` > 0)),
  CONSTRAINT `entrada_estoque_chk_2` CHECK ((`valor_custo` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrada_estoque`
--

LOCK TABLES `entrada_estoque` WRITE;
/*!40000 ALTER TABLE `entrada_estoque` DISABLE KEYS */;
INSERT INTO `entrada_estoque` VALUES (1,1,1,1,50,45.00,'2026-11-14'),(2,2,1,1,30,55.00,'2026-11-14'),(3,3,1,1,40,38.00,'2026-11-14'),(4,4,1,1,60,25.00,'2026-11-14'),(5,5,1,1,40,42.00,'2026-11-14'),(6,6,1,1,25,95.00,'2026-11-14'),(7,7,1,1,30,78.00,'2026-11-14'),(8,8,1,1,20,110.00,'2026-11-14'),(9,9,1,1,50,32.00,'2026-11-14');
/*!40000 ALTER TABLE `entrada_estoque` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fornecedor`
--

DROP TABLE IF EXISTS `fornecedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fornecedor` (
  `id_fornecedor` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnpj` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contato` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_fornecedor`),
  UNIQUE KEY `cnpj` (`cnpj`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fornecedor`
--

LOCK TABLES `fornecedor` WRITE;
/*!40000 ALTER TABLE `fornecedor` DISABLE KEYS */;
INSERT INTO `fornecedor` VALUES (1,'Distribuidora Cultural Ltda','12.345.678/0001-00',NULL);
/*!40000 ALTER TABLE `fornecedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funcionario`
--

DROP TABLE IF EXISTS `funcionario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcionario` (
  `id_funcionario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `perfil` enum('ADMIN','GERENTE_VENDAS','OPERADOR_ESTOQUE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `data_cadastro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_funcionario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcionario`
--

LOCK TABLES `funcionario` WRITE;
/*!40000 ALTER TABLE `funcionario` DISABLE KEYS */;
INSERT INTO `funcionario` VALUES (1,'Administrador Nexo','admin@nexo.com','$2a$10$Mgfl98ttT0fvatf5pFzYhOHzmQBxhA4wYB4ECnLEtlDz8tG1ASvgS','ADMIN',1,'2026-11-14 19:05:12');
/*!40000 ALTER TABLE `funcionario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo_precificacao`
--

DROP TABLE IF EXISTS `grupo_precificacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo_precificacao` (
  `id_grupo` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `margem_lucro_percentual` decimal(6,2) NOT NULL,
  PRIMARY KEY (`id_grupo`),
  UNIQUE KEY `nome` (`nome`),
  CONSTRAINT `grupo_precificacao_chk_1` CHECK ((`margem_lucro_percentual` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo_precificacao`
--

LOCK TABLES `grupo_precificacao` WRITE;
/*!40000 ALTER TABLE `grupo_precificacao` DISABLE KEYS */;
INSERT INTO `grupo_precificacao` VALUES (1,'Padr├úo',40.00),(2,'Premium',60.00),(3,'Promocional',20.00);
/*!40000 ALTER TABLE `grupo_precificacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interacao_chatbot`
--

DROP TABLE IF EXISTS `interacao_chatbot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interacao_chatbot` (
  `id_interacao` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `mensagem_cliente` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `resposta_ia` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `livros_sugeridos` json DEFAULT NULL,
  `feedback` enum('UTIL','NAO_UTIL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `feedback_data` datetime DEFAULT NULL,
  `data_interacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_interacao`),
  KEY `idx_interacao_cliente` (`id_cliente`),
  CONSTRAINT `fk_interacao_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interacao_chatbot`
--

LOCK TABLES `interacao_chatbot` WRITE;
/*!40000 ALTER TABLE `interacao_chatbot` DISABLE KEYS */;
INSERT INTO `interacao_chatbot` VALUES (1,1,'Tem algo de f├¡sica qu├óntica?','Recomendo \"A Ordem do Tempo\" de Carlo Rovelli. {\"livros_recomendados\": [1]}','[1]','UTIL','2026-02-12 10:00:00','2026-02-12 09:55:00'),(2,1,'E algo de filosofia cl├íssica?','Sugiro a \"├ëtica a Nic├┤maco\" de Arist├│teles. {\"livros_recomendados\": [9]}','[9]','UTIL','2026-02-12 10:05:00','2026-02-12 10:00:00'),(3,2,'Voc├¬ indica livros sobre design?','Recomendo \"Design e Forma\" de Johannes Itten. {\"livros_recomendados\": [7]}','[7]','UTIL','2026-03-15 14:00:00','2026-03-15 13:50:00'),(4,2,'Algo sobre hist├│ria da arte?','Sugiro \"A Hist├│ria da Arte\" de E.H. Gombrich. {\"livros_recomendados\": [8]}','[8]','NAO_UTIL','2026-03-15 14:10:00','2026-03-15 14:05:00'),(5,1,'Recomende um livro de f├¡sica qu├óntica','Arthur, recomendo **ÔÇ£A Ordem do TempoÔÇØ (ID 1)**, de Carlo Rovelli. O livro combina f├¡sica qu├óntica e filosofia para explorar a natureza do tempo e do universo ÔÇö uma ├│tima escolha, especialmente porque voc├¬ avaliou essa obra com 5 estrelas.','[1]','UTIL','2026-11-14 22:07:10','2026-11-14 22:07:05'),(6,2,'Sugira um livro sobre hist├│ria da arte','Marina, recomendo **ÔÇ£A Hist├│ria da ArteÔÇØ**, de E.H. Gombrich. ├ë um cl├íssico acess├¡vel que percorre o desenvolvimento da arte ao longo da hist├│ria, alinhando-se diretamente ao seu interesse por arte e hist├│ria ÔÇö e voc├¬ j├í demonstrou interesse pelo tema.','[8]',NULL,NULL,'2026-11-14 22:09:39'),(7,1,'Indique um livro de filosofia','Arthur, recomendo **ÔÇ£Al├®m do Bem e do MalÔÇØ (ID 5)**, de Nietzsche. A obra investiga a moral, a religi├úo e os fundamentos da filosofia ocidental, sendo uma excelente escolha para complementar sua leitura de **ÔÇ£├ëtica a Nic├┤macoÔÇØ**.','[5]','UTIL','2026-11-14 22:11:46','2026-11-14 22:11:46');
/*!40000 ALTER TABLE `interacao_chatbot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_carrinho`
--

DROP TABLE IF EXISTS `item_carrinho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_carrinho` (
  `id_item_carrinho` int NOT NULL AUTO_INCREMENT,
  `id_carrinho` int NOT NULL,
  `id_livro` int NOT NULL,
  `quantidade` int NOT NULL,
  `data_bloqueio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_expiracao_bloqueio` datetime NOT NULL,
  `notificado_expiracao` tinyint(1) NOT NULL DEFAULT '0',
  `removido_por_expiracao` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_item_carrinho`),
  KEY `fk_itemcarrinho_livro` (`id_livro`),
  KEY `idx_itemcarrinho_carrinho` (`id_carrinho`),
  KEY `idx_itemcarrinho_expiracao` (`data_expiracao_bloqueio`),
  CONSTRAINT `fk_itemcarrinho_carrinho` FOREIGN KEY (`id_carrinho`) REFERENCES `carrinho` (`id_carrinho`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_itemcarrinho_livro` FOREIGN KEY (`id_livro`) REFERENCES `livro` (`id_livro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `item_carrinho_chk_1` CHECK ((`quantidade` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_carrinho`
--

LOCK TABLES `item_carrinho` WRITE;
/*!40000 ALTER TABLE `item_carrinho` DISABLE KEYS */;
/*!40000 ALTER TABLE `item_carrinho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_pedido`
--

DROP TABLE IF EXISTS `item_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_pedido` (
  `id_item_pedido` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_livro` int NOT NULL,
  `quantidade` int NOT NULL,
  `valor_unitario` decimal(10,2) NOT NULL,
  `valor_total_item` decimal(10,2) NOT NULL,
  `quantidade_trocada` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_item_pedido`),
  KEY `idx_itempedido_pedido` (`id_pedido`),
  KEY `idx_itempedido_livro` (`id_livro`),
  CONSTRAINT `fk_itempedido_livro` FOREIGN KEY (`id_livro`) REFERENCES `livro` (`id_livro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_itempedido_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `item_pedido_chk_1` CHECK ((`quantidade` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_pedido`
--

LOCK TABLES `item_pedido` WRITE;
/*!40000 ALTER TABLE `item_pedido` DISABLE KEYS */;
INSERT INTO `item_pedido` VALUES (1,1,1,1,94.90,94.90,0),(2,1,9,1,59.90,59.90,0),(3,1,4,1,49.90,49.90,0),(4,2,3,1,89.90,89.90,0),(5,3,7,1,119.90,119.90,0),(6,3,8,1,179.90,179.90,0),(7,4,6,1,149.90,149.90,0),(8,5,10,2,50.00,100.00,0),(9,6,10,1,50.00,50.00,0),(10,7,11,3,40.00,120.00,0),(11,8,11,2,40.00,80.00,0),(12,9,12,1,80.00,80.00,0),(13,10,10,4,50.00,200.00,0),(14,11,12,2,80.00,160.00,0),(15,12,13,1,60.00,60.00,0),(16,13,10,5,50.00,250.00,0),(17,14,11,5,40.00,200.00,0),(18,15,12,3,80.00,240.00,0),(19,16,13,2,60.00,120.00,0),(20,17,10,1,50.00,50.00,0),(21,18,13,3,60.00,180.00,0);
/*!40000 ALTER TABLE `item_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_troca`
--

DROP TABLE IF EXISTS `item_troca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_troca` (
  `id_item_troca` int NOT NULL AUTO_INCREMENT,
  `id_troca` int NOT NULL,
  `id_item_pedido` int NOT NULL,
  `quantidade` int NOT NULL,
  PRIMARY KEY (`id_item_troca`),
  KEY `fk_itemtroca_itempedido` (`id_item_pedido`),
  KEY `idx_itemtroca_troca` (`id_troca`),
  CONSTRAINT `fk_itemtroca_itempedido` FOREIGN KEY (`id_item_pedido`) REFERENCES `item_pedido` (`id_item_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_itemtroca_troca` FOREIGN KEY (`id_troca`) REFERENCES `troca` (`id_troca`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `item_troca_chk_1` CHECK ((`quantidade` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_troca`
--

LOCK TABLES `item_troca` WRITE;
/*!40000 ALTER TABLE `item_troca` DISABLE KEYS */;
/*!40000 ALTER TABLE `item_troca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `livro`
--

DROP TABLE IF EXISTS `livro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `livro` (
  `id_livro` int NOT NULL AUTO_INCREMENT,
  `codigo_livro` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `isbn` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_autor` int NOT NULL,
  `id_editora` int NOT NULL,
  `ano_publicacao` smallint NOT NULL,
  `edicao` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `num_paginas` int NOT NULL,
  `sinopse` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `altura` decimal(6,2) NOT NULL,
  `largura` decimal(6,2) NOT NULL,
  `peso` decimal(6,3) NOT NULL,
  `profundidade` decimal(6,2) NOT NULL,
  `codigo_barras` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_grupo_precificacao` int NOT NULL,
  `valor_custo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valor_venda` decimal(10,2) NOT NULL DEFAULT '0.00',
  `quantidade_estoque` int NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `id_motivo_status` int DEFAULT NULL,
  `justificativa_status` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `imagem_principal_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_cadastro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_livro`),
  UNIQUE KEY `codigo_livro` (`codigo_livro`),
  UNIQUE KEY `isbn` (`isbn`),
  UNIQUE KEY `codigo_barras` (`codigo_barras`),
  KEY `fk_livro_grupo_precificacao` (`id_grupo_precificacao`),
  KEY `fk_livro_motivo_status` (`id_motivo_status`),
  KEY `idx_livro_titulo` (`titulo`),
  KEY `idx_livro_autor` (`id_autor`),
  KEY `idx_livro_editora` (`id_editora`),
  KEY `idx_livro_ativo` (`ativo`),
  CONSTRAINT `fk_livro_autor` FOREIGN KEY (`id_autor`) REFERENCES `autor` (`id_autor`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_livro_editora` FOREIGN KEY (`id_editora`) REFERENCES `editora` (`id_editora`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_livro_grupo_precificacao` FOREIGN KEY (`id_grupo_precificacao`) REFERENCES `grupo_precificacao` (`id_grupo`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_livro_motivo_status` FOREIGN KEY (`id_motivo_status`) REFERENCES `motivo_status_livro` (`id_motivo`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `livro_chk_1` CHECK ((`num_paginas` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `livro`
--

LOCK TABLES `livro` WRITE;
/*!40000 ALTER TABLE `livro` DISABLE KEYS */;
INSERT INTO `livro` VALUES (1,'LIV-001','A Ordem do Tempo','978-85-1',1,1,2020,'1┬¬',224,'Uma reflex├úo fascinante sobre a natureza do tempo e do universo, mesclando f├¡sica qu├óntica com filosofia.',24.00,16.00,0.300,2.00,'BAR-001',1,45.00,94.90,50,1,NULL,NULL,NULL,'2026-11-14 19:05:12'),(2,'LIV-002','Sapiens - Uma Breve Hist├│ria da Humanidade','978-85-2',2,2,2016,'1┬¬',464,'Neste livro magistral, Yuval Noah Harari tra├ºa a hist├│ria da humanidade desde a Idade da Pedra at├® o s├®culo XXI.',23.50,15.50,0.450,3.00,'BAR-002',2,55.00,119.90,30,1,NULL,NULL,NULL,'2026-11-14 19:05:12'),(3,'LIV-003','Uma Breve Hist├│ria do Tempo','978-85-3',3,3,2018,'2┬¬',256,'Stephen Hawking explica as teorias do Big Bang, buracos negros e raios de luz em linguagem acess├¡vel.',23.00,15.00,0.320,2.50,'BAR-003',1,38.00,89.90,40,1,NULL,NULL,NULL,'2026-11-14 19:05:12'),(4,'LIV-004','Sete Breves Li├º├Áes de F├¡sica','978-85-4',1,1,2019,'1┬¬',88,'O f├¡sico Carlo Rovelli apresenta sete li├º├Áes essenciais sobre a revolu├º├úo cient├¡fica em andamento.',20.00,13.00,0.150,1.50,'BAR-004',3,25.00,49.90,60,1,NULL,NULL,NULL,'2026-11-14 19:05:12'),(5,'LIV-005','Al├®m do Bem e do Mal','978-85-5',5,5,2001,'1┬¬',320,'Uma das obras mais importantes de Nietzsche, examinando a moral, a religi├úo e a filosofia ocidental.',23.00,15.50,0.380,2.50,'BAR-005',1,42.00,72.50,40,1,NULL,NULL,NULL,'2026-11-14 19:05:12'),(6,'LIV-006','Mimesis','978-85-6',6,6,2013,'1┬¬',576,'Erich Auerbach analisa a representa├º├úo da realidade na literatura ocidental.',24.00,16.50,0.650,3.00,'BAR-006',2,95.00,149.90,25,1,NULL,NULL,NULL,'2026-11-14 19:05:12'),(7,'LIV-007','Design e Forma','978-85-7',7,7,2015,'Revisada',128,'Johannes Itten apresenta os fundamentos do design e da cor, base do ensino da Bauhaus.',28.00,21.00,0.520,1.50,'BAR-007',2,78.00,119.90,30,1,NULL,NULL,NULL,'2026-11-14 19:05:12'),(8,'LIV-008','A Hist├│ria da Arte','978-85-8',8,8,2012,'16┬¬',688,'Cl├íssico de E.H. Gombrich, apresenta a hist├│ria da arte de forma acess├¡vel.',26.00,19.00,1.200,3.50,'BAR-008',2,110.00,179.90,20,1,NULL,NULL,NULL,'2026-11-14 19:05:12'),(9,'LIV-009','├ëtica a Nic├┤maco','978-85-9',9,5,2019,'3┬¬',432,'Arist├│teles desenvolve sua teoria da virtude, da felicidade e da vida boa.',22.00,14.00,0.320,2.00,'BAR-009',1,32.00,59.90,50,1,NULL,NULL,NULL,'2026-11-14 19:05:12'),(10,'SEED-LIV-FIL','Seed Filosofia','9990000000011',10,10,2020,'1ª',200,'Livro de massa de teste.',21.00,14.00,0.400,2.00,'9990000000011',1,50.00,50.00,100,1,NULL,NULL,NULL,'2026-11-19 06:59:52'),(11,'SEED-LIV-CIE','Seed Ciência','9990000000012',10,10,2020,'1ª',200,'Livro de massa de teste.',21.00,14.00,0.400,2.00,'9990000000012',1,40.00,40.00,100,1,NULL,NULL,NULL,'2026-11-19 06:59:52'),(12,'SEED-LIV-ART','Seed Arte','9990000000013',10,10,2020,'1ª',200,'Livro de massa de teste.',21.00,14.00,0.400,2.00,'9990000000013',1,80.00,80.00,100,1,NULL,NULL,NULL,'2026-11-19 06:59:52'),(13,'SEED-LIV-HIS','Seed História','9990000000014',10,10,2020,'1ª',200,'Livro de massa de teste.',21.00,14.00,0.400,2.00,'9990000000014',1,60.00,60.00,100,1,NULL,NULL,NULL,'2026-11-19 06:59:52');
/*!40000 ALTER TABLE `livro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `livro_categoria`
--

DROP TABLE IF EXISTS `livro_categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `livro_categoria` (
  `id_livro` int NOT NULL,
  `id_categoria` int NOT NULL,
  PRIMARY KEY (`id_livro`,`id_categoria`),
  KEY `idx_livrocat_categoria_livro` (`id_categoria`,`id_livro`),
  CONSTRAINT `fk_livrocat_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_livrocat_livro` FOREIGN KEY (`id_livro`) REFERENCES `livro` (`id_livro`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `livro_categoria`
--

LOCK TABLES `livro_categoria` WRITE;
/*!40000 ALTER TABLE `livro_categoria` DISABLE KEYS */;
INSERT INTO `livro_categoria` VALUES (1,1),(1,2),(2,4),(2,5),(3,1),(3,2),(4,1),(4,2),(5,1),(6,4),(6,5),(7,1),(7,3),(8,3),(8,4),(9,1),(10,1),(12,3);
/*!40000 ALTER TABLE `livro_categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `livro_imagem`
--

DROP TABLE IF EXISTS `livro_imagem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `livro_imagem` (
  `id_imagem` int NOT NULL AUTO_INCREMENT,
  `id_livro` int NOT NULL,
  `tipo` enum('CAPA','GALERIA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GALERIA',
  `ordem` int NOT NULL DEFAULT '0',
  `url_imagem` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_arquivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `data_cadastro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_imagem`),
  KEY `idx_livroimg_livro` (`id_livro`),
  CONSTRAINT `fk_livroimg_livro` FOREIGN KEY (`id_livro`) REFERENCES `livro` (`id_livro`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `livro_imagem`
--

LOCK TABLES `livro_imagem` WRITE;
/*!40000 ALTER TABLE `livro_imagem` DISABLE KEYS */;
/*!40000 ALTER TABLE `livro_imagem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_auditoria`
--

DROP TABLE IF EXISTS `log_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_auditoria` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `tabela_afetada` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_registro` int NOT NULL,
  `operacao` enum('INSERT','UPDATE','DELETE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_funcionario` int DEFAULT NULL,
  `id_cliente` int DEFAULT NULL,
  `dados_alterados` json DEFAULT NULL,
  `data_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `fk_log_funcionario` (`id_funcionario`),
  KEY `fk_log_cliente` (`id_cliente`),
  KEY `idx_log_tabela` (`tabela_afetada`,`id_registro`),
  CONSTRAINT `fk_log_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_log_funcionario` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_auditoria`
--

LOCK TABLES `log_auditoria` WRITE;
/*!40000 ALTER TABLE `log_auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `log_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `motivo_status_livro`
--

DROP TABLE IF EXISTS `motivo_status_livro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `motivo_status_livro` (
  `id_motivo` int NOT NULL AUTO_INCREMENT,
  `descricao` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('ATIVACAO','INATIVACAO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `automatico` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_motivo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `motivo_status_livro`
--

LOCK TABLES `motivo_status_livro` WRITE;
/*!40000 ALTER TABLE `motivo_status_livro` DISABLE KEYS */;
INSERT INTO `motivo_status_livro` VALUES (1,'Fora de mercado','INATIVACAO',1),(2,'Baixa demanda','INATIVACAO',0),(3,'Erro de cadastro','INATIVACAO',0),(4,'Reposi├º├úo de estoque','ATIVACAO',0),(5,'Reavalia├º├úo editorial','ATIVACAO',0);
/*!40000 ALTER TABLE `motivo_status_livro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimentacao_estoque`
--

DROP TABLE IF EXISTS `movimentacao_estoque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimentacao_estoque` (
  `id_movimentacao` int NOT NULL AUTO_INCREMENT,
  `id_livro` int NOT NULL,
  `tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` int NOT NULL,
  `id_pedido` int DEFAULT NULL,
  `id_troca` int DEFAULT NULL,
  `data_movimentacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimentacao`),
  KEY `fk_movest_livro` (`id_livro`),
  KEY `idx_movest_pedido` (`id_pedido`),
  CONSTRAINT `fk_movest_livro` FOREIGN KEY (`id_livro`) REFERENCES `livro` (`id_livro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `movimentacao_estoque_chk_1` CHECK ((`quantidade` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimentacao_estoque`
--

LOCK TABLES `movimentacao_estoque` WRITE;
/*!40000 ALTER TABLE `movimentacao_estoque` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimentacao_estoque` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacao`
--

DROP TABLE IF EXISTS `notificacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacao` (
  `id_notificacao` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `tipo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensagem` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_pedido` int DEFAULT NULL,
  `id_troca` int DEFAULT NULL,
  `lida` tinyint(1) NOT NULL DEFAULT '0',
  `data_criacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacao`),
  KEY `idx_notificacao_cliente` (`id_cliente`),
  CONSTRAINT `fk_notificacao_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacao`
--

LOCK TABLES `notificacao` WRITE;
/*!40000 ALTER TABLE `notificacao` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido`
--

DROP TABLE IF EXISTS `pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `codigo_pedido` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_cliente` int NOT NULL,
  `id_endereco_entrega` int NOT NULL,
  `status` enum('EM_ABERTO','EM_PROCESSAMENTO','APROVADA','REPROVADA','EM_TRANSITO','ENTREGUE','EM_TROCA','TROCA_AUTORIZADA','TROCADO','CANCELADO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EM_ABERTO',
  `valor_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valor_frete` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valor_pix` decimal(10,2) NOT NULL DEFAULT '0.00',
  `data_pedido` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_processamento` datetime DEFAULT NULL,
  `data_transporte` datetime DEFAULT NULL,
  `data_entrega` datetime DEFAULT NULL,
  `observacao` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_pedido`),
  UNIQUE KEY `codigo_pedido` (`codigo_pedido`),
  KEY `fk_pedido_endereco` (`id_endereco_entrega`),
  KEY `idx_pedido_cliente` (`id_cliente`),
  KEY `idx_pedido_status` (`status`),
  KEY `idx_pedido_data` (`data_pedido`),
  KEY `idx_pedido_status_data` (`status`,`data_pedido`),
  CONSTRAINT `fk_pedido_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pedido_endereco` FOREIGN KEY (`id_endereco_entrega`) REFERENCES `endereco` (`id_endereco`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
INSERT INTO `pedido` VALUES (1,'PED-001',1,1,'ENTREGUE',184.80,15.00,0.00,'2026-01-10 10:00:00',NULL,NULL,'2026-01-15 14:00:00',NULL),(2,'PED-002',1,1,'ENTREGUE',89.90,10.00,0.00,'2026-02-05 16:30:00',NULL,NULL,'2026-02-10 11:00:00',NULL),(3,'PED-003',2,2,'ENTREGUE',299.80,20.00,0.00,'2026-01-20 09:00:00',NULL,NULL,'2026-01-25 17:00:00',NULL),(4,'PED-004',2,2,'ENTREGUE',119.90,12.00,0.00,'2026-03-08 13:45:00',NULL,NULL,'2026-03-12 10:00:00',NULL),(5,'SEED-ANL-001',3,3,'ENTREGUE',100.00,0.00,0.00,'2025-01-10 10:00:00',NULL,NULL,NULL,NULL),(6,'SEED-ANL-002',3,3,'ENTREGUE',50.00,0.00,0.00,'2025-02-12 10:00:00',NULL,NULL,NULL,NULL),(7,'SEED-ANL-003',3,3,'ENTREGUE',120.00,0.00,0.00,'2025-02-20 10:00:00',NULL,NULL,NULL,NULL),(8,'SEED-ANL-004',3,3,'ENTREGUE',80.00,0.00,0.00,'2025-03-05 10:00:00',NULL,NULL,NULL,NULL),(9,'SEED-ANL-005',3,3,'ENTREGUE',80.00,0.00,0.00,'2025-03-15 10:00:00',NULL,NULL,NULL,NULL),(10,'SEED-ANL-006',3,3,'ENTREGUE',200.00,0.00,0.00,'2025-04-08 10:00:00',NULL,NULL,NULL,NULL),(11,'SEED-ANL-007',3,3,'ENTREGUE',160.00,0.00,0.00,'2025-05-02 10:00:00',NULL,NULL,NULL,NULL),(12,'SEED-ANL-008',3,3,'ENTREGUE',60.00,0.00,0.00,'2025-05-18 10:00:00',NULL,NULL,NULL,NULL),(13,'SEED-ANL-009',3,3,'APROVADA',250.00,0.00,0.00,'2025-02-25 10:00:00',NULL,NULL,NULL,NULL),(14,'SEED-ANL-010',3,3,'EM_TRANSITO',200.00,0.00,0.00,'2025-03-20 10:00:00',NULL,NULL,NULL,NULL),(15,'SEED-ANL-011',3,3,'REPROVADA',240.00,0.00,0.00,'2025-04-10 10:00:00',NULL,NULL,NULL,NULL),(16,'SEED-ANL-012',3,3,'CANCELADO',120.00,0.00,0.00,'2025-05-10 10:00:00',NULL,NULL,NULL,NULL),(17,'SEED-ANL-013',3,3,'EM_PROCESSAMENTO',50.00,0.00,0.00,'2025-06-03 10:00:00',NULL,NULL,NULL,NULL),(18,'SEED-ANL-014',3,3,'ENTREGUE',180.00,0.00,0.00,'2025-06-14 10:00:00',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_cartao`
--

DROP TABLE IF EXISTS `pedido_cartao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_cartao` (
  `id_pedido_cartao` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_cartao` int NOT NULL,
  `valor_pago` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_pedido_cartao`),
  KEY `fk_pedidocartao_cartao` (`id_cartao`),
  KEY `idx_pedidocartao_pedido` (`id_pedido`),
  CONSTRAINT `fk_pedidocartao_cartao` FOREIGN KEY (`id_cartao`) REFERENCES `cartao_credito` (`id_cartao`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pedidocartao_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pedido_cartao_chk_1` CHECK ((`valor_pago` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_cartao`
--

LOCK TABLES `pedido_cartao` WRITE;
/*!40000 ALTER TABLE `pedido_cartao` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedido_cartao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_cupom`
--

DROP TABLE IF EXISTS `pedido_cupom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_cupom` (
  `id_pedido_cupom` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_cupom` int DEFAULT NULL,
  `id_cupom_catalogo` int DEFAULT NULL,
  `valor_utilizado` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_pedido_cupom`),
  UNIQUE KEY `uq_pedido_cupom` (`id_pedido`,`id_cupom`),
  KEY `fk_pedidocupom_cupom` (`id_cupom`),
  KEY `fk_pedidocupom_catalogo` (`id_cupom_catalogo`),
  KEY `idx_pedidocupom_pedido` (`id_pedido`),
  CONSTRAINT `fk_pedidocupom_catalogo` FOREIGN KEY (`id_cupom_catalogo`) REFERENCES `cupom_catalogo` (`id_cupom_catalogo`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pedidocupom_cupom` FOREIGN KEY (`id_cupom`) REFERENCES `cupom` (`id_cupom`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pedidocupom_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pedido_cupom_chk_1` CHECK ((`valor_utilizado` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_cupom`
--

LOCK TABLES `pedido_cupom` WRITE;
/*!40000 ALTER TABLE `pedido_cupom` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedido_cupom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_status_historico`
--

DROP TABLE IF EXISTS `pedido_status_historico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_status_historico` (
  `id_historico` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_funcionario` int DEFAULT NULL,
  `status_anterior` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_novo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_alteracao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historico`),
  KEY `fk_historico_funcionario` (`id_funcionario`),
  KEY `idx_historico_pedido` (`id_pedido`),
  CONSTRAINT `fk_historico_funcionario` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_historico_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_status_historico`
--

LOCK TABLES `pedido_status_historico` WRITE;
/*!40000 ALTER TABLE `pedido_status_historico` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedido_status_historico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencia_cliente`
--

DROP TABLE IF EXISTS `preferencia_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferencia_cliente` (
  `id_preferencia` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `categoria` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `origem` enum('EXPLICITO','IMPLICITO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EXPLICITO',
  `data_cadastro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_preferencia`),
  UNIQUE KEY `uq_preferencia_cliente_categoria` (`id_cliente`,`categoria`,`origem`),
  KEY `idx_preferencia_cliente` (`id_cliente`),
  CONSTRAINT `fk_preferencia_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencia_cliente`
--

LOCK TABLES `preferencia_cliente` WRITE;
/*!40000 ALTER TABLE `preferencia_cliente` DISABLE KEYS */;
INSERT INTO `preferencia_cliente` VALUES (1,1,'Mec├ónica Qu├óntica','EXPLICITO','2026-11-14 19:05:12'),(2,1,'Filosofia','EXPLICITO','2026-11-14 19:05:12'),(3,1,'Estoicismo','EXPLICITO','2026-11-14 19:05:12'),(4,2,'Design Bauhaus','EXPLICITO','2026-11-14 19:05:12'),(5,2,'Idealismo Alem├úo','EXPLICITO','2026-11-14 19:05:12'),(6,2,'Est├®tica','EXPLICITO','2026-11-14 19:05:12'),(7,1,'Filosofia','IMPLICITO','2026-11-14 22:06:59'),(8,1,'Ci├¬ncia','IMPLICITO','2026-11-14 22:06:59'),(9,2,'Hist├│ria','IMPLICITO','2026-11-14 22:09:37'),(10,2,'Filosofia','IMPLICITO','2026-11-14 22:09:37'),(11,2,'Arte','IMPLICITO','2026-11-14 22:09:37'),(12,2,'Literatura','IMPLICITO','2026-11-14 22:09:37');
/*!40000 ALTER TABLE `preferencia_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recomendacao_ia`
--

DROP TABLE IF EXISTS `recomendacao_ia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recomendacao_ia` (
  `id_recomendacao` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `id_livro` int NOT NULL,
  `score` decimal(5,4) NOT NULL,
  `origem` enum('HISTORICO_COMPRA','PREFERENCIA','CHATBOT','FEEDBACK') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_geracao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_recomendacao`),
  KEY `fk_recomendacao_livro` (`id_livro`),
  KEY `idx_recomendacao_cliente` (`id_cliente`),
  CONSTRAINT `fk_recomendacao_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recomendacao_livro` FOREIGN KEY (`id_livro`) REFERENCES `livro` (`id_livro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `recomendacao_ia_chk_1` CHECK ((`score` between 0 and 1))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recomendacao_ia`
--

LOCK TABLES `recomendacao_ia` WRITE;
/*!40000 ALTER TABLE `recomendacao_ia` DISABLE KEYS */;
INSERT INTO `recomendacao_ia` VALUES (1,1,1,1.0000,'CHATBOT','2026-11-14 22:07:05'),(2,2,8,0.8000,'CHATBOT','2026-11-14 22:09:39'),(3,1,1,0.7500,'HISTORICO_COMPRA','2026-11-14 22:11:44'),(4,1,3,0.7500,'HISTORICO_COMPRA','2026-11-14 22:11:44'),(5,1,4,0.7500,'HISTORICO_COMPRA','2026-11-14 22:11:44'),(6,1,5,0.7500,'HISTORICO_COMPRA','2026-11-14 22:11:44'),(7,1,7,0.7500,'HISTORICO_COMPRA','2026-11-14 22:11:44'),(8,1,5,0.9500,'CHATBOT','2026-11-14 22:11:46');
/*!40000 ALTER TABLE `recomendacao_ia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `troca`
--

DROP TABLE IF EXISTS `troca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `troca` (
  `id_troca` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_cliente` int NOT NULL,
  `id_funcionario_autorizacao` int DEFAULT NULL,
  `id_cupom_gerado` int DEFAULT NULL,
  `status` enum('SOLICITADA','ACEITA','NEGADA','ITEM_ENVIADO','ITEM_RECEBIDO','PROCESSADA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SOLICITADA',
  `motivo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `retorna_estoque` tinyint(1) DEFAULT NULL,
  `compra_inteira` tinyint(1) NOT NULL DEFAULT '0',
  `data_solicitacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_autorizacao` datetime DEFAULT NULL,
  `data_processamento` datetime DEFAULT NULL,
  PRIMARY KEY (`id_troca`),
  KEY `fk_troca_funcionario` (`id_funcionario_autorizacao`),
  KEY `fk_troca_cupom` (`id_cupom_gerado`),
  KEY `idx_troca_pedido` (`id_pedido`),
  KEY `idx_troca_cliente` (`id_cliente`),
  KEY `idx_troca_status` (`status`),
  CONSTRAINT `fk_troca_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_troca_cupom` FOREIGN KEY (`id_cupom_gerado`) REFERENCES `cupom` (`id_cupom`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_troca_funcionario` FOREIGN KEY (`id_funcionario_autorizacao`) REFERENCES `funcionario` (`id_funcionario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_troca_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `troca`
--

LOCK TABLES `troca` WRITE;
/*!40000 ALTER TABLE `troca` DISABLE KEYS */;
/*!40000 ALTER TABLE `troca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_vendas_por_categoria_mes`
--

DROP TABLE IF EXISTS `vw_vendas_por_categoria_mes`;
/*!50001 DROP VIEW IF EXISTS `vw_vendas_por_categoria_mes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_vendas_por_categoria_mes` AS SELECT 
 1 AS `id_categoria`,
 1 AS `categoria`,
 1 AS `ano_mes`,
 1 AS `valor_total_vendas`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'nexo_db'
--

--
-- Final view structure for view `vw_vendas_por_categoria_mes`
--

/*!50001 DROP VIEW IF EXISTS `vw_vendas_por_categoria_mes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_vendas_por_categoria_mes` AS select `c`.`id_categoria` AS `id_categoria`,`c`.`nome` AS `categoria`,date_format(`p`.`data_pedido`,'%Y-%m') AS `ano_mes`,sum(`ip`.`valor_total_item`) AS `valor_total_vendas` from ((((`pedido` `p` join `item_pedido` `ip` on((`ip`.`id_pedido` = `p`.`id_pedido`))) join `livro` `l` on((`l`.`id_livro` = `ip`.`id_livro`))) join `livro_categoria` `lc` on((`lc`.`id_livro` = `l`.`id_livro`))) join `categoria` `c` on((`c`.`id_categoria` = `lc`.`id_categoria`))) where (`p`.`status` = 'ENTREGUE') group by `c`.`id_categoria`,`c`.`nome`,date_format(`p`.`data_pedido`,'%Y-%m') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19  7:02:40
