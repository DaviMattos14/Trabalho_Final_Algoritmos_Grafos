import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET / => listar todos os exercícios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, topic, difficulty, created_at, updated_at FROM exercises ORDER BY id'
    );
    res.json({ success: true, exercises: rows });
  } catch (error) {
    console.error('Erro ao listar exercícios:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /:id/progress
router.get('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query; 

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    }

    const [rows] = await pool.execute(
      'SELECT user_answer, is_completed FROM user_exercises WHERE exercise_id = ? AND user_id = ?',
      [id, user_id]
    );

    if (rows.length === 0) {
      return res.json({ success: true, progress: null });
    }

    // Converte o bit do banco (0/1) para boolean para o front
    const data = rows[0];
    data.is_completed = Boolean(data.is_completed);

    res.json({ success: true, progress: data });
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// POST / => criar novo exercício
router.post('/', async (req, res) => {
  try {
    const { title, answer, topic, difficulty } = req.body;
    if (!title || !answer) {
      return res.status(400).json({ success: false, message: 'title e answer são obrigatórios' });
    }

    const [result] = await pool.execute(
      'INSERT INTO exercises (title, answer, topic, difficulty) VALUES (?, ?, ?, ?)',
      [title, answer, topic || null, difficulty || 'Médio']
    );

    res.status(201).json({
      success: true,
      message: 'Exercício criado',
      exercise: { id: result.insertId, title, topic: topic || null, difficulty }
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
    // Recebe o status calculado pelo Front-end
    const { user_id, user_answer, is_completed } = req.body;

    if (!user_id || typeof user_answer === 'undefined') {
      return res.status(400).json({ success: false, message: 'user_id e user_answer são obrigatórios' });
    }

    // Converte para booleano real (caso venha string ou undefined)
    const isCompletedBool = is_completed === true; 
    
    // Data de conclusão: Só define se for completado agora
    const completedAt = isCompletedBool ? new Date() : null;

    // Query UPSERT (Insert ou Update)
    // A lógica do completed_at garante que se já estava completo, mantém a data original.
    await pool.execute(
      `INSERT INTO user_exercises (user_id, exercise_id, user_answer, is_completed, completed_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_answer = VALUES(user_answer),
         is_completed = VALUES(is_completed),
         -- Se o novo status é completo e o antigo era nulo, atualiza a data. Se não, mantém a antiga.
         completed_at = IF(VALUES(is_completed) AND completed_at IS NULL, VALUES(completed_at), completed_at),
         updated_at = CURRENT_TIMESTAMP`,
      [user_id, id, user_answer, isCompletedBool ? 1 : 0, completedAt]
    );

    res.json({ success: true, message: 'Progresso salvo', is_completed: isCompletedBool });
  } catch (error) {
    console.error('Erro ao submeter resposta:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /:id => detalhes do exercício (inclui gabarito `answer`)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT id, title, answer, topic, difficulty, created_at, updated_at FROM exercises WHERE id = ?',
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercício não encontrado' });
    }

    res.json({ success: true, exercise: rows[0] });
  } catch (error) {
    console.error('Erro ao buscar exercício:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM exercises WHERE id = ?', [id]);
    const affectedRows = result.affectedRows ?? result[0]?.affectedRows ?? 0;
    if (affectedRows === 0) return res.status(404).json({ success: false, message: 'Exercício não encontrado' });
    res.json({ success: true, message: 'Exercício deletado' });
  } catch (error) {
    console.error('Erro ao deletar exercício:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;