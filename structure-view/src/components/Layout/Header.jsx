import React from 'react';
import { Menu, UserCircle, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Importa o contexto

const Header = ({ title, toggleSidebar, isDarkMode, onLoginClick }) => {
  const { user, logout } = useAuth(); // Pega o usuário e a função de logout
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Verifica se estamos na página do Visualizador
  const isVisualizer = location.pathname === '/visualizer';
  const algoParam = searchParams.get('algo');

  // Mapa de nomes para o título dinâmico
  const algoNames = {
    'dfs': 'Busca em Profundidade (DFS)',
    'bfs': 'Busca em Largura (BFS)',
    'dijkstra': 'Algoritmo de Dijkstra',
    'topo': 'Ordenação Topológica'
  };

  // Define qual título mostrar
  const displayTitle = isVisualizer && algoParam ? algoNames[algoParam] : title;

  const handleLogout = () => {
      logout();
      navigate('/home'); // Redireciona para Home após sair
  };

  const styles = {
    container: {
      height: '64px',
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      flexShrink: 0,
      transition: 'all 0.3s'
    },
    leftGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    title: {
      fontSize: '1.1rem', 
      fontWeight: '600', 
      color: isDarkMode ? '#f8fafc' : '#111827'
    },
    iconBtn: {
      cursor: 'pointer', 
      color: isDarkMode ? '#cbd5e1' : '#64748b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'none',
      border: 'none',
      padding: 0
    },
    loginBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.9rem',
      transition: 'background 0.2s'
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: '#dc2626ff',
        color: isDarkMode ? '#ffffffff' : '#ffffffff', // Vermelho
        border: `1px solid ${isDarkMode ? '#dc2626ff' : '#dc2626ff'}`,
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '0.9rem',
        transition: 'all 0.2s'
    },
    userText: {
        color: isDarkMode ? '#cbd5e1' : '#475569',
        fontWeight: '600',
        marginRight: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    divider: {
        width: '1px',
        height: '24px',
        backgroundColor: isDarkMode ? '#334155' : '#e5e7eb',
        display: isVisualizer ? 'block' : 'none'
    }
  };

  return (
    <header style={styles.container}>
      <div style={styles.leftGroup}>
        {/* 1. Botão da Sidebar */}
        <button onClick={toggleSidebar} style={styles.iconBtn} title="Menu">
          <Menu size={24} />
        </button>

        {/* 2. Botão Voltar (Visualizer) */}
        {isVisualizer && (
            <>
                <div style={styles.divider}></div>
                <button 
                    onClick={() => navigate('/algorithms')} 
                    style={styles.iconBtn}
                    title="Voltar para lista"
                >
                    <ArrowLeft size={24} />
                </button>
            </>
        )}

        {/* 3. Título */}
        <h1 style={styles.title}>{displayTitle}</h1>
      </div>

      <div>
        {user ? (
            // ESTADO LOGADO
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={styles.userText}>
                    <UserCircle size={20} />
                    Olá, {user.name || user.email.split('@')[0]}
                </span>
                <button onClick={handleLogout} style={styles.logoutBtn} title="Sair da conta">
                    <LogOut size={16} />
                    Sair
                </button>
            </div>
        ) : (
            // ESTADO DESLOGADO
            <button onClick={onLoginClick} style={styles.loginBtn}>
                <UserCircle size={18} />
                Entrar / Registrar
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;