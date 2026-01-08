import React, { useState, useRef, useEffect } from 'react';
import { Menu, UserCircle, ArrowLeft, LogOut, Settings } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UpdateUserModal from './UpdateUserModal';

const Header = ({ title, toggleSidebar, isDarkMode, onLoginClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const menuRef = useRef(null);

  const isVisualizer = location.pathname === '/visualizer';
  const algoParam = searchParams.get('algo');

  const algoNames = {
    'dfs': 'Busca em Profundidade (DFS)',
    'bfs': 'Busca em Largura (BFS)',
    'dijkstra': 'Algoritmo de Dijkstra',
    'topo': 'Ordenação Topológica',
    'floyd': "Algoritmo de Floyd-Warshall"
  };

  // --- MUDANÇA 1: Registro das Rotas de Sub-páginas ---
  const routeTitles = {
    '/classes/graph-rep': 'Representação de Grafos',
    '/classes/linked-list': 'Listas Encadeadas',
    '/classes/bfs': 'Busca em Largura (BFS)',
    '/classes/dfs': 'Busca em Profundidade (DFS)',
    '/classes/topological': 'Ordenação Topológica',
    '/classes/dijkstra': 'Algoritmo de Dijkstra',
    '/classes/scc': 'Componentes Fortemente Conexos',
    // Exercícios
    '/problem/dfs-start-finish-time': 'Exercício: Tempos de Busca em Profundidade (DFS)',
    '/problem/form': 'Exercício: Múltipla escolha'
  };

  const displayTitle = (isVisualizer && algoParam)
    ? algoNames[algoParam]
    : (routeTitles[location.pathname] || title);

  // --- MUDANÇA 2: Lógica de Voltar Inteligente ---
  const showBackButton = isVisualizer || routeTitles[location.pathname];

  const handleBack = () => {
    if (isVisualizer) navigate('/algorithms');
    else if (location.pathname.includes('/classes')) navigate('/classes');
    else if (location.pathname.includes('/problem')) navigate('/problem'); // Volta para lista de exercícios
    else navigate('/home'); // Fallback
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
    setShowUserMenu(false);
  };

  const handleChangeData = () => {
    setShowUserMenu(false);
    setShowUpdateModal(true);
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const styles = {
    container: {
      height: '64px',
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', flexShrink: 0, transition: 'all 0.3s'
    },
    leftGroup: { display: 'flex', alignItems: 'center', gap: '1rem' },
    title: { fontSize: '1.1rem', fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#111827' },
    iconBtn: { cursor: 'pointer', color: isDarkMode ? '#cbd5e1' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', padding: 0 },
    loginBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem', transition: 'background 0.2s' },
    userButton: {
      display: 'flex', alignItems: 'center', gap: '8px',
      backgroundColor: 'transparent',
      color: isDarkMode ? '#cbd5e1' : '#475569',
      border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.9rem',
      transition: 'all 0.2s',
      position: 'relative'
    },
    userMenuContainer: {
      position: 'relative',
      display: 'inline-block'
    },
    userMenu: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '8px',
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      minWidth: '180px',
      zIndex: 1000,
      overflow: 'hidden'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 16px',
      cursor: 'pointer',
      color: isDarkMode ? '#cbd5e1' : '#475569',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'background 0.2s',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      background: 'transparent'
    },
    divider: { width: '1px', height: '24px', backgroundColor: isDarkMode ? '#334155' : '#e5e7eb', display: showBackButton ? 'block' : 'none' },
    menuDivider: {
      height: '1px',
      backgroundColor: isDarkMode ? '#334155' : '#e5e7eb',
      margin: 0
    }
  };

  return (
    <header style={styles.container}>
      <div style={styles.leftGroup}>
        <button onClick={toggleSidebar} style={styles.iconBtn} title="Menu">
          <Menu size={24} />
        </button>

        {showBackButton && (
          <>
            <div style={styles.divider}></div>
            <button onClick={handleBack} style={styles.iconBtn} title="Voltar">
              <ArrowLeft size={24} />
            </button>
          </>
        )}

        <h1 style={styles.title}>{displayTitle}</h1>
      </div>

      <div>
        {user ? (
          <div style={styles.userMenuContainer} ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={styles.userButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <UserCircle size={20} />
              Olá, {user.name || user.email.split('@')[0]}
            </button>

            {showUserMenu && (
              <div style={styles.userMenu}>
                <button
                  onClick={handleChangeData}
                  style={styles.menuItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Settings size={18} />
                  Alterar dados
                </button>
                <div style={styles.menuDivider}></div>
                <button
                  onClick={handleLogout}
                  style={{ ...styles.menuItem, color: isDarkMode ? '#f87171' : '#dc2626' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#7f1d1d22' : '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onLoginClick} style={styles.loginBtn}>
            <UserCircle size={18} />
            Entrar / Registrar
          </button>
        )}
      </div>

      <UpdateUserModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        isDarkMode={isDarkMode}
      />
    </header>
  );
};

export default Header;