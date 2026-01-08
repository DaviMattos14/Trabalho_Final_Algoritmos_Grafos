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
  },

  async updateUser({ userId, currentPassword, email, newPassword }) {
    try {
      const response = await fetch(`${API_URL}/auth/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          current_password: currentPassword,
          email,
          new_password: newPassword
        }),
      });

      // Verificar se a resposta é JSON antes de fazer o parse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Servidor não está respondendo corretamente. Verifique se o servidor está rodando.');
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao atualizar dados');
      return data;
    } catch (error) {
      if (error.message.includes('fetch')) throw new Error('Não foi possível conectar ao servidor.');
      throw error;
    }
  },

  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao solicitar link de redefinição.');
      return data;
    } catch (error) {
      if (error.message.includes('fetch')) throw new Error('Não foi possível conectar ao servidor.');
      throw error;
    }
  },

  async resetPassword(token, newPassword) {
    try {
      // O token vai na URL (params) e a nova senha no corpo
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao redefinir a senha.');
      return data;
    } catch (error) {
      if (error.message.includes('fetch')) throw new Error('Não foi possível conectar ao servidor.');
      throw error;
    }
  }
};