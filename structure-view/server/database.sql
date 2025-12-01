-- Schema do banco de dados para o sistema de login
CREATE DATABASE IF NOT EXISTS structure_view
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE structure_view;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de exercícios
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    topic VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir um usuário de exemplo (senha: "senha123" - hash simples para demonstração)
-- Em produção, use bcrypt ou similar
INSERT INTO users (email, password, name) 
VALUES ('admin@example.com', 'senha123', 'Admin')
ON DUPLICATE KEY UPDATE email=email;
-- Inserir um exercício de exemplo

ALTER TABLE exercises ADD COLUMN difficulty VARCHAR(50) DEFAULT 'Médio';
ALTER TABLE exercises CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Atualizar ou Inserir o Exercício com a Dificuldade
INSERT INTO exercises (id, title, topic, answer, difficulty) 
VALUES (
    2, 
    'Tempos de Busca em Profundidade (DFS)', 
    'Grafos', 
    '{"start0":0,"end0":11,"start1":5,"end1":8,"start2":1,"end2":10,"start3":2,"end3":3,"start4":4,"end4":9,"start5":6,"end5":7}',
    'Fácil'
)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    topic = VALUES(topic),
    answer = VALUES(answer),
    difficulty = VALUES(difficulty);


-- EXERCÍCIOS DE ORDENAÇÃO TOPOLÓGICAS
INSERT INTO exercises (title, answer, topic)
VALUES (
  'Múltipla escolha - Com base no gráfico abaixo. Qual é uma ordenação topológica válida?',
  '{"graph":{"A":[["B",1],["C",1]],"B":[["D",1]],"C":[["D",1]],"D":[]},"options":["A, B, C, D","C, A, B, D","B, A, C, D","A, D, B, C"],"expected":"A, B, C, D","correct":"A, B, C, D"}',
  'Ordenação Topológica'
);

INSERT INTO exercises (title, answer, topic)
VALUES (
  'Múltipla escolha - Qual é uma ordenação topológica válida para o seguinte grafo?',
  '{"graph":{"H":[["E",1],["F",1]],"E":[["C",1],["D",1]],"F":[["D",1]],"C":[["A",1]],"D":[["B",1]],"A":[],"B":[]},"options":["H, E, F, C, D, A, B","H, F, E, D, C, B, A","E, H, F, C, D, A, B","H, C, E, F, D, A, B"],"expected":"H, E, F, C, D, A, B","correct":"H, E, F, C, D, A, B"}',
  'Ordenação Topológica'
);

-- EXERCÍCIOS DE ALGORITMO DE DIJKSTRA

INSERT INTO exercises (title, answer, topic)
VALUES (
  'Múltipla escolha - Qual é a menor distância total de A até E usando Dijkstra?',
  '{"graph":{"A":[["B",2],["C",5]],"B":[["D",1]],"C":[["D",2]],"D":[["E",3]],"E":[]},"options":[5,6,7,8],"expected":6,"correct":6}',
  'Dijkstra'
);

INSERT INTO exercises (title, answer, topic)
VALUES (
  'Múltipla escolha - Usando o algoritmo de Dijkstra, qual é a menor distância total para ir do nó A ao nó F?',
  '{"graph":{"A":[["B",4],["C",2]],"B":[["C",5],["D",10]],"C":[["E",3]],"D":[["F",11]],"E":[["D",4]],"F":[]},"options":[16,17,18,20,21],"expected":20,"correct":20}',
  'Dijkstra'
);

-- Exercícios de busca em profundidade
INSERT INTO exercises (title, answer, topic)
VALUES (
  'Múltipla escolha - Qual é a ordem de visita a partir do nó S? (Usando busca em profundidade)',
  '{"graph":{"S":[["A",1],["B",1]],"A":[["C",1]],"B":[["E",1]],"C":[["D",1]],"D":[],"E":[]},"options":["S, A, C, D, B, E","S, B, E, A, C, D","A, S, C, D, B, E","S, A, B, C, D, E"],"expected":"S, A, C, D, B, E","correct":"S, A, C, D, B, E"}',
  'DFS'
);

-- Exercícios de busca em largura

INSERT INTO exercises (title, answer, topic)
VALUES (
  'Múltipla escolha - Qual é a ordem de visita da BFS a partir do nó A?',
  '{"graph":{"A":[["B",1],["C",1]],"B":[["D",1]],"C":[["E",1]],"D":[],"E":[]},"options":["A, B, C, D, E","A, C, B, E, D","B, A, C, D, E","A, B, D, C, E"],"expected":"A, B, C, D, E","correct":"A, B, C, D, E"}',
  'BFS'
);






