import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Home = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* 1. Barra Lateral */}
      <Sidebar />

      {/* 2. Área Principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* 2.1 Cabeçalho */}
        <Header title="Início" />

        {/* 2.2 Conteúdo com Scroll */}
        <main style={{ 
          flex: 1, 
          padding: '3rem', 
          overflowY: 'auto', 
          backgroundColor: '#ffffff' 
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
            Apresentação da plataforma
          </h2>
          
          <div style={{ color: '#374151', lineHeight: '1.7', fontSize: '1rem', textAlign: 'justify', maxWidth: '900px' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </p>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;