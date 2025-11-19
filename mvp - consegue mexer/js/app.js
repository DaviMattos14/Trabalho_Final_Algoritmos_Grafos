import { renderPseudoCode, highlightLine } from "./pseudo.js";
import { drawGraph, graphData, updateGraphData, setDirected } from "./graph.js";
import { dfsAlgorithm } from "./algorithms/dfs.js";
import { bfsAlgorithm } from "./algorithms/bfs.js";
import { topologicalAlgorithm } from "./algorithms/topological.js";

const ALGORITHMS = {
    'dfs': dfsAlgorithm,
    'bfs': bfsAlgorithm,
    'topo': topologicalAlgorithm
};

let currentAlgorithm = dfsAlgorithm;

// Elementos da UI
let statusEl, finishedVectorEl, queueVectorEl, queueLabelEl, graphInputEl, loadGraphBtn;
let playPauseBtn, prevBtn, nextBtn, resetBtn, speedSlider, algoSelector;
// Elementos do Modal
let modalEl, btnEditGraph, spanCloseModal;

// Estado
let algorithmSteps = []; 
let currentStep = 0;
let isPlaying = false;
let animationTimer = null;
let animationSpeed = 1200; 

// --- HELPERS DE FORMATAÇÃO DE TEXTO (ATUALIZADO) ---

// Transforma o Objeto JS -> Texto Compacto (Uma linha por nó)
function graphToText(graphObj) {
    // Pega todas as chaves (nós) e ordena alfabeticamente
    const keys = Object.keys(graphObj).sort();
    
    // Mapeia cada chave para uma linha de texto
    const lines = keys.map(key => {
        // Transforma o array de vizinhos em string compacta: ["B","C"]
        // Adicionamos .replace(/,/g, ", ") para dar um espaço após a vírgula e ficar bonito
        const neighbors = JSON.stringify(graphObj[key]).replace(/,/g, ", ");
        
        // Retorna o formato "A: ["B", "C"]"
        return `${key}: ${neighbors}`;
    });

    // Junta todas as linhas com uma vírgula e quebra de linha
    return lines.join(',\n');
}

// Transforma Texto -> Objeto JS
function textToGraph(text) {
    let cleanText = text.trim();
    
    // 1. Remove vírgula final se houver (para evitar erro no JSON.parse)
    // Ex: ... F: []  ,  } -> ... F: [] }
    cleanText = cleanText.replace(/,(\s*)$/, '$1');

    // 2. Se o usuário esqueceu as chaves externas, nós adicionamos
    if (!cleanText.startsWith('{')) {
        cleanText = '{' + cleanText + '}';
    }

    // 3. Recoloca aspas nas chaves que não têm (Ex: A: -> "A":)
    cleanText = cleanText.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
    
    // 4. Tenta fazer o parse
    return JSON.parse(cleanText);
}


// --- RENDERIZAÇÃO ---

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


// --- LÓGICA DO MODAL E INPUT ---

function openModal() {
    // Usa a nova função formatada
    graphInputEl.value = graphToText(graphData.graph);
    modalEl.style.display = "block";
}

function closeModal() {
    modalEl.style.display = "none";
}

function onLoadGraphClick() {
    const rawText = graphInputEl.value;
    
    try {
        const newGraph = textToGraph(rawText);

        if (typeof newGraph !== 'object' || newGraph === null) {
            throw new Error("O formato deve resultar em um objeto.");
        }

        updateGraphData(newGraph);
        
        const keys = Object.keys(newGraph).sort();
        const newStart = keys.includes("A") ? "A" : keys[0];
        
        initializeAnimationData(newStart); 
        reset();

        closeModal();

    } catch (e) {
        alert("Erro de Formatação: " + e.message + "\n\nCertifique-se de usar o formato:\nA: [\"B\", \"C\"],\nB: []");
    }
}

function onAlgorithmChange(event) {
    const selectedKey = event.target.value;
    currentAlgorithm = ALGORITHMS[selectedKey];
    initializeAnimationData();
    reset();
}

function initializeAnimationData(startNodeOverride = null) {
    const keys = Object.keys(graphData.graph).sort();
    const effectiveStartNode = startNodeOverride || (keys.includes("A") ? "A" : keys[0]);

    document.getElementById("algorithmTitle").textContent = currentAlgorithm.name;
    renderPseudoCode(currentAlgorithm.pseudoCode);

    const label = currentAlgorithm.label || "Fila (Queue):";
    queueLabelEl.textContent = label;
    
    if (currentAlgorithm === bfsAlgorithm) {
        setDirected(false);
    } else {
        setDirected(true);
    }

    algorithmSteps = currentAlgorithm.getSteps(graphData.graph, effectiveStartNode);
}

function initialize() {
    statusEl = document.getElementById("statusText");
    finishedVectorEl = document.getElementById("finishedVector");
    queueVectorEl = document.getElementById("queueVector");
    queueLabelEl = document.getElementById("queueLabel");
    
    modalEl = document.getElementById("inputModal");
    btnEditGraph = document.getElementById("btn-edit-graph");
    spanCloseModal = document.querySelector(".close-modal");
    graphInputEl = document.getElementById("graphInput");
    loadGraphBtn = document.getElementById("btn-load-graph");

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
    
    btnEditGraph.onclick = openModal;
    spanCloseModal.onclick = closeModal;
    loadGraphBtn.onclick = onLoadGraphClick;

    window.onclick = function(event) {
        if (event.target === modalEl) closeModal();
    }

    animationSpeed = speedSlider.valueAsNumber;
    
    // Inicializa com o texto formatado
    graphInputEl.value = graphToText(graphData.graph);

    initializeAnimationData();
    renderStep(0);
}

document.addEventListener('DOMContentLoaded', initialize);