-- Script SIMPLES para continuar migration 004 após erro
-- Execute este script se a migration 004 falhou na etapa de Configuracoes
-- Este script apenas cria as foreign keys que faltaram

SET @tenant_padrao_id = (SELECT id FROM Tenant WHERE slug = 'sistema-padrao' LIMIT 1);

-- ============================================
-- ETAPA 7: Migrar CONFIGURACOES (Corrigido)
-- ============================================
-- Verificar se já existe configuração com tenantId
-- Se já existe, não fazer nada (já está migrada)
-- Se não existe, atualizar a existente sem tenantId

UPDATE `Configuracoes` 
SET `tenantId` = @tenant_padrao_id 
WHERE `tenantId` IS NULL
  AND (SELECT COUNT(*) FROM `Configuracoes` WHERE `tenantId` = @tenant_padrao_id) = 0
LIMIT 1;

-- Se não havia configuração nenhuma, criar uma nova
INSERT IGNORE INTO `Configuracoes` (`tenantId`, `webhook`, `createdAt`, `updatedAt`)
SELECT @tenant_padrao_id, NULL, NOW(), NOW()
WHERE (SELECT COUNT(*) FROM `Configuracoes`) = 0;

SELECT '✓ Configurações corrigidas' AS status;

-- ============================================
-- ETAPA 8: Criar Foreign Keys
-- ============================================
-- Criar foreign keys (se já existirem, dará erro que pode ser ignorado)

-- Foreign Key: Usuario -> Tenant
ALTER TABLE `Usuario` 
ADD CONSTRAINT `Usuario_tenantId_fkey` 
FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Key: Ensaio -> Tenant
ALTER TABLE `Ensaio` 
ADD CONSTRAINT `Ensaio_tenantId_fkey` 
FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Key: Musico -> Tenant
ALTER TABLE `Musico` 
ADD CONSTRAINT `Musico_tenantId_fkey` 
FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Key: Contato -> Tenant
ALTER TABLE `Contato` 
ADD CONSTRAINT `Contato_tenantId_fkey` 
FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Key: Instrumento -> Tenant
ALTER TABLE `Instrumento` 
ADD CONSTRAINT `Instrumento_tenantId_fkey` 
FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Key: Configuracoes -> Tenant
ALTER TABLE `Configuracoes` 
ADD CONSTRAINT `Configuracoes_tenantId_fkey` 
FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

SELECT '✓ Foreign keys criadas com sucesso' AS status;
SELECT '========================================' AS '';
SELECT '✓ Migration 004 corrigida e concluída!' AS '';
SELECT '========================================' AS '';
