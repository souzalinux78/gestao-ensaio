-- Script SQL para criar índices de performance
-- Execute após aplicar migração do Prisma

-- 1. Índice composto para Ensaio: filtro por instrutor + data (muito comum)
-- Melhora queries como: WHERE instrutorId = X AND data BETWEEN ...
CREATE INDEX idx_ensaio_instrutor_data 
ON Ensaio(instrutorId, data DESC);

-- 2. Índice composto para Usuario: filtro por tipo + aprovado
-- Melhora queries de listagem de usuários com filtros
CREATE INDEX idx_usuario_tipo_aprovado 
ON Usuario(tipo, aprovado);

-- 3. Índice para Contato: busca por nome (filtros de busca)
-- Melhora queries LIKE '%nome%'
CREATE INDEX idx_contato_nome 
ON Contato(nome);

-- 4. Índice para Musico: busca por nome (filtros de busca)
-- Melhora queries LIKE '%nome%'
CREATE INDEX idx_musico_nome 
ON Musico(nome);

-- 5. Índice para Ensaio: filtro por data range (relatórios)
-- Já existe, mas verificar se está otimizado
-- CREATE INDEX idx_ensaio_data ON Ensaio(data); -- Já existe no schema

-- Verificar índices existentes:
-- SHOW INDEX FROM Ensaio;
-- SHOW INDEX FROM Usuario;
-- SHOW INDEX FROM Contato;
-- SHOW INDEX FROM Musico;
