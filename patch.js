const fs = require('fs');
let code = fs.readFileSync('src/components/NoteEditor.tsx', 'utf-8');

// Imports
code = code.replace(
  'import { useEditor, EditorContent } from "@tiptap/react";',
  'import { useEditor, EditorContent } from "@tiptap/react";\nimport Underline from "@tiptap/extension-underline";\nimport TextStyle from "@tiptap/extension-text-style";\nimport { FontSize } from "./editor/FontSize";\nimport { EditorBubbleMenu } from "./editor/EditorBubbleMenu";'
);

// Extensions
code = code.replace(
  '      SlashCommand,',
  '      SlashCommand,\n      Underline,\n      TextStyle,\n      FontSize,'
);

// Default text size text-lg -> text-base
code = code.replace(
  'className="flex-1 w-full text-gray-900 text-lg"',
  'className="flex-1 w-full text-gray-900 text-base"'
);

// EditorBubbleMenu component
code = code.replace(
  '<EditorContent editor={editor} className="min-h-full" />',
  '<EditorBubbleMenu editor={editor!} />\n            <EditorContent editor={editor} className="min-h-full" />'
);

fs.writeFileSync('src/components/NoteEditor.tsx', code);
console.log("Patched NoteEditor.tsx");
