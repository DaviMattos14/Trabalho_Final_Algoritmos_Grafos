import { naturalSort } from "../utils.js";

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

function getSteps(rawGraph, start) {
    const history = [];
    const queue = [];

    // Pré-processamento: Simetria para BFS
    const graph = {};
    
    // Copia e Simetriza em um passo
    for (let u in rawGraph) {
        if (!graph[u]) graph[u] = [];
        // Copia arestas originais
        rawGraph[u].forEach(edge => {
            // Adiciona aresta de ida
            if (!graph[u].some(e => e.target === edge.target)) {
                graph[u].push({ ...edge });
            }
            
            // Garante destino existe
            const v = edge.target;
            if (!graph[v]) graph[v] = [];
            
            // Adiciona aresta de volta (Simetria)
            if (!graph[v].some(e => e.target === u)) {
                graph[v].push({ target: u, weight: edge.weight });
            }
        });
    }
    
    // Ordenação
    for (let key in graph) {
        graph[key].sort((a, b) => naturalSort(a.target, b.target));
    }

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

        for (const edge of graph[u]) {
            const v = edge.target;
            pushStep(4, `Checando vizinho ${v}`, v);

            if (!state.visited.has(v)) {
                pushStep(5, `Vizinho ${v} é branco.`, v);
                state.visited.add(v); 
                pushStep(6, `Marcando ${v} visitado.`, v);
                queue.push(v);
                pushStep(7, `Enfileirando ${v}.`, v);
            } else {
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