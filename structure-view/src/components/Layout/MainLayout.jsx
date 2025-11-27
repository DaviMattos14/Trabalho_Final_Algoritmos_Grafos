import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import LoginModal from './LoginModal';

const MainLayout = () => {
  // ... (Lógica de estado mantida)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  const openLogin = () => setIsLoginModalOpen(true);
  const closeLogin = () => setIsLoginModalOpen(false);

  const themeBg = isDarkMode ? '#0f172a' : '#f8f9fa';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: themeBg }}>
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <Header 
          title="StructureView" 
          toggleSidebar={toggleSidebar} 
          isDarkMode={isDarkMode}
          onLoginClick={openLogin} 
        />

        <Outlet context={{ isDarkMode }} /> 

      </div>

      {/* Renderização Condicional para evitar erro se não chamado */}
      {isLoginModalOpen && (
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLogin} />
      )}
    </div>
  );
};

export default MainLayout;