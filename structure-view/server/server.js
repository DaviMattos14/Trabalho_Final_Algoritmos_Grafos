import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import exercisesRoutes from './routes/exercises.js'; 

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exercisesRoutes); 

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor rodando!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});

