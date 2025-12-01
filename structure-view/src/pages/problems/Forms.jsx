import React, { useEffect, useState } from 'react';
import { Circle, CircleDot, CheckCircle, Send, Eye, Loader2, CloudUpload } from 'lucide-react';
import { useLocation, useOutletContext, Navigate } from 'react-router-dom';
import GraphViewer from '../../components/GraphViewer';
import OptionsList from '../../components/OptionsList';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function Forms() {
  const { isDarkMode } = useOutletContext();
  const location = useLocation();
  const { user } = useAuth();
  const [inputs, setInputs] = useState("{}");
  const [isSaving, setIsSaving] = useState(false);

  const shouldRedirect = !location.state;
  let { answer: original_answer, title, id: EXERCISE_ID, topic } = location.state || {};
  const answer = JSON.parse(original_answer ?? "{}");

  useEffect(() => {
    const loadProgress = async () => {
      if (!user || !EXERCISE_ID) return;

      try {
        const data = await api.getUserProgress(EXERCISE_ID, user.id);
        console.log(data)
        if (data && data.success && data.progress) {
          // Se tiver resposta salva, converte de volta para objeto
          const savedInputs = JSON.parse(data.progress.user_answer);
          console.log(data);
          setInputs(savedInputs);
        }
      } catch (e) {
        console.error("Erro ao carregar progresso:", e);
      }
    };

    loadProgress();
  }, [user, EXERCISE_ID]);

  const handleAutoSave = async () => {
    if (!user || inputs.length === 2 || !EXERCISE_ID) return;

    setIsSaving(true);
    try {
      await api.submitExercise(EXERCISE_ID, user.id, inputs, true);
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const revealAnswers = () => {
    if (window.confirm("Tem certeza? Tente resolver sozinho primeiro!")) {
      setInputs(original_answer);
      setTimeout(handleAutoSave, 100);
    }
  };

  const handleChange = (e) => {
    const val = e === '' ? '' : e;
    setInputs(() => JSON.stringify(({ ...answer, expected: val })));
  };

  useEffect(() => {
    if (inputs !== "{}") handleAutoSave();
  }, [inputs])

  if (shouldRedirect) {
    return <Navigate to="/problem" replace />;
  }

  const theme = {
    bg: isDarkMode ? '#1e293b' : '#f8f9fa',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSec: isDarkMode ? '#94a3b8' : '#64748b',
    cardBg: isDarkMode ? '#0f172a' : 'white',
    cardBorder: isDarkMode ? '#334155' : '#e2e8f0',
    inputBg: isDarkMode ? '#0f172a' : '#ffffff'
  };

  //console.log(original_answer)

  const displayTitle = title && title.includes("-") ? title.split("-").slice(1).join("").trim() : title;

  return (
    <main style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: theme.bg, overflowY: 'auto' }}>
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <section style={{ backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '30px', marginBottom: '30px' }}>
          <div style={{ gap: "12px", flexDirection: "column", display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ alignSelf: "flex-end", display: 'flex', gap: '10px', alignItems: 'center', justifyItems: "flex-end" }}>
              {user && (
                <span style={{ fontSize: '0.8rem', color: theme.textSec, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {isSaving ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : <><CloudUpload size={14} /> Salvo</>}
                </span>
              )}

              <button
                onClick={revealAnswers}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textSec, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <Eye size={16} /> Revelar Respostas
              </button>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: theme.text, margin: '0 0 15px 0' }}>
              {displayTitle}
            </h2>
          </div>
          <div style={{ margin: "0 auto" }}>
            {
              answer.graph ? <GraphViewer graph={answer.graph} showArrows={true} showWeights={["DFS", "BFS", "Dijkstra"].includes(topic)} /> : null
            }
          </div>
          <OptionsList answer={answer} state={[inputs, handleChange]} />
        </section>

      </div>
    </main>
  );
};
