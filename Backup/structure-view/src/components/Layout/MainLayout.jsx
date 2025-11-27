import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import LoginModal from './LoginModal';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Detecta redimensionamento da tela
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false); // Fecha sidebar ao diminuir
      else setIsSidebarOpen(true); // Abre ao aumentar
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const openLogin = () => setIsLoginModalOpen(true);
  const closeLogin = () => setIsLoginModalOpen(false);

  const themeBg = isDarkMode ? '#0f172a' : '#f8f9fa';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: themeBg, overflow: 'hidden' }}>
      
      {/* Sidebar com comportamento Mobile */}
      <div style={{
          position: isMobile ? 'absolute' : 'relative',
          zIndex: 50,
          height: '100%',
          transform: isMobile && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
          boxShadow: isMobile && isSidebarOpen ? '4px 0 15px rgba(0,0,0,0.1)' : 'none'
      }}>
          <Sidebar 
            isOpen={isSidebarOpen} 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme}
            // Fecha sidebar ao clicar em item no mobile
            onItemClick={() => isMobile && setIsSidebarOpen(false)} 
          />
      </div>

      {/* Overlay para fechar sidebar no mobile clicando fora */}
      {isMobile && isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.5)', zIndex: 40
            }}
          />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
        
        <Header 
          title="StructureView" 
          toggleSidebar={toggleSidebar} 
          isDarkMode={isDarkMode}
          onLoginClick={openLogin} 
        />

        <Outlet context={{ isDarkMode }} /> 

      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={closeLogin} />
    </div>
  );
};

export default MainLayout;