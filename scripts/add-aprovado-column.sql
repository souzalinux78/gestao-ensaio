-- Adicionar coluna aprovado na tabela Usuario
ALTER TABLE Usuario ADD COLUMN aprovado BOOLEAN DEFAULT FALSE;

-- Marcar todos os admins existentes como aprovados
UPDATE Usuario SET aprovado = TRUE WHERE tipo = 'admin';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuario_aprovado ON Usuario(aprovado);
