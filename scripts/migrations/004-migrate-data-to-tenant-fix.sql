-- Script de correção: Migrar Configuracoes (executar apenas esta parte se deu erro)
-- Use este script se a migration 004 falhou na etapa de Configuracoes

SET @tenant_padrao_id = (SELECT id FROM Tenant WHERE slug = 'sistema-padrao' LIMIT 1);

-- Verificar se já existe configuração com tenantId
-- Se já existe, não fazer nada (já está migrada)
-- Se não existe, atualizar a existente sem tenantId

-- Opção 1: Se já existe configuração com tenantId, não fazer nada
-- Opção 2: Se não existe, atualizar a existente sem tenantId
UPDATE `Configuracoes` 
SET `tenantId` = @tenant_padrao_id 
WHERE `tenantId` IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM `Configuracoes`) AS c2 
    WHERE c2.`tenantId` = @tenant_padrao_id
  )
LIMIT 1;

-- Se não havia configuração nenhuma, criar uma nova (só se não existir com tenantId)
INSERT IGNORE INTO `Configuracoes` (`tenantId`, `webhook`, `createdAt`, `updatedAt`)
SELECT @tenant_padrao_id, NULL, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM `Configuracoes`) AS c3 
    WHERE c3.`tenantId` = @tenant_padrao_id
)
AND (SELECT COUNT(*) FROM `Configuracoes` WHERE `tenantId` IS NULL) = 0
AND (SELECT COUNT(*) FROM `Configuracoes`) = 0;

SELECT '✓ Configurações corrigidas' AS status;
