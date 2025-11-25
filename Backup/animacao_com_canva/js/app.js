import { renderPseudoCode, highlightLine } from "./pseudo.js";
import { drawGraph, graphData, updateGraphData, setDirected } from "./graph.js";
import { loadGraphToEditor, exportGraphFromEditor, clearEditor } from "./editor.js"; // Importação do Editor
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
let playPauseBtn, prevBtn, nextBtn, resetBtn, speedSlider, algoSelector, startNodeInput;
let modalEl, btnEditGraph, spanCloseModal;

// Elementos das Abas
let tabBtns, tabContents;
let currentTab = 'text'; // Estado da aba atual

// Estado do Player
let algorithmSteps = []; 
let currentStep = 0;
let isPlaying = false;
let animationTimer = null;
let animationSpeed = 1200; 

// --- HELPERS GERAIS ---

function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// --- HELPERS DE FORMATAÇÃO ---

function graphToText(graphObj) {
    const keys = Object.keys(graphObj).sort(naturalSort);
    
    const lines = keys.map(key => {
        const neighbors = JSON.stringify(graphObj[key]).replace(/,/g, ", ");
        return `${key}: ${neighbors}`;
    });

    return lines.join(',\n');
}

function textToGraph(text) {
    let cleanText = text.trim();
    cleanText = cleanText.replace(/,(\s*)$/, '$1');

    if (!cleanText.startsWith('{')) {
        cleanText = '{' + cleanText + '}';
    }

    cleanText = cleanText.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
    
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


// --- LÓGICA DO MODAL E ABAS ---

function openModal() {
    // Ao abrir, populamos ambas as visões com o grafo atual
    const currentGraph = graphData.graph;
    
    // 1. Preenche Texto
    graphInputEl.value = graphToText(currentGraph);
    
    // 2. Carrega Editor Visual
    loadGraphToEditor(currentGraph);
    
    // 3. Reseta para a aba de texto por padrão (ou mantenha a última usada)
    switchTab('text');
    
    modalEl.style.display = "block";
}

function closeModal() {
    modalEl.style.display = "none";
}

// Função para alternar abas e sincronizar dados
function switchTab(tabName) {
    // Antes de trocar, salvamos o estado da aba atual para a outra
    if (currentTab === 'text' && tabName === 'visual') {
        try {
            const graphFromText = textToGraph(graphInputEl.value);
            loadGraphToEditor(graphFromText);
        } catch (e) {
            alert("Erro de sintaxe no texto. Corrija antes de mudar para o modo visual.");
            return; // Impede a troca se o texto estiver quebrado
        }
    } else if (currentTab === 'visual' && tabName === 'text') {
        const graphFromVisual = exportGraphFromEditor();
        graphInputEl.value = graphToText(graphFromVisual);
    }

    currentTab = tabName;
    
    // Atualiza Classes CSS
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabName) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    tabContents.forEach(content => {
        if (content.id === `tab-${tabName}`) content.classList.add('active');
        else content.classList.remove('active');
    });
}

function onLoadGraphClick() {
    let newGraph;
    
    try {
        // Pega os dados da aba que está ativa no momento
        if (currentTab === 'text') {
            const rawText = graphInputEl.value;
            newGraph = textToGraph(rawText);
        } else {
            newGraph = exportGraphFromEditor();
        }

        if (typeof newGraph !== 'object' || newGraph === null) throw new Error("Erro: Grafo inválido.");

        // Ordenação e Validação
        const keys = Object.keys(newGraph).sort(naturalSort);
        if (keys.length === 0) throw new Error("O grafo não pode estar vazio.");

        // Define novo início
        const newStart = keys[0];

        updateGraphData(newGraph, newStart);
        startNodeInput.value = newStart;

        initializeAnimationData(); 
        reset();
        closeModal();

    } catch (e) {
        alert("Erro ao carregar grafo: " + e.message);
    }
}

function onAlgorithmChange(event) {
    const selectedKey = event.target.value;
    currentAlgorithm = ALGORITHMS[selectedKey];
    initializeAnimationData();
    reset();
}

function onStartNodeChange() {
    const newStart = startNodeInput.value;
    if (graphData.graph[newStart] !== undefined) {
        initializeAnimationData();
        reset();
    } else {
        startNodeInput.style.borderColor = "red";
        setTimeout(() => startNodeInput.style.borderColor = "#ddd", 1000);
    }
}

function initializeAnimationData() {
    const keys = Object.keys(graphData.graph).sort(naturalSort);
    
    let effectiveStartNode = startNodeInput.value;
    if (graphData.graph[effectiveStartNode] === undefined) {
        effectiveStartNode = keys[0];
        startNodeInput.value = effectiveStartNode; 
    }

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
    startNodeInput = document.getElementById("startNodeInput");
    
    playPauseBtn = document.getElementById("btn-play-pause");
    prevBtn = document.getElementById("btn-prev");
    nextBtn = document.getElementById("btn-next");
    resetBtn = document.getElementById("resetBtn");
    speedSlider = document.getElementById("speedSlider");
    algoSelector = document.getElementById("algoSelector");

    // Abas
    tabBtns = document.querySelectorAll('.tab-btn');
    tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });

    // Listeners
    playPauseBtn.onclick = togglePlayPause;
    prevBtn.onclick = stepBackward;
    nextBtn.onclick = stepForward;
    resetBtn.onclick = reset;
    speedSlider.oninput = onSpeedChange;
    algoSelector.onchange = onAlgorithmChange;
    startNodeInput.onchange = onStartNodeChange;
    
    btnEditGraph.onclick = openModal;
    spanCloseModal.onclick = closeModal;
    loadGraphBtn.onclick = onLoadGraphClick;

    window.onclick = function(event) { if (event.target === modalEl) closeModal(); }

    animationSpeed = speedSlider.valueAsNumber;
    
    // Carregamento Inicial
    graphInputEl.value = graphToText(graphData.graph);

    initializeAnimationData();
    renderStep(0);
}

document.addEventListener('DOMContentLoaded', initialize);