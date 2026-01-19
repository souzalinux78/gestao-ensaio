USE gestao_ensaio;

-- Adicionar coluna igreja na tabela Usuario
-- Nota: Se a coluna já existir, você receberá um erro. Isso é normal.
ALTER TABLE Usuario ADD COLUMN igreja VARCHAR(255) NULL;
CREATE INDEX idx_igreja ON Usuario(igreja);
