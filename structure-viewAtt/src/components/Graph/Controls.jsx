import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

const Controls = ({ 
    isPlaying, 
    onPlayPause, 
    onStepForward, 
    onStepBackward, 
    onReset, 
    speed, 
    setSpeed,
    showDirectedControl,
    isDirected,
    onToggleDirected,
    isDarkMode = false // <--- NOVA PROP
}) => {

  // Definição de Cores
  const theme = {
    containerBg: isDarkMode ? '#1e293b' : '#ffffff',
    containerBorder: isDarkMode ? '#334155' : '#e2e8f0',
    text: isDarkMode ? '#94a3b8' : '#475569',
    btnBg: isDarkMode ? '#0f172a' : '#f1f5f9',
    btnBorder: isDarkMode ? '#334155' : '#cbd5e1',
    btnText: isDarkMode ? '#e2e8f0' : '#475569',
    btnHover: isDarkMode ? '#1e293b' : '#e2e8f0'
  };
  
  return (
    <div style={{ 
        height: '70px', 
        background: theme.containerBg, 
        borderTop: `1px solid ${theme.containerBorder}`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 2rem',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
        flexShrink: 0,
        transition: 'background 0.3s, border 0.3s'
    }}>
        {/* Esquerda: Checkbox e Velocidade */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {showDirectedControl && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.9rem', color: theme.text }}>
                    <input 
                        type="checkbox" 
                        checked={isDirected} 
                        onChange={onToggleDirected} 
                        style={{ accentColor: '#2563eb' }}
                    />
                    Direcionado
                </label>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: theme.text }}>Velocidade</span>
                <input 
                    type="range" 
                    min="100" max="2000" step="100"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    style={{ width: '100px', accentColor: '#2563eb', cursor: 'pointer' }}
                />
            </div>
        </div>

        {/* Centro: Playback */}
        <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onStepBackward} className="control-btn" title="Voltar">
                <SkipBack size={20} />
            </button>
            
            <button onClick={onPlayPause} className="control-btn primary" style={{ width: '50px' }}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button onClick={onStepForward} className="control-btn" title="Avançar">
                <SkipForward size={20} />
            </button>
        </div>

        {/* Direita: Reset */}
        <button onClick={onReset} className="control-btn" title="Resetar">
            <RotateCcw size={18} style={{ marginRight: '5px' }}/> 
            Resetar
        </button>

        {/* Estilos Dinâmicos para Hover e Estados */}
        <style>{`
            .control-btn {
                display: flex; align-items: center; justify-content: center;
                background-color: ${theme.btnBg}; 
                border: 1px solid ${theme.btnBorder};
                padding: 8px 12px; borderRadius: 6px; cursor: pointer;
                color: ${theme.btnText}; 
                transition: all 0.2s;
            }
            .control-btn:hover { 
                background-color: ${theme.btnHover}; 
                color: ${isDarkMode ? '#fff' : '#1e293b'}; 
                border-color: ${isDarkMode ? '#475569' : '#94a3b8'};
            }
            .control-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            
            /* Botão Primário (Play) mantém a cor azul, mas ajusta brilho */
            .control-btn.primary { 
                background-color: #2563eb; 
                color: white; 
                border: 1px solid #2563eb; 
            }
            .control-btn.primary:hover { 
                background-color: #1d4ed8; 
                border-color: #1d4ed8;
            }
        `}</style>
    </div>
  );
};

export default Controls;