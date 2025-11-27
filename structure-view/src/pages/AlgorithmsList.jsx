import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const AlgorithmsList = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext();

  const algos = [
    { id: 'dfs', name: 'Busca em Profundidade (DFS)', desc: 'Explora o grafo indo o mais fundo possível.', color: '#3b82f6' },
    { id: 'bfs', name: 'Busca em Largura (BFS)', desc: 'Explora vizinhos camada por camada.', color: '#10b981' },
    { id: 'dijkstra', name: 'Algoritmo de Dijkstra', desc: 'Encontra o caminho mais curto em grafos ponderados.', color: '#f59e0b' },
    { id: 'topo', name: 'Ordenação Topológica', desc: 'Ordenação linear para grafos direcionados.', color: '#8b5cf6' },
  ];

  return (
    <main style={{ padding: '2rem', overflowY: 'auto', flex: 1, backgroundColor: isDarkMode ? '#1e293b' : '#f8f9fa' }}>
      <h2 style={{ marginBottom: '2rem', color: isDarkMode ? '#fff' : '#333' }}>Catálogo de Algoritmos</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {algos.map(algo => (
          <div 
            key={algo.id}
            onClick={() => navigate(`/visualizer?algo=${algo.id}`)}
            style={{
              background: isDarkMode ? '#0f172a' : 'white',
              borderRadius: '8px',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              color: isDarkMode ? '#fff' : '#333'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: algo.color, marginBottom: '1rem' }}></div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{algo.name}</h3>
            <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.9rem' }}>{algo.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AlgorithmsList;