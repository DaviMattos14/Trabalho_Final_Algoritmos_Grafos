import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { AlertCircle, CheckCircle, Lock, Network } from 'lucide-react';
import { api } from '../services/api'; // Assumindo que este é o caminho

const ResetPasswordPage = () => {
  // Captura o token da URL, ex: /reset-password/TOKEN_AQUI
  const { token } = useParams(); 
  const navigate = useNavigate();

  // Estados do Componente
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Verifica se o token está presente ao carregar
    if (!token) {
      setError('Token de redefinição não encontrado na URL.');
    }
  }, [token]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Token de redefinição ausente.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('A senha e a confirmação de senha não coincidem.');
      return;
    }

    setLoading(true);

    try {
      // Chamada para a nova função da API
      const response = await api.resetPassword(token, password);
      
      if (response.success) {
        setSuccess(response.message || 'Senha redefinida com sucesso!');
        // Redireciona para o login após 3 segundos
        setTimeout(() => {
          navigate('/home'); // Ajuste para a sua rota de login
        }, 2000);
      } else {
        setError(response.message || 'Erro ao redefinir a senha.');
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro. Tente novamente ou solicite um novo link.');
    } finally {
      setLoading(false);
    }
  };


  const styles = {
    container: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#f1f5f9',  borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '400px',
    },
    content: {
      backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px',
      textAlign: 'center'
    },
    input: {
      width: '100%', padding: '12px', borderRadius: '6px',
      border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none'
    },
    button: {
      width: '100%', padding: '12px', borderRadius: '6px', border: 'none',
      backgroundColor: loading ? '#94a3b8' : '#2563eb', 
      color: 'white', fontWeight: 'bold', fontSize: '1rem',
      cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px',
      transition: 'background 0.2s'
    },
    errorBox: {
      backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px',
      borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1rem',
      display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left'
    },
    successBox: {
        backgroundColor: '#dcfce7', color: '#16a34a', padding: '10px',
        borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1rem',
        display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left'
    },

    overlay: {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // O fundo escuro semi-transparente
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.content}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#2563eb' }}>
              <Lock size={48} />
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
              Redefinir Senha
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Insira sua nova senha.
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {error && (
                  <div style={styles.errorBox}>
                      <AlertCircle size={18} />
                      <span>{error}</span>
                  </div>
              )}

              {success && (
                  <div style={styles.successBox}>
                      <CheckCircle size={18} />
                      <span>{success}</span>
                  </div>
              )}
              
              <input 
                type="password" 
                placeholder="Nova Senha (mín. 6 caracteres)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              
              <input 
                type="password" 
                placeholder="Confirmar Nova Senha" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                required
              />
              
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? 'Redefinindo...' : 'Trocar Senha'}
              </button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;