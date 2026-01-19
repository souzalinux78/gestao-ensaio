USE gestao_ensaio;

-- Adicionar coluna hinosEnsaidos na tabela Ensaio
-- Nota: Se a coluna já existir, você receberá um erro. Isso é normal.
ALTER TABLE Ensaio ADD COLUMN hinosEnsaidos VARCHAR(500) NULL;
