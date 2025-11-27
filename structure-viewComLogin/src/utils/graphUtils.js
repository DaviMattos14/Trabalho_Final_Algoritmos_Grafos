// Ordenação Natural: Funciona para "1", "2", "10" e "A", "B"
export function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// Converte Objeto Interno -> Texto para o Usuário (Formatação bonita)
export function graphToText(graphObj) {
    const keys = Object.keys(graphObj).sort(naturalSort);
    
    const lines = keys.map(key => {
        // Mapeia vizinhos: Se peso for 1, mostra só "B". Se for >1, mostra ["B", 5]
        const neighbors = graphObj[key].map(edge => {
            if (edge.weight === 1) return `"${edge.target}"`;
            return `["${edge.target}", ${edge.weight}]`;
        });
        return `${key}: [${neighbors.join(", ")}]`;
    });

    return lines.join(',\n');
}

// Converte Texto do Usuário -> Objeto Interno Normalizado {target, weight}
export function textToGraph(text) {
    let cleanText = text.trim();
    
    // Remove vírgula final solta para evitar erro de JSON
    cleanText = cleanText.replace(/,(\s*)$/, '$1');

    // Adiciona chaves externas se o usuário esqueceu
    if (!cleanText.startsWith('{')) {
        cleanText = '{' + cleanText + '}';
    }

    // Regex para colocar aspas em chaves numéricas ou strings simples (ex: 0: -> "0":)
    cleanText = cleanText.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
    
    const rawObj = JSON.parse(cleanText);
    const normalizedGraph = {};

    // Normaliza tudo para: { target: "String", weight: Number }
    for (let key in rawObj) {
        normalizedGraph[key] = rawObj[key].map(item => {
            if (Array.isArray(item)) {
                // Formato ["B", 10]
                return { target: item[0].toString(), weight: Number(item[1]) };
            } else if (typeof item === 'object' && item.target) {
                // Já está no formato interno (segurança)
                return item;
            } else {
                // Formato "B" (Assume peso 1)
                return { target: item.toString(), weight: 1 };
            }
        });
    }
    return normalizedGraph;
}