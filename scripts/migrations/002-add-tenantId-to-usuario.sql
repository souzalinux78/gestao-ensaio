-- Migration 002: Adicionar tenantId ao Usuario
-- Data: 2024
-- Descrição: Adiciona campo tenantId (nullable) na tabela Usuario para suporte multi-tenant

-- Adicionar coluna tenantId (nullable inicialmente para migração gradual)
ALTER TABLE `Usuario` 
ADD COLUMN `tenantId` INT NULL AFTER `aprovado`;

-- Criar índice na coluna tenantId para performance
CREATE INDEX `Usuario_tenantId_idx` ON `Usuario` (`tenantId`);

-- Criar índice composto para filtros comuns (tenantId + tipo)
CREATE INDEX `Usuario_tenantId_tipo_idx` ON `Usuario` (`tenantId`, `tipo`);

-- Criar foreign key para Tenant
-- NOTA: Adicionar foreign key apenas após migrar dados (ETAPA 4)
-- Por enquanto, deixamos sem constraint para permitir migração gradual
-- ALTER TABLE `Usuario` 
-- ADD CONSTRAINT `Usuario_tenantId_fkey` 
-- FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Comentário: A foreign key será adicionada na ETAPA 4 após migrar todos os dados
