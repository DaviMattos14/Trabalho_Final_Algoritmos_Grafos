import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateLayout } from '../utils/layout';
import { naturalSort } from '../utils/graphUtils';

// Importa Algoritmos
import { dfsAlgorithm } from '../algorithms/dfs';
import { bfsAlgorithm } from '../algorithms/bfs';
import { dijkstraAlgorithm } from '../algorithms/dijkstra';
import { topologicalAlgorithm } from '../algorithms/topological';

const ALGORITHMS = {
    'dfs': dfsAlgorithm,
    'bfs': bfsAlgorithm,
    'dijkstra': dijkstraAlgorithm,
    'topo': topologicalAlgorithm
};

const DEFAULT_GRAPH = {
    "0": [{target:"1", weight:4}, {target:"2", weight:1}],
    "1": [{target:"3", weight:1}],
    "2": [{target:"1", weight:2}, {target:"3", weight:5}],
    "3": []
};

const STORAGE_KEY = "structureView_session";

// --- HELPER DE CARREGAMENTO SÍNCRONO ---
const loadState = () => {
    try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error("Erro ao ler sessão:", e);
        return null;
    }
};

export const useGraph = (initialAlgo = 'dfs') => {
    // Lê o storage UMA VEZ no início
    const savedData = loadState();

    // --- ESTADO COM INICIALIZAÇÃO PREGUIÇOSA ---
    
    const [graph, setGraph] = useState(() => {
        return savedData?.graph || DEFAULT_GRAPH;
    });

    const [startNode, setStartNode] = useState(() => {
        return savedData?.startNode || "0";
    });

    const [isDirected, setIsDirected] = useState(() => {
        return savedData?.isDirected !== undefined ? savedData.isDirected : true;
    });

    // Posições: Se não tiver salvo, calcula agora mesmo
    const [positions, setPositions] = useState(() => {
        if (savedData?.positions && Object.keys(savedData.positions).length > 0) {
            return savedData.positions;
        }
        // Fallback: Calcula layout inicial
        const g = savedData?.graph || DEFAULT_GRAPH;
        const s = savedData?.startNode || "0";
        return calculateLayout(g, s);
    });

    const [algorithmKey, setAlgorithmKey] = useState(initialAlgo);
    
    // Estado da Animação (Não precisa persistir)
    const [history, setHistory] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);

    const timerRef = useRef(null);

    // Sincroniza URL com Estado
    useEffect(() => {
        setAlgorithmKey(initialAlgo);
    }, [initialAlgo]);

    // --- PERSISTÊNCIA (Save) ---
    // Salva automaticamente a cada mudança crítica
    useEffect(() => {
        const dataToSave = {
            graph,
            startNode,
            isDirected,
            positions
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }, [graph, startNode, isDirected, positions]);


    // --- CONTROLE DE DIREÇÃO AUTOMÁTICO ---
    useEffect(() => {
        // Só altera se o algoritmo mudar e não tivermos uma preferência salva explícita?
        // Para simplificar UX: BFS força não-direcionado, outros forçam direcionado
        // Mas respeitamos o valor salvo na carga inicial (o useEffect roda após o render)
        
        if (algorithmKey === 'bfs') {
            setIsDirected(false); 
        } else {
            setIsDirected(true);
        }
    }, [algorithmKey]);


    // --- EXECUÇÃO DO ALGORITMO ---
    useEffect(() => {
        const algo = ALGORITHMS[algorithmKey];
        if (!algo) return;

        const keys = Object.keys(graph).sort(naturalSort);
        const effectiveStart = graph[startNode] ? startNode : keys[0];
        
        if (effectiveStart !== startNode && keys.length > 0) {
            setStartNode(effectiveStart); 
            return;
        }
        
        if (effectiveStart) {
            const steps = algo.getSteps(graph, effectiveStart, isDirected);
            setHistory(steps);
            setCurrentStepIndex(0);
            setIsPlaying(false); 
        }
    }, [graph, startNode, algorithmKey, isDirected]);


    // --- CONTROLES DE PLAYBACK ---
    const stepForward = useCallback(() => {
        setCurrentStepIndex(prev => Math.min(prev + 1, history.length - 1));
    }, [history.length]);

    const stepBackward = useCallback(() => {
        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
    }, []);

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setTimeout(() => {
                if (currentStepIndex < history.length - 1) {
                    stepForward();
                } else {
                    setIsPlaying(false);
                }
            }, 2100 - speed); 
        }
        return () => clearTimeout(timerRef.current);
    }, [isPlaying, currentStepIndex, history.length, speed, stepForward]);


    // --- AÇÕES DO USUÁRIO ---
    const resetAnimation = () => {
        setIsPlaying(false);
        setCurrentStepIndex(0);
    };

    const updateNodePosition = (id, x, y) => {
        setPositions(prev => ({
            ...prev,
            [id]: { x, y }
        }));
    };

    const saveGraphFromEditor = (newGraph, newStart) => {
        setGraph(newGraph);
        if(newStart) setStartNode(newStart);
        
        const newLayout = calculateLayout(newGraph, newStart || startNode);
        setPositions(newLayout);
        
        resetAnimation();
    };

    const currentStepData = history[currentStepIndex] || {};
    const currentAlgoInfo = ALGORITHMS[algorithmKey];

    return {
        graph,
        positions,
        history,
        currentStepData,
        currentAlgoInfo,
        
        startNode,
        isDirected,
        isPlaying,
        speed,
        currentStepIndex,
        totalSteps: history.length,

        setAlgorithm: setAlgorithmKey,
        setStartNode,
        setIsDirected,
        setSpeed,
        setIsPlaying,
        
        stepForward,
        stepBackward,
        resetAnimation,
        updateNodePosition,
        saveGraphFromEditor
    };
};