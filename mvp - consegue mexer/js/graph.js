const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

// --- ESTADO ---
let graph = {};     
let positions = {}; 
let isDirected = true;

// Estado para arrastar nós
let draggedNode = null;
let dragOffset = { x: 0, y: 0 };
let isDragging = false;

// Estado atual do desenho (para redesenhar após arrastar)
let currentDrawState = {
    visited: new Set(),
    finished: new Set(),
    current: null
};

// Inicialização
function initDefaultGraph() {
    const defaultGraph = {
        A: ["B", "C"],
        B: ["D", "E"],
        C: ["F"],
        D: [],
        E: [], 
        F: []
    };
    updateGraphData(defaultGraph);
}

// --- NOVO MOTOR DE LAYOUT (Árvore Horizontal) ---
function calculateLayout(graphObj) {
    const newPositions = {};
    const nodes = Object.keys(graphObj).sort();
    
    if (nodes.length === 0) return {};

    // 1. Descobrir a "Raiz" Lógica
    const inDegree = {};
    nodes.forEach(n => inDegree[n] = 0);
    
    for (let u in graphObj) {
        for (let v of graphObj[u]) {
            if (inDegree[v] !== undefined) inDegree[v]++;
        }
    }

    let root = nodes.find(n => inDegree[n] === 0) || nodes[0];

    // 2. BFS para determinar as Camadas
    const layers = {};
    const depth = {};
    const queue = [root];
    const visited = new Set([root]);

    depth[root] = 0;
    layers[0] = [root];
    let maxDepth = 0;
    
    let qIndex = 0;
    while(qIndex < queue.length) {
        const u = queue[qIndex++];
        const d = depth[u];

        if (graphObj[u]) {
            const neighbors = [...graphObj[u]].sort(); 
            
            for (let v of neighbors) {
                if (!visited.has(v)) {
                    visited.add(v);
                    depth[v] = d + 1;
                    maxDepth = Math.max(maxDepth, d + 1);
                    
                    if (!layers[d + 1]) layers[d + 1] = [];
                    layers[d + 1].push(v);
                    
                    queue.push(v);
                }
            }
        }
    }

    nodes.forEach(n => {
        if (!visited.has(n)) {
            if (!layers[0]) layers[0] = [];
            layers[0].push(n); 
        }
    });

    // 3. Calcular Coordenadas X e Y
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const paddingX = 60;
    const paddingY = 60;

    const colWidth = (canvasWidth - 2 * paddingX) / (Math.max(1, maxDepth)); 

    Object.keys(layers).forEach(levelStr => {
        const level = parseInt(levelStr);
        const nodesInLayer = layers[level];
        
        const x = paddingX + (level * colWidth);
        const rowHeight = (canvasHeight - 2 * paddingY) / (nodesInLayer.length);

        nodesInLayer.forEach((node, idx) => {
            const y = paddingY + (idx * rowHeight) + (rowHeight / 2) - (rowHeight * 0.5 * 0); 
            const finalY = (nodesInLayer.length === 1) ? canvasHeight / 2 : paddingY + (idx * (canvasHeight - 2*paddingY) / (nodesInLayer.length - 1 || 1));
            newPositions[node] = { x, y: finalY };
        });
    });

    return newPositions;
}

export function updateGraphData(newGraphJSON) {
    graph = newGraphJSON;
    
    for (let u in graph) {
        if (!graph[u]) graph[u] = [];
        for (let v of graph[u]) {
            if (!graph[v]) graph[v] = [];
        }
    }
    
    positions = calculateLayout(graph);
}

export function setDirected(directed) {
    isDirected = directed;
}

export const graphData = {
    get graph() { return graph; },
    get positions() { return positions; }
};

// --- HELPER: Desenhar Seta ---
function drawArrow(fromX, fromY, toX, toY, color) {
    const headLength = 10; 
    const nodeRadius = 20; 

    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    const endX = toX - nodeRadius * Math.cos(angle);
    const endY = toY - nodeRadius * Math.sin(angle);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.fill();
    ctx.stroke();
}

// --- FUNÇÃO DE DESENHO PRINCIPAL ---
export function drawGraph(visited, finished, current) {
    // Salva o estado atual para redesenhar após arrastar
    currentDrawState.visited = visited;
    currentDrawState.finished = finished;
    currentDrawState.current = current;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 1. Desenha Arestas
    for (let u in graph) {
        if (!graph[u]) continue; 

        for (let v of graph[u]) {
            if (!positions[u] || !positions[v]) continue;

            const a = positions[u];
            const b = positions[v];
            
            // --- CORREÇÃO AQUI ---
            let isHighlight = false;

            // Caso 1: Origem é o nó atual (Padrão: A->B)
            if (u === current && graph[u].includes(v)) {
                isHighlight = true;
            }
            
            // Caso 2: Destino é o nó atual E modo não-direcionado (Padrão: E->A, processando A)
            // REMOVI a checagem 'graph[v].includes(u)' pois o JSON pode não ter a volta explícita
            if (!isDirected && v === current) {
                isHighlight = true;
            }

            const edgeColor = isHighlight ? "#ff0000" : "#494949ff";

            if (isDirected) {
                drawArrow(a.x, a.y, b.x, b.y, edgeColor);
            } else {
                ctx.strokeStyle = edgeColor;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }
    }

    // 2. Desenha Nós
    for (let node in positions) {
        const { x, y } = positions[node];
        const radius = 20;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (finished.has(node)) {
            ctx.fillStyle = "#404040"; 
        } else if (visited.has(node)) {
            ctx.fillStyle = "#ccc"; 
        } else {
            ctx.fillStyle = "white"; 
        }
        
        ctx.strokeStyle = (node === current) ? "#ff0000" : "black"; 
        
        ctx.fill();
        ctx.stroke();

        if(finished.has(node)) ctx.fillStyle = "white";
        else ctx.fillStyle = "black";
        
        ctx.fillText(node, x, y);
    }
}

// --- FUNÇÃO AUXILIAR: Redesenhar com estado atual ---
function redrawCurrentState() {
    drawGraph(currentDrawState.visited, currentDrawState.finished, currentDrawState.current);
}

// --- FUNÇÃO: Detectar qual nó foi clicado ---
function getNodeAtPosition(x, y) {
    const radius = 20;
    for (let node in positions) {
        const pos = positions[node];
        const dx = x - pos.x;
        const dy = y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
            return node;
        }
    }
    return null;
}

// --- FUNÇÃO: Obter coordenadas do mouse no canvas ---
function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// --- EVENT LISTENERS PARA ARRASTAR NÓS ---
canvas.addEventListener('mousedown', (e) => {
    const coords = getCanvasCoordinates(e);
    const node = getNodeAtPosition(coords.x, coords.y);
    
    if (node) {
        isDragging = true;
        draggedNode = node;
        dragOffset.x = coords.x - positions[node].x;
        dragOffset.y = coords.y - positions[node].y;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && draggedNode) {
        const coords = getCanvasCoordinates(e);
        positions[draggedNode].x = coords.x - dragOffset.x;
        positions[draggedNode].y = coords.y - dragOffset.y;
        
        // Garantir que o nó não saia dos limites do canvas
        const radius = 20;
        positions[draggedNode].x = Math.max(radius, Math.min(canvas.width - radius, positions[draggedNode].x));
        positions[draggedNode].y = Math.max(radius, Math.min(canvas.height - radius, positions[draggedNode].y));
        
        redrawCurrentState();
    } else {
        // Mudar cursor quando passar sobre um nó
        const coords = getCanvasCoordinates(e);
        const node = getNodeAtPosition(coords.x, coords.y);
        canvas.style.cursor = node ? 'grab' : 'default';
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        draggedNode = null;
        canvas.style.cursor = 'default';
    }
});

canvas.addEventListener('mouseleave', () => {
    if (isDragging) {
        isDragging = false;
        draggedNode = null;
        canvas.style.cursor = 'default';
    }
});

initDefaultGraph();