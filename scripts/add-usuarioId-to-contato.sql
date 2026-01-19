USE gestao_ensaio;

-- Adicionar coluna usuarioId na tabela Contato
-- Nota: Se a coluna já existir, você receberá um erro. Isso é normal.
ALTER TABLE Contato ADD COLUMN usuarioId INT NOT NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_contato_usuario ON Contato(usuarioId);

-- Adicionar foreign key
-- Primeiro, precisamos criar um usuário temporário se não existir nenhum
-- Depois, associar contatos existentes ao primeiro admin encontrado
UPDATE Contato c
SET c.usuarioId = (
    SELECT id FROM Usuario WHERE tipo = 'admin' LIMIT 1
)
WHERE c.usuarioId IS NULL OR c.usuarioId = 0;

-- Agora adicionar a foreign key
ALTER TABLE Contato 
ADD CONSTRAINT fk_contato_usuario 
FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE;
