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
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedSubtopic, setSelectedSubtopic] = useState('all');

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

  // --- Helpers ---
  // Agrupar exercícios por topic e subtopic
  const groupedExercises = exercises.reduce((acc, item) => {
    const topic = item.topic || 'Geral';
    const subtopic = item.subtopic || 'sem categoria';
    
    if (!acc[topic]) acc[topic] = {};
    if (!acc[topic][subtopic]) acc[topic][subtopic] = [];
    
    acc[topic][subtopic].push(item);
    return acc;
  }, {});

  // Extrair topics e subtopics disponíveis
  const availableTopics = Object.keys(groupedExercises);
  const availableSubtopics = selectedTopic === 'all' 
    ? [] 
    : Object.keys(groupedExercises[selectedTopic] || {});

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

    // Usar o campo 'type' para determinar o tipo de exercício
    const exerciseType = (item.type || 'Múltipla Escolha').toLowerCase();
    
    if (exerciseType.includes('múltipla') || exerciseType.includes('escolha') || exerciseType.includes('form')) {
      navigate('/problem/form', { state: item });
    } else if (exerciseType.includes('prático') || exerciseType.includes('visualizador')) {
      navigate(`/visualizer?algo=${getAlgoParam(item.title)}`);
    } else {
      // Fallback: tentar detectar pelo answer se tem options
      try {
        const parsed = typeof item.answer === 'string' ? JSON.parse(item.answer) : item.answer;
        if (parsed && parsed.options) {
          navigate('/problem/form', { state: item });
        } else {
          navigate(`/visualizer?algo=${getAlgoParam(item.title)}`);
        }
      } catch (e) {
        console.log("Erro ao detectar tipo de exercício", e);
        navigate('/problem/form', { state: item }); // Fallback para form
      }
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Filter size={20} color={theme.textSec} />
            
            <select 
                value={selectedTopic}
                onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    setSelectedSubtopic('all'); // Reset subtopic ao trocar topic
                }}
                style={{
                    padding: '10px 15px', borderRadius: '8px', border: `1px solid ${theme.cardBorder}`,
                    backgroundColor: theme.inputBg, color: theme.text, outline: 'none', cursor: 'pointer', fontSize: '0.95rem', minWidth: '180px'
                }}
            >
                <option value="all">Todos os Tópicos</option>
                {availableTopics.map((topic, idx) => (
                    <option key={idx} value={topic}>{topic}</option>
                ))}
            </select>

            {selectedTopic !== 'all' && availableSubtopics.length > 0 && (
                <select 
                    value={selectedSubtopic}
                    onChange={(e) => setSelectedSubtopic(e.target.value)}
                    style={{
                        padding: '10px 15px', borderRadius: '8px', border: `1px solid ${theme.cardBorder}`,
                        backgroundColor: theme.inputBg, color: theme.text, outline: 'none', cursor: 'pointer', fontSize: '0.95rem', minWidth: '180px'
                    }}
                >
                    <option value="all">Todos os Subtópicos</option>
                    {availableSubtopics.map((subtopic, idx) => (
                        <option key={idx} value={subtopic}>{subtopic}</option>
                    ))}
                </select>
            )}
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
        {Object.keys(groupedExercises).map((topic, topicIdx) => {
            if (selectedTopic !== 'all' && topic !== selectedTopic) return null;

            const subtopics = groupedExercises[topic];

            return (
                <div key={topicIdx}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 2rem 0', color: theme.text }}>
                        {topic}
                    </h2>

                    {Object.keys(subtopics).map((subtopic, subtopicIdx) => {
                        if (selectedSubtopic !== 'all' && subtopic !== selectedSubtopic) return null;

                        const items = subtopics[subtopic];

                        return (
                            <section key={subtopicIdx} style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '600', margin: '0 0 1.5rem 0', color: theme.textSec, borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom: '10px' }}>
                                    {subtopic}
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                {items.map((item) => {
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
                                    <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        <span style={{ fontSize: '0.85rem', color: theme.textSec }}>Dificuldade: {item.difficulty || 'Média'}</span>
                                        <span style={{ fontSize: '0.85rem', color: theme.textSec }}>Tipo: {item.type || 'Múltipla Escolha'}</span>
                                    </div>
                                </div>
                                <Box size={24} color={theme.textSec} style={{opacity: 0.5}} />
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
                                })})
                                </div>
                            </section>
                        );
                    })}
                </div>
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