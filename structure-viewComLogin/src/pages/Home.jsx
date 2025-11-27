import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Home = () => {
  const { isDarkMode } = useOutletContext(); // Pega o tema do Layout

  const styles = {
    main: {
      flex: 1, 
      padding: '3rem', 
      overflowY: 'auto', 
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      color: isDarkMode ? '#f1f5f9' : '#111827',
      transition: 'background-color 0.3s' 
    },
    text: {
      color: isDarkMode ? '#94a3b8' : '#374151',
      lineHeight: '1.7',
      textAlign: 'justify',
      maxWidth: '900px'
    }
  };

  return (
    <main style={styles.main}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        Apresentação da plataforma
      </h2>
      
      <div style={styles.text}>
        <p style={{ marginBottom: '1.5rem' }}>
          Bem-vindo ao <strong>StructureView</strong>. Esta plataforma foi desenhada para auxiliar no estudo de algoritmos complexos através de visualização interativa.
        </p>
        <p>
          Clique em "Entrar" no canto superior direito para acessar sua conta, ou navegue pelos algoritmos disponíveis no menu lateral.
        </p>
      </div>
    </main>
  );
};

export default Home;