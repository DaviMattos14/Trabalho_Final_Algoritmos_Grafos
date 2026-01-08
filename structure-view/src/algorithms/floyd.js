import { naturalSort } from "../utils/graphUtils";

const pseudoCode = [
    "Floyd-Warshall(G):",
    "  Seja dist uma matriz |V|x|V| inicializada com ∞",
    "  Para cada aresta (u,v) com peso w: dist[u][v] = w",
    "  Para cada vértice v: dist[v][v] = 0",
    "  Para k de 1 até |V|:",
    "    Para i de 1 até |V|:",
    "      Para j de 1 até |V|:",
    "        Se dist[i][j] > dist[i][k] + dist[k][j]:",
    "          dist[i][j] = dist[i][k] + dist[k][j]"
];

function getSteps(rawGraph, startNode, isDirected) {
    const history = [];

    // 1. Identificar e Ordenar Nós
    const nodes = Object.keys(rawGraph).sort(naturalSort);
    const N = nodes.length;
    
    // Mapeamento de ID para índice da matriz
    const nodeToIndex = {};
    nodes.forEach((node, idx) => { nodeToIndex[node] = idx; });

    // 2. Inicialização da Matriz
    // Criamos uma matriz 2D simples para manipulação interna
    let dist = Array(N).fill(null).map(() => Array(N).fill(Infinity));
    let nextDist = Array(N).fill(null).map(() => Array(N).fill(Infinity)); // Para imutabilidade visual

    // Inicializa diagonais e arestas
    for (let i = 0; i < N; i++) {
        dist[i][i] = 0;
        const u = nodes[i];
        
        // Processa vizinhos
        const neighbors = rawGraph[u] || [];
        neighbors.forEach(edge => {
            const v = edge.target;
            const w = edge.weight || 1;
            const j = nodeToIndex[v];
            if (j !== undefined) {
                dist[i][j] = w;
            }
        });
    }

    // Se não for direcionado, espelhar a matriz
    if (!isDirected) {
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (dist[i][j] !== Infinity) {
                    dist[j][i] = dist[i][j];
                }
            }
        }
    }

    // Helper para criar snapshot do estado
    function pushStep(line, description, pointers = {}, highlightUpdate = null) {
        // Clona a matriz atual para o histórico (Deep Copy)
        const matrixSnapshot = dist.map(row => [...row]);
        
        history.push({
            matrix: matrixSnapshot,
            nodes: nodes, // Necessário para renderizar cabeçalhos
            pointers: pointers, // { k, i, j } para highlight
            highlightUpdate: highlightUpdate, // { r, c } celula alterada
            line: line,
            description: description
        });
    }

    pushStep(1, "Inicializando matriz de distâncias.", {}, null);
    pushStep(2, "Carregando pesos das arestas diretas.", {}, null);
    pushStep(3, "Distância para si mesmo definida como 0.", {}, null);

    // 3. Execução do Algoritmo (Loop Triplo)
    for (let k = 0; k < N; k++) {
        pushStep(4, `Iteração k=${nodes[k]} (Pivô)`, { k: k }, null);

        for (let i = 0; i < N; i++) {
            // Otimização visual: Pular se i não alcança k (pois dist[i][k] será ∞)
            if (dist[i][k] === Infinity) continue;

            for (let j = 0; j < N; j++) {
                // Pular se k não alcança j
                if (dist[k][j] === Infinity) continue;
                if (i === j) continue; // Pula diagonal

                const sum = dist[i][k] + dist[k][j];
                const current = dist[i][j];

                pushStep(7, 
                    `Comparando: ${nodes[i]}→${nodes[j]} (${current === Infinity ? '∞' : current}) vs via ${nodes[k]} (${sum})`, 
                    { k, i, j }, 
                    null
                );

                if (sum < current) {
                    dist[i][j] = sum;
                    pushStep(8, 
                        `Atualizado! Novo caminho mais curto de ${nodes[i]} para ${nodes[j]} é ${sum}`, 
                        { k, i, j }, 
                        { r: i, c: j } // Marca célula atualizada
                    );
                }
            }
        }
    }

    pushStep(-1, "Algoritmo Floyd-Warshall concluído. Matriz final de distâncias mínimas.", {}, null);
    
    return history;
}

export const floydWarshallAlgorithm = {
    name: "Floyd-Warshall",
    label: "Matriz de Adjacência",
    isWeighted: true,
    pseudoCode: pseudoCode,
    getSteps: getSteps
};