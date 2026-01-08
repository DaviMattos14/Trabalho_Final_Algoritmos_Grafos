import { Edit3 } from "lucide-react";
import useTheme from "./useTheme";

export default function UpdateGraphBar({ 
    handleOpenModal, 
}) {
    const { theme } = useTheme();

    return (
        <div className="control-row" style={{ backgroundColor: theme.panelBg, borderColor: theme.border }}>
            <button onClick={handleOpenModal} className="action-btn" style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <Edit3 size={16} /> Editar Grafo
            </button>
        </div>
    );
}