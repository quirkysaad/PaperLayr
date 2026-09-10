import { generateJSON } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';

const html = '<p>Line 1</p><p><br /></p><p>Line 2</p>';
const json = generateJSON(html, [StarterKit]);
console.log(JSON.stringify(json, null, 2));

const html2 = '<p>Line 1</p><p></p><p>Line 2</p>';
const json2 = generateJSON(html2, [StarterKit]);
console.log("Empty paragraph:", JSON.stringify(json2, null, 2));
