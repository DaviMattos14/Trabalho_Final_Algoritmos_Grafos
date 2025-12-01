import { Circle, CheckCircle } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function OptionsList({ state, answer }) {
  const { isDarkMode } = useOutletContext();
  const [selected, setSelected] = state;
  const correct = answer.correct;
  const options = answer.options;

  const theme = {
    border: isDarkMode ? "#f1f5f9" : "#1e293b",
    bg: isDarkMode ? "#1e293b" : "#f8f9fa",
    text: isDarkMode ? "#f1f5f9" : "#1e293b",
    textSec: isDarkMode ? "#94a3b8" : "#64748b",
    cardBg: isDarkMode ? "#0f172a" : "white",
    cardBorder: isDarkMode ? "#334155" : "#e2e8f0",
    inputBg: isDarkMode ? "#0f172a" : "#ffffff",
    correct: "green",
    error: "red",
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map((opt, index) => {
        const isSelected = JSON.parse(selected).expected === opt;
        const isCorrect = isSelected && JSON.parse(selected).expected === correct;

        return (
          <div
            key={index}
            onClick={() => setSelected(opt)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              padding: 6,
              borderRadius: 6,
              border: isSelected
                ? "2px solid " + (isCorrect ? theme.correct : theme.error)
                : "1px solid " + theme.text,
            }}
          >
            {isSelected ? (
              <CheckCircle
                size={20}
                stroke={isCorrect ? theme.correct : theme.error}
              />
            ) : (
              <Circle size={20} stroke={theme.text} />
            )}

            <span style={{ fontSize: 15, color: theme.text }}>{opt}</span>
          </div>
        );
      })}
    </div>
  );
}
