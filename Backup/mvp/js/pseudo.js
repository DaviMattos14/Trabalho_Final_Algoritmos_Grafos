export function renderPseudoCode(lines) {
    const box = document.getElementById("pseudoCode");
    box.innerHTML = "";
    
    lines.forEach((line, index) => {
        const span = document.createElement("span");
        span.textContent = line;
        span.id = `line-${index}`; // IDs de 0 a N
        box.appendChild(span);
    });
}

export function highlightLine(index) {
    const spans = document.querySelectorAll("#pseudoCode span");
    spans.forEach(s => s.classList.remove("highlight"));
    
    // O índice -1 (para estados sem linha) não destacará nada
    const lineToHighlight = document.getElementById(`line-${index}`);
    if (lineToHighlight) {
        lineToHighlight.classList.add("highlight");
    }
}