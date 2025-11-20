// js/algorithms/dfs.js

const pseudoCode = [
    "DFS(u):",
    "  marcar u como visitado (cinza)",
    "  para cada v em vizinhos(u):",
    "    se v não visitado (branco):",
    "      DFS(v)",
    "  marcar u como finalizado (preto)"
];

function getSteps(graph, start) {
    const history = [];
    
    // Estado base
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
        const newState = {
            visited: new Set(state.visited),
            finished: new Set(state.finished),
            finishedOrder: [...state.finishedOrder],
            queueSnapshot: [], 
            node: node,
            line: line,
            status: status
        };
        history.push(newState);
    }

    pushStep(-1, "Pronto para iniciar.", null);

    function dfs(u) {
        pushStep(0, `Iniciando DFS(${u})`, u);

        state.visited.add(u);
        pushStep(1, `Visitando ${u} (estado: cinza)`, u);

        // --- CORREÇÃO: Ordenar vizinhos alfabeticamente ---
        // Garante determinismo: visita C antes de D, mesmo que D venha antes no array
        const neighbors = [...(graph[u] || [])].sort();

        for (const v of neighbors) {
            pushStep(2, `Checando vizinho ${v}`, v);
            
            if (!state.visited.has(v)) {
                pushStep(3, `Vizinho ${v} é branco.`, v);
                
                pushStep(4, `Chamando DFS(${v})`, v);
                dfs(v);
                
                pushStep(2, `Retornando para ${u} (após ${v})`, u);
            } else {
                pushStep(3, `Vizinho ${v} já visitado.`, v);
            }
        }

        pushStep(5, `Não há mais vizinhos brancos para ${u}.`, u);

        state.finished.add(u);
        state.finishedOrder.push(u);
        pushStep(5, `Finalizando ${u} (estado: preto)`, u);
    }

    if(graph[start]) {
       dfs(start);
    }
    
    pushStep(-1, "Busca em profundidade concluída.", null);
    
    return history;
}

export const dfsAlgorithm = {
    name: "Busca em Profundidade (DFS)",
    pseudoCode: pseudoCode,
    getSteps: getSteps
};