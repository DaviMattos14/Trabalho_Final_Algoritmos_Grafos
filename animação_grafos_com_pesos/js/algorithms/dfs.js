import { naturalSort } from "../utils.js";

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
    const stack = []; 

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
            queueSnapshot: [...stack], 
            node: node,
            line: line,
            status: status
        });
    }

    pushStep(-1, "Pronto para iniciar.", null);

    function dfs(u) {
        stack.push(u);
        pushStep(0, `Iniciando DFS(${u})`, u);

        state.visited.add(u);
        pushStep(1, `Visitando ${u} (estado: cinza)`, u);

        const neighbors = [...(graph[u] || [])].sort((a, b) => naturalSort(a.target, b.target));

        for (const edge of neighbors) {
            const v = edge.target;
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
        
        stack.pop();
    }

    if(graph[start]) {
       dfs(start);
    }
    
    pushStep(-1, "Busca em profundidade concluída.", null);
    
    return history;
}

export const dfsAlgorithm = {
    name: "Busca em Profundidade (DFS)",
    label: "Pilha (Stack):", 
    pseudoCode: pseudoCode,
    getSteps: getSteps
};