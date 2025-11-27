const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
      if (error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3001.');
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
      if (error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3001.');
      }
      throw error;
    }
  },
};

