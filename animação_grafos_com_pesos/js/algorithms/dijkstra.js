const pseudoCode = [
    "Dijkstra(s):",
    "  dist[s] = 0, outros = ∞",
    "  Q = todos vértices (prioridade dist)",
    "  enquanto Q não vazia:",
    "    u = remove mínimo de Q",
    "    para cada vizinho v de u:",
    "      alt = dist[u] + peso(u, v)",
    "      se alt < dist[v]:",
    "        dist[v] = alt",
    "        predecessor[v] = u" // <--- Linha importante agora
];

function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function getSteps(graph, start) {
    const history = [];
    const nodes = Object.keys(graph).sort(naturalSort);
    
    // Estruturas de Dados
    const dist = {};
    // --- NOVA ESTRUTURA: Rastreia o "pai" no caminho mínimo ---
    const predecessors = {}; 
    
    const visited = new Set(); 
    const processing = new Set(); 
    const pq = []; 

    // Inicialização
    nodes.forEach(n => {
        dist[n] = Infinity;
        pq.push(n);
    });
    
    if (dist[start] !== undefined) {
        dist[start] = 0;
        processing.add(start);
    }

    function pushStep(line, status, u) {
        const pqSnapshot = [...pq].sort((a, b) => dist[a] - dist[b]);
        const pqText = pqSnapshot.map(n => `${n}(${dist[n] === Infinity ? '∞' : dist[n]})`);

        const distList = Object.keys(dist)
            .filter(n => dist[n] !== Infinity)
            .sort(naturalSort)
            .map(n => `${n}(${dist[n]})`);

        history.push({
            visited: new Set(processing), 
            finished: new Set(visited),   
            finishedOrder: distList,
            queueSnapshot: pqText,        
            distances: {...dist},
            // --- SALVA O ESTADO DOS PREDECESSORES ---
            predecessors: {...predecessors}, 
            node: u,
            line: line,
            status: status
        });
    }

    pushStep(1, "Init distâncias.", start);

    // Loop Principal
    while (pq.length > 0) {
        pq.sort((a, b) => dist[a] - dist[b]); 
        pushStep(2, `PQ: [${pq.map(n=>`${n}(${dist[n]===Infinity?'∞':dist[n]})`).join(', ')}]`, null);

        const u = pq.shift();
        if (dist[u] === Infinity) break;

        processing.delete(u);
        visited.add(u); 
        pushStep(3, `Processando ${u} (Dist: ${dist[u]})`, u);

        const neighbors = [...(graph[u] || [])].sort((a, b) => naturalSort(a.target, b.target));

        for (let edge of neighbors) {
            const v = edge.target;
            const weight = edge.weight;

            if (visited.has(v)) continue;
            if (!processing.has(v)) processing.add(v);

            pushStep(4, `Checando ${v} (Peso: ${weight})`, v);

            const alt = dist[u] + weight;
            pushStep(5, `Caminho: ${dist[u]} + ${weight} = ${alt}. Antigo: ${dist[v]===Infinity?'∞':dist[v]}`, v);

            // Relaxamento
            if (alt < dist[v]) {
                dist[v] = alt;
                // --- REGISTRA O PREDECESSOR ---
                predecessors[v] = u; 
                pushStep(6, `Relaxando! Nova dist[${v}] = ${alt}. Predecessor de ${v} é ${u}.`, v);
            }
        }
    }

    pushStep(-1, "Concluído.", null);
    return history;
}

export const dijkstraAlgorithm = {
    name: "Algoritmo de Dijkstra",
    label: "Fila de Prioridade (Min):",
    isWeighted: true,
    pseudoCode: pseudoCode,
    getSteps: getSteps
};