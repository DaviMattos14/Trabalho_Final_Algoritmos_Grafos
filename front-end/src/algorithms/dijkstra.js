import { naturalSort } from "../utils/graphUtils.js";

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
    "        predecessor[v] = u"
];

function getSteps(rawGraph, start, isDirected) {
    const history = [];
    
    // --- PREPARAÇÃO DO GRAFO ---
    let graph;

    if (isDirected) {
        graph = rawGraph;
    } else {
        graph = {};
        // 1. Copia
        for (let key in rawGraph) {
            graph[key] = rawGraph[key].map(e => ({...e}));
        }
        // 2. Simetria
        for (let u in rawGraph) {
            for (let edge of rawGraph[u]) {
                const v = edge.target;
                const w = edge.weight;
                if (!graph[v]) graph[v] = [];
                if (!graph[v].some(e => e.target === u)) {
                    graph[v].push({ target: u, weight: w });
                }
            }
        }
    }

    const nodes = Object.keys(graph).sort((a, b) => naturalSort(a, b));
    
    const dist = {};
    const visited = new Set(); 
    const processing = new Set(); 
    const pq = []; 
    const predecessors = {}; 

    nodes.forEach(n => {
        dist[n] = Infinity;
        pq.push(n);
    });
    
    if (dist[start] !== undefined) {
        dist[start] = 0;
        processing.add(start);
    }

    // --- ALTERAÇÃO: Parâmetro highlightAll ---
    function pushStep(line, status, u, highlightEdges = false, highlightAll = false) {
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
            predecessors: {...predecessors},
            node: u,
            line: line,
            status: status,
            highlightEdges: highlightEdges,
            highlightAll: highlightAll // <--- Nova Propriedade
        });
    }

    pushStep(1, `Iniciando de ${start}. Modo: ${isDirected ? 'Direcionado' : 'Não Direcionado'}`, start);

    while (pq.length > 0) {
        pq.sort((a, b) => dist[a] - dist[b]); 
        pushStep(2, `Fila Q: [${pq.map(n=>`${n}(${dist[n]===Infinity?'∞':dist[n]})`).join(', ')}]`, null);

        const u = pq.shift();
        if (dist[u] === Infinity) {
            pushStep(2, "Restante inalcançável.", u);
            break;
        }

        processing.delete(u);
        visited.add(u); 
        
        pushStep(3, `Processando ${u} (Dist: ${dist[u]})`, u);

        const neighbors = [...(graph[u] || [])].sort((a, b) => naturalSort(a.target, b.target));

        // --- MUDANÇA VISUAL: Destaca todas as saídas antes do loop ---
        if (neighbors.length > 0) {
            pushStep(4, `Analisando saídas de ${u}...`, u, false, true);
        } else {
            pushStep(4, `Nó ${u} não tem saídas.`, u);
        }

        for (let edge of neighbors) {
            const v = edge.target;
            const weight = edge.weight;

            if (visited.has(v)) continue; 
            if (!processing.has(v)) processing.add(v); 

            // Destaque individual da aresta sendo testada
            pushStep(4, `Checando ${v} (Peso: ${weight})`, v, true);

            const alt = dist[u] + weight;
            pushStep(5, `Caminho: ${dist[u]} + ${weight} = ${alt}. Antigo: ${dist[v]===Infinity?'∞':dist[v]}`, v);

            if (alt < dist[v]) {
                dist[v] = alt;
                predecessors[v] = u; 
                // Destaque da aresta ao relaxar
                pushStep(6, `Relaxando! Nova dist[${v}] = ${alt}`, v, true);
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