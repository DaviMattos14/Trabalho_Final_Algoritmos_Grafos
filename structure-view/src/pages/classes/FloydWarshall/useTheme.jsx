import { useOutletContext } from "react-router-dom";


export default function useTheme() {
    const context = useOutletContext();
    const isDarkMode = context ? context.isDarkMode : false;

    return {
        theme: {
            bg: isDarkMode ? '#0f172a' : '#f0f2f5',
            panelBg: isDarkMode ? '#1e293b' : '#ffffff',
            text: isDarkMode ? '#f1f5f9' : '#1e293b',
            textSec: isDarkMode ? '#94a3b8' : '#64748b',
            border: isDarkMode ? '#556e92ff' : '#e5e7eb',
            inputBg: isDarkMode ? '#0f172a' : '#f9fafb',
            cardBg: isDarkMode ? '#1e293b' : '#ffffff',
            codeBg: isDarkMode ? '#0f172a' : '#f8fafc',
        },
        isDarkMode
    };
}