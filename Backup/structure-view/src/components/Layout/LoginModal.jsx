import React from 'react';
import { Network, X } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    // Lógica de autenticação futura virá aqui
    onClose();
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
            <input 
              type="email" 
              placeholder="Email" 
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} 
            />
            <input 
              type="password" 
              placeholder="Senha" 
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} 
            />
            <button 
              type="submit" 
              style={{ 
                padding: '12px', 
                background: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                marginTop: '10px' 
              }}
            >
              Entrar
            </button>
          </form>
          
          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            Não tem conta? <a href="#" style={{ color: '#2563eb', fontWeight: 'bold' }}>Registre-se</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;