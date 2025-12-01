const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao fazer login');
      return data;
    } catch (error) {
      if (error.message.includes('fetch')) throw new Error('Não foi possível conectar ao servidor.');
      throw error;
    }
  },

  async register(email, password, name) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao registrar');
      return data;
    } catch (error) {
      if (error.message.includes('fetch')) throw new Error('Não foi possível conectar ao servidor.');
      throw error;
    }
  },

  async getExercisesList() {
    try {
      const response = await fetch(`${API_URL}/exercises`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error("Erro ao buscar lista:", error);
      throw error;
    }
  },

  // --- NOVO MÉTODO ---
  async getUserProgress(exerciseId, userId) {
      try {
          const response = await fetch(`${API_URL}/exercises/${exerciseId}/progress?user_id=${userId}`);
          const data = await response.json();
          if (!response.ok) throw new Error(data.message);
          return data; // { success: true, progress: { user_answer: "...", is_completed: 1 } }
      } catch (error) {
          console.error("Erro ao buscar progresso:", error);
          return null;
      }
  },
  // ------------------

  async submitExercise(exerciseId, userId, userAnswer) {
    try {
      const response = await fetch(`${API_URL}/exercises/${exerciseId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            user_id: userId, 
            user_answer: JSON.stringify(userAnswer) // Garante envio como string
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