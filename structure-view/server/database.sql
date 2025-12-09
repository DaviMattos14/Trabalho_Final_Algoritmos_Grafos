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

-- Tabela de exercícios
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    topic VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de progresso do usuário nos exercícios (sem attempts)
CREATE TABLE IF NOT EXISTS user_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    user_answer TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_exercise (user_id, exercise_id)
);

-- Inserir um usuário de exemplo (senha: "senha123" - hash simples para demonstração)
-- Em produção, use bcrypt ou similar
INSERT INTO users (email, password, name) 
VALUES ('admin@example.com', 'senha123', 'Admin')
ON DUPLICATE KEY UPDATE email=email;
-- Inserir um exercício de exemplo

ALTER TABLE exercises ADD COLUMN difficulty VARCHAR(50) DEFAULT 'Médio';

-- 2. Atualizar ou Inserir o Exercício com a Dificuldade
INSERT INTO exercises (id, title, topic, answer, difficulty) 
VALUES (
    2, 
    'Tempos de Busca em Profundidade (DFS)', 
    'Grafos', 
    '{"start0":0,"end0":12,"start2":1,"end2":10,"start3":2,"end3":3,"start4":4,"end4":9,"start1":7,"end1":8,"start5":6,"end5":7}',
    'Facil'
)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    topic = VALUES(topic),
    answer = VALUES(answer),
    difficulty = VALUES(difficulty);


ALTER TABLE exercises
ADD subtopic VARCHAR(100) DEFAULT 'sem categoria',
ADD type VARCHAR(100) DEFAULT 'Múltipla Escolha';


UPDATE exercises
SET title = SUBSTRING(title, LENGTH('Múltipla escolha -') + 1)
WHERE title LIKE 'Múltipla escolha - %';
