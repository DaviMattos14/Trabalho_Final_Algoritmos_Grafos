const pseudoCode = [
    "BFS(s):",
    "  crie uma fila Q e enfileire s (cinza)", 
    "  enquanto Q não está vazia:",                 
    "    u = desenfileire de Q",               
    "    para cada v em vizinhos(u):",         
    "      se v não foi visitado (branco):",       
    "        marque v como visitado (cinza)",  
    "        enfileire v em Q",                
    "    marque u como finalizado (preto)"     
];

function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function getSteps(rawGraph, start) {
    const history = [];
    const queue = [];

    // Simetriza grafo e ordena
    const graph = {};
    for (let key in rawGraph) graph[key] = [...(rawGraph[key] || [])];
    for (let u in rawGraph) {
        for (let v of rawGraph[u]) {
            if (!graph[v]) graph[v] = [];
            if (!graph[v].includes(u)) graph[v].push(u);
        }
    }
    for (let key in graph) graph[key].sort(naturalSort);

    const state = { visited: new Set(), finished: new Set(), finishedOrder: [], queueSnapshot: [], node: null, line: -1, status: "Pronto para iniciar." };

    function pushStep(line, status, node) {
        history.push({
            visited: new Set(state.visited),
            finished: new Set(state.finished),
            finishedOrder: [...state.finishedOrder],
            queueSnapshot: [...queue],
            node: node, line: line, status: status
        });
    }

    pushStep(-1, "Pronto para iniciar.", null);
    
    if (graph[start]) {
        state.visited.add(start);
        queue.push(start);
        // Linha 1: Enfileira S
        pushStep(1, `Iniciando BFS(${start}). Enfileirando.`, start);
    }

    while (queue.length > 0) {
        pushStep(2, `Verificando fila...`, null);

        const u = queue.shift();
        // Linha 3: Desenfileira
        pushStep(3, `Desenfileirando ${u}.`, u);

        for (const v of graph[u]) {
            // Linha 4: Vizinhos
            pushStep(4, `Checando vizinho ${v}`, v);

            if (!state.visited.has(v)) {
                // Linha 5: Checa se branco
                pushStep(5, `Vizinho ${v} é branco.`, v);
                
                state.visited.add(v); 
                // Linha 6: Marca cinza
                pushStep(6, `Marcando ${v} visitado.`, v);
                
                queue.push(v);
                // Linha 7: Enfileira
                pushStep(7, `Enfileirando ${v}.`, v);
            }
        }
        // Linha 8: Finaliza
        state.finished.add(u);
        state.finishedOrder.push(u);
        pushStep(8, `Finalizando ${u}.`, u);
    }

    pushStep(-1, "Busca em Largura concluída.", null);
    return history;
}

export const bfsAlgorithm = {
    name: "Busca em Largura (BFS)",
    pseudoCode: pseudoCode,
    getSteps: getSteps
};