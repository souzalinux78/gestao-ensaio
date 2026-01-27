-- Migration 003: Adicionar tenantId aos modelos de dados
-- Data: 2024
-- Descrição: Adiciona campo tenantId (nullable) nas tabelas de dados para suporte multi-tenant

-- ============================================
-- 1. ENSAIO
-- ============================================
ALTER TABLE `Ensaio` 
ADD COLUMN `tenantId` INT NULL AFTER `instrutorId`;

CREATE INDEX `Ensaio_tenantId_idx` ON `Ensaio` (`tenantId`);
CREATE INDEX `Ensaio_tenantId_data_idx` ON `Ensaio` (`tenantId`, `data` DESC);
CREATE INDEX `Ensaio_tenantId_instrutorId_idx` ON `Ensaio` (`tenantId`, `instrutorId`);

-- ============================================
-- 2. MUSICO
-- ============================================
ALTER TABLE `Musico` 
ADD COLUMN `tenantId` INT NULL AFTER `instrutorId`;

-- Remover constraint unique antiga (instrutorId, nome)
ALTER TABLE `Musico` DROP INDEX `Musico_instrutorId_nome_key`;

-- Criar novo unique constraint incluindo tenantId
CREATE UNIQUE INDEX `Musico_tenantId_instrutorId_nome_key` ON `Musico` (`tenantId`, `instrutorId`, `nome`);

CREATE INDEX `Musico_tenantId_idx` ON `Musico` (`tenantId`);
CREATE INDEX `Musico_tenantId_instrutorId_idx` ON `Musico` (`tenantId`, `instrutorId`);

-- ============================================
-- 3. CONTATO
-- ============================================
ALTER TABLE `Contato` 
ADD COLUMN `tenantId` INT NULL AFTER `usuarioId`;

CREATE INDEX `Contato_tenantId_idx` ON `Contato` (`tenantId`);
CREATE INDEX `Contato_tenantId_usuarioId_idx` ON `Contato` (`tenantId`, `usuarioId`);

-- ============================================
-- 4. INSTRUMENTO
-- ============================================
ALTER TABLE `Instrumento` 
ADD COLUMN `tenantId` INT NULL AFTER `nome`;

-- Remover constraint unique antiga (nome)
ALTER TABLE `Instrumento` DROP INDEX `Instrumento_nome_key`;

-- Criar novo unique constraint incluindo tenantId (permite mesmo nome em tenants diferentes)
CREATE UNIQUE INDEX `Instrumento_tenantId_nome_key` ON `Instrumento` (`tenantId`, `nome`);

CREATE INDEX `Instrumento_tenantId_idx` ON `Instrumento` (`tenantId`);

-- ============================================
-- 5. CONFIGURACOES
-- ============================================
ALTER TABLE `Configuracoes` 
ADD COLUMN `tenantId` INT NULL AFTER `id`;

-- Criar unique constraint: uma configuração por tenant
CREATE UNIQUE INDEX `Configuracoes_tenantId_key` ON `Configuracoes` (`tenantId`);

CREATE INDEX `Configuracoes_tenantId_idx` ON `Configuracoes` (`tenantId`);

-- ============================================
-- NOTA: Foreign Keys serão adicionadas na ETAPA 4
-- após migrar todos os dados existentes
-- ============================================
