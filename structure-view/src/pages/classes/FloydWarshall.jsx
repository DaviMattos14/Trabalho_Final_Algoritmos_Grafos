import React from 'react';
import { useOutletContext } from 'react-router-dom';

const FloydWarshallClass = () => {
    const context = useOutletContext();
    const isDarkMode = context ? context.isDarkMode : false;

    const theme = {
        bg: isDarkMode ? '#0f172a' : '#f8f9fa',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        text: isDarkMode ? '#f1f5f9' : '#1e293b',
        textSec: isDarkMode ? '#94a3b8' : '#475569',
        border: isDarkMode ? '#334155' : '#e2e8f0',
        accent: '#8b5cf6',
        visited: '#10b981',
        current: '#f59e0b',
        processing: '#3b82f6',
        matrixCell: isDarkMode ? '#334155' : '#e2e8f0'
    };

    const theorySteps = [
        {
            title: 'O que é',
            description:
                'O algoritmo de Floyd–Warshall encontra o caminho de menor custo entre todos os pares de vértices de um grafo ponderado.',
        },
        {
            title: 'Para que serve',
            description:
                'Resolve o problema all-pairs shortest path: calcula simultaneamente a menor distância entre cada par de vértices (i, j).',
        },
        {
            title: 'Pesos negativos',
            description:
                'Aceita arestas com peso negativo, desde que não existam ciclos negativos no grafo.',
        },
        {
            title: 'Detecção de ciclos negativos',
            description:
                'Se ao final da execução dist[v][v] < 0 para algum vértice v, então existe um ciclo negativo acessível.',
            highlight: true
        }
    ];

    const pseudoCode = `
// dist é a matriz de adjacência, n é o número de vértices
para k de 1 até n:
  para i de 1 até n:
    para j de 1 até n:
      se dist[i][k] + dist[k][j] < dist[i][j]:
        dist[i][j] = dist[i][k] + dist[k][j]
`;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100%',
                backgroundColor: theme.bg,
                overflowY: 'auto'
            }}
        >
            <div
                style={{
                    padding: '40px',
                    width: '100%',
                    maxWidth: '1000px',
                    margin: '0 auto'
                }}
            >
                {/* Intro */}
                <section style={{ marginBottom: '40px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginBottom: '20px'
                        }}
                    >
                        <h2
                            style={{
                                fontSize: '1.8rem',
                                fontWeight: '700',
                                color: theme.text,
                                margin: 0
                            }}
                        >
                            Algoritmo de Floyd-Warshall
                        </h2>
                    </div>

                    <p
                        style={{
                            lineHeight: 1.8,
                            color: theme.textSec,
                            marginBottom: '15px',
                            fontSize: '1.05rem'
                        }}
                    >
                        O algoritmo de Floyd–Warshall calcula os caminhos mínimos entre
                        todos os pares de vértices de um grafo ponderado. Ele funciona
                        mesmo com arestas de peso negativo, desde que não haja ciclos
                        negativos.
                    </p>

                    <p
                        style={{
                            lineHeight: 1.8,
                            color: theme.textSec,
                            fontSize: '1.05rem'
                        }}
                    >
                        Seu funcionamento baseia-se em atualizar iterativamente uma
                        matriz de distâncias, testando se passar por um vértice k
                        melhora o caminho entre i e j.
                    </p>
                </section>

                {/* Cards */}
                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '20px',
                        marginBottom: '40px'
                    }}
                >
                    {theorySteps.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                backgroundColor: theme.cardBg,
                                padding: '20px',
                                borderRadius: '12px',
                                border: `1px solid ${
                                    item.highlight ? theme.accent : theme.border
                                }`,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        >
                            <h4
                                style={{
                                    color: item.highlight
                                        ? theme.accent
                                        : theme.text,
                                    margin: '0 0 10px 0'
                                }}
                            >
                                {item.title}
                            </h4>
                            <p
                                style={{
                                    color: theme.textSec,
                                    fontSize: '0.9rem',
                                    margin: 0,
                                    lineHeight: 1.5
                                }}
                            >
                                {item.description}
                            </p>
                        </div>
                    ))}
                </section>

                {/* Pseudocode & Table */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '40px'
                    }}
                >
                    {/* Pseudocódigo */}
                    <section
                        style={{
                            borderRadius: '12px',
                            border: `1px solid ${theme.border}`,
                            padding: '24px',
                            backgroundColor: theme.cardBg
                        }}
                    >
                        <h3
                            style={{
                                color: theme.text,
                                fontSize: '1.1rem',
                                marginBottom: '12px',
                                fontWeight: 600
                            }}
                        >
                            Pseudocódigo
                        </h3>

                        <pre
                            style={{
                                margin: 0,
                                backgroundColor: '#0f172a',
                                color: '#e2e8f0',
                                borderRadius: '10px',
                                padding: '16px',
                                fontFamily:
                                    'JetBrains Mono, Consolas, monospace',
                                fontSize: '0.85rem',
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.6
                            }}
                        >
                            {pseudoCode}
                        </pre>
                    </section>

                    {/* Complexidade */}
                    <section
                        style={{
                            borderRadius: '12px',
                            border: `1px solid ${theme.border}`,
                            overflow: 'hidden'
                        }}
                    >
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                color: theme.text
                            }}
                        >
                            <thead
                                style={{
                                    backgroundColor: isDarkMode
                                        ? '#172235'
                                        : '#e2e8f0'
                                }}
                            >
                                <tr>
                                    <th style={{ padding: '14px' }}>
                                        Aspecto
                                    </th>
                                    <th style={{ padding: '14px' }}>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    style={{
                                        borderBottom: `1px solid ${theme.border}`,
                                        backgroundColor: theme.cardBg
                                    }}
                                >
                                    <td style={{ padding: '14px' }}>Tempo</td>
                                    <td
                                        style={{
                                            padding: '14px',
                                            color: '#ef4444',
                                            fontWeight: 600,
                                            fontFamily: 'monospace'
                                        }}
                                    >
                                        O(V³)
                                    </td>
                                </tr>

                                <tr
                                    style={{
                                        borderBottom: `1px solid ${theme.border}`,
                                        backgroundColor: theme.cardBg
                                    }}
                                >
                                    <td style={{ padding: '14px' }}>Espaço</td>
                                    <td
                                        style={{
                                            padding: '14px',
                                            color: '#facc15',
                                            fontWeight: 600,
                                            fontFamily: 'monospace'
                                        }}
                                    >
                                        O(V²)
                                    </td>
                                </tr>

                                <tr style={{ backgroundColor: theme.cardBg }}>
                                    <td style={{ padding: '14px' }}>
                                        Ideal para
                                    </td>
                                    <td style={{ padding: '14px' }}>
                                        Grafos densos · Matrizes de adjacência ·
                                        Arestas negativas · Detecção de ciclos
                                        negativos.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default FloydWarshallClass;
