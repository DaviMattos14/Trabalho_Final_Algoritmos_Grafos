export function renderPseudoCode(lines) {
    const box = document.getElementById("pseudoCode");
    if (!box) return; // Segurança
    
    box.innerHTML = "";
    
    lines.forEach((line, index) => {
        // Usamos div para garantir quebra de linha
        const lineContainer = document.createElement("div");
        lineContainer.textContent = line;
        lineContainer.id = `line-${index}`;
        
        // Estilo base para garantir alinhamento
        lineContainer.style.padding = "2px 4px";
        lineContainer.style.fontFamily = "monospace";
        
        box.appendChild(lineContainer);
    });
}

export function highlightLine(index) {
    // Remove de todos
    const allLines = document.querySelectorAll("#pseudoCode div");
    allLines.forEach(el => {
        el.style.backgroundColor = "transparent";
        el.style.fontWeight = "normal";
    });
    
    // Adiciona no atual
    const lineToHighlight = document.getElementById(`line-${index}`);
    if (lineToHighlight) {
        lineToHighlight.style.backgroundColor = "#fef08a"; // Amarelo
        lineToHighlight.style.fontWeight = "bold";
    }
}