import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Book, Share2, List, ArrowRight } from 'lucide-react';

const Classes = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext(); // Pega o tema do Layout

  // Definição dos Conteúdos
  const sections = [
    {
      title: "Estruturas Básicas",
      icon: <List size={24} />,
      items: [
        { id: 'linked-list', title: "Lista Encadeada (Linked List)", desc: "Conceitos de nós e ponteiros." }
      ]
    },
    {
      title: "Grafos",
      icon: <Share2 size={24} />,
      items: [
        { id: 'graph-intro', title: "Representação de Grafos", desc: "Matriz vs Lista de Adjacência." },
        { id: 'dfs-intro', title: "Busca em Profundidade (DFS)", desc: "Exploração de grafos com pilha." },
        { id: 'bfs-intro', title: "Busca em Largura (BFS)", desc: "Exploração de grafos com fila." },
        { id: 'scc-intro', title: "Componentes Fortemente Conexos", desc: "Ciclos e conectividade (CFCs)." },
        { id: 'topo-intro', title: "Ordenação Topológica", desc: "Ordenação linear para grafos direcionados acíclicos." },
        { id: 'dijkstra-intro', title: "Algoritmo de Dijkstra", desc: "Caminho mais curto em grafos ponderados." }
      ]
    }
  ];

  // Cores do Tema
  const theme = {
    bg: isDarkMode ? '#1e293b' : '#ffffff', // Fundo do container (igual ao Home)
    text: isDarkMode ? '#ffffffff' : '#111827',
    textSec: isDarkMode ? '#d9dde4ff' : '#64748b',
    cardBg: isDarkMode ? '#0f172a' : '#f8fafc',
    cardBorder: isDarkMode ? '#334155' : '#e2e8f0',
    cardHover: isDarkMode ? '#1e293b' : '#ffffff',
    sectionTitle: isDarkMode ? '#e2e8f0' : '#334155'
  };

  return (
    <main style={{ 
      flex: 1, 
      padding: '3rem', 
      overflowY: 'auto', 
      backgroundColor: theme.bg,
      transition: 'background-color 0.3s'
    }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text, marginBottom: '2rem' }}>
        Conteúdos de Estudo
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {sections.map((section, idx) => (
          <div key={idx}>
            {/* Título da Seção */}
            <div style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', 
                marginBottom: '1.5rem', paddingBottom: '0.5rem',
                borderBottom: `2px solid ${theme.cardBorder}`,
                color: theme.sectionTitle
            }}>
                {section.icon}
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>{section.title}</h3>
            </div>

            {/* Grid de Botões */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {section.items.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'graph-rep' || item.id === 'graph-intro') navigate('/classes/graph-rep');
                    else if (item.id === 'linked-list') navigate('/classes/linked-list');
                    else if (item.id === 'dfs-intro') navigate('/classes/dfs');
                    else if (item.id === 'bfs-intro') navigate('/classes/bfs');
                    else if (item.id === 'scc-intro') navigate('/classes/scc');
                    else if (item.id === 'topo-intro') navigate('/classes/topological');
                    else if (item.id === 'dijkstra-intro') navigate('/classes/dijkstra');
                    else console.log("Aula em breve");
                  }}
                  style={{
                    backgroundColor: theme.cardBg,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: '8px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                  onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = theme.cardBorder;
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: theme.text, fontSize: '1rem', fontWeight: '600' }}>{item.title}</h4>
                    <ArrowRight size={18} color="#3b82f6" />
                  </div>
                  <p style={{ margin: 0, color: theme.textSec, fontSize: '0.85rem', lineHeight: '1.4' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </main>
  );
};

export default Classes;