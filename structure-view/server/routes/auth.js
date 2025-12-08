import express from 'express';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import transporter from '../config/email.js'


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

    // Comparação simples de senha (para trabalho de faculdade)
    // Em produção, use bcrypt.compare()
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
    // Em produção, use bcrypt.hash() para hash da senha
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

// ROTA: Recuperação de Senha (Forgot Password)
router.post('/forgot-password', async (req, res) => {
  try {
    const JWT_SECRET = 'chave';
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'O email é obrigatório para a recuperação de senha.' 
      });
    }

    const [users] = await pool.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.json({ 
        success: false, 
        message: 'Se o email não encontrado.' 
      });
    }

    const user = users[0];
    const token = jwt.sign(
      { userId: user.id, type: 'reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const resetURL = `https://structureview.vercel.app/reset-password/${token}`; // URL do seu frontend
    const mailOptions = {
      to: user.email,
      from: 'structureview90@gmail.com',
      subject: 'Redefinição de Senha',
      html: `
        <h2>Redefinição de Senha Solicitada</h2>
        <p>Você solicitou a redefinição de senha para sua conta.</p>
        <p>Clique neste link para prosseguir:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>Este link expira em 1 hora.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // 4. Sucesso
    res.json({
      success: true,
      message: 'Link de redefinição de senha enviado para o seu email. Verifique sua caixa de entrada.'
    });

  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor ao solicitar a recuperação.' 
    });
  }
});



// Redefinição de Senha (/reset-password/:token)
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    const JWT_SECRET = 'chave';

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'A nova senha deve ter pelo menos 6 caracteres.'
        });
    }
    
    let userId;

    // 1. Verificar e Decodificar o JWT
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
    } catch (err) {
        // O token é inválido (expirado, alterado ou incorreto)
        return res.status(401).json({ 
            success: false, 
            message: 'Token de redefinição inválido ou expirado. Tente novamente a solicitação.' 
        });
    }

    // 2. Atualizar a Senha do Usuário
    try {
        await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [newPassword, userId] 
        );
        
        res.json({
            success: true,
            message: 'Sua senha foi redefinida com sucesso. Agora você pode fazer login.'
        });

    } catch (error) {
        console.error('Erro ao redefinir a senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao tentar atualizar a senha.'
        });
    }
});

export default router;

