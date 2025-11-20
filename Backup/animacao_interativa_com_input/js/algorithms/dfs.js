const pseudoCode = [
    "DFS(u):",
    "  marcar u como visitado (cinza)",
    "  para cada v em vizinhos(u):",
    "    se v não visitado (branco):",
    "      DFS(v)",
    "  marcar u como finalizado (preto)"
];

function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function getSteps(graph, start) {
    const history = [];
    const state = { visited: new Set(), finished: new Set(), finishedOrder: [], queueSnapshot: [], node: null, line: -1, status: "Pronto para iniciar." };

    function pushStep(line, status, node) {
        history.push({
            visited: new Set(state.visited),
            finished: new Set(state.finished),
            finishedOrder: [...state.finishedOrder],
            queueSnapshot: [],
            node: node, line: line, status: status
        });
    }

    pushStep(-1, "Pronto para iniciar.", null);

    function dfs(u) {
        // Linha 0: Chamada inicial
        pushStep(0, `Iniciando DFS(${u})`, u);
        
        // Linha 1: Marca visitado
        state.visited.add(u);
        pushStep(1, `Visitando ${u} (estado: cinza)`, u);

        // Ordenação Natural
        const neighbors = [...(graph[u] || [])].sort(naturalSort);

        for (const v of neighbors) {
            // Linha 2: Loop
            pushStep(2, `Checando vizinho ${v}`, v);
            
            if (!state.visited.has(v)) {
                // Linha 3: Checa se branco (não visitado)
                pushStep(3, `Vizinho ${v} é branco.`, v);
                
                // Linha 4: Chamada recursiva
                pushStep(4, `Chamando DFS(${v})`, v);
                dfs(v);
                
                pushStep(2, `Retornando para ${u}`, u);
            }
        }

        // Linha 5: Finaliza
        state.finished.add(u);
        state.finishedOrder.push(u);
        pushStep(5, `Finalizando ${u} (estado: preto)`, u);
    }

    if(graph[start]) dfs(start);
    
    pushStep(-1, "Busca em profundidade concluída.", null);
    return history;
}

export const dfsAlgorithm = {
    name: "Busca em Profundidade (DFS)",
    pseudoCode: pseudoCode,
    getSteps: getSteps
};