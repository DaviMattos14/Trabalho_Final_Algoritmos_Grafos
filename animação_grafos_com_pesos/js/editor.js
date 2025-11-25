import { calculateLayout } from "./graph.js";

const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d");

let nodes = []; 
let edges = []; // Agora armazena { from, to, weight }

let isDraggingLine = false; 
let dragStartNode = null;
let isMovingNode = false; 
let movingNode = null; 
let moveOffset = { x: 0, y: 0 };
let lastRightClickTime = 0; 
let mouseX = 0; 
let mouseY = 0;

export function loadGraphToEditor(adjGraph) {
    nodes = []; 
    edges = [];
    
    const keys = Object.keys(adjGraph).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    
    if (keys.length === 0) { drawEditor(); return; }

    // Layout Automático para organizar inicialmente
    const root = keys[0];
    const treePositions = calculateLayout(adjGraph, root);
    
    // Centralização
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const posKeys = Object.keys(treePositions);
    if (posKeys.length === 0) { minX=0; maxX=0; minY=0; maxY=0; }
    else {
        posKeys.forEach(k => {
            const p = treePositions[k];
            if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
        });
    }
    const offsetX = (canvas.width - (maxX - minX)) / 2 - minX;
    const offsetY = (canvas.height - (maxY - minY)) / 2 - minY;

    keys.forEach(key => {
        if (treePositions[key]) nodes.push({ id: key, x: treePositions[key].x + offsetX, y: treePositions[key].y + offsetY });
        else nodes.push({ id: key, x: 100, y: 100 });
    });

    // Carrega arestas e pesos
    keys.forEach(u => {
        adjGraph[u].forEach(edge => {
            // Suporta formato antigo (string) ou novo (objeto)
            let target = edge;
            let weight = 1;
            
            if (typeof edge === 'object' && edge.target) {
                target = edge.target;
                weight = edge.weight || 1;
            }

            edges.push({ from: u, to: target, weight: weight });
        });
    });
    drawEditor();
}

export function exportGraphFromEditor() {
    const adjGraph = {};
    nodes.forEach(n => adjGraph[n.id] = []);
    
    edges.forEach(edge => {
        if (adjGraph[edge.from] && adjGraph[edge.to]) {
            // Evita duplicatas
            if (!adjGraph[edge.from].some(e => e.target === edge.to)) {
                adjGraph[edge.from].push({ 
                    target: edge.to, 
                    weight: edge.weight 
                });
            }
        }
    });
    return adjGraph;
}

export function clearEditor() { nodes = []; edges = []; drawEditor(); }

// --- DESENHO ---

function drawEditor() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Arestas
    ctx.lineWidth = 2;
    edges.forEach(edge => {
        const start = nodes.find(n => n.id === edge.from);
        const end = nodes.find(n => n.id === edge.to);
        if (!start || !end) return;
        
        drawArrow(start.x, start.y, end.x, end.y, "#555");
        // Desenha o peso sobre a linha
        drawWeight(start.x, start.y, end.x, end.y, edge.weight);
    });

    // Linha temporária
    if (isDraggingLine && dragStartNode) {
        drawArrow(dragStartNode.x, dragStartNode.y, mouseX, mouseY, "#2196F3"); 
    }

    // Nós
    nodes.forEach(node => {
        ctx.beginPath(); ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        if (node === movingNode) ctx.fillStyle = "#e3f2fd"; else if (node === dragStartNode) ctx.fillStyle = "#bbdefb"; else ctx.fillStyle = "white";
        ctx.fill(); ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "#000"; ctx.font = "bold 14px Courier New"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(node.id, node.x, node.y);
    });
}

function drawWeight(fromX, fromY, toX, toY, weight) {
    const midX = (fromX + toX) / 2; 
    const midY = (fromY + toY) / 2;
    ctx.save();
    ctx.fillStyle = "white"; 
    ctx.fillRect(midX - 10, midY - 10, 20, 20); // Fundo branco para leitura
    ctx.fillStyle = "#333"; 
    ctx.font = "bold 12px Arial"; 
    ctx.textAlign = "center"; 
    ctx.textBaseline = "middle";
    ctx.fillText(weight, midX, midY);
    ctx.restore();
}

function drawArrow(fromX, fromY, toX, toY, color) {
    const headLength = 10; const angle = Math.atan2(toY - fromY, toX - fromX);
    const nodeRadius = 20;
    const endX = toX - nodeRadius * Math.cos(angle); const endY = toY - nodeRadius * Math.sin(angle);
    const startX = fromX + nodeRadius * Math.cos(angle); const startY = fromY + nodeRadius * Math.sin(angle);
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(endX, endY); ctx.fill();
}

// --- INTERAÇÃO ---

function getCanvasCoords(e) { const rect = canvas.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; }
function getNodeAt(x, y) { return nodes.find(n => Math.sqrt((n.x - x)**2 + (n.y - y)**2) <= 20); }
function getDistanceToSegmentSquared(p, v, w) {
    const l2 = (v.x - w.x)**2 + (v.y - w.y)**2; if (l2 === 0) return (p.x - v.x)**2 + (p.y - v.y)**2;
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2; t = Math.max(0, Math.min(1, t));
    return (p.x - (v.x + t * (w.x - v.x)))**2 + (p.y - (v.y + t * (w.y - v.y)))**2;
}
function getEdgeAt(x, y) {
    const clickPoint = {x, y}; 
    return edges.find(edge => {
        const n1 = nodes.find(n => n.id === edge.from); const n2 = nodes.find(n => n.id === edge.to);
        if (!n1 || !n2) return false;
        return Math.sqrt(getDistanceToSegmentSquared(clickPoint, n1, n2)) < 8;
    });
}
function getNextId() { let id = 0; while (nodes.some(n => n.id === id.toString())) { id++; } return id.toString(); }

// --- EVENT LISTENERS ---

canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); return false; });

canvas.addEventListener('mousedown', (e) => {
    const {x, y} = getCanvasCoords(e); 
    const clickedNode = getNodeAt(x, y);
    const clickedEdge = getEdgeAt(x, y);

    // --- LÓGICA DE EDIÇÃO DE PESO (Shift + Clique Esquerdo) ---
    if (e.button === 0 && e.shiftKey && clickedEdge) {
        const newWeight = prompt(`Novo peso para aresta ${clickedEdge.from}->${clickedEdge.to}:`, clickedEdge.weight);
        if (newWeight !== null) {
            const w = parseInt(newWeight);
            if (!isNaN(w)) {
                clickedEdge.weight = w;
                drawEditor();
            } else {
                alert("Por favor, insira um número válido.");
            }
        }
        return; // Impede criação de nó
    }

    // Esquerdo: Criar
    if (e.button === 0) {
        if (clickedNode) { isDraggingLine = true; dragStartNode = clickedNode; }
        else { if (!nodes.find(n => Math.sqrt((n.x-x)**2+(n.y-y)**2)<40)) { nodes.push({ id: getNextId(), x, y }); drawEditor(); } }
    }
    
    // Direito: Mover ou Deletar
    if (e.button === 2) {
        if (Date.now() - lastRightClickTime < 300) {
            if (clickedEdge) { edges = edges.filter(e => e !== clickedEdge); drawEditor(); return; }
        }
        lastRightClickTime = Date.now();
        if (clickedNode) { isMovingNode = true; movingNode = clickedNode; moveOffset.x = x - clickedNode.x; moveOffset.y = y - clickedNode.y; canvas.style.cursor = "grabbing"; }
    }
});

canvas.addEventListener('mousemove', (e) => {
    const {x, y} = getCanvasCoords(e); mouseX = x; mouseY = y;
    if (isDraggingLine) { drawEditor(); return; }
    if (isMovingNode && movingNode) {
        movingNode.x = x - moveOffset.x; movingNode.y = y - moveOffset.y;
        movingNode.x = Math.max(20, Math.min(canvas.width-20, movingNode.x)); movingNode.y = Math.max(20, Math.min(canvas.height-20, movingNode.y));
        drawEditor(); return;
    }
    
    // Cursor
    const hoverNode = getNodeAt(x, y);
    const hoverEdge = getEdgeAt(x, y);
    if (hoverNode) canvas.style.cursor = isMovingNode ? "grabbing" : "grab";
    else if (hoverEdge) canvas.style.cursor = e.shiftKey ? "text" : "pointer"; // Feedback visual
    else canvas.style.cursor = "crosshair";
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0 && isDraggingLine) {
        const {x, y} = getCanvasCoords(e); const targetNode = getNodeAt(x, y);
        if (targetNode && targetNode !== dragStartNode && !edges.some(e => e.from===dragStartNode.id && e.to===targetNode.id)) {
            // Cria aresta com peso 1 padrão
            edges.push({ from: dragStartNode.id, to: targetNode.id, weight: 1 });
        }
        isDraggingLine = false; dragStartNode = null; drawEditor();
    }
    if (e.button === 2 && isMovingNode) { isMovingNode = false; movingNode = null; canvas.style.cursor = "crosshair"; drawEditor(); }
});

canvas.addEventListener('mouseleave', () => { isDraggingLine=false; dragStartNode=null; isMovingNode=false; movingNode=null; drawEditor(); });

canvas.addEventListener('dblclick', (e) => {
    const {x, y} = getCanvasCoords(e); const clickedNode = getNodeAt(x, y);
    if (clickedNode) {
        nodes = nodes.filter(n => n !== clickedNode);
        edges = edges.filter(e => e.from !== clickedNode.id && e.to !== clickedNode.id);
        drawEditor();
    }
});

document.getElementById('btn-clear-editor').onclick = clearEditor;