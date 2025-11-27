-- Schema do banco de dados para o sistema de login
CREATE DATABASE IF NOT EXISTS structure_view;
USE structure_view;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir um usuário de exemplo (senha: "senha123" - hash simples para demonstração)
-- Em produção, use bcrypt ou similar
INSERT INTO users (email, password, name) 
VALUES ('admin@example.com', 'senha123', 'Admin')
ON DUPLICATE KEY UPDATE email=email;

