import React, { useMemo, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Play, Pause, RotateCcw } from 'lucide-react';

const DijkstraClass = () => {
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
        accent: '#f59e0b',
        visited: '#10b981',
        current: '#f59e0b',
        processing: '#3b82f6'
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

    // Arestas com pesos
    const edges = [
        { from: 'A', to: 'B', weight: 4 },
        { from: 'A', to: 'C', weight: 2 },
        { from: 'B', to: 'D', weight: 5 },
        { from: 'B', to: 'E', weight: 3 },
        { from: 'C', to: 'E', weight: 1 },
        { from: 'D', to: 'F', weight: 2 },
        { from: 'E', to: 'F', weight: 3 }
    ];

    // Roteiro da Animação Automática
const demoSteps = [
        { curr: null, visited: [], distances: { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity }, queue: ['A', 'B', 'C', 'D', 'E', 'F'], relaxingEdge: null, desc: "Inicialização: dist[A] = 0, outros = ∞. Fila Q = [A, B, C, D, E, F]" },
        { curr: 'A', visited: [], distances: { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity }, queue: ['A', 'B', 'C', 'D', 'E', 'F'], relaxingEdge: null, desc: "Seleciona A da fila (menor distância = 0)" },
        { curr: 'A', visited: ['A'], distances: { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity }, queue: ['B', 'C', 'D', 'E', 'F'], relaxingEdge: null, desc: "Marca A como visitado. Remove A da fila. Inicia relaxamento dos vizinhos" },
        { curr: 'A', visited: ['A'], distances: { A: 0, B: 4, C: Infinity, D: Infinity, E: Infinity, F: Infinity }, queue: ['B', 'C', 'D', 'E', 'F'], relaxingEdge: ['A', 'B'], desc: "Relaxa aresta A→B: dist[B] = min(∞, 0+4) = 4 ✓" },
        { curr: 'A', visited: ['A'], distances: { A: 0, B: 4, C: 2, D: Infinity, E: Infinity, F: Infinity }, queue: ['C', 'B', 'D', 'E', 'F'], relaxingEdge: ['A', 'C'], desc: "Relaxa aresta A→C: dist[C] = min(∞, 0+2) = 2 ✓ Reordena fila" },
        { curr: 'C', visited: ['A'], distances: { A: 0, B: 4, C: 2, D: Infinity, E: Infinity, F: Infinity }, queue: ['C', 'B', 'D', 'E', 'F'], relaxingEdge: null, desc: "Seleciona C da fila (menor distância não visitada = 2)" },
        { curr: 'C', visited: ['A', 'C'], distances: { A: 0, B: 4, C: 2, D: Infinity, E: Infinity, F: Infinity }, queue: ['B', 'D', 'E', 'F'], relaxingEdge: null, desc: "Marca C como visitado. Remove C da fila. Inicia relaxamento" },
        { curr: 'C', visited: ['A', 'C'], distances: { A: 0, B: 4, C: 2, D: Infinity, E: 3, F: Infinity }, queue: ['E', 'B', 'D', 'F'], relaxingEdge: ['C', 'E'], desc: "Relaxa aresta C→E: dist[E] = min(∞, 2+1) = 3 ✓ Reordena fila" },
        { curr: 'E', visited: ['A', 'C'], distances: { A: 0, B: 4, C: 2, D: Infinity, E: 3, F: Infinity }, queue: ['E', 'B', 'D', 'F'], relaxingEdge: null, desc: "Seleciona E da fila (menor distância = 3)" },
        { curr: 'E', visited: ['A', 'C', 'E'], distances: { A: 0, B: 4, C: 2, D: Infinity, E: 3, F: Infinity }, queue: ['B', 'D', 'F'], relaxingEdge: null, desc: "Marca E como visitado. Remove E da fila. Inicia relaxamento" },
        { curr: 'E', visited: ['A', 'C', 'E'], distances: { A: 0, B: 4, C: 2, D: Infinity, E: 3, F: 6 }, queue: ['B', 'F', 'D'], relaxingEdge: ['E', 'F'], desc: "Relaxa aresta E→F: dist[F] = min(∞, 3+3) = 6 ✓ Reordena fila" },
        { curr: 'B', visited: ['A', 'C', 'E'], distances: { A: 0, B: 4, C: 2, D: Infinity, E: 3, F: 6 }, queue: ['B', 'F', 'D'], relaxingEdge: null, desc: "Seleciona B da fila (menor distância = 4)" },
        { curr: 'B', visited: ['A', 'C', 'E', 'B'], distances: { A: 0, B: 4, C: 2, D: Infinity, E: 3, F: 6 }, queue: ['F', 'D'], relaxingEdge: null, desc: "Marca B como visitado. Remove B da fila. Inicia relaxamento" },
        { curr: 'B', visited: ['A', 'C', 'E', 'B'], distances: { A: 0, B: 4, C: 2, D: 9, E: 3, F: 6 }, queue: ['F', 'D'], relaxingEdge: ['B', 'D'], desc: "Relaxa aresta B→D: dist[D] = min(∞, 4+5) = 9 ✓" },
        { curr: 'B', visited: ['A', 'C', 'E', 'B'], distances: { A: 0, B: 4, C: 2, D: 9, E: 3, F: 6 }, queue: ['F', 'D'], relaxingEdge: ['B', 'E'], desc: "Tenta relaxar B→E: dist[E] = min(3, 4+3) = 3 (não melhora) ✗" },
        { curr: 'F', visited: ['A', 'C', 'E', 'B'], distances: { A: 0, B: 4, C: 2, D: 9, E: 3, F: 6 }, queue: ['F', 'D'], relaxingEdge: null, desc: "Seleciona F da fila (menor distância = 6)" },
        { curr: 'F', visited: ['A', 'C', 'E', 'B', 'F'], distances: { A: 0, B: 4, C: 2, D: 9, E: 3, F: 6 }, queue: ['D'], relaxingEdge: null, desc: "Marca F como visitado. Remove F da fila. F não tem vizinhos" },
        { curr: 'D', visited: ['A', 'C', 'E', 'B', 'F'], distances: { A: 0, B: 4, C: 2, D: 9, E: 3, F: 6 }, queue: ['D'], relaxingEdge: null, desc: "Seleciona D da fila (último vértice, distância = 9)" },
        { curr: 'D', visited: ['A', 'C', 'E', 'B', 'F', 'D'], distances: { A: 0, B: 4, C: 2, D: 9, E: 3, F: 6 }, queue: [], relaxingEdge: null, desc: "Marca D como visitado. Fila vazia. Algoritmo concluído!" },
        { curr: null, visited: ['A', 'C', 'E', 'B', 'F', 'D'], distances: { A: 0, B: 4, C: 2, D: 9, E: 3, F: 6 }, queue: [], relaxingEdge: null, desc: "Todas as distâncias mínimas de A foram encontradas ✓" }
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
            }, 2000);
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
    const dijkstraSteps = [
        {
            title: 'Inicialização',
            description: 'Inicializamos dist[A] = 0 e dist[v] = ∞ para todos os outros vértices. Criamos fila de prioridade Q com todos os vértices.',
            visited: [],
            distances: { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity },
            queue: ['A', 'B', 'C', 'D', 'E', 'F'],
            highlight: null
        },
        {
            title: 'Processa A',
            description: 'Removemos A de Q (menor distância). Relaxamos arestas: A→B (peso 4), A→C (peso 2). Atualizamos dist[B]=4, dist[C]=2.',
            visited: ['A'],
            distances: { A: 0, B: 4, C: 2, D: Infinity, E: Infinity, F: Infinity },
            queue: ['C', 'B', 'D', 'E', 'F'],
            highlight: 'A'
        },
        {
            title: 'Processa C',
            description: 'C tem menor distância (2). Removemos C de Q. Relaxamos C→E: dist[C]+1=3 < dist[E]=∞, então dist[E]=3.',
            visited: ['A', 'C'],
            distances: { A: 0, B: 4, C: 2, D: Infinity, E: 3, F: Infinity },
            queue: ['B', 'E', 'D', 'F'],
            highlight: 'C'
        },
        {
            title: 'Processa B',
            description: 'B tem menor distância (4). Removemos B de Q. Relaxamos B→D: dist[B]+5=9 < dist[D]=∞, então dist[D]=9.',
            visited: ['A', 'C', 'B'],
            distances: { A: 0, B: 4, C: 2, D: 9, E: 3, F: Infinity },
            queue: ['E', 'D', 'F'],
            highlight: 'B'
        },
        {
            title: 'Processa E',
            description: 'E tem menor distância (3). Removemos E de Q. Relaxamos E→F: dist[E]+3=6 < dist[F]=∞, então dist[F]=6.',
            visited: ['A', 'C', 'B', 'E'],
            distances: { A: 0, B: 4, C: 2, D: 9, E: 3, F: 6 },
            queue: ['F', 'D'],
            highlight: 'E'
        },
        {
            title: 'Processa F',
            description: 'F tem menor distância (6). Removemos F de Q. F não tem arestas de saída não visitadas.',
            visited: ['A', 'C', 'B', 'E', 'F'],
            distances: { A: 0, B: 4, C: 2, D: 9, E: 3, F: 6 },
            queue: ['D'],
            highlight: 'F'
        },
        {
            title: 'Processa D',
            description: 'Removemos D de Q. D não tem arestas de saída não visitadas. Q vazia, algoritmo concluído.',
            visited: ['A', 'C', 'B', 'E', 'F', 'D'],
            distances: { A: 0, B: 4, C: 2, D: 9, E: 3, F: 6 },
            queue: [],
            highlight: 'D'
        }
    ];

    const pseudoCode = `
procedure Dijkstra(origem):
    dist[origem] = 0
    dist[v] = ∞ para todos v ≠ origem
    Q = fila de prioridade com todos vértices
    
    enquanto Q não vazia:
        u = remove mínimo de Q (menor dist[u])
        para cada vizinho v de u:
            alt = dist[u] + peso(u, v)
            se alt < dist[v]:
                dist[v] = alt
                predecessor[v] = u`;

    const adjacencyRows = nodes.map(node => {
        const neighbors = edges
            .filter(e => e.from === node)
            .map(e => `${e.to}(${e.weight})`);
        return { node, neighbors };
    });

    const renderGraph = () => {
        const step = activeStep >= 1 ? dijkstraSteps[activeStep - 1] : dijkstraSteps[0];
        
        return (
            <svg width="380" height="320" viewBox="0 -40 380 320" style={{ maxWidth: '100%' }}>
                <defs>
                    <marker id="arrow-dijkstra" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill={theme.textSec} />
                    </marker>
                </defs>
                {edges.map((edge, idx) => {
                    const start = positions[edge.from];
                    const end = positions[edge.to];
                    const angle = Math.atan2(end.y - start.y, end.x - start.x);
                    const r = 20; 
                    const x1 = start.x + r * Math.cos(angle);
                    const y1 = start.y + r * Math.sin(angle);
                    const x2 = end.x - r * Math.cos(angle);
                    const y2 = end.y - r * Math.sin(angle);
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;
                    
                    // Ajustes específicos para arestas com visualização difícil
                    let weightX = midX;
                    let weightY = midY - 5;
                    
                    if (edge.from === 'A' && edge.to === 'C') {
                        // AC: vertical, move peso para direita, mais próximo
                        weightX = midX + 12;
                        weightY = midY;
                    } else if (edge.from === 'B' && edge.to === 'D') {
                        // BD: vertical, move peso para direita, mais próximo
                        weightX = midX + 12;
                        weightY = midY;
                    } else if (edge.from === 'B' && edge.to === 'E') {
                        // BE: diagonal, move peso mais próximo da aresta
                        weightX = midX - 8;
                        weightY = midY - 8;
                    }
                    
                    return (
                        <g key={`${edge.from}-${edge.to}-${idx}`}>
                            <line
                                x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke={theme.textSec}
                                strokeWidth="2"
                                markerEnd="url(#arrow-dijkstra)"
                            />
                            <text
                                x={weightX}
                                y={weightY}
                                textAnchor="middle"
                                fill={theme.accent}
                                fontWeight="600"
                                fontSize="12"
                                style={{ pointerEvents: 'none' }}
                            >
                                {edge.weight}
                            </text>
                        </g>
                    );
                })}
                {nodes.map(node => {
                    const isVisited = step.visited.includes(node);
                    const isHighlighted = step.highlight === node;
                    const dist = step.distances[node];
                    const distText = dist === Infinity ? '∞' : dist.toString();
                    
                    let fill = theme.cardBg;
                    if (isVisited) fill = theme.visited;
                    if (isHighlighted) fill = theme.current;
                    
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
                                fill={isVisited || isHighlighted ? '#fff' : theme.text}
                                fontWeight="600"
                            >
                                {node}
                            </text>
                            <text
                                x={positions[node].x}
                                y={(node === 'A' || node === 'B') ? positions[node].y - 28 : positions[node].y + 35}
                                textAnchor="middle"
                                fill={theme.accent}
                                fontWeight="600"
                                fontSize="11"
                            >
                                d={distText}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: theme.bg, overflowY: 'auto' }}>
            <div style={{ padding: '40px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.text, marginBottom: '20px' }}>
                        Algoritmo de Dijkstra
                    </h2>
                    <p style={{ lineHeight: 1.8, color: theme.textSec, marginBottom: '15px', fontSize: '1.05rem' }}>
                        O algoritmo de Dijkstra encontra o caminho mais curto de um vértice origem para todos os outros
                        vértices em um grafo ponderado com pesos não negativos. Utiliza uma fila de prioridade (heap) para
                        sempre processar o vértice com menor distância conhecida, garantindo que quando um vértice é processado,
                        sua distância já é a mínima possível.
                    </p>
                    <p style={{ lineHeight: 1.8, color: theme.textSec, fontSize: '1.05rem' }}>
                        A técnica é fundamental para roteamento em redes, sistemas de navegação GPS e otimização de caminhos.
                        O algoritmo mantém distâncias provisórias e as atualiza (relaxa) sempre que encontra um caminho melhor,
                        até que todas as distâncias finais sejam determinadas.
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
                        Grafo de Referência (Ponderado)
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', alignItems: 'center' }}>
                        {renderGraph()}
                        <div style={{ flex: '1 1 250px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.text }}>
                                <thead>
                                    <tr style={{ backgroundColor: isDarkMode ? '#172235' : '#e2e8f0' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Vértice</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Adjacentes (peso)</th>
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
                        Grafo direcionado ponderado. Os números nas arestas representam os pesos. Dijkstra encontra o caminho mais curto de A para todos os outros vértices.
                    </p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Simulação Passo a Passo
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
                        {dijkstraSteps.map((step, index) => (
                            <button
                                key={step.title}
                                onClick={() => setActiveStep(index + 1)}
                                style={{
                                    borderRadius: '12px',
                                    border: `1px solid ${activeStep === index + 1 ? theme.accent : theme.border}`,
                                    backgroundColor: activeStep === index + 1 ? (isDarkMode ? '#3d2e1a' : '#fef3c7') : theme.cardBg,
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
                                    <p style={{ margin: '4px 0', color: theme.text }}>Fila Q: [{step.queue.join(', ') || '∅'}]</p>
                                    <p style={{ margin: '4px 0', color: theme.accent, fontWeight: '600' }}>
                                        Distâncias: {Object.entries(step.distances).map(([v, d]) => `${v}=${d === Infinity ? '∞' : d}`).join(', ')}
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
                    
                    <svg width="300" height="300" viewBox="0 -40 380 320" style={{ overflow: 'visible' }}>
                        <defs>
                            <marker id="arrow-demo" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L9,3 z" fill={theme.textSec} />
                            </marker>
                            <marker id="arrow-highlight" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L9,3 z" fill={theme.current} />
                            </marker>
                        </defs>
                        {edges.map((edge, idx) => {
                            const start = positions[edge.from];
                            const end = positions[edge.to];
                            const angle = Math.atan2(end.y - start.y, end.x - start.x);
                            const r = 20; 
                            const x1 = start.x + r * Math.cos(angle);
                            const y1 = start.y + r * Math.sin(angle);
                            const x2 = end.x - r * Math.cos(angle);
                            const y2 = end.y - r * Math.sin(angle);
                            const midX = (x1 + x2) / 2;
                            const midY = (y1 + y2) / 2;
                            
                            const currentData = demoSteps[autoStep];
                            const isRelaxing = currentData.relaxingEdge && 
                                             currentData.relaxingEdge[0] === edge.from && 
                                             currentData.relaxingEdge[1] === edge.to;
                            
                            let weightX = midX;
                            let weightY = midY - 5;
                            
                            if (edge.from === 'A' && edge.to === 'C') {
                                weightX = midX + 12;
                                weightY = midY;
                            } else if (edge.from === 'B' && edge.to === 'D') {
                                weightX = midX + 12;
                                weightY = midY;
                            } else if (edge.from === 'B' && edge.to === 'E') {
                                weightX = midX - 8;
                                weightY = midY - 8;
                            }
                            
                            return (
                                <g key={`${edge.from}-${edge.to}-${idx}`}>
                                    <line 
                                        x1={x1} y1={y1} x2={x2} y2={y2} 
                                        stroke={isRelaxing ? theme.current : theme.textSec} 
                                        strokeWidth={isRelaxing ? "3" : "2"} 
                                        markerEnd={isRelaxing ? "url(#arrow-highlight)" : "url(#arrow-demo)"}
                                        style={{ transition: 'all 0.3s ease' }}
                                    />
                                    <text 
                                        x={weightX} y={weightY} 
                                        textAnchor="middle" 
                                        fill={isRelaxing ? theme.current : theme.accent} 
                                        fontWeight="600" 
                                        fontSize={isRelaxing ? "14" : "12"}
                                        style={{ transition: 'all 0.3s ease' }}
                                    >
                                        {edge.weight}
                                    </text>
                                </g>
                            );
                        })}
                        
                        {nodes.map(n => {
                            const pos = positions[n];
                            const currentData = demoSteps[autoStep];
                            
                            const isCurr = currentData.curr === n;
                            const isVis = currentData.visited.includes(n);
                            const dist = currentData.distances[n];
                            const distText = dist === Infinity ? '∞' : dist.toString();
                            
                            let fill = theme.cardBg;
                            if (isVis) fill = theme.visited;
                            if (isCurr) fill = theme.current;
                            
                            let textColor = theme.text;
                            if (isVis || isCurr) textColor = '#fff';

                            return (
                                <g key={n} style={{ transition: 'all 0.3s ease' }}>
                                    <circle cx={pos.x} cy={pos.y} r={isCurr ? "25" : "20"} fill={fill} stroke={theme.accent} strokeWidth="2" />
                                    <text x={pos.x} y={pos.y} dy="5" textAnchor="middle" fill={textColor} fontWeight="bold">{n}</text>
                                    <text x={pos.x} y={(n === 'A' || n === 'B') ? pos.y - 28 : pos.y + 35} textAnchor="middle" fill={theme.accent} fontWeight="600" fontSize="11">d={distText}</text>
                                </g>
                            );
                        })}
                    </svg>

                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: theme.bg, borderRadius: '8px', border: `1px solid ${theme.border}`, width: '100%', textAlign: 'center' }}>
                         <span style={{ color: theme.textSec, fontSize: '0.9rem', marginRight: '10px' }}>Passo {autoStep + 1}/{demoSteps.length}:</span>
                         <strong style={{ color: theme.text }}>{demoSteps[autoStep].desc}</strong>
                    </div>
                    <div style={{ marginTop: '10px', padding: '15px', backgroundColor: theme.accent + '20', borderRadius: '8px', border: `1px solid ${theme.accent}`, width: '100%' }}>
                        <div style={{ color: theme.textSec, fontSize: '0.9rem', marginBottom: '5px' }}>Distâncias Mínimas de A:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                            {Object.entries(demoSteps[autoStep].distances).map(([v, d]) => (
                                <span key={v} style={{ color: theme.accent, fontWeight: '600', fontSize: '0.95rem' }}>
                                    {v}: {d === Infinity ? '∞' : d}
                                </span>
                            ))}
                        </div>
                    </div>
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
                                    <td style={{ padding: '14px', color: '#10b981', fontWeight: 600 }}>O((V + E) log V)</td>
                                    <td style={{ padding: '14px', color: theme.textSec }}>Com heap binário. O(V²) com array simples.</td>
                                </tr>
                                <tr style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.cardBg }}>
                                    <td style={{ padding: '14px' }}>Espaço</td>
                                    <td style={{ padding: '14px', color: '#facc15', fontWeight: 600 }}>O(V)</td>
                                    <td style={{ padding: '14px', color: theme.textSec }}>Para vetor de distâncias + heap de prioridade.</td>
                                </tr>
                                <tr style={{ borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.cardBg }}>
                                    <td style={{ padding: '14px' }}>Aplicações</td>
                                    <td style={{ padding: '14px', color: '#3b82f6', fontWeight: 600 }}>Roteamento, GPS, Redes</td>
                                    <td style={{ padding: '14px', color: theme.textSec }}>Encontrar caminhos mais curtos em mapas, roteamento de pacotes, sistemas de navegação.</td>
                                </tr>
                                <tr style={{ backgroundColor: theme.cardBg }}>
                                    <td style={{ padding: '14px' }}>Requisito</td>
                                    <td style={{ padding: '14px', color: '#ef4444', fontWeight: 600 }}>Pesos não negativos</td>
                                    <td style={{ padding: '14px', color: theme.textSec }}>O algoritmo não funciona corretamente com pesos negativos. Use Bellman-Ford nesse caso.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DijkstraClass;

