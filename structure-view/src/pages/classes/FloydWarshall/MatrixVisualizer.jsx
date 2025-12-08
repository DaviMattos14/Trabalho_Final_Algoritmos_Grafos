


export default function MatrixVisualizer({ currentStepData, theme, isDarkMode }) {
    if (!currentStepData || !currentStepData.matrix) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.textSec }}>
                Aguardando início...
            </div>
        );
    }

    const { matrix, nodes, pointers, highlightUpdate } = currentStepData;
    const { k, i, j } = pointers || {};

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            height: '100%', 
            width: '100%',
            overflow: 'auto',
            padding: '20px'
        }}>
            <h3 style={{ color: theme.text, marginBottom: '15px', fontSize: '1.1rem' }}>
                Matriz D[{k !== undefined ? nodes[k] : 'Inicial'}]
            </h3>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `auto repeat(${nodes.length}, minmax(45px, 1fr))`,
                gap: '2px',
                border: `1px solid ${theme.border}`,
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: theme.cardBg
            }}>
                {/* Canto Vazio Superior Esquerdo */}
                <div style={{}}></div> 

                {/* Cabeçalhos das Colunas */}
                {nodes.map(n => (
                    <div key={`h-${n}`} style={{ 
                        fontWeight: 'bold', textAlign: 'center', padding: '8px', 
                        color: theme.text, borderBottom: `2px solid ${theme.border}` 
                    }}>
                        {n}
                    </div>
                ))}

                {/* Linhas da Matriz */}
                {matrix.map((row, rowIdx) => (
                    <>
                        {/* Cabeçalho da Linha */}
                        <div key={`rh-${rowIdx}`} style={{ 
                            fontWeight: 'bold', textAlign: 'center', padding: '10px', 
                            color: theme.text, borderRight: `2px solid ${theme.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {nodes[rowIdx]}
                        </div>

                        {/* Células */}
                        {row.map((val, colIdx) => {
                            // Lógica de Highlight
                            const isTarget = rowIdx === i && colIdx === j; // Célula sendo calculada (i, j)
                            const isSourceK = rowIdx === i && colIdx === k; // Célula (i, k)
                            const isKTarget = rowIdx === k && colIdx === j; // Célula (k, j)
                            const isUpdated = highlightUpdate && highlightUpdate.r === rowIdx && highlightUpdate.c === colIdx;

                            // Cores
                            let bgColor = 'transparent';
                            let borderColor = 'transparent';
                            let fontWeight = 'normal';
                            let transform = 'scale(1)';
                            let zIndex = 0;

                            if (isTarget) {
                                bgColor = isUpdated ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'; 
                                borderColor = isUpdated ? theme.success : theme.danger;
                                fontWeight = 'bold';
                                transform = 'scale(1.05)';
                                zIndex = 10;
                            } else if (isSourceK || isKTarget) {
                                bgColor = 'rgba(59, 130, 246, 0.15)'; 
                                borderColor = theme.highlight;
                                fontWeight = 'bold';
                            } else if (rowIdx === k || colIdx === k) {
                                // Destaca linha e coluna do pivô K levemente
                                bgColor = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
                            }

                            return (
                                <div key={`${rowIdx}-${colIdx}`} style={{
                                    border: `1px solid ${borderColor === 'transparent' ? theme.border : borderColor}`,
                                    backgroundColor: bgColor,
                                    color: theme.text,
                                    padding: '8px',
                                    textAlign: 'center',
                                    borderRadius: '4px',
                                    minWidth: '45px',
                                    fontWeight: fontWeight,
                                    transition: 'all 0.2s ease',
                                    transform: transform,
                                    zIndex: zIndex,
                                    position: 'relative',
                                    boxShadow: zIndex > 0 ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                                }}>
                                    {val === Infinity ? '∞' : val}
                                </div>
                            );
                        })}
                    </>
                ))}
            </div>
        </div>
    );
}