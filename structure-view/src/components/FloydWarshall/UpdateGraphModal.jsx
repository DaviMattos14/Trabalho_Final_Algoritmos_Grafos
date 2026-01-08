import GraphEditor from "../Graph/GraphEditor";
import useTheme from "./useTheme";

export default function UpdateGraphModal({ 
    isModalOpen, 
    setIsModalOpen, 
    activeTab, 
    setActiveTab, 
    textInput, 
    setTextInput, 
    handleSaveText, 
    graph, 
    saveGraphFromEditor 
}) {
    const { theme, isDarkMode } = useTheme();

    return isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
            <div className="modal-content" style={{ backgroundColor: theme.panelBg, color: theme.text, borderColor: theme.border }}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                    <h2 style={{margin: 0}}>Editar Grafo</h2>
                    <span className="close-modal" onClick={() => setIsModalOpen(false)} style={{color: theme.textSec}}>&times;</span>
                </div>
                
                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>📝 Texto</button>
                    <button className={`tab-btn ${activeTab === 'visual' ? 'active' : ''}`} onClick={() => setActiveTab('visual')}>🎨 Desenhar</button>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {activeTab === 'text' ? (
                        <div id="tab-text" className="tab-content active">
                            <p className="hint" style={{ color: theme.textSec }}>
                                Formato Ponderado: <b>0: [ ["1", 5], "2" ]</b><br />
                                (Use <b>["Destino", Peso]</b> ou apenas <b>"Destino"</b> para peso 1)
                            </p>
                            <textarea 
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                style={{ 
                                    height: '100%', width: '100%', resize: 'none', fontFamily: 'monospace',
                                    backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border
                                }}
                            ></textarea>
                                <div className="modal-actions">
                                <button onClick={handleSaveText} className="primary-btn">Salvar e Atualizar</button>
                            </div>
                        </div>
                    ) : (
                        <GraphEditor 
                            initialGraph={graph}
                            onSave={(newGraph, newStart) => {
                                saveGraphFromEditor(newGraph, newStart);
                                setIsModalOpen(false);
                            }}
                            onClose={() => setIsModalOpen(false)}
                            isDarkMode={isDarkMode}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
