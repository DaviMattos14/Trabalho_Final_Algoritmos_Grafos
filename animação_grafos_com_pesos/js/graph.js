import { naturalSort } from "./utils.js"; // <--- IMPORT

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

// (Removida definição local de naturalSort)

function getSymmetricGraph(rawGraph) {
    const symmetric = {};
    for (let u in rawGraph) {
        if (!symmetric[u]) symmetric[u] = new Set();
        for (let edge of rawGraph[u]) { 
            const v = edge.target;
            if (!symmetric[v]) symmetric[v] = new Set();
            symmetric[u].add(v);
            symmetric[v].add(u); 
        }
    }
    return symmetric;
}

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

    let maxNodesInLayer = 0;
    Object.values(layers).forEach(l => maxNodesInLayer = Math.max(maxNodesInLayer, l.length));

    Object.keys(layers).forEach(levelStr => {
        const level = parseInt(levelStr);
        const nodesInLayer = layers[level];
        const x = PADDING + (level * MIN_COL_WIDTH);
        const layerHeight = nodesInLayer.length * MIN_ROW_HEIGHT;
        const virtualHeight = Math.max(canvas.height, (nodes.length * MIN_ROW_HEIGHT) / 2); 
        const startY = (virtualHeight / 2) - (layerHeight / 2) + (MIN_ROW_HEIGHT / 2);

        nodesInLayer.forEach((node, idx) => {
            const y = startY + (idx * MIN_ROW_HEIGHT);
            newPositions[node] = { x, y };
        });
    });
    return newPositions;
}

// ... (Resto do arquivo graph.js permanece idêntico, apenas garantindo que a exportação e imports estão no topo) ...
// Certifique-se de copiar o restante das funções (updateGraphData, drawing helpers, drawGraph, listeners) do seu arquivo atual ou da minha última resposta completa.

export function updateGraphData(newGraphJSON, startNode) {
    graph = newGraphJSON;
    for (let u in graph) {
        if (!graph[u]) graph[u] = [];
        // Garante alvos existem
        graph[u].forEach(edge => {
            if (!graph[edge.target]) graph[edge.target] = [];
        });
    }
    positions = calculateLayout(graph, startNode);
}

export function setDirected(directed) { isDirected = directed; }

export const graphData = { get graph() { return graph; }, get positions() { return positions; } };

function screenToWorld(screenX, screenY) {
    return { x: (screenX - viewState.offsetX) / viewState.scale, y: (screenY - viewState.offsetY) / viewState.scale };
}

function getGraphBounds() {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const nodeKeys = Object.keys(positions);
    if (nodeKeys.length === 0) return { minX:0, maxX:100, minY:0, maxY:100, width:100, height:100 }; 
    nodeKeys.forEach(key => {
        const p = positions[key];
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    });
    const padding = 60;
    return { minX: minX - padding, maxX: maxX + padding, minY: minY - padding, maxY: maxY + padding, width: (maxX - minX) + (padding * 2), height: (maxY - minY) + (padding * 2) };
}

function updateCamera() {
    const bounds = getGraphBounds();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;
    let newScale = Math.min(scaleX, scaleY);
    newScale = Math.min(newScale, 1); 
    const centeredX = (canvas.width - (bounds.width * newScale)) / 2;
    const centeredY = (canvas.height - (bounds.height * newScale)) / 2;
    viewState.scale = newScale;
    viewState.offsetX = centeredX - (bounds.minX * newScale);
    viewState.offsetY = centeredY - (bounds.minY * newScale);
}

// --- DRAWING HELPERS ---
function drawWeight(fromX, fromY, toX, toY, weight) {
    if (weight === 1) return;
    const midX = (fromX + toX) / 2; 
    const midY = (fromY + toY) / 2;
    ctx.save();
    ctx.fillStyle = "white"; ctx.fillRect(midX - 10, midY - 10, 20, 20);
    ctx.fillStyle = "#333"; ctx.font = "bold 12px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(weight, midX, midY);
    ctx.restore();
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

// --- FUNÇÃO DE DESENHO PRINCIPAL ---
// Agora aceita 'predecessors' para destacar caminho mínimo
export function drawGraph(visited, finished, current, distances = null, showWeights = false, predecessors = null) {
    currentDrawState.visited = visited; 
    currentDrawState.finished = finished; 
    currentDrawState.current = current;
    updateCamera();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); 
    ctx.translate(viewState.offsetX, viewState.offsetY);
    ctx.scale(viewState.scale, viewState.scale);
    ctx.font = "bold 16px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";

    for (let u in graph) {
        if (!graph[u]) continue; 
        for (let edge of graph[u]) {
            const v = edge.target; const w = edge.weight;
            if (!positions[u] || !positions[v]) continue;
            const a = positions[u]; const b = positions[v];
            
            let edgeColor = "#ccc";
            let lineWidth = Math.max(2, 2 / viewState.scale);

            // --- LÓGICA DE CAMINHO MÍNIMO (DIJKSTRA) ---
            let isShortestPath = false;
            if (predecessors) {
                // Se U é pai de V, ou V é pai de U
                if (predecessors[v] === u || predecessors[u] === v) {
                    isShortestPath = true;
                }
            }

            if (isShortestPath) {
                edgeColor = "#ff0000"; // Vermelho vivo
                lineWidth = Math.max(4, 4 / viewState.scale); // Mais grosso
            } else {
                // --- LÓGICA DE DESTAQUE DE ANIMAÇÃO ---
                let isAnimHighlight = false;
                // 1. Se sou a origem (u) e sou o atual
                if (u === current && graph[u].some(e => e.target === v)) isAnimHighlight = true;
                // 2. Se sou o destino (v), sou o atual E modo não-direcionado (BFS)
                if (!isDirected && v === current) isAnimHighlight = true;

                if (isAnimHighlight) {
                    edgeColor = "#ff6666"; // Vermelho claro
                    lineWidth = Math.max(3, 3 / viewState.scale);
                }
            }

            ctx.lineWidth = lineWidth;

            if (Math.abs(a.x - b.x) < 10) {
                drawCurvedArrow(a.x, a.y, b.x, b.y, edgeColor);
            } else {
                if (isDirected) {
                    drawArrow(a.x, a.y, b.x, b.y, edgeColor);
                } else {
                    ctx.strokeStyle = edgeColor; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                }
            }
            
            if (showWeights) drawWeight(a.x, a.y, b.x, b.y, w);
        }
    }

    ctx.lineWidth = 2; 
    for (let node in positions) {
        const { x, y } = positions[node];
        ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2);
        if (finished.has(node)) ctx.fillStyle = "#404040"; 
        else if (visited.has(node)) ctx.fillStyle = "#ffcc66"; 
        else ctx.fillStyle = "white"; 
        ctx.strokeStyle = (node === current) ? "#ff0000" : "black"; 
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = finished.has(node) ? "white" : "black";
        ctx.fillText(node, x, y);

        if (distances && distances[node] !== undefined) {
            const dist = distances[node];
            const distText = dist === Infinity ? "∞" : dist;
            ctx.fillStyle = "blue"; ctx.font = "bold 14px Arial";
            ctx.fillText(distText, x, y - 32);
        }
    }
    ctx.restore(); 
}

function redrawCurrentState() { drawGraph(currentDrawState.visited, currentDrawState.finished, currentDrawState.current); }
function getNodeAtPosition(worldX, worldY) {
    const radius = 20;
    for (let node in positions) {
        const pos = positions[node];
        const dx = worldX - pos.x; const dy = worldY - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) <= radius) return node;
    } return null;
}
function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    return screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
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
canvas.addEventListener('mouseup', () => { isDragging = false; draggedNode = null; canvas.style.cursor = 'default'; });
canvas.addEventListener('mouseleave', () => { isDragging = false; draggedNode = null; canvas.style.cursor = 'default'; });