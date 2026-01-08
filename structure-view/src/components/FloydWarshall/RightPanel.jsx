import useTheme from "./useTheme";


export default function RightPanel({ currentAlgoInfo, currentStepData }) {
    const { theme, isDarkMode } = useTheme();
    
    // Extrai dados para exibição amigável
    const { nodes, pointers, matrix } = currentStepData || {};
    const { k, i, j } = pointers || {};

    // Helper visual (retorna string para exibição)
    const getValStr = (r, c) => {
        if (!matrix || r === undefined || c === undefined || !matrix[r]) return '?';
        const v = matrix[r][c];
        return v === Infinity ? '∞' : v;
    };

    // Helper numérico seguro (retorna Infinity se inválido para evitar crash na soma)
    const getValNum = (r, c) => {
        if (!matrix || r === undefined || c === undefined || !matrix[r]) return Infinity;
        return matrix[r][c];
    };

    return (
        <div id="uiPanel">
        {[
            { title: 'Pseudocódigo', content: (
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.5', marginTop: '10px', maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', color: theme.text }}>
                    {currentAlgoInfo?.pseudoCode?.map((line, idx) => (
                        <div key={idx} style={{ 
                            backgroundColor: currentStepData.line === idx ? (isDarkMode ? '#854d0e' : '#fef08a') : 'transparent',
                            color: currentStepData.line === idx ? (isDarkMode ? '#fff' : '#000') : theme.text,
                            fontWeight: currentStepData.line === idx ? 'bold' : 'normal',
                            padding: '2px 4px',
                            fontFamily: '"Courier New", monospace',
                            borderRadius: '3px'
                        }}>
                            {line}
                        </div>
                    ))}
                </div>
            )},
            { title: 'Cálculos & Estado', content: (
                <div style={{ marginTop: '5px', color: theme.textSec, fontSize: '0.9rem' }}>
                    {/* Descrição Textual */}
                    <div style={{ marginBottom: '10px', fontStyle: 'italic', color: theme.text }}>
                        {currentStepData?.description || "Iniciando..."}
                    </div>

                    {/* Detalhes Matemáticos - Renderiza APENAS se os ponteiros existirem */}
                    {pointers && nodes && typeof i === 'number' && typeof j === 'number' && typeof k === 'number' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: `1px solid ${theme.border}`, paddingTop: '10px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px' }}>
                                <span style={{fontWeight:'bold', color: theme.highlight}}>k (Via):</span> 
                                <span>{nodes[k]} (idx: {k})</span>
                                
                                <span style={{fontWeight:'bold'}}>i (De):</span> 
                                <span>{nodes[i]}</span>
                                
                                <span style={{fontWeight:'bold'}}>j (Para):</span> 
                                <span>{nodes[j]}</span>
                            </div>

                            <div style={{ backgroundColor: theme.codeBg, padding: '8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem', color: theme.text }}>
                                dist[{nodes[i]}][{nodes[j]}] &gt; <br/>
                                dist[{nodes[i]}][{nodes[k]}] + dist[{nodes[k]}][{nodes[j]}]
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold' }}>
                                <span style={{ color: theme.danger }}>{getValStr(i, j)}</span>
                                <span>&gt;</span>
                                <span style={{ color: theme.highlight }}>{getValStr(i, k)} + {getValStr(k, j)}</span>
                            </div>
                            
                            <div style={{ textAlign: 'center', color: theme.textSec }}>
                                {getValNum(i, k) !== Infinity && getValNum(k, j) !== Infinity 
                                    ? `= ${(getValNum(i, k) + getValNum(k, j))}` 
                                    : '= ∞'}
                            </div>
                        </div>
                    )}
                </div>
            )},
        ].map((card, idx) => (
            <div key={idx} style={{ 
                backgroundColor: theme.cardBg, 
                padding: '15px', 
                border: `1px solid ${theme.border}`, 
                borderRadius: '8px', 
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                marginBottom: '10px'
            }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.textSec, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {card.title}
                </h3>
                {card.content}
            </div>
        ))}
    </div>
    );
}