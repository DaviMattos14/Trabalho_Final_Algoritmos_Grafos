export function renderPseudoCode(lines) {
    const box = document.getElementById("pseudoCode");
    box.innerHTML = "";
    
    lines.forEach((line, index) => {
        const span = document.createElement("span");
        span.textContent = line;
        span.id = `line-${index}`;
        box.appendChild(span);
    });
}

export function highlightLine(index) {
    const spans = document.querySelectorAll("#pseudoCode span");
    spans.forEach(s => s.classList.remove("highlight"));
    const lineToHighlight = document.getElementById(`line-${index}`);
    if (lineToHighlight) lineToHighlight.classList.add("highlight");
}