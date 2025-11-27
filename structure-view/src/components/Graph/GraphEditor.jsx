import React, { useRef, useEffect, useState } from 'react';
import { calculateLayout } from '../../utils/layout';

const GraphEditor = ({ initialGraph, onSave, onClose, isDarkMode = false }) => {
  const canvasRef = useRef(null);
  
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragStartNode, setDragStartNode] = useState(null); 
  const [mousePos, setMousePos] = useState({x:0, y:0});
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Guarda o tamanho anterior para calcular o deslocamento (shift)
  const prevSize = useRef({ w: 0, h: 0 });
  const lastRightClick = useRef(0);

  const THEME = {
    background: isDarkMode ? '#1e293b' : '#ffffff',
    edge: isDarkMode ? '#94a3b8' : '#64748b',
    nodeFill: isDarkMode ? '#334155' : '#ffffff',
    nodeBorder: isDarkMode ? '#cbd5e1' : '#000000',
    text: isDarkMode ? '#f1f5f9' : '#000000',
    highlight: '#3b82f6', 
    weightBox: isDarkMode ? '#0f172a' : '#ffffff',
    weightText: isDarkMode ? '#f1f5f9' : '#000000'
  };

  // --- RESIZE OBSERVER COM AUTO-CENTRALIZAÇÃO ---
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;

      const resizeObserver = new ResizeObserver(() => {
          const rect = canvas.parentElement.getBoundingClientRect();
          const newW = rect.width;
          const newH = rect.height;
          
          if (prevSize.current.w > 0 && prevSize.current.h > 0) {
              const dx = (newW - prevSize.current.w) / 2;
              const dy = (newH - prevSize.current.h) / 2;
              
              if (dx !== 0 || dy !== 0) {
                  setNodes(prevNodes => prevNodes.map(n => ({
                      ...n, 
                      x: n.x + dx, 
                      y: n.y + dy 
                  })));
              }
          }
          
          prevSize.current = { w: newW, h: newH };
          setDimensions({ width: newW, height: newH });
      });

      resizeObserver.observe(canvas.parentElement);
      return () => resizeObserver.disconnect();
  }, []);

  // 1. Inicialização
  useEffect(() => {
    const keys = Object.keys(initialGraph).sort();
    
    if (keys.length === 0) { setNodes([]); setEdges([]); return; }

    const currentW = prevSize.current.w || 800;
    const currentH = prevSize.current.h || 500;
    
    const layout = calculateLayout(initialGraph, keys[0], currentW, currentH);
    
    // Bounding Box para centralizar
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const posKeys = Object.keys(layout);
    if(posKeys.length > 0) {
        posKeys.forEach(k => {
            const p = layout[k];
            minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
        });
        if(maxX === minX) maxX += 100;
        if(maxY === minY) maxY += 100;
    } else { minX = 0; maxX = currentW; minY = 0; maxY = currentH; }

    // Tamanho atual do container
    const rect = canvasRef.current ? canvasRef.current.getBoundingClientRect() : { width: currentW, height: currentH };
    
    // --- RE-CENTRALIZAÇÃO ROBUSTA ---
    // Removemos o bloco "newNodes" problemático e usamos apenas este:
    const finalNodes = keys.map(k => {
        const p = layout[k] || {x:0, y:0};
        // Traz para 0,0 relativo ao topo-esquerda do grafo
        const zeroX = p.x - minX;
        const zeroY = p.y - minY;
        // Move para o centro da tela
        return {
            id: k,
            x: zeroX + (rect.width - (maxX - minX)) / 2,
            y: zeroY + (rect.height - (maxY - minY)) / 2
        };
    });

    const newEdges = [];
    keys.forEach(u => {
        initialGraph[u].forEach(edge => {
            newEdges.push({ from: u, to: edge.target, weight: edge.weight });
        });
    });

    setNodes(finalNodes);
    setEdges(newEdges);
    
    if (canvasRef.current) {
        const r = canvasRef.current.getBoundingClientRect();
        prevSize.current = { w: r.width, h: r.height };
    }
  }, [initialGraph]); 

  // 2. Loop de Desenho
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect(); 
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    ctx.scale(dpr, dpr);

    ctx.fillStyle = THEME.background;
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.lineWidth = 2;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    edges.forEach(edge => {
        const u = nodes.find(n => n.id === edge.from);
        const v = nodes.find(n => n.id === edge.to);
        if (!u || !v) return;
        
        ctx.strokeStyle = THEME.edge;
        ctx.fillStyle = THEME.edge;
        drawArrow(ctx, u.x, u.y, v.x, v.y);
        
        const midX = (u.x + v.x) / 2;
        const midY = (u.y + v.y) / 2;
        ctx.save();
        ctx.fillStyle = THEME.weightBox;
        ctx.fillRect(midX - 10, midY - 10, 20, 20);
        ctx.fillStyle = THEME.weightText;
        ctx.fillText(edge.weight, midX, midY);
        ctx.restore();
    });

    if (dragStartNode) {
        ctx.beginPath();
        ctx.moveTo(dragStartNode.x, dragStartNode.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.strokeStyle = THEME.highlight; 
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = THEME.highlight;
        drawArrowHead(ctx, dragStartNode.x, dragStartNode.y, mousePos.x, mousePos.y);
    }

    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = THEME.nodeFill;
        ctx.fill();
        if (node.id === draggedNode?.id) ctx.strokeStyle = THEME.highlight; 
        else if (node.id === dragStartNode?.id) ctx.strokeStyle = THEME.highlight; 
        else ctx.strokeStyle = THEME.nodeBorder;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = THEME.text;
        ctx.font = 'bold 14px "Courier New"';
        ctx.fillText(node.id, node.x, node.y);
    });

  }, [nodes, edges, dragStartNode, mousePos, draggedNode, isDarkMode, dimensions]);

  // Helpers
  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const r = 20; 
    const endX = toX - r * Math.cos(angle);
    const endY = toY - r * Math.sin(angle);
    const startX = fromX + r * Math.cos(angle);
    const startY = fromY + r * Math.sin(angle);
    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle;
    drawArrowHead(ctx, startX, startY, endX, endY);
  };

  const drawArrowHead = (ctx, fromX, fromY, toX, toY) => {
      const headLength = 10; const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.beginPath(); ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(toX, toY); ctx.fill();
  };

  const getCoords = (e) => { const rect = canvasRef.current.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; };
  const getNodeAt = (x, y) => { return nodes.find(n => Math.sqrt((n.x - x)**2 + (n.y - y)**2) < 25); };
  const getDistanceToSegmentSquared = (p, v, w) => {
    const l2 = (v.x - w.x)**2 + (v.y - w.y)**2; if (l2 === 0) return (p.x - v.x)**2 + (p.y - v.y)**2;
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2; t = Math.max(0, Math.min(1, t));
    return (p.x - (v.x + t * (w.x - v.x)))**2 + (p.y - (v.y + t * (w.y - v.y)))**2;
  };
  const getEdgeAt = (x, y) => {
      const clickPoint = {x, y}; 
      return edges.find(edge => {
          const n1 = nodes.find(n => n.id === edge.from); const n2 = nodes.find(n => n.id === edge.to);
          if (!n1 || !n2) return false;
          return Math.sqrt(getDistanceToSegmentSquared(clickPoint, n1, n2)) < 15;
      });
  };
  const getNextId = () => { let id = 0; while (nodes.some(n => n.id === id.toString())) { id++; } return id.toString(); }

  const handleMouseDown = (e) => {
    const { x, y } = getCoords(e);
    const clickedNode = getNodeAt(x, y);
    const clickedEdge = getEdgeAt(x, y);

    if (e.button === 0 && e.shiftKey && clickedEdge) {
        const newWeight = prompt(`Novo peso:`, clickedEdge.weight);
        if (newWeight !== null) {
            const w = parseInt(newWeight);
            if (!isNaN(w)) {
                const newEdges = edges.map(ed => ed === clickedEdge ? { ...ed, weight: w } : ed);
                setEdges(newEdges);
            }
        }
        return;
    }
    if (e.button === 0) {
        if (clickedNode) { setDragStartNode(clickedNode); }
        else { if (!nodes.find(n => Math.sqrt((n.x-x)**2+(n.y-y)**2)<40)) { nodes.push({ id: getNextId(), x, y }); } }
    }
    if (e.button === 2) {
        const now = Date.now();
        if (now - lastRightClick.current < 300) {
            if (clickedEdge) { setEdges(edges.filter(e => e !== clickedEdge)); return; }
        }
        lastRightClick.current = now;
        if (clickedNode) { setDraggedNode(clickedNode); }
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = getCoords(e);
    setMousePos({x, y});
    if (draggedNode) {
        const rect = canvasRef.current.getBoundingClientRect();
        const newNodes = nodes.map(n => n.id === draggedNode.id ? { ...n, x: Math.max(20, Math.min(rect.width-20, x)), y: Math.max(20, Math.min(rect.height-20, y)) } : n);
        setNodes(newNodes);
    }
    const hoverNode = getNodeAt(x, y); const hoverEdge = getEdgeAt(x, y);
    if (hoverNode) canvasRef.current.style.cursor = 'grab';
    else if (hoverEdge) canvasRef.current.style.cursor = e.shiftKey ? 'text' : 'pointer';
    else canvasRef.current.style.cursor = 'crosshair';
  };

  const handleMouseUp = (e) => {
    if (e.button === 0 && dragStartNode) {
        const { x, y } = getCoords(e); const targetNode = getNodeAt(x, y);
        if (targetNode && targetNode.id !== dragStartNode.id) {
            if (!edges.some(edge => edge.from === dragStartNode.id && edge.to === targetNode.id)) {
                setEdges([...edges, { from: dragStartNode.id, to: targetNode.id, weight: 1 }]);
            }
        }
        setDragStartNode(null);
    }
    if (e.button === 2 && draggedNode) { setDraggedNode(null); }
  };

  const handleDblClick = (e) => {
    const { x, y } = getCoords(e); const clickedNode = getNodeAt(x, y);
    if (clickedNode) {
        setNodes(nodes.filter(n => n.id !== clickedNode.id));
        setEdges(edges.filter(e => e.from !== clickedNode.id && e.to !== clickedNode.id));
    }
  };

  const handleSave = () => {
    const newGraphObj = {};
    nodes.forEach(n => newGraphObj[n.id] = []);
    edges.forEach(e => {
        if (newGraphObj[e.from]) {
            newGraphObj[e.from].push({ target: e.to, weight: e.weight });
        }
    });
    const newStart = nodes.length > 0 ? nodes.sort((a,b) => parseInt(a.id) - parseInt(b.id))[0].id : null;
    onSave(newGraphObj, newStart);
    onClose();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
        <div className="editor-toolbar" style={{ 
            display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '6px',
            background: THEME.background, border: `1px solid ${THEME.nodeBorder}`
        }}>
            <span style={{fontSize: '0.9rem', color: THEME.edge}}>
                🖱️ Esq: <b>Criar Nó</b> | 
                ⚫ Clique + Arrastar entre nós: <b>Criar Aresta</b> | 
                ⇧+Esq: <b>Mudar Peso</b> <br/>
                🖱️ Dir: <b>Mover Nó</b> | 
                ❌ 2x Dir: <b>Apagar Aresta</b> | 
                ❌ 2x Esq: <b>Apagar Nó</b>
            </span>
            <button onClick={() => {setNodes([]); setEdges([])}} style={{
                padding: '4px 8px', border: `1px solid ${THEME.nodeBorder}`, borderRadius: '4px', cursor: 'pointer',
                backgroundColor: THEME.background, color: THEME.text
            }}>Limpar</button>
        </div>
        
        <div style={{ flex: 1, border: `1px solid ${THEME.nodeBorder}`, borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
            <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair', background: THEME.background }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
                onDoubleClick={handleDblClick}
            />
        </div>

        <div style={{ textAlign: 'right' }}>
            <button onClick={handleSave} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Salvar e Atualizar
            </button>
        </div>
    </div>
  );
};

export default GraphEditor;