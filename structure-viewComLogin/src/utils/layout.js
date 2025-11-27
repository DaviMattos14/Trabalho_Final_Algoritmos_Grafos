// src/utils/layout.js
import { naturalSort } from "./graphUtils"; // Certifique-se de que o caminho está certo

// Helper: Simetria para cálculo de distâncias
function getSymmetricGraph(rawGraph) {
    const symmetric = {};
    for (let u in rawGraph) {
        if (!symmetric[u]) symmetric[u] = new Set();
        // Garante que rawGraph[u] é um array (pode vir do editor incompleto)
        const edges = Array.isArray(rawGraph[u]) ? rawGraph[u] : [];
        
        edges.forEach(edge => {
            const v = edge.target; // Estrutura {target, weight}
            if (!symmetric[v]) symmetric[v] = new Set();
            symmetric[u].add(v);
            symmetric[v].add(u); 
        });
    }
    return symmetric;
}

export function calculateLayout(graphObj, rootNode, width = 800, height = 600) {
    const newPositions = {};
    const nodes = Object.keys(graphObj).sort(naturalSort);
    
    if (nodes.length === 0) return {};

    // 1. Determina Raiz
    let root = rootNode;
    if (!graphObj[root]) {
        // Tenta achar nó com in-degree 0
        const inDegree = {};
        nodes.forEach(n => inDegree[n] = 0);
        Object.values(graphObj).flat().forEach(edge => {
             if (inDegree[edge.target] !== undefined) inDegree[edge.target]++;
        });
        root = nodes.find(n => inDegree[n] === 0) || nodes[0];
    }

    // 2. BFS para Camadas (usando grafo simétrico para layout coeso)
    const symmetricGraph = getSymmetricGraph(graphObj);
    const layers = {};
    const visited = new Set([root.toString()]);
    const queue = [{node: root.toString(), depth: 0}];
    
    layers[0] = [root.toString()];
    let maxDepth = 0;
    let qIndex = 0;

    while(qIndex < queue.length) {
        const {node: u, depth: d} = queue[qIndex++];
        const neighbors = Array.from(symmetricGraph[u] || []).sort(naturalSort);
            
        for (let v of neighbors) {
            const vStr = v.toString();
            if (!visited.has(vStr)) {
                visited.add(vStr);
                const nextDepth = d + 1;
                if (!layers[nextDepth]) layers[nextDepth] = [];
                layers[nextDepth].push(vStr);
                maxDepth = Math.max(maxDepth, nextDepth);
                queue.push({node: vStr, depth: nextDepth});
            }
        }
    }

    // Nós desconexos
    nodes.forEach(n => {
        if (!visited.has(n)) {
            if (!layers[0]) layers[0] = [];
            layers[0].push(n); 
        }
    });

    // 3. Cálculo de Coordenadas
    const MIN_COL_WIDTH = 120;  
    const MIN_ROW_HEIGHT = 80;  
    const PADDING = 100;        

    // Calcula tamanho virtual
    let maxNodesInLayer = 0;
    Object.values(layers).forEach(l => maxNodesInLayer = Math.max(maxNodesInLayer, l.length));

    // Define área virtual
    // (Não dependemos mais do canvas, usamos números abstratos que o componente visual vai escalar)
    
    Object.keys(layers).forEach(levelStr => {
        const level = parseInt(levelStr);
        const nodesInLayer = layers[level];
        
        const x = PADDING + (level * MIN_COL_WIDTH);
        const layerHeight = nodesInLayer.length * MIN_ROW_HEIGHT;
        
        // Centraliza verticalmente em relação à altura base passada
        const startY = (height / 2) - (layerHeight / 2) + (MIN_ROW_HEIGHT / 2);

        nodesInLayer.forEach((node, idx) => {
            const y = startY + (idx * MIN_ROW_HEIGHT);
            newPositions[node] = { x, y };
        });
    });

    return newPositions;
}