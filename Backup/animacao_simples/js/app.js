import { renderPseudoCode, highlightLine } from "./pseudo.js";
import { drawGraph, graphData } from "./graph.js";
import { dfsAlgorithm } from "./algorithms/dfs.js";
import { bfsAlgorithm } from "./algorithms/bfs.js";
import { topologicalAlgorithm } from "./algorithms/topological.js"; // <--- Importar

// Mapa de algoritmos
const ALGORITHMS = {
    'dfs': dfsAlgorithm,
    'bfs': bfsAlgorithm,
    'topo': topologicalAlgorithm // <--- Adicionar
};

let currentAlgorithm = dfsAlgorithm;
const START_NODE = "A";

// Elementos da UI
let statusEl, finishedVectorEl, queueVectorEl, queueLabelEl, playPauseBtn, prevBtn, nextBtn, resetBtn, speedSlider, algoSelector;

// ... Variáveis de estado (iguais) ...
let algorithmSteps = []; 
let currentStep = 0;
let isPlaying = false;
let animationTimer = null;
let animationSpeed = 1200; 

function renderStep(index) {
    if (index < 0 || index >= algorithmSteps.length) return;
    
    const step = algorithmSteps[index];

    highlightLine(step.line);
    statusEl.textContent = step.status;
    finishedVectorEl.textContent = `[${step.finishedOrder.join(', ')}]`;
    
    const queueText = step.queueSnapshot ? step.queueSnapshot.join(', ') : "";
    queueVectorEl.textContent = `[${queueText}]`;
    
    drawGraph(step.visited, step.finished, step.node);
    
    currentStep = index;
    
    prevBtn.disabled = (currentStep === 0);
    nextBtn.disabled = (currentStep === algorithmSteps.length - 1);
}

// ... Funções de playback (stepForward, stepBackward, playLoop, togglePlayPause, onSpeedChange, reset) PERMANECEM IGUAIS ...
// (Copie do código anterior se necessário, nada mudou aqui)

function stepForward() { if (currentStep < algorithmSteps.length - 1) renderStep(currentStep + 1); }
function stepBackward() { if (currentStep > 0) renderStep(currentStep - 1); }
function playLoop() {
    if (!isPlaying || currentStep >= algorithmSteps.length - 1) { if(isPlaying) togglePlayPause(); return; }
    stepForward();
    animationTimer = setTimeout(playLoop, 2100 - animationSpeed);
}
function togglePlayPause() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        playPauseBtn.textContent = "❚❚ Pause";
        if (currentStep >= algorithmSteps.length - 1) currentStep = 0;
        playLoop();
    } else {
        playPauseBtn.textContent = "▶ Play";
        if (animationTimer) clearTimeout(animationTimer);
    }
}
function onSpeedChange(e) { animationSpeed = e.target.valueAsNumber; }
function reset() { if (isPlaying) togglePlayPause(); currentStep = 0; renderStep(0); }


function onAlgorithmChange(event) {
    const selectedKey = event.target.value;
    currentAlgorithm = ALGORITHMS[selectedKey];
    initializeAnimationData();
    reset();
}

function initializeAnimationData() {
    document.getElementById("algorithmTitle").textContent = currentAlgorithm.name;
    renderPseudoCode(currentAlgorithm.pseudoCode);

    // --- ATUALIZAÇÃO DINÂMICA DO RÓTULO DA CAIXA AUXILIAR ---
    // Se o algoritmo tiver um 'label' específico, usa. Senão, usa padrão.
    const label = currentAlgorithm.label || "Fila (Queue):";
    document.getElementById("queueLabel").textContent = label;

    algorithmSteps = currentAlgorithm.getSteps(graphData.graph, START_NODE);
}

function initialize() {
    statusEl = document.getElementById("statusText");
    finishedVectorEl = document.getElementById("finishedVector");
    queueVectorEl = document.getElementById("queueVector");
    
    // Novo seletor para o rótulo
    queueLabelEl = document.getElementById("queueLabel");

    playPauseBtn = document.getElementById("btn-play-pause");
    prevBtn = document.getElementById("btn-prev");
    nextBtn = document.getElementById("btn-next");
    resetBtn = document.getElementById("resetBtn");
    speedSlider = document.getElementById("speedSlider");
    algoSelector = document.getElementById("algoSelector");

    playPauseBtn.onclick = togglePlayPause;
    prevBtn.onclick = stepBackward;
    nextBtn.onclick = stepForward;
    resetBtn.onclick = reset;
    speedSlider.oninput = onSpeedChange;
    algoSelector.onchange = onAlgorithmChange;

    animationSpeed = speedSlider.valueAsNumber;

    initializeAnimationData();
    renderStep(0);
}

document.addEventListener('DOMContentLoaded', initialize);