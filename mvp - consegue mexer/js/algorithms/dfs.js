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
        queueSnapshot: [], // DFS não usa fila, mas mantemos vazio para compatibilidade com a UI
        node: null,
        line: -1,
        status: "Pronto para iniciar."
    };

    // Função auxiliar para salvar snapshots
    function pushStep(line, status, node) {
        const newState = {
            visited: new Set(state.visited),
            finished: new Set(state.finished),
            finishedOrder: [...state.finishedOrder],
            queueSnapshot: [], // Sempre vazio no DFS
            node: node,
            line: line,
            status: status
        };
        history.push(newState);
    }

    // --- PASSO INICIAL (CORREÇÃO) ---
    // Grava o estado limpo para o grafo aparecer antes do Play
    pushStep(-1, "Pronto para iniciar.", null);

    function dfs(u) {
        
        // Linha 0: Chamada da função
        pushStep(0, `Iniciando DFS(${u})`, u);

        // Linha 1: Marcar como visitado (Cinza)
        state.visited.add(u);
        pushStep(1, `Visitando ${u} (estado: cinza)`, u);

        // Linha 2: Loop nos vizinhos
        for (const v of graph[u]) {
            pushStep(2, `Checando vizinho ${v}`, v);
            
            // Linha 3: Se não visitado
            if (!state.visited.has(v)) {
                pushStep(3, `Vizinho ${v} é branco.`, v);
                
                // Linha 4: Chamada Recursiva
                pushStep(4, `Chamando DFS(${v})`, v);
                dfs(v);
                
                // Retorno da recursão (volta para a linha do loop)
                pushStep(2, `Retornando para ${u} (após ${v})`, u);
            } else {
                pushStep(3, `Vizinho ${v} já visitado.`, v);
            }
        }

        pushStep(5, `Não há mais vizinhos brancos para ${u}.`, u);

        // Linha 5: Finalizar (Preto)
        state.finished.add(u);
        state.finishedOrder.push(u);
        pushStep(5, `Finalizando ${u} (estado: preto)`, u);
    }

    // Inicia o algoritmo se o nó existir
    if(graph[start]) {
       dfs(start);
    }
    
    // Passo Final
    pushStep(-1, "Busca em profundidade concluída.", null);
    
    return history;
}

export const dfsAlgorithm = {
    name: "Busca em Profundidade (DFS)",
    pseudoCode: pseudoCode,
    getSteps: getSteps
};