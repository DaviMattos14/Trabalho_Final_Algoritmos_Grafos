import { highlightLine } from "./pseudo.js";

let animationTimer = null;
let running = false;
let finishedOrder = []; // Array para o vetor de finalização

export async function runAnimation(steps, drawGraph) {
    running = true;
    const visited = new Set(); // Nós 'cinza'
    const finished = new Set(); // Nós 'preto'

    // Referências da UI
    const statusEl = document.getElementById("statusText");
    const finishedVectorEl = document.getElementById("finishedVector");

    for (const step of steps) {
        if (!running) break; 

        highlightLine(step.line);
        statusEl.textContent = step.status;

        let currentNode = step.node;

        if (step.action === "enter") {
            visited.add(step.node); // 'cinza'
        }
        
        if (step.action === "exit") {
            finished.add(step.node); // 'preto'
            
            // --- MELHORIA 4 (Lógica) ---
            finishedOrder.push(step.node);
            finishedVectorEl.textContent = `[${finishedOrder.join(', ')}]`;
            // --- Fim da Melhoria ---
        }

        drawGraph(visited, finished, currentNode);
        await delay(800);
    }
    
    running = false;
    highlightLine(-1); 
    statusEl.textContent = "Concluído.";
}

export function stopAnimation() {
    running = false;
    if (animationTimer) {
        clearTimeout(animationTimer);
    }
    
    // --- MELHORIA 4 (Reset) ---
    finishedOrder = []; // Limpa o array
    const el = document.getElementById("finishedVector");
    if (el) el.textContent = "[]"; // Limpa a UI
    // --- Fim da Melhoria ---
}

function delay(ms) {
    return new Promise(res => {
        animationTimer = setTimeout(res, ms);
    });
}