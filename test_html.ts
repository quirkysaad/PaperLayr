const html = `
<p>Card for payment :</p>
<p>4440000009900010</p>
<p>05/27</p>
<p><br></p>
<p>5123450000000008</p>
<p>05/27</p>
<p><br></p>
<p><br></p>
<p><br></p>
<p>Mokafaa:</p>
`;

let cleaned = html;
const emptyBlockSequenceRegex = /(<(p|div)[^>]*>\s*(?:<br\s*\/?>|&nbsp;|\s)*\s*<\/(?:p|div)>\s*){2,}/gi;
cleaned = cleaned.replace(emptyBlockSequenceRegex, "<p><br /></p>\n");
console.log(cleaned);
