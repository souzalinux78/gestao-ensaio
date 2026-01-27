-- Script para continuar migration 004 após erro em Configuracoes
-- Execute este script se a migration 004 falhou na etapa de Configuracoes
-- Este script apenas cria as foreign keys que faltaram

SET @tenant_padrao_id = (SELECT id FROM Tenant WHERE slug = 'sistema-padrao' LIMIT 1);

-- ============================================
-- ETAPA 7: Migrar CONFIGURACOES (Corrigido)
-- ============================================
-- Verificar se já existe configuração com tenantId
SET @has_config_with_tenant = (SELECT COUNT(*) FROM `Configuracoes` WHERE `tenantId` = @tenant_padrao_id);

-- Se NÃO existe configuração com tenantId, atualizar a existente sem tenantId
UPDATE `Configuracoes` 
SET `tenantId` = @tenant_padrao_id 
WHERE `tenantId` IS NULL
  AND @has_config_with_tenant = 0
LIMIT 1;

-- Se não havia configuração nenhuma, criar uma nova
INSERT IGNORE INTO `Configuracoes` (`tenantId`, `webhook`, `createdAt`, `updatedAt`)
SELECT @tenant_padrao_id, NULL, NOW(), NOW()
WHERE (SELECT COUNT(*) FROM `Configuracoes`) = 0;

SELECT '✓ Configurações corrigidas' AS status;

-- ============================================
-- ETAPA 8: Criar Foreign Keys
-- ============================================
-- Verificar se foreign keys já existem antes de criar

-- Foreign Key: Usuario -> Tenant
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'Usuario' 
                  AND CONSTRAINT_NAME = 'Usuario_tenantId_fkey');
                  
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE',
    'SELECT "Foreign key Usuario já existe" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign Key: Ensaio -> Tenant
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'Ensaio' 
                  AND CONSTRAINT_NAME = 'Ensaio_tenantId_fkey');
                  
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `Ensaio` ADD CONSTRAINT `Ensaio_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE',
    'SELECT "Foreign key Ensaio já existe" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign Key: Musico -> Tenant
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'Musico' 
                  AND CONSTRAINT_NAME = 'Musico_tenantId_fkey');
                  
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `Musico` ADD CONSTRAINT `Musico_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE',
    'SELECT "Foreign key Musico já existe" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign Key: Contato -> Tenant
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'Contato' 
                  AND CONSTRAINT_NAME = 'Contato_tenantId_fkey');
                  
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `Contato` ADD CONSTRAINT `Contato_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE',
    'SELECT "Foreign key Contato já existe" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign Key: Instrumento -> Tenant
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'Instrumento' 
                  AND CONSTRAINT_NAME = 'Instrumento_tenantId_fkey');
                  
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `Instrumento` ADD CONSTRAINT `Instrumento_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE',
    'SELECT "Foreign key Instrumento já existe" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign Key: Configuracoes -> Tenant
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'Configuracoes' 
                  AND CONSTRAINT_NAME = 'Configuracoes_tenantId_fkey');
                  
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `Configuracoes` ADD CONSTRAINT `Configuracoes_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE',
    'SELECT "Foreign key Configuracoes já existe" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✓ Foreign keys criadas/verificadas com sucesso' AS status;

SELECT '========================================' AS '';
SELECT '✓ Migration 004 corrigida e concluída!' AS '';
SELECT '========================================' AS '';
