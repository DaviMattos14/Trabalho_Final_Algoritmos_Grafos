import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Play, CheckCircle, Clock, Circle, Box, ShieldAlert, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const ProblemsList = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext();
  const { user } = useAuth();

  // Estados de Dados
  const [exercises, setExercises] = useState([]);
  const [progressMap, setProgressMap] = useState({}); // Mapa: { id: 'completed' | 'not_started' }
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 1. Carregar Lista de Exercícios do Banco de Dados
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await api.getExercisesList();
        if (data.success) {
          setExercises(data.exercises);
        }
      } catch (error) {
        console.error("Erro ao carregar exercícios:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExercises();
  }, []);

  // 2. Carregar Progresso do Usuário (Apenas se estiver logado e houver exercícios)
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || exercises.length === 0) return;

      const newProgressMap = {};

      // Busca o status de cada exercício
      // (Nota: Em produção, uma rota que retorna todos os status de uma vez seria mais eficiente)
      await Promise.all(exercises.map(async (ex) => {
        try {
          const p = await api.getUserProgress(ex.id, user.id);
          if (p && p.success && p.progress) {
            // Se existe registro, verifica se está completo
            newProgressMap[ex.id] = p.progress.is_completed ? 'completed' : 'in_progress';
          } else {
            newProgressMap[ex.id] = 'not_started';
          }
        } catch (e) {
          console.error(`Erro ao buscar progresso do exercício ${ex.id}`, e);
          newProgressMap[ex.id] = 'not_started';
        }
      }));

      setProgressMap(newProgressMap);
    };

    fetchProgress();
  }, [user, exercises]);

  // --- HELPERS DE LÓGICA ---

  // Agrupa exercícios por Tópico (ex: 'Grafos', 'Estruturas') vindo do banco
  const groupedExercises = exercises.reduce((acc, item) => {
    const topic = item.topic || 'Geral';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(item);
    return acc;
  }, {});

  const availableCategories = Object.keys(groupedExercises);

  // Infere o algoritmo com base no título para o visualizador genérico
  const getAlgoParam = (title) => {
    const t = title.toLowerCase();
    if (t.includes('dfs') || t.includes('profundidade')) return 'dfs';
    if (t.includes('bfs') || t.includes('largura')) return 'bfs';
    if (t.includes('dijkstra')) return 'dijkstra';
    if (t.includes('topológica') || t.includes('topological')) return 'topo';
    return 'dfs'; // Fallback
  };

  // Direciona para a página correta
  const handleNavigation = (item) => {
    // Redirecionamento específico para o exercício de Tempos DFS (ID 2 no seed do banco)
    // Verificamos também pelo título para ser mais robusto caso o ID mude
    if (item.id === 2 || item.title.includes('Tempos') || item.title.includes('Start and Finish')) {
      navigate('/problem/dfs-start-finish-time');
      return;
    }

    let isForm = false;
    try {
      const parsed = typeof item.answer === 'string' ? JSON.parse(item.answer) : item.answer;
      if (parsed && parsed.options) {
        isForm = true;
      }
    } catch (e) {
      console.log("Erro ao parsear resposta", e);
    }

    if (isForm || item.title.includes("Múltipla escolha -")) {
      navigate('/problem/form', { state: item });
    }
    else {
      // Redirecionamento genérico para o Visualizador
      // navigate(`/visualizer?algo=${getAlgoParam(item.title)}`);
    }
  };

  const getStatusConfig = (id) => {
    const status = progressMap[id] || 'not_started';
    switch (status) {
      case 'completed': return { label: 'Concluído', color: '#10b981', icon: <CheckCircle size={16} /> };
      case 'in_progress': return { label: 'Em Andamento', color: '#f59e0b', icon: <Clock size={16} /> };
      default: return { label: 'Não Iniciado', color: '#64748b', icon: <Circle size={16} /> };
    }
  };

  // Tema Visual
  const theme = {
    bg: isDarkMode ? '#1e293b' : '#f8f9fa',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSec: isDarkMode ? '#94a3b8' : '#64748b',
    cardBg: isDarkMode ? '#0f172a' : 'white',
    cardBorder: isDarkMode ? '#334155' : '#e2e8f0',
    inputBg: isDarkMode ? '#0f172a' : '#ffffff'
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: theme.textSec, alignItems: 'center', gap: '10px' }}>
      <Loader2 className="animate-spin" /> Carregando exercícios...
    </div>;
  }

  return (
    <main style={{ flex: 1, padding: '3rem', overflowY: 'auto', backgroundColor: theme.bg }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: theme.text, fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
          Exercícios Práticos
        </h2>

        {/* Filtro de Categorias */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={20} color={theme.textSec} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px 15px', borderRadius: '8px', border: `1px solid ${theme.cardBorder}`,
              backgroundColor: theme.inputBg, color: theme.text, outline: 'none', cursor: 'pointer', fontSize: '0.95rem', minWidth: '200px'
            }}
          >
            <option value="all">Todas as Categorias</option>
            {availableCategories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Aviso de Login */}
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
        {Object.keys(groupedExercises).map((category, idx) => {
          // Aplica filtro visual
          if (selectedCategory !== 'all' && category !== selectedCategory) return null;

          return (
            <section key={idx}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1.5rem 0', color: theme.textSec, borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom: '10px' }}>
                {category}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {groupedExercises[category].map((item) => {
                  const status = getStatusConfig(item.id);

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.cardBorder}`,
                        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'transform 0.2s', position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h4 style={{ margin: 0, color: theme.text, fontSize: '1.1rem', fontWeight: '600' }}>{item.title}</h4>

                          {/* MUDANÇA: Usa item.difficulty vindo do banco */}
                          <span style={{
                            fontSize: '0.85rem',
                            color: theme.textSec,
                            marginTop: '5px',
                            display: 'inline-block',
                            // Opcional: Cor baseada na dificuldade
                            fontWeight: '500'
                          }}>
                            Dificuldade: {item.difficulty || 'Não definida'}
                          </span>
                        </div>
                        <Box size={24} color={theme.textSec} style={{ opacity: 0.5 }} />
                      </div>


                      <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: `1px solid ${theme.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          onClick={() => handleNavigation(item)}
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
          );
        })}

        {Object.keys(groupedExercises).length === 0 && (
          <p style={{ color: theme.textSec, textAlign: 'center', marginTop: '2rem' }}>Nenhum exercício disponível.</p>
        )}
      </div>
    </main>
  );
};

export default ProblemsList;