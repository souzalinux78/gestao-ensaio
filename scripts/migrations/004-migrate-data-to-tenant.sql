-- Migration 004: Migrar Dados Existentes para Tenant Padrão
-- Data: 2024
-- Descrição: Atribui todos os dados existentes ao tenant padrão e cria foreign keys

-- ============================================
-- ETAPA 1: Obter ID do Tenant Padrão
-- ============================================
-- Assumimos que o tenant padrão tem ID = 1 (criado na migration 001)
-- Se não existir, a migration falhará (o que é o comportamento esperado)

SET @tenant_padrao_id = (SELECT id FROM Tenant WHERE slug = 'sistema-padrao' LIMIT 1);

-- Verificar se tenant padrão existe
SELECT IF(@tenant_padrao_id IS NULL, 
    CONCAT('ERRO: Tenant padrão não encontrado! Execute a migration 001 primeiro.'),
    CONCAT('✓ Tenant padrão encontrado: ID = ', @tenant_padrao_id)
) AS status;

-- ============================================
-- ETAPA 2: Migrar USUARIOS
-- ============================================
-- Atribuir todos os usuários sem tenantId ao tenant padrão
UPDATE `Usuario` 
SET `tenantId` = @tenant_padrao_id 
WHERE `tenantId` IS NULL;

SELECT CONCAT('✓ Usuários migrados: ', ROW_COUNT()) AS status;

-- ============================================
-- ETAPA 3: Migrar ENSAIOS
-- ============================================
-- Atribuir cada ensaio ao tenant do seu instrutor
UPDATE `Ensaio` e
INNER JOIN `Usuario` u ON e.instrutorId = u.id
SET e.tenantId = u.tenantId
WHERE e.tenantId IS NULL;

SELECT CONCAT('✓ Ensaios migrados: ', ROW_COUNT()) AS status;

-- ============================================
-- ETAPA 4: Migrar MUSICOS
-- ============================================
-- Atribuir cada músico ao tenant do seu instrutor
UPDATE `Musico` m
INNER JOIN `Usuario` u ON m.instrutorId = u.id
SET m.tenantId = u.tenantId
WHERE m.tenantId IS NULL;

SELECT CONCAT('✓ Músicos migrados: ', ROW_COUNT()) AS status;

-- ============================================
-- ETAPA 5: Migrar CONTATOS
-- ============================================
-- Atribuir cada contato ao tenant do seu usuário
UPDATE `Contato` c
INNER JOIN `Usuario` u ON c.usuarioId = u.id
SET c.tenantId = u.tenantId
WHERE c.tenantId IS NULL;

SELECT CONCAT('✓ Contatos migrados: ', ROW_COUNT()) AS status;

-- ============================================
-- ETAPA 6: Migrar INSTRUMENTOS
-- ============================================
-- Atribuir instrumentos ao tenant padrão
-- NOTA: Podemos deixar NULL para instrumentos compartilhados globalmente
-- Por enquanto, vamos atribuir ao tenant padrão
UPDATE `Instrumento` 
SET `tenantId` = @tenant_padrao_id 
WHERE `tenantId` IS NULL;

SELECT CONCAT('✓ Instrumentos migrados: ', ROW_COUNT()) AS status;

-- ============================================
-- ETAPA 7: Migrar CONFIGURACOES
-- ============================================
-- Atribuir configurações ao tenant padrão
-- Estratégia: Verificar antes e só atualizar/criar se necessário

-- Verificar se já existe configuração com tenantId
SET @has_config_with_tenant = (SELECT COUNT(*) FROM `Configuracoes` WHERE `tenantId` = @tenant_padrao_id);

-- Se NÃO existe configuração com tenantId, atualizar a existente sem tenantId
-- Usar variável para evitar subquery no WHERE
UPDATE `Configuracoes` 
SET `tenantId` = @tenant_padrao_id 
WHERE `tenantId` IS NULL
  AND @has_config_with_tenant = 0
LIMIT 1;

-- Se não havia configuração nenhuma, criar uma nova
-- Usar INSERT IGNORE para evitar erro de duplicata (caso já exista por algum motivo)
INSERT IGNORE INTO `Configuracoes` (`tenantId`, `webhook`, `createdAt`, `updatedAt`)
SELECT @tenant_padrao_id, NULL, NOW(), NOW()
WHERE (SELECT COUNT(*) FROM `Configuracoes`) = 0;

SELECT CONCAT('✓ Configurações migradas') AS status;

-- ============================================
-- ETAPA 8: Criar Foreign Keys
-- ============================================

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

-- ============================================
-- ETAPA 9: Tornar Campos NOT NULL (Opcional)
-- ============================================
-- NOTA: Por enquanto, vamos manter nullable para permitir flexibilidade
-- Se quiser tornar NOT NULL, descomente as linhas abaixo:

-- ALTER TABLE `Usuario` MODIFY COLUMN `tenantId` INT NOT NULL;
-- ALTER TABLE `Ensaio` MODIFY COLUMN `tenantId` INT NOT NULL;
-- ALTER TABLE `Musico` MODIFY COLUMN `tenantId` INT NOT NULL;
-- ALTER TABLE `Contato` MODIFY COLUMN `tenantId` INT NOT NULL;
-- ALTER TABLE `Instrumento` MODIFY COLUMN `tenantId` INT NOT NULL;
-- ALTER TABLE `Configuracoes` MODIFY COLUMN `tenantId` INT NOT NULL;

-- ============================================
-- ETAPA 10: Verificação Final
-- ============================================

SELECT '========================================' AS '';
SELECT 'VERIFICAÇÃO FINAL' AS '';
SELECT '========================================' AS '';

-- Verificar se há registros sem tenantId
SELECT 
    'Usuarios sem tenantId' AS tabela,
    COUNT(*) AS total
FROM `Usuario` WHERE `tenantId` IS NULL
UNION ALL
SELECT 
    'Ensaios sem tenantId',
    COUNT(*)
FROM `Ensaio` WHERE `tenantId` IS NULL
UNION ALL
SELECT 
    'Musicos sem tenantId',
    COUNT(*)
FROM `Musico` WHERE `tenantId` IS NULL
UNION ALL
SELECT 
    'Contatos sem tenantId',
    COUNT(*)
FROM `Contato` WHERE `tenantId` IS NULL
UNION ALL
SELECT 
    'Instrumentos sem tenantId',
    COUNT(*)
FROM `Instrumento` WHERE `tenantId` IS NULL
UNION ALL
SELECT 
    'Configuracoes sem tenantId',
    COUNT(*)
FROM `Configuracoes` WHERE `tenantId` IS NULL;

-- Contar registros por tenant
SELECT 
    t.nome AS tenant,
    COUNT(DISTINCT u.id) AS usuarios,
    COUNT(DISTINCT e.id) AS ensaios,
    COUNT(DISTINCT m.id) AS musicos,
    COUNT(DISTINCT c.id) AS contatos,
    COUNT(DISTINCT i.id) AS instrumentos,
    COUNT(DISTINCT cfg.id) AS configuracoes
FROM `Tenant` t
LEFT JOIN `Usuario` u ON u.tenantId = t.id
LEFT JOIN `Ensaio` e ON e.tenantId = t.id
LEFT JOIN `Musico` m ON m.tenantId = t.id
LEFT JOIN `Contato` c ON c.tenantId = t.id
LEFT JOIN `Instrumento` i ON i.tenantId = t.id
LEFT JOIN `Configuracoes` cfg ON cfg.tenantId = t.id
GROUP BY t.id, t.nome;

SELECT '========================================' AS '';
SELECT '✓ Migration 004 concluída!' AS '';
SELECT '========================================' AS '';
