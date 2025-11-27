import { naturalSort } from "../utils/graphUtils.js";

const pseudoCode = [
    "BFS(s):",                                 // Linha 0
    "  crie uma fila Q e enfileire s (laranja)", // Linha 1
    "  enquanto Q não vazia:",                 // Linha 2
    "    u = desenfileire de Q",               // Linha 3
    "    para cada v em vizinhos(u):",         // Linha 4
    "      se v não visitado (branco):",       // Linha 5
    "        marque v como visitado (laranja)",  // Linha 6
    "        enfileire v em Q",                // Linha 7
    "    marque u como finalizado (preto)"     // Linha 8
];

function getSteps(rawGraph, start) {
    const history = [];
    const queue = [];

    // --- PRÉ-PROCESSAMENTO: SIMETRIA ---
    const graph = {};
    for (let key in rawGraph) {
        graph[key] = rawGraph[key].map(e => ({...e}));
    }
    
    for (let u in rawGraph) {
        for (let edge of rawGraph[u]) {
            const v = edge.target;
            if (!graph[v]) graph[v] = [];
            
            if (!graph[v].some(e => e.target === u)) {
                graph[v].push({ target: u, weight: edge.weight });
            }
        }
    }
    
    for (let key in graph) {
        graph[key].sort((a, b) => naturalSort(a.target, b.target));
    }
    // -----------------------------------

    const state = { 
        visited: new Set(), 
        finished: new Set(), 
        finishedOrder: [], 
        queueSnapshot: [], 
        node: null, 
        line: -1, 
        status: "Pronto para iniciar." 
    };

    function pushStep(line, status, node) {
        history.push({
            visited: new Set(state.visited),
            finished: new Set(state.finished),
            finishedOrder: [...state.finishedOrder],
            queueSnapshot: [...queue],
            node: node, 
            line: line, 
            status: status
        });
    }

    // Estado inicial (Reset)
    pushStep(-1, "Pronto para iniciar.", null);
    
    if (graph[start]) {
        // --- MUDANÇA 1: Destaca a chamada da função (Linha 0) ---
        pushStep(0, `Chamando BFS(${start})...`, start);

        state.visited.add(start);
        queue.push(start);

        // --- MUDANÇA 2: Destaca a criação da fila (Linha 1) ---
        pushStep(1, `Criando fila Q e enfileirando ${start} (laranja).`, start);
    }

    while (queue.length > 0) {
        // --- MUDANÇA 3: Destaca a verificação do loop (Linha 2) ---
        pushStep(2, `Verificando se a fila está vazia... (Tamanho: ${queue.length})`, null);

        const u = queue.shift();
        pushStep(3, `Desenfileirando ${u}.`, u);

        for (const edge of graph[u]) {
            const v = edge.target;
            pushStep(4, `Checando vizinho ${v}`, v);

            if (!state.visited.has(v)) {
                pushStep(5, `Vizinho ${v} é branco.`, v);
                
                state.visited.add(v); 
                pushStep(6, `Marcando ${v} como visitado (laranja).`, v);
                
                queue.push(v);
                pushStep(7, `Enfileirando ${v}.`, v);
            } else {
                pushStep(5, `Vizinho ${v} já visitado. Vamos para o próximo.`, v);
            }
        }
        state.finished.add(u);
        state.finishedOrder.push(u);
        pushStep(8, `Finalizando ${u} (preto).`, u);
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