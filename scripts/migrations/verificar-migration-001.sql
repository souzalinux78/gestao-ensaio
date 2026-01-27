-- Script de Verificação: Migration 001
-- Execute este script após executar a migration para verificar se tudo está correto

-- 1. Verificar se tabela existe
SELECT 'Verificando se tabela Tenant existe...' AS Status;
SHOW TABLES LIKE 'Tenant';

-- 2. Verificar estrutura da tabela
SELECT 'Verificando estrutura da tabela...' AS Status;
DESCRIBE Tenant;

-- 3. Verificar tenant padrão
SELECT 'Verificando tenant padrão...' AS Status;
SELECT 
    id,
    nome,
    slug,
    ativo,
    createdAt,
    updatedAt
FROM Tenant 
WHERE slug = 'sistema-padrao';

-- 4. Verificar índices
SELECT 'Verificando índices...' AS Status;
SHOW INDEX FROM Tenant;

-- 5. Contar total de tenants (deve ser 1 - o padrão)
SELECT 'Contando total de tenants...' AS Status;
SELECT COUNT(*) AS total_tenants FROM Tenant;

-- 6. Verificar se tenant padrão está ativo
SELECT 'Verificando se tenant padrão está ativo...' AS Status;
SELECT 
    CASE 
        WHEN COUNT(*) = 1 AND MAX(ativo) = 1 THEN 'OK - Tenant padrão ativo'
        WHEN COUNT(*) = 1 AND MAX(ativo) = 0 THEN 'AVISO - Tenant padrão inativo'
        WHEN COUNT(*) = 0 THEN 'ERRO - Tenant padrão não encontrado'
        ELSE 'ERRO - Múltiplos tenants padrão encontrados'
    END AS status
FROM Tenant 
WHERE slug = 'sistema-padrao';
