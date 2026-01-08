import { useState } from "react";
import { useGraph } from "../../hooks/useGraph";
import useTheme from "./useTheme";
import { graphToText, textToGraph } from "../../utils/graphUtils";
import MatrixVisualizer from "./MatrixVisualizer";
import RightPanel from "./RightPanel";
import Controls from "../Graph/Controls";
import UpdateGraphModal from "./UpdateGraphModal";
import UpdateGraphBar from "./UpdateGraphBar";




export default function FloydWarshall() {
    const { theme, isDarkMode } = useTheme();    
    
    const {
        graph, isDirected, startNode,
        currentStepData, currentAlgoInfo,
        isPlaying, speed,
        setIsDirected, setSpeed, setIsPlaying,
        stepForward, stepBackward, resetAnimation,
        saveGraphFromEditor
    } = useGraph("floyd");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('text'); 
    const [textInput, setTextInput] = useState('');

    const handleSaveText = () => {
        try {
            const newGraph = textToGraph(textInput);
            const keys = Object.keys(newGraph);
            if (keys.length === 0) throw new Error("O grafo não pode ser vazio");
            let newStart = startNode;
            if (!newGraph[newStart]) newStart = keys[0];
            saveGraphFromEditor(newGraph, newStart);
            setIsModalOpen(false);
        } catch (e) { alert("Erro no formato do JSON: " + e.message); }
    };

    const handleOpenModal = () => {
        setTextInput(graphToText(graph));
        setActiveTab('text'); 
        setIsModalOpen(true);
    };

    return (
        <div 
            className="viz-wrapper" 
            style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.bg }}>
            <div 
                id="container" 
                style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
               <div className="left-column">
                    <UpdateGraphBar handleOpenModal={handleOpenModal} />
                    <div style={{ flex: 1, border: `1px solid ${theme.border}`, borderRadius: '8px', overflow: 'hidden', backgroundColor: theme.panelBg, position: 'relative' }}>
                        <MatrixVisualizer 
                            currentStepData={currentStepData} 
                            theme={theme} 
                            isDarkMode={isDarkMode} 
                        />
                    </div>
               </div>
                <RightPanel 
                    currentAlgoInfo={currentAlgoInfo}
                    currentStepData={currentStepData}
                />
                
            </div>
            {/* 3. Controles */}
            <div style={{ flexShrink: 0 }}>
                <Controls 
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    onStepForward={stepForward}
                    onStepBackward={stepBackward}
                    onReset={resetAnimation}
                    speed={speed}
                    setSpeed={setSpeed}
                    showDirectedControl={currentAlgoInfo?.name?.includes('Dijkstra')}
                    isDirected={isDirected}
                    onToggleDirected={() => setIsDirected(!isDirected)}
                    isDarkMode={isDarkMode} 
                />
            </div>
            <UpdateGraphModal 
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen} 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                textInput={textInput}
                setTextInput={setTextInput}
                handleSaveText={handleSaveText}
                graph={graph}
                saveGraphFromEditor={saveGraphFromEditor}
            />
        </div>
    );
};

