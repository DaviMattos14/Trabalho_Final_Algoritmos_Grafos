# Configuração Rápida do Backend

## 1. Criar arquivo .env

Na pasta `server/`, crie um arquivo chamado `.env` com o seguinte conteúdo:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql_aqui
DB_NAME=structure_view
PORT=3001
```

**Importante:** Substitua `sua_senha_mysql_aqui` pela senha do seu MySQL.

Se você não tem senha no MySQL, deixe vazio:
```env
DB_PASSWORD=
```

## 2. Criar o banco de dados

Execute o script SQL:

```bash
mysql -u root -p < server/database.sql
```

Ou execute manualmente no MySQL:
```sql
CREATE DATABASE IF NOT EXISTS structure_view;
USE structure_view;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (email, password, name) 
VALUES ('admin@example.com', 'senha123', 'Admin')
ON DUPLICATE KEY UPDATE email=email;
```

## 3. Instalar dependências

```bash
cd server
npm install
```

## 4. Iniciar o servidor

```bash
npm start
```

Você deve ver:
```
🚀 Servidor rodando na porta 3001
📡 API disponível em http://localhost:3001/api
✅ Conectado ao MySQL!
```

## Teste rápido

Abra no navegador: http://localhost:3001/api/health

Deve retornar: `{"status":"OK","message":"Servidor rodando!"}`

## Usuário de teste

- **Email:** admin@example.com
- **Senha:** senha123

