import { naturalSort } from "../utils.js";

const pseudoCode = [
    "TopologicalSort(u):",
    "  marcar u como visitado (cinza)",
    "  para cada v em vizinhos(u):",
    "    se v não visitado (branco):",
    "      TopologicalSort(v)",
    "  marcar u como finalizado (preto)",
    "  adicionar u ao INÍCIO da lista" 
];

function getSteps(graph, start) {
    const history = [];
    const topoList = []; 
    
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
            queueSnapshot: [...topoList], 
            node: node,
            line: line,
            status: status
        });
    }

    pushStep(-1, "Pronto para iniciar.", null);

    function dfs(u) {
        pushStep(0, `Chamando TopologicalSort(${u})`, u);

        state.visited.add(u);
        pushStep(1, `Visitando ${u} (cinza)`, u);

        const neighbors = [...(graph[u] || [])].sort((a, b) => naturalSort(a.target, b.target));

        for (const edge of neighbors) {
            const v = edge.target;
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

        topoList.unshift(u);
        pushStep(6, `Adicionando ${u} ao início da Lista Topológica.`, u);
    }

    if(graph[start]) {
       dfs(start);
    }
    
    pushStep(-1, "Ordenação concluída.", null);
    
    return history;
}

export const topologicalAlgorithm = {
    name: "Ordenação Topológica (DFS)",
    label: "Lista Topológica:", 
    pseudoCode: pseudoCode,
    getSteps: getSteps
};