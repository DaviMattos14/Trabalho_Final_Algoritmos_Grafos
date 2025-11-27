import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Box, 
  Archive, 
  BarChart3, 
  Moon, 
  Sun, 
  Network, 
  Share2 
} from 'lucide-react';

const Sidebar = ({ isOpen, isDarkMode, toggleTheme, onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Início', path: '/home' },
    { icon: <Share2 size={20} />, label: 'Algoritmos', path: '/algorithms' },
    { icon: <BookOpen size={20} />, label: 'Conteúdos', path: '/classes' }, 
    { icon: <Box size={20} />, label: 'Exercícios', path: '/problem' },
    //{ icon: <Archive size={20} />, label: 'Problemas Passados', path: '/history' },
    //{ icon: <BarChart3 size={20} />, label: 'Resultados', path: '/results' },
  ];

  const styles = {
    aside: {
        width: isOpen ? '260px' : '80px',
        backgroundColor: isDarkMode ? '#0f172a' : '#f3f4f6',
        borderRight: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        flexShrink: 0,
        transition: 'width 0.3s ease, background-color 0.3s',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        height: '100%' // Garante altura total no layout flex
    },
    logoArea: {
        padding: isOpen ? '0 1.5rem' : '0',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'flex-start' : 'center',
        gap: '10px',
        height: '40px'
    },
    logoText: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: isDarkMode ? '#f8fafc' : '#111827',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.2s',
        display: isOpen ? 'block' : 'none'
    },
    item: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: isOpen ? 'flex-start' : 'center',
      gap: '12px',
      padding: '12px 1.5rem',
      cursor: 'pointer',
      color: isActive ? '#3b82f6' : (isDarkMode ? '#94a3b8' : '#64748b'),
      backgroundColor: isActive ? (isDarkMode ? '#1e293b' : '#ffffff') : 'transparent',
      borderLeft: isActive ? '4px solid #2563eb' : '4px solid transparent',
      fontWeight: '500',
      fontSize: '0.95rem',
      transition: 'all 0.2s',
      textDecoration: 'none'
    }),
    footer: {
        padding: isOpen ? '0 1.5rem' : '0',
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'flex-start' : 'center',
        gap: '10px',
        color: isDarkMode ? '#94a3b8' : '#64748b',
        cursor: 'pointer'
    }
  };

  return (
    <aside style={styles.aside}>
      <div style={styles.logoArea}>
        <Network color="#2563eb" size={28} />
        <span style={styles.logoText}>StructureView</span>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <div 
              key={index} 
              style={styles.item(isActive)} 
              title={!isOpen ? item.label : ''}
              onClick={() => {
                  navigate(item.path);
                  // Se estiver no mobile (onItemClick existe), fecha o menu
                  if (onItemClick) onItemClick();
              }}
            >
              {item.icon}
              {isOpen && <span>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      <div style={styles.footer} onClick={toggleTheme}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        {isOpen && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
      </div>
    </aside>
  );
};

export default Sidebar;