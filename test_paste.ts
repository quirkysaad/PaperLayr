import { stripExtraBrAndNbsp, formatOriginalContent } from "./src/components/editor/pasteUtils.ts";

const text = `Card for payment :
4440000009900010
05/27

5123450000000008
05/27



Mokafaa:
Mobile number : 220223770`;

console.log("=== KEEP ORIGINAL ===");
console.log(formatOriginalContent("", text));

console.log("=== STRIP EXTRA ===");
console.log(stripExtraBrAndNbsp("", text).content);
