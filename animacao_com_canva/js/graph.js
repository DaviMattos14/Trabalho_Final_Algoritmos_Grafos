const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

// --- ESTADO ---
let graph = {};     
let positions = {}; 
let isDirected = true;
let viewState = { scale: 1, offsetX: 0, offsetY: 0 };
let draggedNode = null;
let dragOffset = { x: 0, y: 0 };
let isDragging = false;
let currentDrawState = { visited: new Set(), finished: new Set(), current: null };

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

// --- EXPORTADO PARA USO NO EDITOR ---
export function calculateLayout(graphObj, rootNode) {
    const newPositions = {};
    const nodes = Object.keys(graphObj).sort(naturalSort);
    
    if (nodes.length === 0) return {};

    let root = rootNode;
    if (!graphObj[root]) root = nodes[0];

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

    nodes.forEach(n => {
        if (!visited.has(n)) {
            if (!layers[0]) layers[0] = [];
            layers[0].push(n); 
        }
    });

    const MIN_COL_WIDTH = 120;  
    const MIN_ROW_HEIGHT = 80;  
    const PADDING = 100;        

    Object.keys(layers).forEach(levelStr => {
        const level = parseInt(levelStr);
        const nodesInLayer = layers[level];
        
        const x = PADDING + (level * MIN_COL_WIDTH);
        const layerHeight = nodesInLayer.length * MIN_ROW_HEIGHT;
        // Altura virtual estimada baseada na maior camada
        const virtualHeight = Math.max(canvas.height, (nodes.length * MIN_ROW_HEIGHT) / 2); 
        const startY = (virtualHeight / 2) - (layerHeight / 2) + (MIN_ROW_HEIGHT / 2);

        nodesInLayer.forEach((node, idx) => {
            const y = startY + (idx * MIN_ROW_HEIGHT);
            newPositions[node] = { x, y };
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

function screenToWorld(screenX, screenY) {
    return {
        x: (screenX - viewState.offsetX) / viewState.scale,
        y: (screenY - viewState.offsetY) / viewState.scale
    };
}

function getGraphBounds() {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const nodeKeys = Object.keys(positions);
    if (nodeKeys.length === 0) return { minX:0, maxX:100, minY:0, maxY:100, width:100, height:100 }; 

    nodeKeys.forEach(key => {
        const p = positions[key];
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    });

    const padding = 60;
    return {
        minX: minX - padding, maxX: maxX + padding,
        minY: minY - padding, maxY: maxY + padding,
        width: (maxX - minX) + (padding * 2),
        height: (maxY - minY) + (padding * 2)
    };
}

function updateCamera() {
    const bounds = getGraphBounds();
    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const scaleX = canvasW / bounds.width;
    const scaleY = canvasH / bounds.height;
    let newScale = Math.min(scaleX, scaleY);
    newScale = Math.min(newScale, 1); 

    const centeredX = (canvasW - (bounds.width * newScale)) / 2;
    const centeredY = (canvasH - (bounds.height * newScale)) / 2;

    viewState.scale = newScale;
    viewState.offsetX = centeredX - (bounds.minX * newScale);
    viewState.offsetY = centeredY - (bounds.minY * newScale);
}

function drawArrow(fromX, fromY, toX, toY, color) {
    const headLength = 10; const nodeRadius = 20; 
    const dx = toX - fromX; const dy = toY - fromY; const angle = Math.atan2(dy, dx);
    const endX = toX - nodeRadius * Math.cos(angle); const endY = toY - nodeRadius * Math.sin(angle);
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
    updateCamera();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); 
    ctx.translate(viewState.offsetX, viewState.offsetY);
    ctx.scale(viewState.scale, viewState.scale);
    ctx.lineWidth = 2; ctx.font = "bold 16px Arial"; 
    ctx.textAlign = "center"; ctx.textBaseline = "middle";

    for (let u in graph) {
        if (!graph[u]) continue; 
        for (let v of graph[u]) {
            if (!positions[u] || !positions[v]) continue;
            const a = positions[u]; const b = positions[v];
            let isHighlight = false;
            if (u === current && graph[u].includes(v)) isHighlight = true;
            if (!isDirected && v === current && graph[v].includes(u)) isHighlight = true;
            const edgeColor = isHighlight ? "#ff0000" : "#0c0c0cff";
            const lineWidth = Math.max(2, 2 / viewState.scale); 
            ctx.lineWidth = isHighlight ? lineWidth + 1 : lineWidth;

            if (Math.abs(a.x - b.x) < 10) {
                drawCurvedArrow(a.x, a.y, b.x, b.y, edgeColor);
            } else {
                if (isDirected) drawArrow(a.x, a.y, b.x, b.y, edgeColor);
                else {
                    ctx.strokeStyle = edgeColor; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                }
            }
        }
    }

    ctx.lineWidth = 2; 
    for (let node in positions) {
        const { x, y } = positions[node];
        ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2);
        if (finished.has(node)) ctx.fillStyle = "#404040"; 
        else if (visited.has(node)) ctx.fillStyle = "#ccc"; 
        else ctx.fillStyle = "white"; 
        ctx.strokeStyle = (node === current) ? "#ff0000" : "black"; 
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = finished.has(node) ? "white" : "black";
        ctx.fillText(node, x, y);
    }
    ctx.restore(); 
}

function redrawCurrentState() { drawGraph(currentDrawState.visited, currentDrawState.finished, currentDrawState.current); }
function getNodeAtPosition(worldX, worldY) {
    const radius = 20;
    for (let node in positions) {
        const pos = positions[node];
        const dx = worldX - pos.x; const dy = worldY - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) return node;
    }
    return null;
}
function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    return screenToWorld(screenX, screenY);
}
canvas.addEventListener('mousedown', (e) => {
    const coords = getCanvasCoordinates(e); 
    const node = getNodeAtPosition(coords.x, coords.y);
    if (node) { isDragging = true; draggedNode = node; dragOffset.x = coords.x - positions[node].x; dragOffset.y = coords.y - positions[node].y; canvas.style.cursor = 'grabbing'; }
});
canvas.addEventListener('mousemove', (e) => {
    const coords = getCanvasCoordinates(e); 
    if (isDragging && draggedNode) {
        positions[draggedNode].x = coords.x - dragOffset.x;
        positions[draggedNode].y = coords.y - dragOffset.y;
        redrawCurrentState();
    } else {
        const node = getNodeAtPosition(coords.x, coords.y);
        canvas.style.cursor = node ? 'grab' : 'default';
    }
});
canvas.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; draggedNode = null; canvas.style.cursor = 'default'; } });
canvas.addEventListener('mouseleave', () => { if (isDragging) { isDragging = false; draggedNode = null; canvas.style.cursor = 'default'; } });

initDefaultGraph();