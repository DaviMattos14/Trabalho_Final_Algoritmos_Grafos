# Backend - StructureView

## Configuração do Banco de Dados MySQL

### 1. Instalar MySQL
Certifique-se de ter o MySQL instalado e rodando na sua máquina.

### 2. Criar o Banco de Dados
Execute o script SQL para criar o banco de dados e a tabela:

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
```

### 3. Configurar Variáveis de Ambiente
**⚠️ IMPORTANTE:** Crie um arquivo `.env` na pasta `server/` com as configurações do seu MySQL:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=structure_view
PORT=3001
```

**Nota:** 
- Se você não tem senha no MySQL, deixe `DB_PASSWORD=` vazio
- Se você tem senha, substitua `sua_senha_aqui` pela sua senha real

### 4. Instalar Dependências do Backend
```bash
cd server
npm install
```

### 5. Iniciar o Servidor
```bash
npm start
```

Ou em modo desenvolvimento (com auto-reload):
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

**Verificação:** Se tudo estiver correto, você verá:
```
🚀 Servidor rodando na porta 3001
📡 API disponível em http://localhost:3001/api
✅ Conectado ao MySQL!
```

**Se aparecer erro de conexão MySQL:**
- Verifique se o arquivo `.env` existe na pasta `server/`
- Verifique se as credenciais no `.env` estão corretas
- Verifique se o MySQL está rodando

## Endpoints da API

### POST /api/auth/login
Faz login de um usuário.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nome do Usuário"
  }
}
```

### POST /api/auth/register
Registra um novo usuário.

**Body:**
```json
{
  "email": "novo@example.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Usuário cadastrado com sucesso",
  "user": {
    "id": 2,
    "email": "novo@example.com",
    "name": "Nome do Usuário"
  }
}
```

## Configuração do Frontend

O frontend está configurado para se conectar ao backend na porta 3001 por padrão.

Se necessário, você pode configurar a URL da API criando um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3001/api
```

## Usuário de Exemplo

O script SQL cria um usuário de exemplo:
- **Email:** admin@example.com
- **Senha:** senha123

## Notas de Segurança

⚠️ **Importante:** Este é um projeto de trabalho de faculdade. A autenticação usa comparação simples de senhas (sem hash). Para um ambiente de produção, você deve:

- Usar `bcrypt` ou similar para hash de senhas
- Implementar tokens JWT para autenticação
- Adicionar validação mais robusta
- Implementar rate limiting
- Usar HTTPS

