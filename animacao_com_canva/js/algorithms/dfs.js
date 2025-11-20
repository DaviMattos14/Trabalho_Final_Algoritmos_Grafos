const pseudoCode = [
    "DFS(u):",
    "  marcar u como visitado (cinza)",
    "  para cada v em vizinhos(u):",
    "    se v não visitado (branco):",
    "      DFS(v)",
    "  marcar u como finalizado (preto)"
];

// Helper local para garantir a ordenação numérica correta
function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function getSteps(graph, start) {
    const history = [];
    
    // --- NOVO: Rastreamento da Pilha de Recursão ---
    const stack = []; 

    const state = {
        visited: new Set(),
        finished: new Set(),
        finishedOrder: [],
        queueSnapshot: [], // Agora representará a Pilha
        node: null,
        line: -1,
        status: "Pronto para iniciar."
    };

    function pushStep(line, status, node) {
        history.push({
            visited: new Set(state.visited),
            finished: new Set(state.finished),
            finishedOrder: [...state.finishedOrder],
            // Clona a pilha atual para o histórico
            queueSnapshot: [...stack], 
            node: node,
            line: line,
            status: status
        });
    }

    pushStep(-1, "Pronto para iniciar.", null);

    function dfs(u) {
        // Entrou na função: Adiciona à Pilha
        stack.push(u);

        pushStep(0, `Iniciando DFS(${u})`, u);

        state.visited.add(u);
        pushStep(1, `Visitando ${u} (estado: cinza)`, u);

        // Ordenação Natural dos vizinhos
        const neighbors = [...(graph[u] || [])].sort(naturalSort);

        for (const v of neighbors) {
            pushStep(2, `Checando vizinho ${v}`, v);
            
            if (!state.visited.has(v)) {
                pushStep(3, `Vizinho ${v} é branco.`, v);
                
                pushStep(4, `Chamando DFS(${v})`, v);
                dfs(v); // Recursão
                
                pushStep(2, `Retornando para ${u} (após ${v})`, u);
            } else {
                pushStep(3, `Vizinho ${v} já visitado.`, v);
            }
        }

        pushStep(5, `Não há mais vizinhos brancos para ${u}.`, u);

        state.finished.add(u);
        state.finishedOrder.push(u);
        pushStep(5, `Finalizando ${u} (estado: preto)`, u);
        
        // Saiu da função (Backtracking): Remove da Pilha
        stack.pop();
    }

    // Inicia se o nó existir
    if(graph[start]) {
       dfs(start);
    }
    
    pushStep(-1, "Busca em profundidade concluída.", null);
    
    return history;
}

export const dfsAlgorithm = {
    name: "Busca em Profundidade (DFS)",
    label: "Pilha (Stack):", // Rótulo atualizado para a UI
    pseudoCode: pseudoCode,
    getSteps: getSteps
};