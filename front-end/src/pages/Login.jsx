import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // MUDANÇA AQUI: Redireciona para /home
    navigate('/home');
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f0f2f5',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '2.5rem', 
        borderRadius: '12px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
        width: '100%', 
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#2563eb' }}>
            <Network size={48} />
        </div>
        <h1 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>StructureView</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Entre para acessar seus grafos</p>
        
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
              fontSize: '1rem',
              marginTop: '10px'
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;