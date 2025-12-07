import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Rota para buscar exercícios
router.get('/', async (req, res) => {
  try {
    // Definindo o cabeçalho aqui, diretamente na rota
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const [rows] = await pool.execute(
      'SELECT id, title, answer, topic, difficulty, created_at, updated_at FROM exercises ORDER BY id'
    );
    
    res.json({ success: true, exercises: rows });
  } catch (error) {
    console.error('Erro ao listar exercícios:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rota para buscar progresso do usuário em um exercício específico
router.get('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query; // Pega o ID do usuário da query string (?user_id=1)

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    }

    const [rows] = await pool.execute(
      'SELECT user_answer, is_completed FROM user_exercises WHERE exercise_id = ? AND user_id = ?',
      [id, user_id]
    );

    if (rows.length === 0) {
      // Se não tiver resposta salva, retorna null sem erro
      return res.json({ success: true, progress: null });
    }

    res.json({ success: true, progress: rows[0] });
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rota para criar um novo exercício
router.post('/', async (req, res) => {
  try {
    const { title, answer, topic } = req.body;
    if (!title || !answer) {
      return res.status(400).json({ success: false, message: 'title e answer são obrigatórios' });
    }

    const [result] = await pool.execute(
      'INSERT INTO exercises (title, answer, topic) VALUES (?, ?, ?)',
      [title, answer, topic || null]
    );

    res.status(201).json({
      success: true,
      message: 'Exercício criado',
      exercise: { id: result.insertId, title, topic: topic || null }
    });
  } catch (error) {
    console.error('Erro ao criar exercício:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rota para submeter a resposta de um exercícior e salvar o progresso do usuário
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, user_answer } = req.body;

    if (!user_id || typeof user_answer === 'undefined') {
      return res.status(400).json({ success: false, message: 'user_id e user_answer são obrigatórios' });
    }

    const [exRows] = await pool.execute('SELECT answer FROM exercises WHERE id = ?', [id]);
    if (exRows.length === 0) return res.status(404).json({ success: false, message: 'Exercício não encontrado' });

    const correct = (exRows[0].answer || '').toString().trim().toLowerCase();
    const isCompleted = true; 
    
    const completedAt = new Date();

    await pool.execute(
      `INSERT INTO user_exercises (user_id, exercise_id, user_answer, is_completed, completed_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_answer = VALUES(user_answer),
         is_completed = VALUES(is_completed),
         completed_at = IF(VALUES(is_completed), VALUES(completed_at), completed_at),
         updated_at = CURRENT_TIMESTAMP`,
      [user_id, id, user_answer, isCompleted ? 1 : 0, completedAt]
    );

    res.json({ success: true, message: 'Resposta salva', is_completed: !!isCompleted });
  } catch (error) {
    console.error('Erro ao submeter resposta:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rota para deletar um exercício
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM exercises WHERE id = ?', [id]);
    const affectedRows =  result?.affectedRows ??  result?.[0]?.affectedRows ?? 0;

    if (affectedRows === 0) return res.status(404).json({ success: false, message: 'Exercício não encontrado' });
    
    res.json({ success: true, message: 'Exercício deletado' });
  } catch (error) {
    console.error('Erro ao deletar exercício:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;