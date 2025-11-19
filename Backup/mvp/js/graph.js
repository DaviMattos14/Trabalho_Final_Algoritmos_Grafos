const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

// Dados do Grafo
const graph = {
    A: ["B", "C"],
    B: ["D", "E"],
    C: ["F"],
    D: [],
    E: [], // Aresta de retorno
    F: []
};

const positions = {
    A: { x: 250, y: 60 },
    B: { x: 150, y: 150 },
    C: { x: 350, y: 150 },
    D: { x: 100,  y: 260 },
    E: { x: 200,  y: 260 },
    F: { x: 350,  y: 260 }
};

export const graphData = {
    graph,
    positions
};

// --- FUNÇÃO DE DESENHO ---
export function drawGraph(visited, finished, current) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 1. Desenha as Arestas
    for (let u in graph) {
        for (let v of graph[u]) {
            const a = positions[u];
            const b = positions[v];
            
            if (u === current && graph[u].includes(v)) {
                ctx.strokeStyle = "#ff0000"; 
            } else {
                ctx.strokeStyle = "#ccc"; 
            }

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }
    }

    // 2. Desenha os Nós
    for (let node in positions) {
        const { x, y } = positions[node];
        const radius = 20;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (finished.has(node)) {
            ctx.fillStyle = "#404040"; // Preto (finalizado)
        } else if (visited.has(node)) {
            ctx.fillStyle = "#ccc"; // Cinza (visitando)
        } else {
            ctx.fillStyle = "white"; // Branco (não visitado)
        }
        
        ctx.strokeStyle = (node === current) ? "#ff0000" : "black"; 
        
        ctx.fill();
        ctx.stroke();

        if(finished.has(node)) {
            ctx.fillStyle = "white";
        } else {
            ctx.fillStyle = "black";
        }
        ctx.fillText(node, x, y);
    }
}