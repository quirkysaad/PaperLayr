import { generateJSON } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';

const text = "A\nB\n\nC\n\n\nD";
const json = generateJSON(text, [StarterKit]);
console.log(JSON.stringify(json, null, 2));
