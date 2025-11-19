// js/algorithms/bfs.js

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

    // --- PRÉ-PROCESSAMENTO: SIMETRIA ---
    // Para BFS, o grafo é não direcionado. 
    // Se E aponta para A, então A deve apontar para E logicamente.
    const graph = {};

    // 1. Copia a estrutura original para não alterar a referência global
    for (let key in rawGraph) {
        graph[key] = [...(rawGraph[key] || [])];
    }

    // 2. Adiciona as arestas inversas
    for (let u in rawGraph) {
        for (let v of rawGraph[u]) {
            // Se existe u->v, garante que existe v->u
            if (!graph[v]) graph[v] = [];
            
            if (!graph[v].includes(u)) {
                graph[v].push(u);
            }
        }
    }

    // 3. Ordena os vizinhos para garantir consistência visual (A antes de B)
    for (let key in graph) {
        graph[key].sort();
    }
    // --- FIM DO PRÉ-PROCESSAMENTO ---


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
            queueSnapshot: [...queue], 
            node: node,
            line: line,
            status: status
        };
        history.push(newState);
    }

    pushStep(-1, "Pronto para iniciar.", null);
    
    // Verifica se o nó inicial existe no grafo processado
    if (graph[start]) {
        state.visited.add(start);
        queue.push(start);
        
        pushStep(0, `Iniciando BFS a partir de ${start}`, start);
        pushStep(1, `Enfileirando ${start} (cinza). Fila: [${queue.join(', ')}]`, start);
    }

    while (queue.length > 0) {
        pushStep(2, `Verificando fila: [${queue.join(', ')}]`, null);

        const u = queue.shift();
        pushStep(3, `Desenfileirando ${u}. Fila restante: [${queue.join(', ')}]`, u);

        // Agora 'graph' contém todas as conexões (ida e volta)
        for (const v of graph[u]) {
            pushStep(4, `Checando vizinho ${v} de ${u}`, v);

            if (!state.visited.has(v)) {
                pushStep(5, `Vizinho ${v} é branco.`, v);
                
                state.visited.add(v); 
                pushStep(6, `Marcando ${v} como visitado (cinza)`, v);
                
                queue.push(v);
                pushStep(7, `Enfileirando ${v}. Fila: [${queue.join(', ')}]`, v);
            } else {
                pushStep(5, `Vizinho ${v} já visitado. Ignorando.`, v);
            }
        }

        state.finished.add(u);
        state.finishedOrder.push(u);
        pushStep(8, `Finalizando processamento de ${u} (preto)`, u);
    }

    pushStep(-1, "Busca em Largura concluída.", null);

    return history;
}

export const bfsAlgorithm = {
    name: "Busca em Largura (BFS)",
    pseudoCode: pseudoCode,
    getSteps: getSteps
};