import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário no banco
    const [users] = await pool.execute(
      'SELECT id, email, name, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    const user = users[0];

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Login bem-sucedido
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rota de registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Verificar se o email já existe
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Inserir novo usuário
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, password, name || null]
    );

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      user: {
        id: result.insertId,
        email: email,
        name: name || null
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de atualização de dados
router.put('/update', async (req, res) => {
  try {
    const { user_id, current_password, email, new_password } = req.body;

    if (!user_id || !current_password) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário e senha atual são obrigatórios'
      });
    }

    // Verificar senha atual
    const [users] = await pool.execute(
      'SELECT id, email, password FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    // Comparação simples de senha (para trabalho de faculdade)
    if (user.password !== current_password) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Verificar se o novo email já existe (se estiver sendo alterado)
    if (email && email !== user.email) {
      const [existingEmail] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, user_id]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso'
        });
      }
    }

    // Construir query de atualização
    const updates = [];
    const values = [];

    if (email && email !== user.email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (new_password) {
      updates.push('password = ?');
      values.push(new_password);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma alteração fornecida'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(user_id);

    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Dados atualizados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de exclusão de usuário
router.delete('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário e senha são obrigatórios'
      });
    }

    // Verificar se o usuário existe e a senha está correta
    const [users] = await pool.execute(
      'SELECT id, email, password FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // Deletar o usuário (cascata deleta user_exercises também)
    await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [user_id]
    );

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

