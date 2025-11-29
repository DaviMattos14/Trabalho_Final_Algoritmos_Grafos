import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Grid, List, Network } from 'lucide-react'; // ArrowLeft removido pois não é mais usado

const GraphRepresentation = () => {
    // navigate removido pois o botão voltar agora está no Header Global
    const { isDarkMode } = useOutletContext();
    const [activeTab, setActiveTab] = useState('visual');

    // Tema
    const theme = {
        bg: isDarkMode ? '#0f172a' : '#f8f9fa',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        text: isDarkMode ? '#f1f5f9' : '#1e293b',
        textSec: isDarkMode ? '#94a3b8' : '#475569',
        border: isDarkMode ? '#334155' : '#e2e8f0',
        accent: '#3b82f6',
        tableHeader: isDarkMode ? '#0f172a' : '#f1f5f9'
    };

    // Dados do Exemplo
    const nodes = [0, 1, 2, 3];
    const edges = [
        { from: 0, to: 1 }, { from: 0, to: 2 },
        { from: 1, to: 2 },
        { from: 2, to: 0 }, { from: 2, to: 3 },
        { from: 3, to: 3 }
    ];

    const MathText = ({ children }) => (
        <span style={{ fontFamily: '"Times New Roman", Times, serif', fontStyle: 'italic', fontSize: '1.1em' }}>
            {children}
        </span>
    );

    const renderMatrix = () => (
        <div style={{
            overflowX: 'auto',
            display: 'flex',
            justifyContent: 'center',
            padding: '10px'
        }}>
            <table
                style={{
                    minWidth: '500px',      /* Aumenta largura mínima */
                    borderCollapse: 'collapse',
                    color: theme.text,
                    textAlign: 'center',
                    fontSize: '1.1rem'      /* Fonte maior */
                }}
            >
                <thead>
                    <tr>
                        <th style={{ padding: '14px', border: `1px solid ${theme.border}`, background: theme.tableHeader }}></th>
                        {nodes.map(n => (
                            <th
                                key={n}
                                style={{
                                    padding: '14px 20px',    /* Células mais largas */
                                    border: `1px solid ${theme.border}`,
                                    background: theme.tableHeader
                                }}
                            >
                                {n}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {nodes.map(row => (
                        <tr key={row}>
                            <th style={{ padding: '14px 20px', border: `1px solid ${theme.border}`, background: theme.tableHeader }}>
                                {row}
                            </th>

                            {nodes.map(col => {
                                const hasEdge = edges.some(e => e.from === row && e.to === col);
                                return (
                                    <td
                                        key={col}
                                        style={{
                                            padding: '14px 20px',          /* Aumenta tamanho da célula */
                                            border: `1px solid ${theme.border}`,
                                            fontWeight: hasEdge ? 'bold' : 'normal',
                                            color: hasEdge ? theme.accent : 'inherit',
                                            backgroundColor: hasEdge ? (isDarkMode ? '#1e3a8a' : '#eff6ff') : 'transparent'
                                        }}
                                    >
                                        {hasEdge ? '1' : '0'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );


    const renderList = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '600px', margin: '0 auto' }}>
            {nodes.map(u => {
                const neighbors = edges.filter(e => e.from === u).map(e => e.to);
                return (
                    <div key={u} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ width: '32px', height: '32px', background: theme.accent, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {u}
                        </div>
                        <div style={{ fontSize: '1.2rem', color: theme.textSec }}>→</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {neighbors.length > 0 ? neighbors.map((v, i) => (
                                <div key={i} style={{ padding: '6px 12px', background: theme.tableHeader, borderRadius: '6px', border: `1px solid ${theme.border}`, color: theme.text, fontWeight: '500' }}>
                                    {v}
                                </div>
                            )) : <span style={{ color: theme.textSec, fontStyle: 'italic', padding: '6px 0' }}>∅</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const VisualGraph = () => {
        const pos = {
            0: { x: 50, y: 100 },
            1: { x: 150, y: 40 },
            2: { x: 150, y: 160 },
            3: { x: 250, y: 100 }
        };

        const ArrowLine = ({ u, v }) => {
            const start = pos[u];
            const end = pos[v];
            if (u === v) {
                return <path d={`M ${start.x + 10},${start.y - 15} C ${start.x + 40},${start.y - 40} ${start.x + 40},${start.y + 40} ${start.x + 15},${start.y + 10}`} fill="none" stroke={theme.textSec} strokeWidth="2" markerEnd="url(#arrow)" />;
            }
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const r = 22;
            const x1 = start.x + r * Math.cos(angle);
            const y1 = start.y + r * Math.sin(angle);
            const x2 = end.x - r * Math.cos(angle);
            const y2 = end.y - r * Math.sin(angle);

            const isBi = edges.some(e => e.from === v && e.to === u);
            if (isBi) {
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                const perpX = -Math.sin(angle) * 20;
                const perpY = Math.cos(angle) * 20;
                return <path d={`M ${x1},${y1} Q ${midX + perpX},${midY + perpY} ${x2},${y2}`} fill="none" stroke={theme.textSec} strokeWidth="2" markerEnd="url(#arrow)" />;
            }
            return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.textSec} strokeWidth="2" markerEnd="url(#arrow)" />;
        };

        return (
            <svg width="300" height="200" viewBox="0 0 300 200" style={{ maxWidth: '100%' }}>
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill={theme.textSec} />
                    </marker>
                </defs>
                {edges.map((e, i) => <ArrowLine key={i} u={e.from} v={e.to} />)}
                {Object.keys(pos).map(k => (
                    <g key={k}>
                        <circle cx={pos[k].x} cy={pos[k].y} r="20" fill={theme.cardBg} stroke={theme.accent} strokeWidth="2" />
                        <text x={pos[k].x} y={pos[k].y} dy="5" textAnchor="middle" fill={theme.text} fontWeight="bold" fontSize="14px">{k}</text>
                    </g>
                ))}
            </svg>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: theme.bg, overflowY: 'auto' }}>

            {/* O CABEÇALHO FOI REMOVIDO DAQUI */}

            {/* Container do Conteúdo */}
            <div style={{
                padding: '40px',
                width: '100%',
                maxWidth: '900px',
                margin: '0 auto'
            }}>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.text, marginBottom: '20px' }}>Estruturas de Dados</h2>
                    <p style={{ lineHeight: '1.8', color: theme.textSec, marginBottom: '15px', fontSize: '1.05rem' }}>
                        Um grafo matemático é denotado por <MathText>G = (V, E)</MathText>, onde <MathText>V</MathText> é o conjunto de vértices e <MathText>E</MathText> é o conjunto de arestas.
                    </p>
                    <p style={{ lineHeight: '1.8', color: theme.textSec, fontSize: '1.05rem' }}>
                        Para que um computador processe essa estrutura abstrata, precisamos traduzi-la para a memória. As duas formas canônicas são a <b>Matriz de Adjacência</b> (focada em acesso rápido) e a <b>Lista de Adjacência</b> (focada em economia de espaço).
                    </p>
                </section>

                <section style={{ backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, backgroundColor: isDarkMode ? '#172235' : '#f1f5f9' }}>
                        {['visual', 'matrix', 'list'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1, padding: '15px', border: 'none',
                                    background: activeTab === tab ? theme.cardBg : 'transparent',
                                    borderBottom: activeTab === tab ? 'none' : `1px solid ${theme.border}`,
                                    color: activeTab === tab ? theme.accent : theme.textSec,
                                    fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {tab === 'visual' && <Network size={18} />}
                                {tab === 'matrix' && <Grid size={18} />}
                                {tab === 'list' && <List size={18} />}
                                {tab === 'visual' ? 'Grafo Visual' : tab === 'matrix' ? 'Matriz' : 'Lista'}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '40px', minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {activeTab === 'visual' && <VisualGraph />}
                        {activeTab === 'matrix' && <div style={{ width: '100%' }}>{renderMatrix()}</div>}
                        {activeTab === 'list' && <div style={{ width: '100%' }}>{renderList()}</div>}
                    </div>

                    <div style={{ padding: '20px', background: isDarkMode ? '#172235' : '#f8fafc', borderTop: `1px solid ${theme.border}`, fontSize: '0.9rem', color: theme.textSec, textAlign: 'center' }}>
                        {activeTab === 'visual' && "Representação visual de um grafo direcionado com 4 vértices e 6 arestas."}
                        {activeTab === 'matrix' && "Matriz N x N. O valor 1 indica conexão direta da linha (origem) para a coluna (destino)."}
                        {activeTab === 'list' && "Array de listas. Cada vértice possui uma lista contendo apenas seus vizinhos diretos."}
                    </div>
                </section>

                <section>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: theme.text, marginBottom: '20px' }}>Comparativo de Complexidade</h3>
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.text }}>
                            <thead style={{ backgroundColor: theme.tableHeader }}>
                                <tr>
                                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: `2px solid ${theme.border}` }}>Operação / Critério</th>
                                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: `2px solid ${theme.border}` }}>Lista de Adjacência</th>
                                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: `2px solid ${theme.border}` }}>Matriz de Adjacência</th>
                                </tr>
                            </thead>
                            <tbody style={{ backgroundColor: theme.cardBg }}>
                                <tr>
                                    <td style={{ padding: '15px', borderBottom: `1px solid ${theme.border}` }}>Espaço (Memória)</td>
                                    <td style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, color: '#10b981', fontWeight: '500' }}>O(V + E) <span style={{ fontSize: '0.8em', color: theme.textSec }}>Eficiente</span></td>
                                    <td style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, color: '#ef4444', fontWeight: '500' }}>O(V²) <span style={{ fontSize: '0.8em', color: theme.textSec }}>Pesado</span></td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '15px', borderBottom: `1px solid ${theme.border}` }}>Verificar aresta (u, v)</td>
                                    <td style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, color: '#ef4444', fontWeight: '500' }}>O(grau de u)</td>
                                    <td style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, color: '#10b981', fontWeight: '500' }}>O(1) <span style={{ fontSize: '0.8em', color: theme.textSec }}>Instantâneo</span></td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '15px' }}>Iterar vizinhos</td>
                                    <td style={{ padding: '15px', color: '#10b981', fontWeight: '500' }}>O(grau de u)</td>
                                    <td style={{ padding: '15px', color: '#ef4444', fontWeight: '500' }}>O(V)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default GraphRepresentation;