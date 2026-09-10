import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const editor = new Editor({
  extensions: [StarterKit],
  content: '<p>Initial</p>',
  onUpdate: () => {
    console.log('Update triggered');
  }
});

editor.commands.setContent('<p>New content</p>');
