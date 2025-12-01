// --- MUDANÇA AQUI: usa variável de ambiente em produção ---
// Localmente o Vite proxy '/api' para 'http://localhost:3001'. Em produção
// configure a variável VITE_API_URL no Vercel para apontar ao backend (ex: https://api.example.com)
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      return data;
    } catch (error) {
      // Mensagem genérica pois erros de proxy aparecem como erros de rede
      if (error.message.includes('fetch') || error.message.includes('token')) {
        throw new Error('Erro de conexão. Verifique se o backend está rodando.');
      }
      throw error;
    }
  },

  async register(email, password, name) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao registrar');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async getExercisesList() {
    try {
      const response = await fetch(`${API_URL}/exercises`);
      // Verifica se o retorno é JSON válido
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta inválida do servidor (não é JSON)");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Erro ao buscar lista de exercícios:", error);
      throw error;
    }
  },

  async getExerciseDetails(id) {
    try {
      const response = await fetch(`${API_URL}/exercises/${id}`);
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta inválida do servidor (não é JSON)");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Erro ao buscar detalhes do exercício:", error);
      throw error;
    }
  },

  async getUserProgress(exerciseId, userId) {
      try {
          const response = await fetch(`${API_URL}/exercises/${exerciseId}/progress?user_id=${userId}`);
          const data = await response.json();
          if (!response.ok) throw new Error(data.message);
          return data; 
      } catch (error) {
          console.error("Erro ao buscar progresso:", error);
          return null;
      }
  },

  async submitExercise(exerciseId, userId, userAnswer, isCompleted) {
    try {
      const response = await fetch(`${API_URL}/exercises/${exerciseId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            user_id: userId, 
            user_answer: JSON.stringify(userAnswer),
            is_completed: isCompleted // Envia o status calculado pelo front
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Erro ao submeter:", error);
      throw error;
    }
  }
};