import React from 'react';
import { Menu, UserCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const Header = ({ title, toggleSidebar, isDarkMode, onLoginClick }) => {
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
        {/* 1. Botão da Sidebar (Sempre visível) */}
        <button onClick={toggleSidebar} style={styles.iconBtn} title="Menu">
          <Menu size={24} />
        </button>

        {/* 2. Separador e Botão Voltar (Apenas no Visualizer) */}
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

        {/* 3. Título da Página ou do Algoritmo */}
        <h1 style={styles.title}>{displayTitle}</h1>
      </div>

      <div>
        <button 
          onClick={onLoginClick} 
          style={styles.loginBtn}
        >
          <UserCircle size={18} />
          Entrar / Registrar
        </button>
      </div>
    </header>
  );
};

export default Header;