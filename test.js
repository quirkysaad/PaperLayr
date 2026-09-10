const sourceText = `Card for payment :
4440000009900010
05/27

5123450000000008
05/27



Mokafaa:`;

let normalizedText = sourceText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
normalizedText = normalizedText.replace(/^[ \t\u00A0]+$/gm, "");
normalizedText = normalizedText.replace(/\n{3,}/g, "\n\n");
normalizedText = normalizedText.trim();
let lines = normalizedText.split("\n");
console.log(lines.length);
console.log(lines);
