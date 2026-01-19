USE gestao_ensaio;

-- Adicionar coluna regencia na tabela Ensaio
-- Nota: Se a coluna já existir, você receberá um erro. Isso é normal.
ALTER TABLE Ensaio ADD COLUMN regencia TEXT NULL;
