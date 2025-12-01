import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Play, CheckCircle, Clock, Circle, Box, ShieldAlert, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProblemsList = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext();
  const { user } = useAuth(); 

  // --- NOVO: Estado para o filtro ---
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock de Dados dos Exercícios
  const categories = [
    {
      title: "Grafos",
      items: [
        { id: 'dfs-start-finish-time', title: 'Tempos de Busca em Profundidade (DFS)', difficulty: 'Fácil', algo: 'dfs' },
        { id: 'ordenacao-topologica-1', title: 'Ordenação Topologica 1', difficulty: 'Facil', algo: 'dfs' }
      ]
    }
  ];

  // --- LÓGICA DE FILTRAGEM ---
  const filteredCategories = selectedCategory === 'all' 
    ? categories 
    : categories.filter(cat => cat.title === selectedCategory);

  // Mock de Status do Usuário
  const userProgress = {
    'bfs-basic': 'completed',
    'dfs-basic': 'in_progress',
    'dijkstra-path': 'not_started',
    'detect-cycle': 'not_started',
    'topo-sort': 'completed'
  };

  const getStatusConfig = (id) => {
    const status = userProgress[id] || 'not_started';
    switch (status) {
      case 'completed': return { label: 'Concluído', color: '#10b981', icon: <CheckCircle size={16} /> };
      case 'in_progress': return { label: 'Em Andamento', color: '#f59e0b', icon: <Clock size={16} /> };
      default: return { label: 'Não Iniciado', color: '#64748b', icon: <Circle size={16} /> };
    }
  };

  const theme = {
    bg: isDarkMode ? '#1e293b' : '#f8f9fa',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSec: isDarkMode ? '#94a3b8' : '#64748b',
    cardBg: isDarkMode ? '#0f172a' : 'white',
    cardBorder: isDarkMode ? '#334155' : '#e2e8f0',
    inputBg: isDarkMode ? '#0f172a' : '#ffffff'
  };

  return (
    <main style={{ flex: 1, padding: '3rem', overflowY: 'auto', backgroundColor: theme.bg }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: theme.text, fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
            Exercícios Práticos
        </h2>

        {/* --- NOVO: Dropdown de Filtro --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={20} color={theme.textSec} />
            <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                    padding: '10px 15px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.cardBorder}`,
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                    outline: 'none',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    minWidth: '200px'
                }}
            >
                <option value="all">Todas as Categorias</option>
                {categories.map((cat, idx) => (
                    <option key={idx} value={cat.title}>{cat.title}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Aviso se não estiver logado */}
      {!user && (
        <div style={{ 
          marginBottom: '2rem', padding: '15px', borderRadius: '8px', 
          backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', 
          border: '1px solid #3b82f6', color: '#3b82f6',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <ShieldAlert size={20} />
          <span>Faça login para salvar seu progresso nos exercícios.</span>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {filteredCategories.length > 0 ? (
            filteredCategories.map((cat, idx) => (
            <section key={idx}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1.5rem 0', color: theme.textSec, borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom: '10px' }}>
                    {cat.title}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {cat.items.map((item) => {
                    const status = getStatusConfig(item.id);
                    
                    return (
                    <div 
                        key={item.id}
                        style={{
                        background: theme.cardBg,
                        borderRadius: '8px',
                        border: `1px solid ${theme.cardBorder}`,
                        padding: '1.5rem',
                        display: 'flex', flexDirection: 'column', gap: '15px',
                        transition: 'transform 0.2s',
                        position: 'relative'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h4 style={{ margin: 0, color: theme.text, fontSize: '1.1rem', fontWeight: '600' }}>{item.title}</h4>
                                <span style={{ fontSize: '0.85rem', color: theme.textSec, marginTop: '5px', display: 'inline-block' }}>Dificuldade: {item.difficulty}</span>
                            </div>
                            <Box size={24} color={theme.textSec} style={{opacity: 0.5}} />
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: `1px solid ${theme.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button 
                                onClick={() => navigate(`/problem/${item.id}`)}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: '#3b82f6', color: 'white', border: 'none',
                                    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
                                }}
                            >
                                <Play size={16} fill="white" /> Praticar
                            </button>

                            {user && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: status.color, fontWeight: '500' }}>
                                    {status.icon}
                                    {status.label}
                                </div>
                            )}
                        </div>
                    </div>
                    );
                })}
                </div>
            </section>
            ))
        ) : (
            <p style={{ color: theme.textSec, textAlign: 'center', marginTop: '2rem' }}>Nenhum exercício encontrado nesta categoria.</p>
        )}
      </div>
    </main>
  );
};

export default ProblemsList;