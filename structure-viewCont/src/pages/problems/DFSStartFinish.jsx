import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Loader2, CloudUpload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const DFSStartFinish = () => {
  const { isDarkMode } = useOutletContext();
  const { user } = useAuth();

  const EXERCISE_ID = 2;

  const correctedAnswers = {
      start0: 1, end0: 12,
      start2: 2, end2: 11,
      start3: 3, end3: 4,
      start4: 5, end4: 10,
      start1: 6, end1: 9,
      start5: 7, end5: 8
  };

  const [inputs, setInputs] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // --- CARREGAMENTO DOS DADOS ---
  useEffect(() => {
    const loadProgress = async () => {
        if (!user) return;
        
        try {
            const data = await api.getUserProgress(EXERCISE_ID, user.id);
            
            if (data && data.success && data.progress) {
                // Se tiver resposta salva, converte de volta para objeto
                const savedInputs = JSON.parse(data.progress.user_answer);
                setInputs(savedInputs);
            }
        } catch (e) {
            console.error("Erro ao carregar progresso:", e);
        }
    };
    
    loadProgress();
  }, [user]);
  // ------------------------------

  const handleChange = (e) => {
    const val = e.target.value === '' ? '' : parseInt(e.target.value);
    setInputs(prev => ({ ...prev, [e.target.name]: val }));
  };

  const handleAutoSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
        await api.submitExercise(EXERCISE_ID, user.id, inputs);
    } catch (error) {
        console.error("Erro ao salvar progresso:", error);
    } finally {
        setTimeout(() => setIsSaving(false), 500);
    }
  };

  const revealAnswers = () => {
      if (window.confirm("Tem certeza? Tente resolver sozinho primeiro!")) {
          setInputs(correctedAnswers);
          setTimeout(handleAutoSave, 100);
      }
  };

  const getRowStatus = (id) => {
      const s = inputs[`start${id}`];
      const e = inputs[`end${id}`];
      if (s === undefined || s === '' || e === undefined || e === '') return 'neutral';
      if (s === correctedAnswers[`start${id}`] && e === correctedAnswers[`end${id}`]) return 'correct';
      return 'wrong';
  };

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8f9fa',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSec: isDarkMode ? '#94a3b8' : '#475569',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    nodeFill: isDarkMode ? '#cbd5e1' : '#e2e8f0',
    nodeText: '#1e293b',
    success: '#10b981',
    error: '#ef4444'
  };

  const GraphSVG = () => (
    <svg width="300" height="220" viewBox="0 0 300 220" style={{ margin: '20px auto', display: 'block' }}>
      <g stroke={isDarkMode ? '#94a3b8' : '#64748b'} strokeWidth="2">
        <line x1="150" y1="30" x2="220" y2="80" />
        <line x1="150" y1="30" x2="80" y2="80" />
        <line x1="220" y1="80" x2="220" y2="160" />
        <line x1="220" y1="80" x2="150" y2="120" />
        <line x1="80" y1="80" x2="150" y2="120" />
        <line x1="80" y1="80" x2="80" y2="160" />
        <line x1="80" y1="160" x2="150" y2="120" />
      </g>
      {[
        { id: 0, x: 150, y: 30 }, { id: 5, x: 80, y: 80 }, { id: 2, x: 220, y: 80 },
        { id: 4, x: 150, y: 120 }, { id: 1, x: 80, y: 160 }, { id: 3, x: 220, y: 160 }
      ].map(n => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r="18" fill={theme.nodeFill} stroke={theme.textSec} strokeWidth="2" />
          <text x={n.x} y={n.y} dy="5" textAnchor="middle" fill={theme.nodeText} fontWeight="bold" fontSize="14px">{n.id}</text>
        </g>
      ))}
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: theme.bg, overflowY: 'auto' }}>
      
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        
        <section style={{ backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '30px', marginBottom: '30px' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: theme.text, margin: '0 0 15px 0' }}>1. DFS Start and Finish Time</h2>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {user && (
                        <span style={{ fontSize: '0.8rem', color: theme.textSec, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {isSaving ? <><Loader2 size={14} className="animate-spin"/> Salvando...</> : <><CloudUpload size={14}/> Salvo</>}
                        </span>
                    )}

                    <button 
                        onClick={revealAnswers}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textSec, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        <Eye size={16} /> Revelar Respostas
                    </button>
                </div>
            </div>

            <p style={{ color: theme.textSec, lineHeight: '1.6' }}>
                Considere o grafo abaixo. Você inicia o algoritmo <b>DFS</b> no nó <b>0</b>. 
                Preencha os tempos de início (start) e fim (finish).
            </p>
            
            <GraphSVG />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '30px' }}>
                {[0, 1, 2, 3, 4, 5].map(id => {
                    const status = getRowStatus(id);
                    let borderColor = theme.border;
                    let icon = null;

                    if (status === 'correct') {
                        borderColor = theme.success;
                        icon = <CheckCircle size={18} color={theme.success} />;
                    } else if (status === 'wrong') {
                        borderColor = theme.error;
                        icon = <XCircle size={18} color={theme.error} />;
                    }

                    return (
                        <div key={id} style={{ 
                            background: theme.bg, padding: '15px', borderRadius: '8px', 
                            border: `1px solid ${borderColor}`, 
                            position: 'relative', transition: 'border-color 0.3s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <strong style={{ color: theme.text }}>Vértice {id}</strong>
                                {icon}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: theme.textSec, display: 'block', marginBottom: '4px' }}>Start</label>
                                    <input 
                                        type="number" name={`start${id}`} 
                                        value={inputs[`start${id}`] !== undefined ? inputs[`start${id}`] : ''}
                                        onChange={handleChange}
                                        onBlur={handleAutoSave}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }} 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: theme.textSec, display: 'block', marginBottom: '4px' }}>Finish</label>
                                    <input 
                                        type="number" name={`end${id}`} 
                                        value={inputs[`end${id}`] !== undefined ? inputs[`end${id}`] : ''}
                                        onChange={handleChange}
                                        onBlur={handleAutoSave}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }} 
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </section>
      </div>
    </div>
  );
};

export default DFSStartFinish;