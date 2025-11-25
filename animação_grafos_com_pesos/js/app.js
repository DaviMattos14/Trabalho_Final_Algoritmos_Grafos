import { renderPseudoCode, highlightLine } from "./pseudo.js";
import { drawGraph, graphData, updateGraphData, setDirected } from "./graph.js";
import { loadGraphToEditor, exportGraphFromEditor, clearEditor } from "./editor.js";
import { dfsAlgorithm } from "./algorithms/dfs.js";
import { bfsAlgorithm } from "./algorithms/bfs.js";
import { topologicalAlgorithm } from "./algorithms/topological.js";
import { dijkstraAlgorithm } from "./algorithms/dijkstra.js";

const ALGORITHMS = {
    'dfs': dfsAlgorithm,
    'bfs': bfsAlgorithm,
    'topo': topologicalAlgorithm,
    'dijkstra': dijkstraAlgorithm
};

let currentAlgorithm = dfsAlgorithm;
let algorithmSteps = []; 
let currentStep = 0;
let isPlaying = false;
let animationTimer = null;
let animationSpeed = 1200; 

let statusEl, finishedVectorEl, queueVectorEl, queueLabelEl, graphInputEl, loadGraphBtn;
let playPauseBtn, prevBtn, nextBtn, resetBtn, speedSlider, algoSelector, startNodeInput;
let modalEl, btnEditGraph, spanCloseModal;
let tabBtns, tabContents;
let currentTab = 'text';

// --- HELPERS GERAIS ---

function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// --- HELPERS DE FORMATAÇÃO ---

function graphToText(graphObj) {
    const keys = Object.keys(graphObj).sort(naturalSort);
    
    const lines = keys.map(key => {
        const neighbors = graphObj[key].map(edge => {
            if (edge.weight === 1) return `"${edge.target}"`;
            return `["${edge.target}", ${edge.weight}]`;
        });
        return `${key}: [${neighbors.join(", ")}]`;
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
    
    const rawObj = JSON.parse(cleanText);
    const normalizedGraph = {};

    for (let key in rawObj) {
        normalizedGraph[key] = rawObj[key].map(item => {
            if (Array.isArray(item)) {
                return { target: item[0].toString(), weight: Number(item[1]) };
            } else {
                return { target: item.toString(), weight: 1 };
            }
        });
    }
    return normalizedGraph;
}

// --- LOCAL STORAGE ---

function saveToLocal(graph, startNode) {
    const data = { graph, startNode };
    localStorage.setItem("graphData", JSON.stringify(data));
}

function loadFromLocal() {
    const data = localStorage.getItem("graphData");
    return data ? JSON.parse(data) : null;
}

// --- RENDERIZAÇÃO ---

function renderStep(index) {
    if (index < 0 || index >= algorithmSteps.length) return;
    
    const step = algorithmSteps[index];

    highlightLine(step.line);
    statusEl.textContent = step.status;
    
    // --- CORREÇÃO DE FORMATAÇÃO AQUI ---
    const finishedList = step.finishedOrder || [];
    if (finishedList.length > 0) {
        // Junta com vírgula e espaço e envolve em chaves
        finishedVectorEl.textContent = `{ ${finishedList.join(', ')} }`;
    } else {
        finishedVectorEl.textContent = "{}";
    }
    
    const queueText = step.queueSnapshot ? step.queueSnapshot.join(', ') : "";
    queueVectorEl.textContent = `[${queueText}]`;
    
    const showWeights = currentAlgorithm.isWeighted || false;

    drawGraph(step.visited, step.finished, step.node, step.distances, showWeights, step.predecessors);
    
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


// --- UI LOGIC ---

function openModal() {
    const currentGraph = graphData.graph;
    graphInputEl.value = graphToText(currentGraph);
    loadGraphToEditor(currentGraph);
    switchTab('text');
    modalEl.style.display = "block";
}

function closeModal() {
    modalEl.style.display = "none";
}

function switchTab(tabName) {
    if (currentTab === 'text' && tabName === 'visual') {
        try {
            const graphFromText = textToGraph(graphInputEl.value);
            loadGraphToEditor(graphFromText);
        } catch (e) {
            alert("Erro de sintaxe no texto. Corrija antes de mudar para o modo visual.");
            return; 
        }
    } else if (currentTab === 'visual' && tabName === 'text') {
        const graphFromVisual = exportGraphFromEditor();
        graphInputEl.value = graphToText(graphFromVisual);
    }

    currentTab = tabName;
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
        if (currentTab === 'text') {
            const rawText = graphInputEl.value;
            newGraph = textToGraph(rawText);
        } else {
            newGraph = exportGraphFromEditor();
        }

        if (typeof newGraph !== 'object' || newGraph === null) throw new Error("Erro: Grafo inválido.");

        const keys = Object.keys(newGraph).sort(naturalSort);
        if (keys.length === 0) throw new Error("O grafo não pode estar vazio.");

        let newStart = startNodeInput.value;
        if (!newGraph[newStart]) newStart = keys[0];

        updateGraphData(newGraph, newStart);
        startNodeInput.value = newStart;
        
        saveToLocal(newGraph, newStart);

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
        saveToLocal(graphData.graph, newStart);
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
    
    // Controle do Label de Finalização/Distância
    const finishedLabelEl = document.querySelector("#finishedBox strong");
    if (currentAlgorithm === dijkstraAlgorithm) {
        if(finishedLabelEl) finishedLabelEl.textContent = "Distâncias Finais:";
        setDirected(false); 
    } else {
        if(finishedLabelEl) finishedLabelEl.textContent = "Ordem de Finalização:";
        if (currentAlgorithm === bfsAlgorithm) {
            setDirected(false);
        } else {
            setDirected(true);
        }
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

    tabBtns = document.querySelectorAll('.tab-btn');
    tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });

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
    
    const savedData = loadFromLocal();
    
    if (savedData) {
        updateGraphData(savedData.graph, savedData.startNode);
        startNodeInput.value = savedData.startNode;
    } else {
        const defaultGraph = {
            "0": [{target:"1", weight:4}, {target:"2", weight:1}],
            "1": [{target:"3", weight:1}],
            "2": [{target:"1", weight:2}, {target:"3", weight:5}],
            "3": []
        };
        updateGraphData(defaultGraph, "0");
        startNodeInput.value = "0";
    }

    setTimeout(() => {
        initializeAnimationData();
        renderStep(0);
    }, 50);
}

document.addEventListener('DOMContentLoaded', initialize);