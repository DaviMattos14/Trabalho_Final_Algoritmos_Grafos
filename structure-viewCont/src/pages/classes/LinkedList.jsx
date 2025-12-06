import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

const LinkedListClass = () => {
    const { isDarkMode } = useOutletContext();

    const theme = {
        bg: isDarkMode ? '#0f172a' : '#f8f9fa',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        text: isDarkMode ? '#f1f5f9' : '#1e293b',
        textSec: isDarkMode ? '#94a3b8' : '#475569',
        border: isDarkMode ? '#334155' : '#e2e8f0',
        accent: '#3b82f6',
        highlight: isDarkMode ? '#1d4ed8' : '#93c5fd',
        focusColor: '#3b82f6',      // Azul para nó em foco
        normalColor: isDarkMode ? '#94a3b8' : '#94a3b8',  // Cinza para normal
        removedColor: '#ef4444',     // Vermelho para removido
        newColor: '#10b981',          // Verde para novo
        visitedColor: isDarkMode ? '#475569' : '#d1d5db'  // Cinza mais claro para visitado
    };

    const baseNodes = useMemo(() => ([
        { id: 'A', value: 12, pointer: 'B', label: 'Endereço 0x1A' },
        { id: 'B', value: 27, pointer: 'C', label: 'Endereço 0x2B' },
        { id: 'C', value: 33, pointer: 'D', label: 'Endereço 0x3C' },
        { id: 'D', value: 41, pointer: null, label: 'Endereço 0x4D' }
    ]), []);

    const operationsTrail = [
        {
            title: 'Inserção no fim',
            description: 'Criamos um novo nó (valor 57) e ajustamos o ponteiro do tail (anterior: 41 → ∅) para apontar para ele (41 → 57). O novo nó aponta para ∅.',
            listState: [...baseNodes, { id: 'E', value: 57, pointer: null, label: 'Endereço 0x5E', state: 'new' }],
            stateMap: { 'D': 'focus' },
            note: 'Note: O nó D muda seu ponteiro (em destaque azul). O nó E é novo (em verde).'
        },
        {
            title: 'Busca por valor 33',
            description: 'Percorremos sequencialmente: visitamos A, depois B, depois C. Ao encontrar o valor 33 em C, paramos. Nós já visitados ficam em cinza; o nó atual em azul.',
            listState: baseNodes,
            stateMap: { 'A': 'visited', 'B': 'visited', 'C': 'focus' },
            note: 'Legenda: Azul = nó em foco (atual), Cinza = já visitado, Branco = não visitado ainda.'
        },
        {
            title: 'Remoção do valor 27 - Marcando',
            description: 'Encontramos o nó B (valor 27) que será removido. Neste passo, o nó está marcado em vermelho indicando que será removido.',
            listState: baseNodes,
            stateMap: { 'B': 'removed' },
            note: 'Marcação: O nó B está em vermelho, pronto para ser removido. Seu antecessor A será atualizado no próximo passo.'
        },
        {
            title: 'Remoção do valor 27 - Finalizando',
            description: 'Atualizamos o ponteiro de A: em vez de A → B → C, agora A → C. O nó B é removido logicamente (não é mais alcançável). A memória será liberada pelo coletor de lixo.',
            listState: baseNodes.filter(node => node.id !== 'B').map((node, index, arr) => ({
                ...node,
                pointer: arr[index + 1] ? arr[index + 1].id : null,
                state: node.id === 'A' ? 'focus' : undefined
            })),
            note: 'Resultado: O nó A (em azul) mudou seu ponteiro para C. O nó B agora está inacessível e será limpo pela memória.'
        }
    ];

    const pseudoCode = `
classe No:
    valor: inteiro
    proximo: Referência(No)

classe ListaEncadeada:
    head: Referência(No)
    tail: Referência(No)

    metodo inserirNoFim(valor: inteiro) -> void:
        novo = No(valor)
        se head == null:
            head = novo
            tail = novo
            retorna
        tail.proximo = novo
        tail = novo

    metodo remover(valor: inteiro) -> booleano:
        anterior = null
        atual = head
        
        enquanto atual != null e atual.valor != valor:
            anterior = atual
            atual = atual.proximo
        
        se atual == null:
            retorna falso  // Valor não encontrado
        
        se anterior == null:
            head = atual.proximo
        senao:
            anterior.proximo = atual.proximo
        
        se atual == tail:
            tail = anterior
        
        retorna verdadeiro

    metodo buscar(valor: inteiro) -> Referência(No):
        atual = head
        
        enquanto atual != null:
            se atual.valor == valor:
                retorna atual
            atual = atual.proximo
        
        retorna null`;

    const complexityRows = [
        { op: 'Inserir no início', cost: 'O(1)', note: 'Atualiza head para o novo nó. Sem dependência de tamanho.' },
        { op: 'Inserir no fim', cost: 'O(1) com tail', note: 'Com tail, acesso direto. Sem tail, seria O(n) percorrendo tudo.' },
        { op: 'Buscar por valor', cost: 'O(n)', note: 'Percorre no máximo todos os n nós até encontrar ou chegar ao fim.' },
        { op: 'Remover nó conhecido', cost: 'O(1)', note: 'Se já tem ponteiro direto para o nó ou seu antecessor. Só atualiza ponteiros.' },
        { op: 'Remover por valor', cost: 'O(n)', note: 'Necessita buscar primeiro (O(n)), depois remover (O(1)). Total: O(n).' },
        { op: 'Acessar elemento[i]', cost: 'O(n)', note: 'Sem índices. Precisamos iterar i passos desde head. Arrays fazem em O(1).' }
    ];

    const renderList = (nodes, stateMap = {}) => {
        // Determina cor baseada no estado do nó (também verifica a propriedade 'state' do próprio nó)
        const getNodeColor = (nodeId, nodeState) => {
            const state = nodeState || stateMap[nodeId];
            if (state === 'focus') return theme.focusColor;      // Azul
            if (state === 'visited') return theme.visitedColor;  // Cinza claro
            if (state === 'new') return theme.newColor;          // Verde
            if (state === 'removed') return theme.removedColor;  // Vermelho
            return theme.border;                                 // Padrão
        };

        const getNodeBgColor = (nodeId, nodeState) => {
            const state = nodeState || stateMap[nodeId];
            if (state === 'focus') return isDarkMode ? '#1e3a8a' : '#eff6ff';  // Azul suave
            if (state === 'visited') return isDarkMode ? '#334155' : '#f3f4f6'; // Cinza suave
            if (state === 'new') return isDarkMode ? '#064e3b' : '#ecfdf5';     // Verde suave
            if (state === 'removed') return isDarkMode ? '#7f1d1d' : '#fee2e2'; // Vermelho suave
            return theme.cardBg;                                              // Branco/escuro
        };

        return (
            <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                    {nodes.map((node, index) => {
                        const state = node.state || stateMap[node.id];
                        const borderColor = getNodeColor(node.id, state);
                        const bgColor = getNodeBgColor(node.id, state);
                        
                        return (
                            <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    minWidth: '100px',
                                    padding: '16px',
                                    borderRadius: '10px',
                                    border: `3px solid ${borderColor}`,
                                    backgroundColor: bgColor,
                                    boxShadow: state === 'focus' ? '0 0 15px rgba(59,130,246,0.5)' : state === 'new' ? '0 0 15px rgba(16,185,129,0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <p style={{ margin: 0, color: theme.textSec, fontSize: '0.75rem', fontWeight: 600 }}>valor</p>
                                    <h4 style={{ margin: '5px 0 10px', color: theme.text, fontSize: '1.3rem', fontWeight: 700 }}>{node.value}</h4>
                                    <p style={{ margin: 0, color: theme.textSec, fontSize: '0.75rem', fontWeight: 600 }}>próximo</p>
                                    <h5 style={{ margin: '5px 0 0', color: theme.text, fontFamily: 'monospace' }}>{node.pointer ?? '∅'}</h5>
                                </div>
                                {index < nodes.length - 1 && (() => {
                                    const arrowColor = state === 'focus' ? theme.focusColor : (state === 'visited' ? theme.visitedColor : theme.textSec);
                                    const uniformStroke = 2; // espessura uniforme para todas as setas
                                    return (
                                        <svg width="60" height="40" style={{ minWidth: '60px' }} aria-hidden>
                                            <defs>
                                                <marker id={`arrow-${index}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                                                    <path d="M0,0 L8,4 L0,8 z" fill={arrowColor} />
                                                </marker>
                                            </defs>
                                            <line
                                                x1="0" y1="20" x2="58" y2="20"
                                                stroke={arrowColor}
                                                strokeWidth={uniformStroke}
                                                strokeLinecap="round"
                                                markerEnd={`url(#arrow-${index})`}
                                            />
                                        </svg>
                                    );
                                })()}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: theme.bg, overflowY: 'auto' }}>
            <div style={{ padding: '40px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.text, marginBottom: '20px' }}>
                        Lista Encadeada (Linked List)
                    </h2>
                    <p style={{ lineHeight: 1.8, color: theme.textSec, marginBottom: '15px', fontSize: '1.05rem' }}>
                        Uma lista encadeada modela uma <strong style={{ color: theme.text }}>sequência ordenada de nós</strong>, em que <strong style={{ color: theme.text }}>cada nó conhece apenas o próximo elemento</strong>. 
                        Diferentemente de arrays, que armazenam elementos continuamente na memória, listas encadeadas distribuem os nós por posições arbitrárias, conectados por ponteiros (referências).
                    </p>
                    <p style={{ lineHeight: 1.8, color: theme.textSec, marginBottom: '15px', fontSize: '1.05rem' }}>
                        <strong style={{ color: theme.text }}>Por que evitam realocação?</strong> Arrays pré-alocam espaço contíguo. Quando crescem além da capacidade, precisam copiar todos os elementos 
                        para um novo bloco maior — custo O(n). Listas encadeadas crescem naturalmente: basta criar um novo nó e atualizar um ponteiro (O(1)).
                    </p>
                    <p style={{ lineHeight: 1.8, color: theme.textSec, fontSize: '1.05rem' }}>
                        Graças ao encadeamento, podemos compor estruturas mais ricas (listas duplamente ligadas, listas circulares, filas e pilhas (Stacks)) 
                        respeitando princípios de encapsulamento: os nós expõem apenas getters/setters e a classe `ListaEncadeada` controla invariantes como referências ao `head` e ao `tail`.
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
                        Estrutura Base
                    </h3>
                    {renderList(baseNodes, {})}
                    <p style={{ textAlign: 'center', marginTop: '20px', color: theme.textSec, fontSize: '0.95rem' }}>
                        Cada bloco mantém o <strong style={{ color: theme.text }}>valor</strong> e um <strong style={{ color: theme.text }}>ponteiro (referência)</strong> para o próximo nó. O último aponta para <strong style={{ color: theme.text }}>∅</strong> (null/vazio).
                    </p>
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: isDarkMode ? '#334155' : '#f0f9ff',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${theme.accent}`,
                        fontSize: '0.9rem',
                        color: theme.textSec
                    }}>
                        <p style={{ margin: 0 }}>
                            <strong style={{ color: theme.text }}>Nota:</strong> As letras A, B, C… e endereços mostrados (0x1A, 0x2B…) são <strong style={{ color: theme.text }}>apenas representações fictícias</strong> para facilitar o aprendizado. 
                            Na prática, cada nó tem um endereço de memória real que varia conforme a execução do programa.
                        </p>
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Exemplo Procedural
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {operationsTrail.map((op, index) => (
                            <div key={op.title} style={{
                                border: `1px solid ${theme.border}`,
                                borderRadius: '12px',
                                backgroundColor: theme.cardBg,
                                padding: '24px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <span style={{ fontSize: '0.9rem', color: theme.textSec, fontWeight: 600 }}>Passo {index + 1}</span>
                                    <h4 style={{ margin: '6px 0 8px', color: theme.text, fontSize: '1.1rem' }}>{op.title}</h4>
                                    <p style={{ margin: 0, color: theme.textSec, lineHeight: 1.6 }}>{op.description}</p>
                                </div>
                                {renderList(op.listState, op.stateMap)}
                                <div style={{
                                    marginTop: '15px',
                                    padding: '12px',
                                    backgroundColor: isDarkMode ? '#334155' : '#f9fafb',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    color: theme.textSec,
                                    borderLeft: `3px solid ${theme.accent}`
                                }}>
                                    {op.note}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Legenda de Cores
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        {[
                            { color: '#3b82f6', name: 'Azul', desc: 'Nó em foco (atual/processando)' },
                            { color: '#d1d5db', name: 'Cinza', desc: 'Nó já visitado' },
                            { color: '#10b981', name: 'Verde', desc: 'Nó novo (recém-inserido)' },
                            { color: '#ef4444', name: 'Vermelho', desc: 'Nó marcado para remoção (transição)' }
                        ].map(item => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '30px',
                                    height: '30px',
                                    backgroundColor: item.color,
                                    borderRadius: '4px',
                                    border: `2px solid ${item.color}`,
                                    opacity: 0.8
                                }} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, color: theme.text, fontSize: '0.95rem' }}>{item.name}</p>
                                    <p style={{ margin: 0, color: theme.textSec, fontSize: '0.85rem' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Pseudocódigo Orientado a Objetos
                    </h3>
                    <div style={{
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: isDarkMode ? '#0f172a' : '#111827',
                        color: '#e2e8f0',
                        padding: '24px',
                        fontFamily: 'JetBrains Mono, Consolas, monospace',
                        fontSize: '0.9rem',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.7,
                        overflowX: 'auto'
                    }}>
                        {pseudoCode}
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Custos Assintóticos
                    </h3>
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.text }}>
                            <thead style={{ backgroundColor: isDarkMode ? '#172235' : '#e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '14px', textAlign: 'left' }}>Operação</th>
                                    <th style={{ padding: '14px', textAlign: 'left' }}>Custo</th>
                                    <th style={{ padding: '14px', textAlign: 'left' }}>Observações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complexityRows.map(row => (
                                    <tr key={row.op} style={{ borderTop: `1px solid ${theme.border}`, backgroundColor: theme.cardBg }}>
                                        <td style={{ padding: '14px' }}>{row.op}</td>
                                        <td style={{ padding: '14px', color: '#10b981', fontWeight: 600 }}>{row.cost}</td>
                                        <td style={{ padding: '14px', color: theme.textSec, fontSize: '0.95rem' }}>{row.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: theme.text, fontSize: '1.2rem', marginBottom: '20px', fontWeight: 600 }}>
                        Quando Usar Lista Encadeada
                    </h3>
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.text }}>
                            <thead style={{ backgroundColor: isDarkMode ? '#172235' : '#e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '14px', textAlign: 'left' }}>Cenário</th>
                                    <th style={{ padding: '14px', textAlign: 'left' }}>Descrição</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { scenario: 'Inserção/remoção frequente no meio', desc: 'O(1) com referência, vs O(n) em array.' },
                                    { scenario: 'Crescimento dinâmico sem realocação', desc: 'Evita overhead de copiar array inteiro.' },
                                    { scenario: 'Implementar filas (FIFO) ou pilhas (LIFO)', desc: 'Rápido em ambas as extremidades.' },
                                    { scenario: 'Estruturas complexas como grafos', desc: 'Nós com múltiplos ponteiros (adjacência).' }
                                ].map(item => (
                                    <tr key={item.scenario} style={{ borderTop: `1px solid ${theme.border}`, backgroundColor: theme.cardBg }}>
                                        <td style={{ padding: '14px', fontWeight: 600 }}>{item.scenario}</td>
                                        <td style={{ padding: '14px', color: theme.textSec, fontSize: '0.95rem' }}>{item.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>


            </div>
        </div>
    );
};

export default LinkedListClass;

