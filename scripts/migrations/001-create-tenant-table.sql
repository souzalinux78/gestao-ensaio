-- Migration 001: Criar tabela Tenant
-- Data: 2024
-- Descrição: Cria a estrutura base para multi-tenancy

-- Criar tabela Tenant
CREATE TABLE IF NOT EXISTS `Tenant` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Tenant_slug_key` (`slug`),
  KEY `Tenant_slug_idx` (`slug`),
  KEY `Tenant_ativo_idx` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tenant padrão para migração de dados existentes
INSERT INTO `Tenant` (`nome`, `slug`, `ativo`, `createdAt`, `updatedAt`)
VALUES ('Sistema Padrão', 'sistema-padrao', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE `nome` = `nome`;
