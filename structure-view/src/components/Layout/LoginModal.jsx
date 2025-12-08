import React, { useState } from 'react';
import { Network, X, AlertCircle, CheckCircle } from 'lucide-react';

// --- CORREÇÃO DOS CAMINHOS (../../) ---
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const LoginModal = ({ isOpen, onClose }) => {
  // Hooks
  const { login } = useAuth();
  
  // Estados do Formulário
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Estados de UI
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(''); 

  if (!isOpen) return null;

  const resetForm = () => {
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSwitchMode = (e) => {
    e.preventDefault();
    setIsRegister(!isRegister);
    setIsForgot(false);
    resetForm();
  };

  const handleToggleForgot = (e) => {
    e.preventDefault();
    setIsForgot(!isForgot);
    setIsRegister(false);
    resetForm();
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError("O email é obrigatório para a recuperação de senha.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.forgotPassword(email);

      if (response.success) {
        setSuccess('Link de redefinição enviado! Verifique sua caixa de entrada.');
      } else {
        // Trata erros específicos da API se houver
        setError(response.message || 'Erro ao tentar recuperar a senha. Email não encontrado ou erro de servidor.');
      }

    } catch (err) {
      setError(err.message || 'Ocorreu um erro na solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;

      if (isRegister) {
        if (!name) throw new Error("Nome é obrigatório para cadastro.");
        response = await api.register(email, password, name);
      } else {
        response = await api.login(email, password);
      }

      if (response.success) {
        login(response.user);
        onClose();
      } else {
         setError(response.message || 'Credenciais inválidas ou erro no servidor.');
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    content: {
      backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px',
      position: 'relative', textAlign: 'center'
    },
    closeBtn: {
      position: 'absolute', right: '15px', top: '15px',
      background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
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
    }
  };

  // Determina o texto do cabeçalho
  const getHeaderTitle = () => {
    if (isForgot) return 'Recuperar Senha';
    if (isRegister) return 'Crie sua conta';
    return 'Bem-vindo de volta';
  };

  // Determina o texto da descrição
  const getHeaderDescription = () => {
    if (isForgot) return 'Insira seu email para receber um link de redefinição.';
    if (isRegister) return 'Preencha os dados para começar';
    return 'Entre para acessar seus grafos';
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={24} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#2563eb' }}>
            <Network size={48} />
        </div>
        <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
            {getHeaderTitle()}
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            {getHeaderDescription()}
        </p>
        
        {/* Formulário de Recuperação de Senha */}
        {isForgot ? (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {error && (
                    <div style={styles.errorBox}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}
                
                {/* NOVO: Exibe mensagem de sucesso */}
                {success && (
                    <div style={styles.successBox}>
                        <CheckCircle size={18} />
                        <span>{success}</span>
                    </div>
                )}

                <input 
                  type="email" 
                  placeholder="Email de Recuperação" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
                
                <button type="submit" style={styles.button} disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
                </button>
                
                {/* Link para voltar para o Login */}
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                    <a href="#" onClick={handleToggleForgot} style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>
                        Voltar para o Login
                    </a>
                </p>

            </form>
        ) : (
            /* Formulário de Login/Cadastro */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {error && (
                    <div style={styles.errorBox}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {isRegister && (
                    <input 
                      type="text" 
                      placeholder="Seu Nome" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={styles.input}
                      required
                    />
                )}

                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
                
                <input 
                  type="password" 
                  placeholder="Senha" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
                
                {/* Link para 'Esqueceu sua senha?' */}
                {!isRegister && (
                    <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
                        <a href="#" onClick={handleToggleForgot} style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none' }}>
                            Esqueceu sua senha?
                        </a>
                    </div>
                )}

                <button type="submit" style={styles.button} disabled={loading}>
                  {loading ? 'Carregando...' : (isRegister ? 'Cadastrar' : 'Entrar')}
                </button>
            </form>
        )}
        
        {/* Rodapé de Login/Cadastro */}
        {!isForgot && (
            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                {isRegister ? 'Já tem uma conta? ' : 'Não tem conta? '}
                <a href="#" onClick={handleSwitchMode} style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>
                    {isRegister ? 'Faça Login' : 'Registre-se'}
                </a>
            </p>
        )}
      </div>
    </div>
  );
};

export default LoginModal;