// js/algorithms/topological.js

const pseudoCode = [
    "TopologicalSort(u):",
    "  marcar u como visitado (cinza)",
    "  para cada v em vizinhos(u):",
    "    se v não visitado (branco):",
    "      TopologicalSort(v)",
    "  marcar u como finalizado (preto)",
    "  adicionar u ao INÍCIO da lista" // O passo crucial
];

function getSteps(graph, start) {
    const history = [];
    const topoList = []; // Nossa lista ordenada
    
    const state = {
        visited: new Set(),
        finished: new Set(),
        finishedOrder: [],
        queueSnapshot: [], // Usaremos para mostrar a Lista Topológica
        node: null,
        line: -1,
        status: "Pronto para iniciar."
    };

    function pushStep(line, status, node) {
        const newState = {
            visited: new Set(state.visited),
            finished: new Set(state.finished),
            finishedOrder: [...state.finishedOrder],
            queueSnapshot: [...topoList], // Salva o estado atual da lista
            node: node,
            line: line,
            status: status
        };
        history.push(newState);
    }

    pushStep(-1, "Pronto para iniciar.", null);

    function dfs(u) {
        pushStep(0, `Chamando TopologicalSort(${u})`, u);

        state.visited.add(u);
        pushStep(1, `Visitando ${u} (cinza)`, u);

        for (const v of graph[u]) {
            pushStep(2, `Checando vizinho ${v}`, v);
            
            if (!state.visited.has(v)) {
                pushStep(3, `Vizinho ${v} é branco.`, v);
                pushStep(4, `Recursão para ${v}`, v);
                dfs(v);
                pushStep(2, `Retornando para ${u} (após ${v})`, u);
            } else {
                pushStep(3, `Vizinho ${v} já visitado. Ignorando.`, v);
            }
        }

        state.finished.add(u);
        state.finishedOrder.push(u);
        pushStep(5, `Finalizando ${u} (preto)`, u);

        // --- O GRANDE TRUQUE DA ORDENAÇÃO TOPOLÓGICA ---
        // Adicionamos no INÍCIO da lista (unshift)
        topoList.unshift(u);
        pushStep(6, `Adicionando ${u} ao início da Lista Topológica.`, u);
    }

    // Loop para garantir que visitamos todos os nós (caso o grafo seja desconexo)
    // Mas para o MVP, focamos no componente do nó inicial
    if(graph[start]) {
       dfs(start);
    }
    
    pushStep(-1, "Ordenação concluída.", null);
    
    return history;
}

export const topologicalAlgorithm = {
    name: "Ordenação Topológica (DFS)",
    label: "Lista Topológica:", // Rótulo customizado para a UI
    pseudoCode: pseudoCode,
    getSteps: getSteps
};