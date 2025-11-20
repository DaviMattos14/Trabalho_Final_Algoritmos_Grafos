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

function getSteps(graph, start) {
    const history = [];
    const queue = []; // A fila real que vamos monitorar

    // Estado base
    const state = {
        visited: new Set(),
        finished: new Set(),
        finishedOrder: [],
        queueSnapshot: [], // Campo importante para o BFS
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
            queueSnapshot: [...queue], // <--- SALVA UMA CÓPIA DA FILA ATUAL
            node: node,
            line: line,
            status: status
        };
        history.push(newState);
    }

    // --- PASSO INICIAL (CORREÇÃO) ---
    pushStep(-1, "Pronto para iniciar.", null);
    
    // Verifica se o nó inicial existe
    if (graph[start]) {
        // Passo 1: Inicialização
        state.visited.add(start);
        queue.push(start);
        
        pushStep(0, `Iniciando BFS a partir de ${start}`, start);
        pushStep(1, `Enfileirando ${start} (cinza). Fila: [${queue.join(', ')}]`, start);
    }

    // Passo 2: Loop Principal
    while (queue.length > 0) {
        pushStep(2, `Verificando fila: [${queue.join(', ')}]`, null);

        // Passo 3: Desenfileirar
        const u = queue.shift();
        pushStep(3, `Desenfileirando ${u}. Fila restante: [${queue.join(', ')}]`, u);

        // Passo 4: Vizinhos
        for (const v of graph[u]) {
            pushStep(4, `Checando vizinho ${v} de ${u}`, v);

            // Passo 5: Se não visitado
            if (!state.visited.has(v)) {
                pushStep(5, `Vizinho ${v} é branco.`, v);
                
                // Passo 6 e 7: Marcar e Enfileirar
                state.visited.add(v); 
                pushStep(6, `Marcando ${v} como visitado (cinza)`, v);
                
                queue.push(v);
                pushStep(7, `Enfileirando ${v}. Fila: [${queue.join(', ')}]`, v);
            } else {
                pushStep(5, `Vizinho ${v} já visitado. Ignorando.`, v);
            }
        }

        // Passo 8: Finalizar
        state.finished.add(u);
        state.finishedOrder.push(u);
        pushStep(8, `Finalizando processamento de ${u} (preto)`, u);
    }

    // Passo Final
    pushStep(-1, "Busca em Largura concluída.", null);

    return history;
}

export const bfsAlgorithm = {
    name: "Busca em Largura (BFS)",
    pseudoCode: pseudoCode,
    getSteps: getSteps
};