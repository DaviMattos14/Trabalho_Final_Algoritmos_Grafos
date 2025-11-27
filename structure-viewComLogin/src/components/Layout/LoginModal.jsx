import React, { useState } from 'react';
import { Network, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const LoginModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const response = await api.register(email, password, name);
        if (response.success) {
          login(response.user);
          onClose();
        }
      } else {
        const response = await api.login(email, password);
        if (response.success) {
          login(response.user);
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  // Reutilizamos as classes .modal do CSS global
  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content" style={{ maxWidth: '400px', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={24} color="#64748b" />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#2563eb' }}>
              <Network size={48} />
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Bem-vindo de volta</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Entre para acessar seus projetos</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ 
                padding: '10px', 
                background: '#fee2e2', 
                color: '#dc2626', 
                borderRadius: '6px', 
                fontSize: '0.9rem' 
              }}>
                {error}
              </div>
            )}
            {isRegister && (
              <input 
                type="text" 
                placeholder="Nome" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} 
              />
            )}
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} 
            />
            <input 
              type="password" 
              placeholder="Senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} 
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '12px', 
                background: loading ? '#94a3b8' : '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold', 
                marginTop: '10px' 
              }}
            >
              {loading ? (isRegister ? 'Registrando...' : 'Entrando...') : (isRegister ? 'Registrar' : 'Entrar')}
            </button>
          </form>
          
          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            {isRegister ? (
              <>Já tem conta? <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(false); setError(''); }} style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>Entrar</a></>
            ) : (
              <>Não tem conta? <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(true); setError(''); }} style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>Registre-se</a></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;