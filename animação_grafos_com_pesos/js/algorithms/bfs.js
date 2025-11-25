const pseudoCode = [
    "BFS(s):",
    "  crie uma fila Q e enfileire s (cinza)", 
    "  enquanto Q não vazia:",                 
    "    u = desenfileire de Q",               
    "    para cada v em vizinhos(u):",         
    "      se v não visitado (branco):",       
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

    // --- PRÉ-PROCESSAMENTO: SIMETRIA (Adaptado para Objetos) ---
    const graph = {};
    // Copia profunda para não alterar o original
    for (let key in rawGraph) {
        graph[key] = rawGraph[key].map(e => ({...e}));
    }
    
    // Simetriza: Se existe A->B, cria B->A
    for (let u in rawGraph) {
        for (let edge of rawGraph[u]) {
            const v = edge.target;
            if (!graph[v]) graph[v] = [];
            
            // Verifica se já existe a volta
            if (!graph[v].some(e => e.target === u)) {
                // Adiciona a volta mantendo o peso original
                graph[v].push({ target: u, weight: edge.weight });
            }
        }
    }
    
    // Ordena para consistência visual
    for (let key in graph) {
        graph[key].sort((a, b) => naturalSort(a.target, b.target));
    }
    // -------------------------------

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
        pushStep(1, `Iniciando BFS(${start}). Enfileirando.`, start);
    }

    while (queue.length > 0) {
        pushStep(2, `Verificando fila...`, null);

        const u = queue.shift();
        pushStep(3, `Desenfileirando ${u}.`, u);

        // Loop sobre arestas (objetos)
        for (const edge of graph[u]) {
            const v = edge.target; // Extrai o alvo
            pushStep(4, `Checando vizinho ${v}`, v);

            if (!state.visited.has(v)) {
                pushStep(5, `Vizinho ${v} é branco.`, v);
                
                state.visited.add(v); 
                pushStep(6, `Marcando ${v} visitado.`, v);
                
                queue.push(v);
                pushStep(7, `Enfileirando ${v}.`, v);
            } else {
                // --- ALTERAÇÃO AQUI ---
                // Mensagem específica quando o vizinho já foi visitado
                pushStep(5, `Vizinho ${v} já visitado. Vamos para o próximo.`, v);
            }
        }
        state.finished.add(u);
        state.finishedOrder.push(u);
        pushStep(8, `Finalizando ${u}.`, u);
    }

    pushStep(-1, "Busca em Largura concluída.", null);
    return history;
}

export const bfsAlgorithm = {
    name: "Busca em Largura (BFS)",
    label: "Fila Q:",
    pseudoCode: pseudoCode,
    getSteps: getSteps
};