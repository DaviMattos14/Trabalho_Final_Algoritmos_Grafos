const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

// --- ESTADO ---
let graph = {};     
let positions = {}; 
let isDirected = true;

// Estado arrastar
let draggedNode = null;
let dragOffset = { x: 0, y: 0 };
let isDragging = false;
let currentDrawState = { visited: new Set(), finished: new Set(), current: null };

// Helper de ordenação natural
function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function initDefaultGraph() {
    const defaultGraph = {
        "0": ["1", "2"],
        "1": ["3", "4"],
        "2": ["5"],
        "3": [],
        "4": [],
        "5": []
    };
    updateGraphData(defaultGraph, "0");
}

function getSymmetricGraph(rawGraph) {
    const symmetric = {};
    for (let u in rawGraph) {
        if (!symmetric[u]) symmetric[u] = new Set();
        for (let v of rawGraph[u]) {
            if (!symmetric[v]) symmetric[v] = new Set();
            symmetric[u].add(v);
            symmetric[v].add(u); 
        }
    }
    return symmetric;
}

function calculateLayout(graphObj, rootNode) {
    const newPositions = {};
    const nodes = Object.keys(graphObj).sort(naturalSort);
    
    if (nodes.length === 0) return {};

    let root = rootNode;
    if (!graphObj[root]) root = nodes[0];

    const symmetricGraph = getSymmetricGraph(graphObj);
    const layers = {};
    const visited = new Set([root]);
    const queue = [{node: root, depth: 0}];
    
    layers[0] = [root];
    let maxDepth = 0;
    let qIndex = 0;

    while(qIndex < queue.length) {
        const {node: u, depth: d} = queue[qIndex++];
        const neighbors = Array.from(symmetricGraph[u] || []).sort(naturalSort);
            
        for (let v of neighbors) {
            if (!visited.has(v)) {
                visited.add(v);
                const nextDepth = d + 1;
                if (!layers[nextDepth]) layers[nextDepth] = [];
                layers[nextDepth].push(v);
                maxDepth = Math.max(maxDepth, nextDepth);
                queue.push({node: v, depth: nextDepth});
            }
        }
    }

    nodes.forEach(n => {
        if (!visited.has(n)) {
            if (!layers[0]) layers[0] = [];
            layers[0].push(n); 
        }
    });

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
            const y = paddingY + (idx * rowHeight) + (rowHeight / 2); 
            const finalY = (nodesInLayer.length === 1) ? canvasHeight / 2 : y;
            newPositions[node] = { x, y: finalY };
        });
    });

    return newPositions;
}

export function updateGraphData(newGraphJSON, startNode) {
    graph = newGraphJSON;
    for (let u in graph) {
        if (!graph[u]) graph[u] = [];
        for (let v of graph[u]) {
            if (!graph[v]) graph[v] = [];
        }
    }
    positions = calculateLayout(graph, startNode);
}

export function setDirected(directed) {
    isDirected = directed;
}

export const graphData = {
    get graph() { return graph; },
    get positions() { return positions; }
};

// --- DRAWING FUNCTIONS (Mantidas iguais, omitindo por brevidade mas devem estar lá) ---
// Certifique-se de que drawArrow e drawCurvedArrow estão aqui
function drawArrow(fromX, fromY, toX, toY, color) {
    const headLength = 10; 
    const nodeRadius = 20; 
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    const endX = toX - nodeRadius * Math.cos(angle);
    const endY = toY - nodeRadius * Math.sin(angle);
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(endX, endY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(endX, endY); ctx.fill();
}

function drawCurvedArrow(fromX, fromY, toX, toY, color) {
    const headLength = 10; const nodeRadius = 20;
    const distY = Math.abs(fromY - toY); const curveOffset = 60; 
    const cpX = fromX + curveOffset; const cpY = (fromY + toY) / 2;
    const dx = toX - cpX; const dy = toY - cpY; const angle = Math.atan2(dy, dx);
    const endX = toX - nodeRadius * Math.cos(angle); const endY = toY - nodeRadius * Math.sin(angle);
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(fromX + nodeRadius, fromY); 
    ctx.quadraticCurveTo(cpX, cpY, endX, endY); ctx.stroke();
    if (isDirected) {
        ctx.beginPath(); ctx.moveTo(endX, endY);
        ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(endX, endY); ctx.fill();
    }
}

export function drawGraph(visited, finished, current) {
    currentDrawState.visited = visited;
    currentDrawState.finished = finished;
    currentDrawState.current = current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2; ctx.font = "16px Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";

    for (let u in graph) {
        if (!graph[u]) continue; 
        for (let v of graph[u]) {
            if (!positions[u] || !positions[v]) continue;
            const a = positions[u]; const b = positions[v];
            let isHighlight = false;
            if (u === current && graph[u].includes(v)) isHighlight = true;
            if (!isDirected && v === current && graph[v].includes(u)) isHighlight = true;
            const edgeColor = isHighlight ? "#ff0000" : "#ccc";
            if (Math.abs(a.x - b.x) < 10) drawCurvedArrow(a.x, a.y, b.x, b.y, edgeColor);
            else {
                if (isDirected) drawArrow(a.x, a.y, b.x, b.y, edgeColor);
                else {
                    ctx.strokeStyle = edgeColor; ctx.beginPath();
                    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                }
            }
        }
    }
    for (let node in positions) {
        const { x, y } = positions[node];
        const radius = 20;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (finished.has(node)) ctx.fillStyle = "#404040"; 
        else if (visited.has(node)) ctx.fillStyle = "#ffcc66"; 
        else ctx.fillStyle = "white"; 
        ctx.strokeStyle = (node === current) ? "#ff0000" : "black"; 
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = finished.has(node) ? "white" : "black";
        ctx.fillText(node, x, y);
    }
}

function redrawCurrentState() { drawGraph(currentDrawState.visited, currentDrawState.finished, currentDrawState.current); }
function getNodeAtPosition(x, y) {
    const radius = 20;
    for (let node in positions) {
        const pos = positions[node];
        const dx = x - pos.x; const dy = y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) return node;
    }
    return null;
}
function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
canvas.addEventListener('mousedown', (e) => {
    const coords = getCanvasCoordinates(e);
    const node = getNodeAtPosition(coords.x, coords.y);
    if (node) { isDragging = true; draggedNode = node; dragOffset.x = coords.x - positions[node].x; dragOffset.y = coords.y - positions[node].y; canvas.style.cursor = 'grabbing'; }
});
canvas.addEventListener('mousemove', (e) => {
    if (isDragging && draggedNode) {
        const coords = getCanvasCoordinates(e);
        positions[draggedNode].x = coords.x - dragOffset.x;
        positions[draggedNode].y = coords.y - dragOffset.y;
        const radius = 20;
        positions[draggedNode].x = Math.max(radius, Math.min(canvas.width - radius, positions[draggedNode].x));
        positions[draggedNode].y = Math.max(radius, Math.min(canvas.height - radius, positions[draggedNode].y));
        redrawCurrentState();
    } else {
        const coords = getCanvasCoordinates(e);
        const node = getNodeAtPosition(coords.x, coords.y);
        canvas.style.cursor = node ? 'grab' : 'default';
    }
});
canvas.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; draggedNode = null; canvas.style.cursor = 'default'; } });
canvas.addEventListener('mouseleave', () => { if (isDragging) { isDragging = false; draggedNode = null; canvas.style.cursor = 'default'; } });

initDefaultGraph();