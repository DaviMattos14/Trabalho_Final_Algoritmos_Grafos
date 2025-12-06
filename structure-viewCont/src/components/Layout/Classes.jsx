import React from 'react';
import PageContainer from '../components/Layout/PageContainer';

const Classes = () => {
  // Estrutura de exemplo para as categorias de conteúdo
  const categories = [
    { title: 'Introdução a Grafos', count: 4, description: 'Conceitos fundamentais, terminologia e representações.' },
    { title: 'Algoritmos de Busca', count: 3, description: 'Aulas sobre DFS e BFS, e suas aplicações práticas.' },
    { title: 'Caminhos Mínimos', count: 2, description: 'Teoria e prática do Algoritmo de Dijkstra.' },
    { title: 'Ordenação Topológica', count: 1, description: 'Entendendo a ordem de dependências em grafos acíclicos.' },
    // Adicione mais categorias aqui
  ];

  return (
    <PageContainer title="Conteúdos e Aulas">
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Categorias de Conteúdo</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {categories.map((cat, index) => (
            <div 
              key={index} 
              style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '20px', 
                cursor: 'pointer',
                transition: 'box-shadow 0.3s, transform 0.3s',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              // Futuramente, esta ação levará para uma subpágina de aulas
              onClick={() => console.log(`Abrir categoria: ${cat.title}`)}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h3 style={{ marginTop: 0, color: '#2563eb' }}>{cat.title}</h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', minHeight: '40px' }}>{cat.description}</p>
              <p style={{ fontWeight: 'bold', color: '#64748b' }}>{cat.count} {cat.count > 1 ? 'Aulas' : 'Aula'}</p>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

export default Classes;
