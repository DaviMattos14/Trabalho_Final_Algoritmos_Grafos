import React, { useMemo, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Play, Pause, RotateCcw } from 'lucide-react'; // Ícones para o player

const BreadthFirstSearchClass = () => {
    const { isDarkMode } = useOutletContext();
    
    // Estado da Simulação Interativa (Mantido)
    const [activeStep, setActiveStep] = useState(0);

    // --- NOVO: Estado da Animação Automática ---
    const [autoStep, setAutoStep] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const theme = {
        bg: isDarkMode ? '#0f172a' : '#f8f9fa',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        text: isDarkMode ? '#f1f5f9' : '#1e293b',
        textSec: isDarkMode ? '#94a3b8' : '#475569',
        border: isDarkMode ? '#334155' : '#e2e8f0',
        accent: '#10b981',
        queue: isDarkMode ? '#172235' : '#ecfdf5',
        visited: '#10b981', // Verde para visitado
        current: '#f59e0b'  // Laranja para atual
    };

    const nodes = useMemo(() => (['A', 'B', 'C', 'D', 'E', 'F']), []);

    const positions = {
        A: { x: 80, y: 40 },
        B: { x: 220, y: 40 },
        C: { x: 80, y: 150 },
        D: { x: 220, y: 150 },
        E: { x: 150, y: 240 },
        F: { x: 320, y: 240 }
    };

    const edges = [
        ['A', 'B'], ['A', 'C'],
        ['B', 'D'], ['B', 'E'],
        ['C', 'E'], ['D', 'F'],
        ['E', 'F']
    ];

    // --- NOVO: Roteiro da Animação Automática ---
    const demoSteps = [
        { curr: 'A', visited: ['A'], queue: ['B', 'C'], desc: "Inicia em A. Enfileira vizinhos B e C." },
        { curr: 'B', visited: ['A', 'B'], queue: ['C', 'D', 'E'], desc: "Processa B. Enfileira vizinhos D e E." },
        { curr: 'C', visited: ['A', 'B', 'C'], queue: ['D', 'E'], desc: "Processa C. E já está na fila." },
        { curr: 'D', visited: ['A', 'B', 'C', 'D'], queue: ['E', 'F'], desc: "Processa D. Enfileira F." },
        { curr: 'E', visited: ['A', 'B', 'C', 'D', 'E'], queue: ['F'], desc: "Processa E. F já está na fila." },
        { curr: 'F', visited: ['A', 'B', 'C', 'D', 'E', 'F'], queue: [], desc: "Processa F. Fila vazia." },
        { curr: null, visited: ['A', 'B', 'C', 'D', 'E', 'F'], queue: [], desc: "Concluído." }
    ];

    // --- NOVO: Loop da Animação ---
    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setAutoStep((prev) => {
                    if (prev >= demoSteps.length - 1) {
                        setIsAutoPlaying(false); // Para no final
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1500);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, demoSteps.length]);

    // Reinicia do passo 0 quando clica em reproduzir após terminar
    const handlePlayPause = () => {
        if (!isAutoPlaying && autoStep >= demoSteps.length - 1) {
            setAutoStep(0);
            setIsAutoPlaying(true);
        } else {
            setIsAutoPlaying(!isAutoPlaying);
        }
    };

    // Dados da simulação interativa (Mantido)
    const bfsSteps = [
        {
            title: 'Inicialização',
            description: 'Marcamos todos como não visitados, enfileiramos o nó inicial (A).',
            queue: ['A'],
            visited: []
        },
        {
            title: 'Processa A',
            description: 'Desenfileiramos A, marcamos como visitado e enfileiramos seus vizinhos (B, C) em ordem.',
            queue: ['B', 'C'],
            visited: ['A'],
            highlight: 'A'
        },
        {
            title: 'Processa B',
            description: 'Processamos B e enfileiramos D e E. Note que seguimos a ordem de chegada (FIFO).',
            queue: ['C', 'D', 'E'],
            visited: ['A', 'B'],
            highlight: 'B'
        },
        {
            title: 'Processa C',
            description: 'Visitamos C. Seu vizinho E já está na fila, então não o enfileiramos novamente.',
            queue: ['D', 'E'],
            visited: ['A', 'B', 'C'],
            highlight: 'C'
        },
        {
            title: 'Processa D',
            description: 'Visitamos D e enfileiramos F. O BFS garante que visitamos nós por camadas.',
            queue: ['E', 'F'],
            visited: ['A', 'B', 'C', 'D'],
            highlight: 'D'
        },
        {
            title: 'Processa E e F',
            description: 'Visitamos E e F, que não têm novos vizinhos. A fila se esvazia e o BFS termina.',
            queue: [],
            visited: ['A', 'B', 'C', 'D', 'E', 'F'],
            highlight: 'E'
        }
    ];

    const pseudoCode = `
procedure BFS(origem):
    fila = Queue()
    marcado[origem] = verdadeiro
    fila.enfileira(origem)

    enquanto fila não vazia:
        u = fila.desenfileira()
        para cada v em adj[u]:
            se !marcado[v]:
                marcado[v] = verdadeiro
                distancia[v] = distancia[u] + 1
                pai[v] = u
                fila.enfileira(v)`;

    const adjacencyRows = nodes.map(node => {
        const neighbors = edges
            .filter(([from]) => from === node)
            .map(([, to]) => to);
        return { node, neighbors };
    });

    const renderGraph = () => (
        <svg width="380" height="280" viewBox="0 0 380 280" style={{ maxWidth: '100%' }}>
            <defs>
                <marker id="arrow-bfs" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill={theme.textSec} />
                </marker>
            </defs>
            {edges.map(([u, v]) => {
                const start = positions[u];
                const end = positions[v];
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const r = 20; 
                const x1 = start.x + r * Math.cos(angle);
                const y1 = start.y + r * Math.sin(angle);
                const x2 = end.x - r * Math.cos(angle);
                const y2 = end.y - r * Math.sin(angle);
                
                return (
                    <line
                        key={`${u}-${v}`}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={theme.textSec}
                        strokeWidth="2"
                        markerEnd="url(#arrow-bfs)"
                    />
                );
            })}
            {nodes.map(node => (
                <g key={node}>
                    <circle
                        cx={positions[node].x}
                        cy={positions[node].y}
                        r="20"
                        fill={activeStep >= 1 && bfsSteps[activeStep - 1].visited.includes(node) ? theme.accent : theme.cardBg}
                        stroke={theme.accent}
                        strokeWidth="2"
                    />
                    <text
                        x={positions[node].x}
                        y={positions[node].y}
                        dy="5"
                        textAnchor="middle"
                        fill={activeStep >= 1 && bfsSteps[activeStep - 1].visited.includes(node) ? '#fff' : theme.text}
                        fontWeight="600"
                    >
                        {node}
                    </text>
                </g>
            ))}
        </svg>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: theme.bg, overflowY: 'auto' }}>
            <div style={{ padding: '40px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.text, marginBottom: '20px' }}>
                        Busca em Largura (Breadth-First Search)
                    </h2>
                    <p style={{ lineHeight: 1.8, color: theme.textSec, marginBottom: '15px', fontSize: '1.05rem' }}>
                        O BFS explora um grafo camada por camada, visitando todos os nós a uma distância k antes
                        de explorar nós a distância k+1. É implementado naturalmente com uma fila (FIFO), garantindo
                        que exploramos os nós em ordem de proximidade do nó de origem.
                    </p>
                    <p style={{ lineHeight: 1.8, color: theme.textSec, fontSize: '1.05rem' }}>
                        A técnica é ideal para encontrar o caminho mais curto em grafos não ponderados, detecção de
                        componentes conectadas e exploração de vizinhanças. Assim como o DFS, o BFS segue o padrão OO
                        separando responsabilidades entre o grafo e o serviço de busca, permitindo reuso e testabilidade.
                    </p>
                </section>

                <section style={{
                    backgroundColor: theme.cardBg,
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    marginBottom: '40px',
                    padding: '30px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.08)'
                }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Grafo de Referência
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', alignItems: 'center' }}>
                        {renderGraph()}
                        <div style={{ flex: '1 1 250px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.text }}>
                                <thead>
                                    <tr style={{ backgroundColor: isDarkMode ? '#172235' : '#e2e8f0' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Vértice</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Adjacentes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adjacencyRows.map(row => (
                                        <tr key={row.node} style={{ borderBottom: `1px solid ${theme.border}` }}>
                                            <td style={{ padding: '10px' }}>{row.node}</td>
                                            <td style={{ padding: '10px', color: theme.textSec }}>
                                                {row.neighbors.join(', ')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '15px', color: theme.textSec }}>
                        Consideramos um grafo direcionado para destacar a ordem de exploração, mas o raciocínio se aplica a grafos não direcionados.
                    </p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Simulação Passo a Passo
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
                        {bfsSteps.map((step, index) => (
                            <button
                                key={step.title}
                                onClick={() => setActiveStep(index + 1)}
                                style={{
                                    borderRadius: '12px',
                                    border: `1px solid ${activeStep === index + 1 ? theme.accent : theme.border}`,
                                    backgroundColor: activeStep === index + 1 ? theme.queue : theme.cardBg,
                                    padding: '18px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: '0.85rem', color: theme.textSec }}>Passo {index + 1}</span>
                                <h4 style={{ margin: '8px 0', color: theme.text }}>{step.title}</h4>
                                <p style={{ margin: 0, color: theme.textSec, fontSize: '0.9rem' }}>{step.description}</p>
                                <div style={{ marginTop: '12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
                                    <p style={{ margin: '4px 0', color: theme.text }}>Fila: [{step.queue.join(', ') || '∅'}]</p>
                                    <p style={{ margin: '4px 0', color: theme.text }}>Visitados: {step.visited.join(' → ') || '∅'}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <div style={{ borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '24px', backgroundColor: theme.cardBg }}>
                        <h3 style={{ color: theme.text, fontSize: '1.1rem', marginBottom: '12px', fontWeight: 600 }}>Pseudocódigo</h3>
                        <pre style={{
                            margin: 0,
                            backgroundColor: isDarkMode ? '#0f172a' : '#0f172a',
                            color: '#e2e8f0',
                            borderRadius: '10px',
                            padding: '16px',
                            fontFamily: 'JetBrains Mono, Consolas, monospace',
                            fontSize: '0.85rem',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6
                        }}>
                            {pseudoCode}
                        </pre>
                    </div>
                </section>

                {/* --- NOVA SEÇÃO: VISUALIZAÇÃO AUTOMÁTICA --- */}
                <section style={{ 
                    backgroundColor: theme.cardBg, 
                    borderRadius: '12px', 
                    border: `1px solid ${theme.border}`,
                    padding: '40px', 
                    marginBottom: '40px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: theme.text, fontSize: '1.2rem', fontWeight: 600 }}>Execução Visual</h3>
                        
                        {/* Controles do Mini Player */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setAutoStep(0)} style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: theme.bg, cursor: 'pointer', color: theme.textSec }}>
                                <RotateCcw size={16} />
                            </button>
                            <button onClick={handlePlayPause} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: theme.accent, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                                {isAutoPlaying ? <Pause size={16}/> : <Play size={16}/>}
                                {isAutoPlaying ? 'Pausar' : 'Reproduzir'}
                            </button>
                        </div>
                    </div>
                    
                    <svg width="300" height="300" viewBox="0 0 380 280" style={{ overflow: 'visible' }}>
                        {/* Arestas */}
                        {edges.map(([u, v]) => {
                            const start = positions[u];
                            const end = positions[v];
                            const angle = Math.atan2(end.y - start.y, end.x - start.x);
                            const r = 20; 
                            const x1 = start.x + r * Math.cos(angle);
                            const y1 = start.y + r * Math.sin(angle);
                            const x2 = end.x - r * Math.cos(angle);
                            const y2 = end.y - r * Math.sin(angle);
                            
                            return <line key={`${u}-${v}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.textSec} strokeWidth="2" markerEnd="url(#arrow-bfs)" />;
                        })}
                        
                        {/* Nós */}
                        {nodes.map(n => {
                            const pos = positions[n];
                            const currentData = demoSteps[autoStep];
                            
                            const isCurr = currentData.curr === n;
                            const isVis = currentData.visited.includes(n);
                            
                            let fill = theme.cardBg; // Branco/Escuro
                            if (isVis) fill = theme.visited; // Verde
                            if (isCurr) fill = theme.current; // Laranja
                            
                            let textColor = theme.text;
                            if (isVis || isCurr) textColor = '#fff';

                            return (
                                <g key={n} style={{ transition: 'all 0.3s ease' }}>
                                    <circle cx={pos.x} cy={pos.y} r={isCurr ? "25" : "20"} fill={fill} stroke={theme.accent} strokeWidth="2" />
                                    <text x={pos.x} y={pos.y} dy="5" textAnchor="middle" fill={textColor} fontWeight="bold">{n}</text>
                                </g>
                            );
                        })}
                    </svg>

                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: theme.bg, borderRadius: '8px', border: `1px solid ${theme.border}`, width: '100%', textAlign: 'center' }}>
                         <span style={{ color: theme.textSec, fontSize: '0.9rem', marginRight: '10px' }}>Passo {autoStep + 1}/{demoSteps.length}:</span>
                         <strong style={{ color: theme.text }}>{demoSteps[autoStep].desc}</strong>
                    </div>
                </section>
                {/* ----------------------------------------- */}

                <section style={{ marginBottom: '60px' }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Complexidade e Boas Práticas
                    </h3>
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.text }}>
                            <thead style={{ backgroundColor: isDarkMode ? '#172235' : '#e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '14px', textAlign: 'left' }}>Aspecto</th>
                                    <th style={{ padding: '14px', textAlign: 'left' }}>Valor</th>
                                    <th style={{ padding: '14px', textAlign: 'left' }}>Notas</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.cardBg }}>
                                    <td style={{ padding: '14px' }}>Tempo</td>
                                    <td style={{ padding: '14px', color: '#10b981', fontWeight: 600 }}>O(V + E)</td>
                                    <td style={{ padding: '14px', color: theme.textSec }}>Cada vértice e aresta é processado no máximo uma vez.</td>
                                </tr>
                                <tr style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.cardBg }}>
                                    <td style={{ padding: '14px' }}>Espaço</td>
                                    <td style={{ padding: '14px', color: '#facc15', fontWeight: 600 }}>O(V)</td>
                                    <td style={{ padding: '14px', color: theme.textSec }}>Para vetor de visitados + fila (pode conter até V nós).</td>
                                </tr>
                                <tr style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.cardBg }}>
                                    <td style={{ padding: '14px' }}>Aplicações</td>
                                    <td style={{ padding: '14px', color: '#3b82f6', fontWeight: 600 }}>Caminho mais curto (não ponderado)</td>
                                    <td style={{ padding: '14px', color: theme.textSec }}>Garante distância mínima devido à exploração por camadas.</td>
                                </tr>
                                <tr style={{ backgroundColor: theme.cardBg }}>
                                    <td style={{ padding: '14px' }}>Ordem de exploração</td>
                                    <td style={{ padding: '14px', color: '#ef4444', fontWeight: 600 }}>FIFO (fila)</td>
                                    <td style={{ padding: '14px', color: theme.textSec }}>Diferente do DFS (LIFO), o BFS explora nós por distância.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BreadthFirstSearchClass;
