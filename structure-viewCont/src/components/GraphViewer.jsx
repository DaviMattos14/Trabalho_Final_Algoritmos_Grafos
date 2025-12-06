import React from "react";
import { useOutletContext } from "react-router-dom";

export default function GraphViewer({ graph, showArrows = true, showWeights = true }) {
  const nodes = Object.keys(graph);
  const { isDarkMode } = useOutletContext();

  // --- Agrupamento em camadas de até 2 nós ---
  const layers = [];
  let line = [];

  nodes.forEach((n) => {
    line.push(n);
    if (line.length === 2) {
      layers.push(line);
      line = [];
    }
  });

  if (line.length > 0) layers.push(line);

  // --- DIMENSÕES ---
  const nodeRadius = 18;
  const verticalGap = 100;
  const horizontalGap = 120;

  const totalWidth =
    (layers.length - 1) * horizontalGap + 2 * (nodeRadius + 20);
  const totalHeight = verticalGap + 2 * (nodeRadius + 20);

  // --- POSIÇÕES DOS NÓS ---
  const positions = {};
  layers.forEach((layer, colIndex) => {
    const x = nodeRadius + 20 + colIndex * horizontalGap;

    layer.forEach((node, rowIndex) => {
      const y = nodeRadius + 20 + rowIndex * verticalGap;
      positions[node] = { x, y };
    });
  });

  // --- FUNÇÃO PARA AJUSTAR O FIM DA LINHA ATÉ A BORDA DO CÍRCULO ---
  const adjustEndPoint = (x1, y1, x2, y2, radius) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return { x: x2, y: y2 };

    const offset = radius; // recuo EXATO até a borda do círculo

    return {
      x: x2 - (dx / dist) * offset,
      y: y2 - (dy / dist) * offset,
    };
  };

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

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: 10,
      }}
    >
      <svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      >
        {/* --- SETA (metade do tamanho anterior) --- */}
        <defs>
          <marker
            id="arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill={currentTheme.edgeDefault} />
          </marker>
        </defs>

        {/* --- ARESTAS --- */}
        {nodes.map((from) =>
          graph[from].map(([to, weight]) => {
            const start = positions[from];
            const end = positions[to];

            const endAdjusted = adjustEndPoint(
              start.x,
              start.y,
              end.x,
              end.y,
              nodeRadius
            );

            return (
              <g key={from + "-" + to}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={endAdjusted.x}
                  y2={endAdjusted.y}
                  stroke={currentTheme.edgeDefault}
                  strokeWidth="2"
                  markerEnd={showArrows ? "url(#arrow)" : undefined}
                />

                {/* Peso da aresta */}
                <text
                  x={(start.x + endAdjusted.x) / 2 - 15}
                  y={(start.y + endAdjusted.y) / 2 - 3}
                  fill={showWeights ? currentTheme.weightText : "transparent"}
                  fontSize="16"
                  fontWeight="bold"
                >
                  {weight}
                </text>
              </g>
            );
          })
        )}

        {/* --- NÓS --- */}
        {nodes.map((node) => (
          <g key={node}>
            <circle
              cx={positions[node].x}
              cy={positions[node].y}
              r={nodeRadius}
              fill={currentTheme.nodeDefault}
              stroke={currentTheme.nodeBorder}
              strokeWidth="2"
            />

            <text
              x={positions[node].x}
              y={positions[node].y + 4}
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fill={currentTheme.text}
            >
              {node}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
