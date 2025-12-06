import React, { useMemo, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Play, Pause, RotateCcw, Network } from 'lucide-react';

const StronglyConnectedComponentsClass = () => {
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
        accent: '#ec4899', // Rosa
        scc1: '#3b82f6',   // Azul
        scc2: '#10b981',   // Verde
        bridge: '#f59e0b',  // Laranja
        groupBg1: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
        groupBg2: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
    };

    const nodes = useMemo(() => (['A', 'B', 'C', 'D', 'E', 'F']), []);

    const positions = {
        A: { x: 80, y: 60 },
        B: { x: 160, y: 120 },
        C: { x: 80, y: 180 },
        D: { x: 260, y: 60 },
        E: { x: 340, y: 120 },
        F: { x: 260, y: 180 }
    };

    // --- Arestas Originais ---
    const edgesOriginal = useMemo(() => ([
        // Ciclo 1 (SCC 1)
        { u: 'A', v: 'B', type: 'internal' }, 
        { u: 'B', v: 'C', type: 'internal' }, 
        { u: 'C', v: 'A', type: 'internal' },
        // Ponte alterada: B → D
        { u: 'B', v: 'D', type: 'bridge' },
        // Ciclo 2 (SCC 2)
        { u: 'D', v: 'E', type: 'internal' }, 
        { u: 'E', v: 'F', type: 'internal' }, 
        { u: 'F', v: 'D', type: 'internal' }
    ]), []);
    
    // --- Arestas Transpostas (Invertidas) ---
    const edgesTransposed = useMemo(() => edgesOriginal.map(edge => ({
        u: edge.v, 
        v: edge.u, 
        type: edge.type, 
        isTransposed: true // Marcador para diferenciação
    })), [edgesOriginal]);

    // --- Seleção Dinâmica das Arestas ---
    const currentEdges = useMemo(() => {
        // Inverte arestas nos passos 3, 4 e 5 da animação
        if (autoStep >= 3 && autoStep <= 5) {
            return edgesTransposed;
        }
        // Retorna ao original nos outros passos
        return edgesOriginal;
    }, [autoStep, edgesOriginal, edgesTransposed]);


    // --- Roteiro da Animação Automática ---
    const demoSteps = [
        { 
            ids: [], 
            groups: [], 
            colors: {}, 
            desc: "Passo 1: Inicia a DFS no grafo original para calcular a ordem de término dos nós." 
        },
        { 
            ids: ['A', 'B', 'C'], 
            groups: [], 
            colors: { A: theme.accent, B: theme.accent, C: theme.accent }, 
            desc: "DFS 1: Explorando A, B e C. (B possui aresta de saída para D)." 
        },
        { 
            ids: ['D', 'E', 'F'], 
            groups: [], 
            colors: { A: theme.accent, B: theme.accent, C: theme.accent, D: theme.accent, E: theme.accent, F: theme.accent }, 
            desc: "DFS 1: Atinge o grupo D, E, F e finaliza. A ordem de término é calculada." 
        },
        { 
            ids: [], 
            groups: [], 
            colors: { A: theme.scc1, B: theme.scc1, C: theme.scc1, D: theme.scc2, E: theme.scc2, F: theme.scc2 }, 
            desc: "Passo 2: Invertemos as arestas (Grafo Transposto). O fluxo de B→D agora é D→B (inverso)." 
        },
        { 
            ids: ['C', 'A', 'B'], 
            groups: [{ x: 50, y: 30, w: 150, h: 180, c: theme.scc1 }], 
            colors: { A: theme.scc1, B: theme.scc1, C: theme.scc1 }, 
            desc: "DFS 2 (no Transposto): Inicia pelo nó com maior tempo de término. Encontra CFC #1: {A, B, C}." 
        },
        { 
            ids: ['D', 'E', 'F'], 
            groups: [
                { x: 50, y: 30, w: 150, h: 180, c: theme.scc1 }, 
                { x: 230, y: 30, w: 150, h: 180, c: theme.scc2 }
            ], 
            colors: { A: theme.scc1, B: theme.scc1, C: theme.scc1, D: theme.scc2, E: theme.scc2, F: theme.scc2 }, 
            desc: "DFS 2: Próximo na pilha é D. Encontra CFC #2: {D, E, F}." 
        },
        { 
            ids: [], 
            groups: [
                { x: 50, y: 30, w: 150, h: 180, c: theme.scc1 }, 
                { x: 230, y: 30, w: 150, h: 180, c: theme.scc2 }
            ], 
            colors: { A: theme.scc1, B: theme.scc1, C: theme.scc1, D: theme.scc2, E: theme.scc2, F: theme.scc2 }, 
            desc: "Concluído. Grafo Condensado: CFC #1 -> CFC #2 (Visualização Original restaurada)." 
        }
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
    }, [isAutoPlaying]);

    const kosarajuPseudo = `
procedure KOSARAJU(G):
    // PASSO 1: Calcular Ordem de Término
    pilha_termino = Stack()
    DFS(G, u, pilha_termino) // Armazena nós ao 'finalizar'

    // PASSO 2: Criar e Executar no Transposto
    G_transposto = InverterArestas(G)
    visitado = Mapa()
    
    enquanto pilha_termino não vazia:
        u = pilha_termino.pop()
        se !visitado[u]:
            SCC_Atual = []
            DFS(G_transposto, u, SCC_Atual) // DFS no Transposto
            registrar(SCC_Atual)
`;

    const steps = [
        {
            title: 'Definição',
            description: 'Subgrafo maximal onde para cada par (u, v), existe um caminho u→v E um caminho v→u.',
            highlight: []
        },
        {
            title: 'Kosaraju Passo 1 (G)',
            description: 'Usar DFS no grafo original (G) para calcular o tempo de término de cada nó e armazená-los em uma pilha.',
            highlight: ['A', 'B', 'C']
        },
        {
            title: 'Grafo Transposto (Gᵀ)',
            description: 'Inverter a direção de todas as arestas. Isso é crucial para isolar os componentes na 2ª DFS, impedindo o "retorno" de CFCs já visitados.',
            highlight: ['C', 'D']
        },
        {
            title: 'Kosaraju Passo 2 (Gᵀ)',
            description: 'Fazer uma DFS no grafo transposto (Gᵀ), seguindo a ordem da pilha. Cada nova DFS encontra um CFC inteiro.',
            highlight: ['A', 'B', 'C']
        },
        {
            title: 'Grafo de Condensação',
            description: 'Cada CFC pode ser tratado como um único "super-nó". O grafo resultante é sempre um Grafo Acíclico Dirigido (DAG).',
            highlight: []
        }
    ];

    const renderGraph = (stepData, edgesToRender) => (
        <svg width="420" height="260" viewBox="0 0 420 260" style={{ maxWidth: '100%' }}>
            <defs>
                <marker id="arrow-scc-default" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill={theme.textSec} />
                </marker>
                <marker id="arrow-scc-bridge" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill={theme.bridge} />
                </marker>
            </defs>

            {/* AGRUPAMENTO (Visualiza o CFC encontrado) */}
            {stepData.groups && stepData.groups.map((group, index) => (
                <rect 
                    key={index}
                    x={group.x} y={group.y} 
                    width={group.w} height={group.h} 
                    rx="15" ry="15" 
                    fill={group.c === theme.scc1 ? theme.groupBg1 : theme.groupBg2}
                    stroke={group.c}
                    strokeDasharray="5,5"
                    strokeWidth="2"
                    style={{ transition: 'all 0.5s ease' }}
                />
            ))}

            {/* Arestas (Renderizadas com base na seleção dinâmica) */}
            {edgesToRender.map(({ u, v, type }) => {
                const start = positions[u];
                const end = positions[v];
                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const r = 24; 
                const x1 = start.x + r * Math.cos(angle);
                const y1 = start.y + r * Math.sin(angle);
                const x2 = end.x - r * Math.cos(angle);
                const y2 = end.y - r * Math.sin(angle);
                
                let strokeColor = theme.textSec;
                let markerId = "url(#arrow-scc-default)";

                if (type === 'bridge') {
                    strokeColor = theme.bridge;
                    markerId = "url(#arrow-scc-bridge)";
                } else if (type === 'internal' && (stepData.colors[u] || stepData.colors[v]) && stepData.colors[u] === stepData.colors[v] && stepData.colors[u] !== theme.accent) {
                    // Colore arestas internas do CFC já encontrado
                    strokeColor = stepData.colors[u]; 
                }

                return (
                    <line
                        key={`${u}-${v}`}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={strokeColor}
                        strokeWidth={type === 'bridge' ? "3" : "2"}
                        markerEnd={markerId}
                        style={{ transition: 'all 0.5s ease' }}
                    />
                );
            })}
            
            {/* Nós */}
            {nodes.map(n => {
                const pos = positions[n];
                const color = stepData.colors[n] || theme.cardBg;
                const isColored = color !== theme.cardBg;

                return (
                    <g key={n} style={{ transition: 'all 0.5s ease' }}>
                        <circle cx={pos.x} cy={pos.y} r="22" fill={color} stroke={isColored ? color : theme.border} strokeWidth="2" />
                        <text x={pos.x} y={pos.y} dy="5" textAnchor="middle" fill={isColored ? '#fff' : theme.text} fontWeight="bold">{n}</text>
                    </g>
                );
            })}
        </svg>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: theme.bg, overflowY: 'auto' }}>
            <div style={{ padding: '40px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Network size={28} color={theme.accent}/>
                        Componentes Fortemente Conexos (CFC)
                    </h2>
                    <p style={{ lineHeight: 1.8, color: theme.textSec, marginBottom: '15px', fontSize: '1.05rem' }}>
                        O problema dos CFCs é resolvido tipicamente com o **Algoritmo de Kosaraju** (duas passagens de DFS) ou **Tarjan** (uma passagem de DFS usando pilhas).
                    </p>
                </section>

                {/* Animação Automática */}
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
                        <h3 style={{ color: theme.text, fontSize: '1.2rem', fontWeight: 600 }}>Visualização de Identificação (Kosaraju)</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setAutoStep(0)} style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: theme.bg, cursor: 'pointer', color: theme.textSec }}>
                                <RotateCcw size={16} />
                            </button>
                            <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: theme.accent, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                                {isAutoPlaying ? <Pause size={16}/> : <Play size={16}/>}
                                {isAutoPlaying ? 'Pausar' : 'Reproduzir'}
                            </button>
                        </div>
                    </div>
                    
                    {renderGraph(demoSteps[autoStep], currentEdges)}

                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: theme.bg, borderRadius: '8px', border: `1px solid ${theme.border}`, width: '100%', textAlign: 'center' }}>
                         <strong style={{ color: theme.text }}>{demoSteps[autoStep].desc}</strong>
                    </div>
                </section>

                {/* Pseudocódigo e Teoria */}
                <section style={{ marginBottom: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
                    <div style={{ borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '24px', backgroundColor: theme.cardBg }}>
                        <h3 style={{ color: theme.text, fontSize: '1.1rem', marginBottom: '12px', fontWeight: 600 }}>Pseudocódigo de Kosaraju</h3>
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
                            {kosarajuPseudo}
                        </pre>
                    </div>
                    
                    <div style={{ borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '24px', backgroundColor: theme.cardBg }}>
                        <h3 style={{ color: theme.text, fontSize: '1.1rem', marginBottom: '12px', fontWeight: 600 }}>Aplicações Chave</h3>
                        <p style={{ color: theme.textSec, fontSize: '0.9rem', marginBottom: '10px' }}>
                            **Detecção de Deadlocks:** Em sistemas operacionais, ciclos no grafo de alocação de recursos representam impasses.
                        </p>
                        <p style={{ color: theme.textSec, fontSize: '0.9rem', marginBottom: '10px' }}>
                            **Análise de Dependência:** Em projetos de software ou planilhas complexas, CFCs indicam dependências circulares que precisam ser resolvidas.
                        </p>
                        <p style={{ color: theme.textSec, fontSize: '0.9rem' }}>
                            **Simplificação de Grafos:** A conversão para um **Grafo de Condensação** (onde cada CFC é um nó) facilita a análise de fluxo.
                        </p>
                    </div>
                </section>

                {/* Simulação Manual (Mantendo a estrutura) */}
                <section style={{ marginBottom: '60px' }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Passo a Passo Teórico
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
                        {steps.map((step, index) => (
                            <button
                                key={step.title}
                                onClick={() => setActiveStep(index)}
                                style={{
                                    borderRadius: '12px',
                                    border: `1px solid ${activeStep === index ? theme.accent : theme.border}`,
                                    backgroundColor: activeStep === index ? (isDarkMode ? '#1e1b4b' : '#fce7f3') : theme.cardBg,
                                    padding: '18px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <h4 style={{ margin: '0 0 8px 0', color: theme.text }}>{step.title}</h4>
                                <p style={{ margin: 0, color: theme.textSec, fontSize: '0.9rem' }}>{step.description}</p>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StronglyConnectedComponentsClass;