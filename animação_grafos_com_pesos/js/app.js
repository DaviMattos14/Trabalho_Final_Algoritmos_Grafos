import { renderPseudoCode, highlightLine } from "./pseudo.js";
import { drawGraph, graphData, updateGraphData, setDirected } from "./graph.js";
import { loadGraphToEditor, exportGraphFromEditor, clearEditor } from "./editor.js";
import { naturalSort, graphToText, textToGraph } from "./utils.js"; // <--- IMPORTAÇÃO CORRETA
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
let directedCheckbox, directedControlContainer;

// --- LOCAL STORAGE ---

function saveToLocal(graph, startNode) {
    const data = { graph, startNode };
    localStorage.setItem("graphData", JSON.stringify(data));
}

function loadFromLocal() {
    try {
        const data = localStorage.getItem("graphData");
        if (!data) return null;
        
        const parsed = JSON.parse(data);
        
        const firstKey = Object.keys(parsed.graph)[0];
        if (firstKey && parsed.graph[firstKey].length > 0) {
            const firstEdge = parsed.graph[firstKey][0];
            if (typeof firstEdge === 'string') {
                console.warn("Migrando dados antigos do LocalStorage...");
                for (let key in parsed.graph) {
                    parsed.graph[key] = parsed.graph[key].map(target => ({ target, weight: 1 }));
                }
            }
        }
        return parsed;
    } catch (e) {
        console.error("Erro ao ler LocalStorage", e);
        return null;
    }
}

// --- RENDERIZAÇÃO ---

function renderStep(index) {
    if (index < 0 || index >= algorithmSteps.length) return;
    
    const step = algorithmSteps[index];

    highlightLine(step.line);
    statusEl.textContent = step.status;
    
    const finishedList = step.finishedOrder || [];
    if (finishedList.length > 0) {
        if (currentAlgorithm === dijkstraAlgorithm) {
             finishedVectorEl.textContent = `{ ${finishedList.join(', ')} }`;
        } else {
             finishedVectorEl.textContent = `[${finishedList.join(', ')}]`;
        }
    } else {
        finishedVectorEl.textContent = currentAlgorithm === dijkstraAlgorithm ? "{}" : "[]";
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
    // Usa função importada de utils.js
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
            // Usa função importada de utils.js
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
            newGraph = textToGraph(graphInputEl.value);
        } else {
            newGraph = exportGraphFromEditor();
        }

        if (typeof newGraph !== 'object' || newGraph === null) throw new Error("Erro: Grafo inválido.");

        // Usa função importada de utils.js
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

// --- LÓGICA DE CONTROLE DE ALGORITMOS E CHECKBOX ---

function onAlgorithmChange(event) {
    const selectedKey = event.target.value;
    currentAlgorithm = ALGORITHMS[selectedKey];
    
    // Controla a visibilidade e o estado padrão do checkbox
    if (currentAlgorithm === dijkstraAlgorithm) {
        directedControlContainer.style.display = "flex";
        directedCheckbox.checked = true;
    } else if (currentAlgorithm === bfsAlgorithm) {
        directedControlContainer.style.display = "none";
        directedCheckbox.checked = false;
    } else {
        directedControlContainer.style.display = "none";
        directedCheckbox.checked = true;
    }
    
    initializeAnimationData();
    reset();
}

function onDirectionChange() {
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
    
    const finishedLabelEl = document.querySelector("#finishedBox strong");
    if (finishedLabelEl) {
        if (currentAlgorithm === dijkstraAlgorithm) finishedLabelEl.textContent = "Distâncias Finais:";
        else finishedLabelEl.textContent = "Ordem de Finalização:";
    }

    const isDirected = directedCheckbox.checked;
    
    setDirected(isDirected);

    algorithmSteps = currentAlgorithm.getSteps(graphData.graph, effectiveStartNode, isDirected);
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
    
    directedCheckbox = document.getElementById("directedCheckbox");
    directedControlContainer = document.getElementById("directedControlContainer");

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
    directedCheckbox.onchange = onDirectionChange;
    
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

    // Configuração inicial correta do checkbox
    algoSelector.value = 'dfs'; 
    onAlgorithmChange({ target: { value: 'dfs' } });

    setTimeout(() => {
        initializeAnimationData();
        renderStep(0);
    }, 50);
}

document.addEventListener('DOMContentLoaded', initialize);