import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET / => listar todos os exercícios (sem revelar answer)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, topic, created_at, updated_at FROM exercises ORDER BY id'
    );
    res.json({ success: true, exercises: rows });
  } catch (error) {
    console.error('Erro ao listar exercícios:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// POST / => criar novo exercício
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

// POST /:id/submit => enviar resposta do usuário
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
    const submitted = (user_answer || '').toString().trim().toLowerCase();
    const isCompleted = correct !== '' && submitted === correct;
    const completedAt = isCompleted ? new Date() : null;

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

    res.json({ success: true, message: 'Resposta recebida', is_completed: !!isCompleted });
  } catch (error) {
    console.error('Erro ao submeter resposta:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// DELETE /:id => deletar exercício
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM exercises WHERE id = ?', [id]);

    // result.affectedRows depende do driver; mysql2 retorna OkPacket
    const affectedRows = result.affectedRows ?? result.affectedRows === 0 ? result.affectedRows : (result[0] && result[0].affectedRows) || 0;
    if (affectedRows === 0) return res.status(404).json({ success: false, message: 'Exercício não encontrado' });

    res.json({ success: true, message: 'Exercício deletado' });
  } catch (error) {
    console.error('Erro ao deletar exercício:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;