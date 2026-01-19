USE gestao_ensaio;

-- Criar tabela Contato
CREATE TABLE IF NOT EXISTS Contato (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nota: Se você já tem a tabela Configuracoes com campos telefone e nome,
-- execute manualmente:
-- ALTER TABLE Configuracoes DROP COLUMN telefone;
-- ALTER TABLE Configuracoes DROP COLUMN nome;
