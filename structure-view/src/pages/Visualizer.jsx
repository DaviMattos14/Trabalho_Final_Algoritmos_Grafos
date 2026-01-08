import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Edit3 } from 'lucide-react'; 

import { useGraph } from '../hooks/useGraph';
import { graphToText, textToGraph } from '../utils/graphUtils';

import GraphCanvas from '../components/Graph/GraphCanvas';
import GraphEditor from '../components/Graph/GraphEditor';
import Controls from '../components/Graph/Controls';

import '../components/Graph/engine.css'; 
import FloydWarshall from '../components/FloydWarshall/FloydWarshall';

const Visualizer = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const algoParam = searchParams.get('algo') || 'dfs';
    
    // Captura o tema do MainLayout
    const context = useOutletContext();
    const isDarkMode = context ? context.isDarkMode : false;

    const {
        graph, positions, isDirected, startNode,
        currentStepData, currentAlgoInfo,
        isPlaying, speed,
        setStartNode, setIsDirected, setSpeed, setIsPlaying,
        stepForward, stepBackward, resetAnimation,
        saveGraphFromEditor, updateNodePosition 
    } = useGraph(algoParam);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('text'); 
    const [textInput, setTextInput] = useState('');

    const [localStartNode, setLocalStartNode] = useState(startNode);
    useEffect(() => setLocalStartNode(startNode), [startNode]);

    // --- CORES DO TEMA ---
    const theme = {
        bg: isDarkMode ? '#0f172a' : '#f0f2f5',
        panelBg: isDarkMode ? '#1e293b' : '#ffffff',
        text: isDarkMode ? '#f1f5f9' : '#1e293b',
        textSec: isDarkMode ? '#94a3b8' : '#64748b',
        border: isDarkMode ? '#556e92ff' : '#e5e7eb',
        inputBg: isDarkMode ? '#0f172a' : '#f9fafb',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        codeBg: isDarkMode ? '#0f172a' : '#f8fafc',
    };

    const handleStartNodeChange = (e) => setLocalStartNode(e.target.value);
    const handleStartNodeCommit = () => {
        if (graph[localStartNode]) setStartNode(localStartNode);
        else setLocalStartNode(startNode);
    };
    const handleStartNodeKeyDown = (e) => {
        if (e.key === 'Enter') { handleStartNodeCommit(); e.target.blur(); }
    };
    const handleFocus = (e) => e.target.select();

    const handleOpenModal = () => {
        setTextInput(graphToText(graph));
        setActiveTab('text'); 
        setIsModalOpen(true);
    };

    const handleSaveText = () => {
        try {
            const newGraph = textToGraph(textInput);
            const keys = Object.keys(newGraph);
            if (keys.length === 0) throw new Error("O grafo não pode ser vazio");
            let newStart = startNode;
            if (!newGraph[newStart]) newStart = keys[0];
            saveGraphFromEditor(newGraph, newStart);
            setIsModalOpen(false);
        } catch (e) { alert("Erro no formato do JSON: " + e.message); }
    };

    const renderFinishedList = (list) => {
        if (!list || list.length === 0) return '[]';
        if (currentAlgoInfo?.name?.includes('Dijkstra')) return `{ ${list.join(', ')} }`;
        return `[${list.join(', ')}]`;
    };

    if(algoParam === "floyd") 
        return <FloydWarshall />

    return (
        <div className="viz-wrapper" style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.bg }}>
            
            {/* ÁREA PRINCIPAL */}
            <div id="container" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                
                {/* Esquerda */}
                <div className="left-column">
                    <div className="control-row" style={{ backgroundColor: theme.panelBg, borderColor: theme.border }}>
                        <button onClick={handleOpenModal} className="action-btn" style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <Edit3 size={16} /> Editar Grafo
                        </button>
                        <div className="input-wrapper" style={{ backgroundColor: theme.inputBg, borderColor: theme.border }}>
                            <label htmlFor="startNodeInput" style={{fontSize: '0.9rem', color: theme.textSec}}>Início:</label>
                            <input 
                                type="text" 
                                id="startNodeInput" 
                                className="small-input" 
                                value={localStartNode}
                                onChange={handleStartNodeChange}
                                onBlur={handleStartNodeCommit}
                                onKeyDown={handleStartNodeKeyDown}
                                onFocus={handleFocus}
                                style={{ 
                                    backgroundColor: theme.panelBg, 
                                    color: theme.text,
                                    borderColor: theme.border
                                }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, border: `1px solid ${theme.border}`, borderRadius: '8px', overflow: 'hidden', backgroundColor: theme.panelBg, position: 'relative' }}>
                        <GraphCanvas 
                            graph={graph}
                            positions={positions}
                            isDirected={isDirected}
                            currentStepData={currentStepData}
                            showWeights={currentAlgoInfo?.isWeighted}
                            onNodeDrag={updateNodePosition}
                            isDarkMode={isDarkMode} 
                        />
                    </div>
                </div>

                {/* Direita */}
                <div id="uiPanel">
                    {/* Box Genérico de Estilo */}
                    {[
                        { title: 'Pseudocódigo', content: (
                            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5', marginTop: '10px', maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', color: theme.text }}>
                                {currentAlgoInfo?.pseudoCode?.map((line, i) => (
                                    <div key={i} style={{ 
                                        backgroundColor: currentStepData.line === i ? (isDarkMode ? '#854d0e' : '#fef08a') : 'transparent',
                                        color: currentStepData.line === i ? (isDarkMode ? '#fff' : '#000') : theme.text,
                                        fontWeight: currentStepData.line === i ? 'bold' : 'normal',
                                        padding: '2px 4px',
                                        fontFamily: '"Courier New", monospace'
                                    }}>
                                        {line}
                                    </div>
                                ))}
                            </div>
                        )},
                        { title: currentAlgoInfo?.label || "Fila:", content: (
                            <div style={{ marginTop: '5px', fontFamily: 'monospace', color: isDarkMode ? '#4ade80' : '#15803d', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                                {currentStepData.queueSnapshot ? `[${currentStepData.queueSnapshot.join(', ')}]` : '[]'}
                            </div>
                        )},
                        { title: 'Status', content: (
                            <div style={{ marginTop: '5px', color: theme.textSec }}>
                                {currentStepData.status || 'Aguardando...'}
                            </div>
                        )},
                        { title: currentAlgoInfo?.name?.includes('Dijkstra') ? 'Distâncias Finais' : 'Ordem de Finalização', content: (
                            <div style={{ marginTop: '5px', fontFamily: 'monospace', color: isDarkMode ? '#60a5fa' : '#1e40af', wordBreak: 'break-word' }}>
                                { renderFinishedList(currentStepData.finishedOrder) }
                            </div>
                        )}
                    ].map((card, idx) => (
                        <div key={idx} style={{ 
                            backgroundColor: theme.cardBg, 
                            padding: '15px', 
                            border: `1px solid ${theme.border}`, 
                            borderRadius: '8px', 
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
                        }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.textSec, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {card.title}
                            </h3>
                            {card.content}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Controles */}
            <div style={{ flexShrink: 0 }}>
                <Controls 
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    onStepForward={stepForward}
                    onStepBackward={stepBackward}
                    onReset={resetAnimation}
                    speed={speed}
                    setSpeed={setSpeed}
                    showDirectedControl={currentAlgoInfo?.name?.includes('Dijkstra')}
                    isDirected={isDirected}
                    onToggleDirected={() => setIsDirected(!isDirected)}
                    isDarkMode={isDarkMode} 
                />
            </div>

            {/* 4. Modal */}
            {isModalOpen && (
                <div className="modal" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ backgroundColor: theme.panelBg, color: theme.text, borderColor: theme.border }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                            <h2 style={{margin: 0}}>Editar Grafo</h2>
                            <span className="close-modal" onClick={() => setIsModalOpen(false)} style={{color: theme.textSec}}>&times;</span>
                        </div>
                        
                        <div className="tabs">
                            <button className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>📝 Texto</button>
                            <button className={`tab-btn ${activeTab === 'visual' ? 'active' : ''}`} onClick={() => setActiveTab('visual')}>🎨 Desenhar</button>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {activeTab === 'text' ? (
                                <div id="tab-text" className="tab-content active">
                                    <p className="hint" style={{ color: theme.textSec }}>
                                        Formato Ponderado: <b>0: [ ["1", 5], "2" ]</b><br />
                                        (Use <b>["Destino", Peso]</b> ou apenas <b>"Destino"</b> para peso 1)
                                    </p>
                                    <textarea 
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        style={{ 
                                            height: '100%', width: '100%', resize: 'none', fontFamily: 'monospace',
                                            backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border
                                        }}
                                    ></textarea>
                                     <div className="modal-actions">
                                        <button onClick={handleSaveText} className="primary-btn">Salvar e Atualizar</button>
                                    </div>
                                </div>
                            ) : (
                                <GraphEditor 
                                    initialGraph={graph}
                                    onSave={(newGraph, newStart) => {
                                        saveGraphFromEditor(newGraph, newStart);
                                        setIsModalOpen(false);
                                    }}
                                    onClose={() => setIsModalOpen(false)}
                                    isDarkMode={isDarkMode}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Visualizer;