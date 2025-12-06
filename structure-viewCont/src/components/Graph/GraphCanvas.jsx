import React, { useRef, useEffect, useState } from 'react';

const GraphCanvas = ({ 
  graph, 
  positions, 
  isDirected, 
  currentStepData = {}, 
  showWeights = false,
  onNodeDrag,
  isDarkMode = false 
}) => {
  const canvasRef = useRef(null);
  
  const viewState = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { 
    visited = new Set(), 
    finished = new Set(), 
    node: currentNode = null,
    distances = null,
    predecessors = null,
    // --- NOVAS FLAGS DE CONTROLE ---
    highlightEdges = false, // Mantido para compatibilidade
    highlightAll = false,   // Destaca todas as saídas
    targetNode = null       // Destaca uma aresta específica
  } = currentStepData;

  const NODE_RADIUS = 20;

  const THEMES = {
    light: {
      background: '#f8fafc', 
      nodeDefault: '#ffffff',
      nodeBorder: '#000000',
      text: '#000000',
      textLight: '#ffffff',
      edgeDefault: '#94a3b8',
      weightBox: '#ffffff',
      weightText: '#333333'
    },
    dark: {
      background: '#1e293b', 
      nodeDefault: '#fdfdfdff', 
      nodeBorder: '#ffffffff',  
      text: '#000000ff',        
      textLight: '#f8fafc',
      edgeDefault: '#64748b', 
      weightBox: '#0f172a',   
      weightText: '#f1f5f9'   
    }
  };

  const currentTheme = isDarkMode ? THEMES.dark : THEMES.light;

  const COLORS = {
    visited: '#f59e0b',  
    finished: isDarkMode ? '#000000ff' : '#000000ff', 
    current: '#ef4444',  
    edgeHighlight: '#f87171', 
    edgePath: '#dc2626',      
    distText: '#3b82f6',      
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const resizeObserver = new ResizeObserver(() => {
        const rect = canvas.parentElement.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
    });

    resizeObserver.observe(canvas.parentElement);

    return () => resizeObserver.disconnect();
  }, []);

  const screenToWorld = (screenX, screenY) => {
    const { scale, offsetX, offsetY } = viewState.current;
    return {
        x: (screenX - offsetX) / scale,
        y: (screenY - offsetY) / scale
    };
  };

  const getNodeAtPosition = (x, y) => {
    if (!positions) return null;
    for (let nodeId in positions) {
        const pos = positions[nodeId];
        const dx = x - pos.x;
        const dy = y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS) return nodeId;
    }
    return null;
  };

  const draw = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = currentTheme.background; 
    ctx.fillRect(0, 0, width, height);

    if (!positions || Object.keys(positions).length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    Object.values(positions).forEach(p => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });

    const PADDING = 100;
    const graphW = (maxX - minX) + (PADDING * 2);
    const graphH = (maxY - minY) + (PADDING * 2);
    
    const scaleX = width / graphW;
    const scaleY = height / graphH;
    let scale = Math.min(scaleX, scaleY);
    scale = Math.min(scale, 1);

    const offsetX = (width - ((maxX - minX + PADDING*2) * scale)) / 2 - (minX - PADDING) * scale;
    const offsetY = (height - ((maxY - minY + PADDING*2) * scale)) / 2 - (minY - PADDING) * scale;

    viewState.current = { scale, offsetX, offsetY };

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold 16px Arial`; 

    // ARESTAS
    Object.keys(graph).forEach(u => {
        if (!positions[u]) return;
        const startPos = positions[u];

        graph[u].forEach(edge => {
            const v = edge.target;
            const w = edge.weight;
            if (!positions[v]) return;
            const endPos = positions[v];

            let strokeStyle = currentTheme.edgeDefault; 
            let lineWidth = 2 / scale;

            const isShortestPath = predecessors && (predecessors[v] === u || predecessors[u] === v);
            
            // --- LÓGICA DE DESTAQUE REFINADA ---
            let isAnimHighlight = false;

            if (!isShortestPath) {
                // Caso 1: Origem é o nó atual
                if (u === currentNode) {
                    if (highlightAll) isAnimHighlight = true; // Destaca todas as saídas
                    if (targetNode === v) isAnimHighlight = true; // Destaca alvo específico
                    // Fallback legado
                    if (highlightEdges && !targetNode && !highlightAll) isAnimHighlight = true; 
                }
                
                // Caso 2: Grafo não direcionado (destaca vindo do destino)
                if (!isDirected && v === currentNode) {
                    if (highlightAll) isAnimHighlight = true;
                    if (targetNode === u) isAnimHighlight = true;
                    if (highlightEdges && !targetNode && !highlightAll) isAnimHighlight = true;
                }
            }

            if (isShortestPath) {
                strokeStyle = COLORS.edgePath;
                lineWidth = 4 / scale;
            } else if (isAnimHighlight) {
                strokeStyle = COLORS.edgeHighlight;
                lineWidth = 3 / scale;
            }

            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;

            if (Math.abs(startPos.x - endPos.x) < 10) {
                drawCurvedLine(ctx, startPos, endPos, isDirected, scale);
            } else {
                drawLine(ctx, startPos, endPos, isDirected, scale);
            }

            if (showWeights && w !== 1) {
                drawWeightBox(ctx, startPos, endPos, w, scale);
            }
        });
    });

    // NÓS
    Object.keys(positions).forEach(nodeId => {
        const pos = positions[nodeId];
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, 2 * Math.PI);
        
        if (finished.has(nodeId)) ctx.fillStyle = COLORS.finished;
        else if (visited.has(nodeId)) ctx.fillStyle = COLORS.visited;
        else ctx.fillStyle = currentTheme.nodeDefault; 

        ctx.fill();
        
        ctx.strokeStyle = (nodeId === currentNode) ? COLORS.current : currentTheme.nodeBorder;
        ctx.lineWidth = (nodeId === currentNode) ? 4 / scale : 2 / scale;
        ctx.stroke();

        ctx.fillStyle = finished.has(nodeId) ? currentTheme.textLight : currentTheme.text;
        if (visited.has(nodeId) && !finished.has(nodeId)) ctx.fillStyle = '#000'; 

        ctx.fillText(nodeId, pos.x, pos.y);

        if (distances && distances[nodeId] !== undefined) {
            const d = distances[nodeId] === Infinity ? '∞' : distances[nodeId];
            ctx.fillStyle = COLORS.distText;
            ctx.font = `bold 14px Arial`;
            ctx.fillText(d, pos.x, pos.y - (NODE_RADIUS * 1.8));
            ctx.font = `bold 16px Arial`;
        }
    });

    ctx.restore();
  };

  // HELPERS VISUAIS
  const drawLine = (ctx, start, end, directed, scale) => {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const r = NODE_RADIUS;
    const endX = end.x - r * Math.cos(angle);
    const endY = end.y - r * Math.sin(angle);
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(endX, endY); ctx.stroke();
    if (directed) drawArrowHead(ctx, endX, endY, angle, scale);
  };

  const drawCurvedLine = (ctx, start, end, directed, scale) => {
    const midY = (start.y + end.y) / 2;
    const cpX = start.x + 60; 
    const cpY = midY;
    const angle = Math.atan2(end.y - cpY, end.x - cpX);
    const r = NODE_RADIUS;
    const endX = end.x - r * Math.cos(angle);
    const endY = end.y - r * Math.sin(angle);
    ctx.beginPath(); ctx.moveTo(start.x + NODE_RADIUS, start.y); 
    ctx.quadraticCurveTo(cpX, cpY, endX, endY); ctx.stroke();
    if (directed) drawArrowHead(ctx, endX, endY, angle, scale);
  };

  const drawArrowHead = (ctx, x, y, angle, scale) => {
    const headLen = 10 / scale;
    ctx.fillStyle = ctx.strokeStyle; 
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(x, y); ctx.fill();
  };

  const drawWeightBox = (ctx, start, end, weight, scale) => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    ctx.save();
    ctx.fillStyle = currentTheme.weightBox;
    const boxSize = 20 / scale;
    ctx.fillRect(midX - boxSize/2, midY - boxSize/2, boxSize, boxSize);
    ctx.fillStyle = currentTheme.weightText;
    ctx.font = `bold ${12/scale}px Arial`;
    ctx.fillText(weight, midX, midY);
    ctx.restore();
  };

  // EVENTOS
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);
    const node = getNodeAtPosition(worldPos.x, worldPos.y);

    if (node) {
      setIsDragging(true);
      setDraggedNode(node);
      setDragOffset({
          x: worldPos.x - positions[node].x,
          y: worldPos.y - positions[node].y
      });
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    const node = getNodeAtPosition(worldPos.x, worldPos.y);
    canvasRef.current.style.cursor = node ? 'grab' : 'default';

    if (isDragging && draggedNode) {
       canvasRef.current.style.cursor = 'grabbing';
       const newX = worldPos.x - dragOffset.x;
       const newY = worldPos.y - dragOffset.y;
       if (onNodeDrag) onNodeDrag(draggedNode, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect(); 
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    draw(ctx, rect.width, rect.height);

  }, [graph, positions, currentStepData, isDirected, showWeights, isDarkMode, dimensions]);

  return (
    <canvas 
      ref={canvasRef} 
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};

export default GraphCanvas;