import React, { useMemo, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Play, Pause, RotateCcw } from 'lucide-react';

const TopologicalSortClass = () => {
    const { isDarkMode } = useOutletContext();
    
    const [activeStep, setActiveStep] = useState(0);
    const [autoStep, setAutoStep] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const theme = {
        bg: isDarkMode ? '#0f172a' : '#f8f9fa',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        text: isDarkMode ? '#f1f5f9' : '#1e293b',
        textSec: isDarkMode ? '#94a3b8' : '#475569',
        border: isDarkMode ? '#334155' : '#e2e8f0',
        accent: '#8b5cf6',
        visited: '#10b981',
        current: '#f59e0b',
        finished: '#8b5cf6'
    };

    // Grafo DAG (Directed Acyclic Graph) para ordenação topológica
    const nodes = useMemo(() => (['A', 'B', 'C', 'D', 'E', 'F']), []);

    const positions = {
        A: { x: 80, y: 60 },
        B: { x: 220, y: 60 },
        C: { x: 80, y: 180 },
        D: { x: 220, y: 180 },
        E: { x: 150, y: 280 },
        F: { x: 320, y: 180 }
    };

    const edges = [
        ['A', 'B'], ['A', 'C'],
        ['B', 'D'], ['B', 'E'],
        ['C', 'E'], ['D', 'F'],
        ['E', 'F']
    ];

    // Roteiro da Animação Automática
    const demoSteps = [
        { curr: 'A', visited: ['A'], finished: [], order: [], desc: "Inicia DFS em A. Marca como visitado (cinza)." },
        { curr: 'B', visited: ['A', 'B'], finished: [], order: [], desc: "Explora vizinho B de A. Marca B como visitado." },
        { curr: 'D', visited: ['A', 'B', 'D'], finished: [], order: [], desc: "Explora vizinho D de B. Marca D como visitado." },
        { curr: 'F', visited: ['A', 'B', 'D', 'F'], finished: [], order: [], desc: "Explora vizinho F de D. Marca F como visitado." },
        { curr: 'F', visited: ['A', 'B', 'D', 'F'], finished: [], order: [], desc: "F não tem vizinhos não visitados. Preparando para finalizar F." },
        { curr: null, visited: ['A', 'B', 'D', 'F'], finished: ['F'], order: ['F'], desc: "Finaliza F (preto) e adiciona ao início da lista topológica." },
        { curr: 'D', visited: ['A', 'B', 'D'], finished: ['F'], order: ['F'], desc: "Backtrack: Retorna a D. D não tem mais vizinhos não visitados." },
        { curr: null, visited: ['A', 'B', 'D'], finished: ['F', 'D'], order: ['D', 'F'], desc: "Finaliza D e adiciona ao início da lista topológica." },
        { curr: 'B', visited: ['A', 'B'], finished: ['F', 'D'], order: ['D', 'F'], desc: "Backtrack: Retorna a B. B ainda tem vizinho E não visitado." },
        { curr: 'E', visited: ['A', 'B', 'E'], finished: ['F', 'D'], order: ['D', 'F'], desc: "Explora vizinho E de B. Marca E como visitado." },
        { curr: 'E', visited: ['A', 'B', 'E'], finished: ['F', 'D'], order: ['D', 'F'], desc: "E tem vizinho F, mas F já foi finalizado. Ignora." },
        { curr: 'E', visited: ['A', 'B', 'E'], finished: ['F', 'D'], order: ['D', 'F'], desc: "E não tem mais vizinhos não visitados. Preparando para finalizar E." },
        { curr: null, visited: ['A', 'B', 'E'], finished: ['F', 'D', 'E'], order: ['E', 'D', 'F'], desc: "Finaliza E e adiciona ao início da lista topológica." },
        { curr: 'B', visited: ['A', 'B'], finished: ['F', 'D', 'E'], order: ['E', 'D', 'F'], desc: "Backtrack: Retorna a B. B não tem mais vizinhos não visitados." },
        { curr: null, visited: ['A', 'B'], finished: ['F', 'D', 'E', 'B'], order: ['B', 'E', 'D', 'F'], desc: "Finaliza B e adiciona ao início da lista topológica." },
        { curr: 'A', visited: ['A'], finished: ['F', 'D', 'E', 'B'], order: ['B', 'E', 'D', 'F'], desc: "Backtrack: Retorna a A. A ainda tem vizinho C não visitado." },
        { curr: 'C', visited: ['A', 'C'], finished: ['F', 'D', 'E', 'B'], order: ['B', 'E', 'D', 'F'], desc: "Explora vizinho C de A. Marca C como visitado." },
        { curr: 'C', visited: ['A', 'C'], finished: ['F', 'D', 'E', 'B'], order: ['B', 'E', 'D', 'F'], desc: "C tem vizinho E, mas E já foi finalizado. Ignora." },
        { curr: 'C', visited: ['A', 'C'], finished: ['F', 'D', 'E', 'B'], order: ['B', 'E', 'D', 'F'], desc: "C não tem mais vizinhos não visitados. Preparando para finalizar C." },
        { curr: null, visited: ['A', 'C'], finished: ['F', 'D', 'E', 'B', 'C'], order: ['C', 'B', 'E', 'D', 'F'], desc: "Finaliza C e adiciona ao início da lista topológica." },
        { curr: 'A', visited: ['A'], finished: ['F', 'D', 'E', 'B', 'C'], order: ['C', 'B', 'E', 'D', 'F'], desc: "Backtrack: Retorna a A. A não tem mais vizinhos não visitados." },
        { curr: null, visited: ['A'], finished: ['F', 'D', 'E', 'B', 'C', 'A'], order: ['A', 'C', 'B', 'E', 'D', 'F'], desc: "Finaliza A e adiciona ao início da lista topológica." },
        { curr: null, visited: [], finished: ['F', 'D', 'E', 'B', 'C', 'A'], order: ['A', 'C', 'B', 'E', 'D', 'F'], desc: "Ordenação topológica concluída: A → C → B → E → D → F" }
    ];

    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setAutoStep((prev) => {
                    if (prev >= demoSteps.length - 1) {
                        setIsAutoPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1800);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, demoSteps.length]);

    const handlePlayPause = () => {
        if (!isAutoPlaying && autoStep >= demoSteps.length - 1) {
            setAutoStep(0);
            setIsAutoPlaying(true);
        } else {
            setIsAutoPlaying(!isAutoPlaying);
        }
    };

    // Dados da simulação interativa
    const topoSteps = [
        {
            title: 'Inicialização',
            description: 'Iniciamos o DFS a partir de A. Todos os nós começam como não visitados.',
            visited: [],
            finished: [],
            order: [],
            highlight: null
        },
        {
            title: 'Visita A',
            description: 'Marcamos A como visitado (cinza) e exploramos seus vizinhos B e C.',
            visited: ['A'],
            finished: [],
            order: [],
            highlight: 'A'
        },
        {
            title: 'Visita B',
            description: 'Exploramos B recursivamente. B tem vizinhos D e E.',
            visited: ['A', 'B'],
            finished: [],
            order: [],
            highlight: 'B'
        },
        {
            title: 'Visita D',
            description: 'Exploramos D recursivamente. D tem vizinho F.',
            visited: ['A', 'B', 'D'],
            finished: [],
            order: [],
            highlight: 'D'
        },
        {
            title: 'Visita F',
            description: 'F não tem vizinhos não visitados. Finalizamos F (preto) e o adicionamos ao início da lista topológica.',
            visited: ['A', 'B', 'D', 'F'],
            finished: ['F'],
            order: ['F'],
            highlight: 'F'
        },
        {
            title: 'Finaliza D',
            description: 'Backtrack: D não tem mais vizinhos. Finalizamos D e o adicionamos ao início da lista.',
            visited: ['A', 'B', 'D'],
            finished: ['F', 'D'],
            order: ['D', 'F'],
            highlight: 'D'
        },
        {
            title: 'Visita E',
            description: 'Retornamos a B e exploramos E. E tem vizinho F, mas F já foi finalizado, então ignoramos.',
            visited: ['A', 'B', 'E'],
            finished: ['F', 'D'],
            order: ['D', 'F'],
            highlight: 'E'
        },
        {
            title: 'Finaliza E e B',
            description: 'E não tem mais vizinhos. Finalizamos E, depois B, adicionando-os ao início da lista.',
            visited: ['A', 'B', 'E'],
            finished: ['F', 'D', 'E', 'B'],
            order: ['B', 'E', 'D', 'F'],
            highlight: 'B'
        },
        {
            title: 'Visita C',
            description: 'Retornamos a A e exploramos C. C tem vizinho E, mas E já foi finalizado.',
            visited: ['A', 'C'],
            finished: ['F', 'D', 'E', 'B'],
            order: ['B', 'E', 'D', 'F'],
            highlight: 'C'
        },
        {
            title: 'Finaliza C e A',
            description: 'C não tem mais vizinhos. Finalizamos C, depois A, completando a ordenação topológica.',
            visited: ['A', 'C'],
            finished: ['F', 'D', 'E', 'B', 'C', 'A'],
            order: ['A', 'C', 'B', 'E', 'D', 'F'],
            highlight: 'A'
        }
    ];

    const pseudoCode = `
procedure TopologicalSort(u):
    marcado[u] = verdadeiro  // Cinza
    para cada v em adj[u]:
        se !marcado[v]:
            TopologicalSort(v)
    finalizado[u] = verdadeiro  // Preto
    listaTopologica.inserirNoInicio(u)`;

    const adjacencyRows = nodes.map(node => {
        const neighbors = edges
            .filter(([from]) => from === node)
            .map(([, to]) => to);
        return { node, neighbors };
    });

    const renderGraph = () => (
        <svg width="380" height="320" viewBox="0 0 380 320" style={{ maxWidth: '100%' }}>
            <defs>
                <marker id="arrow-topo" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
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
                        markerEnd="url(#arrow-topo)"
                    />
                );
            })}
            {nodes.map(node => {
                const step = activeStep >= 1 ? topoSteps[activeStep - 1] : topoSteps[0];
                const isVisited = step.visited.includes(node);
                const isFinished = step.finished.includes(node);
                const isHighlighted = step.highlight === node;
                
                let fill = theme.cardBg;
                if (isFinished) fill = theme.finished;
                else if (isVisited) fill = theme.visited;
                
                return (
                    <g key={node}>
                        <circle
                            cx={positions[node].x}
                            cy={positions[node].y}
                            r="20"
                            fill={fill}
                            stroke={isHighlighted ? theme.current : theme.accent}
                            strokeWidth={isHighlighted ? "3" : "2"}
                        />
                        <text
                            x={positions[node].x}
                            y={positions[node].y}
                            dy="5"
                            textAnchor="middle"
                            fill={isVisited || isFinished ? '#fff' : theme.text}
                            fontWeight="600"
                        >
                            {node}
                        </text>
                    </g>
                );
            })}
        </svg>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: theme.bg, overflowY: 'auto' }}>
            <div style={{ padding: '40px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.text, marginBottom: '20px' }}>
                        Ordenação Topológica
                    </h2>
                    <p style={{ lineHeight: 1.8, color: theme.textSec, marginBottom: '15px', fontSize: '1.05rem' }}>
                        A ordenação topológica é uma ordenação linear dos vértices de um grafo direcionado acíclico (DAG)
                        tal que, para toda aresta direcionada (u, v), o vértice u aparece antes de v na ordenação.
                        É implementada usando uma modificação do DFS: quando um nó é finalizado (todos os seus vizinhos
                        foram processados), ele é adicionado ao início da lista topológica.
                    </p>
                    <p style={{ lineHeight: 1.8, color: theme.textSec, fontSize: '1.05rem' }}>
                        A técnica é fundamental para resolver problemas de dependências, como ordenação de tarefas,
                        compilação de módulos e planejamento de projetos. O algoritmo garante que todas as dependências
                        sejam respeitadas na ordem final.
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
                        Grafo de Referência (DAG)
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
                                                {row.neighbors.join(', ') || '∅'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '15px', color: theme.textSec }}>
                        Grafo direcionado acíclico (DAG). A ordenação topológica garante que dependências sejam respeitadas.
                    </p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Simulação Passo a Passo
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
                        {topoSteps.map((step, index) => (
                            <button
                                key={step.title}
                                onClick={() => setActiveStep(index + 1)}
                                style={{
                                    borderRadius: '12px',
                                    border: `1px solid ${activeStep === index + 1 ? theme.accent : theme.border}`,
                                    backgroundColor: activeStep === index + 1 ? (isDarkMode ? '#2d1b4e' : '#f3e8ff') : theme.cardBg,
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
                                    <p style={{ margin: '4px 0', color: theme.text }}>Visitados: {step.visited.join(', ') || '∅'}</p>
                                    <p style={{ margin: '4px 0', color: theme.text }}>Finalizados: {step.finished.join(', ') || '∅'}</p>
                                    <p style={{ margin: '4px 0', color: theme.accent, fontWeight: '600' }}>
                                        Ordem: {step.order.join(' → ') || '∅'}
                                    </p>
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
                    
                    <svg width="300" height="300" viewBox="0 0 380 320" style={{ overflow: 'visible' }}>
                        {edges.map(([u, v]) => {
                            const start = positions[u];
                            const end = positions[v];
                            const angle = Math.atan2(end.y - start.y, end.x - start.x);
                            const r = 20; 
                            const x1 = start.x + r * Math.cos(angle);
                            const y1 = start.y + r * Math.sin(angle);
                            const x2 = end.x - r * Math.cos(angle);
                            const y2 = end.y - r * Math.sin(angle);
                            
                            return <line key={`${u}-${v}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.textSec} strokeWidth="2" markerEnd="url(#arrow-topo)" />;
                        })}
                        
                        {nodes.map(n => {
                            const pos = positions[n];
                            const currentData = demoSteps[autoStep];
                            
                            const isCurr = currentData.curr === n;
                            const isVis = currentData.visited.includes(n);
                            const isFin = currentData.finished.includes(n);
                            
                            let fill = theme.cardBg;
                            if (isFin) fill = theme.finished;
                            else if (isVis) fill = theme.visited;
                            if (isCurr) fill = theme.current;
                            
                            let textColor = theme.text;
                            if (isVis || isFin || isCurr) textColor = '#fff';

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
                    {demoSteps[autoStep].order.length > 0 && (
                        <div style={{ marginTop: '10px', padding: '15px', backgroundColor: theme.accent + '20', borderRadius: '8px', border: `1px solid ${theme.accent}`, width: '100%', textAlign: 'center' }}>
                            <span style={{ color: theme.textSec, fontSize: '0.9rem' }}>Ordem Topológica: </span>
                            <strong style={{ color: theme.accent, fontSize: '1.1rem' }}>{demoSteps[autoStep].order.join(' → ')}</strong>
                        </div>
                    )}
                </section>

                <section style={{ marginBottom: '60px' }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Complexidade e Aplicações
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
                                    <td style={{ padding: '14px', color: theme.textSec }}>Baseado em DFS, visita cada vértice e aresta uma vez.</td>
                                </tr>
                                <tr style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.cardBg }}>
                                    <td style={{ padding: '14px' }}>Espaço</td>
                                    <td style={{ padding: '14px', color: '#facc15', fontWeight: 600 }}>O(V)</td>
                                    <td style={{ padding: '14px', color: theme.textSec }}>Para vetor de visitados + pilha de recursão.</td>
                                </tr>
                                <tr style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.cardBg }}>
                                    <td style={{ padding: '14px' }}>Aplicações</td>
                                    <td style={{ padding: '14px', color: '#3b82f6', fontWeight: 600 }}>Dependências, Compilação, Planejamento</td>
                                    <td style={{ padding: '14px', color: theme.textSec }}>Ordenação de tarefas com dependências, compilação de módulos, planejamento de projetos.</td>
                                </tr>
                                <tr style={{ backgroundColor: theme.cardBg }}>
                                    <td style={{ padding: '14px' }}>Requisito</td>
                                    <td style={{ padding: '14px', color: '#ef4444', fontWeight: 600 }}>Grafo DAG</td>
                                    <td style={{ padding: '14px', color: theme.textSec }}>O grafo deve ser direcionado e acíclico. Ciclos impedem ordenação topológica.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TopologicalSortClass;

