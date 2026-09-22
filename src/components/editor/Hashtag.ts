import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

const HASHTAG_REGEX = /(?:^|\s)(#[\w-]+)/g;

function findHashtags(doc: ProseMirrorNode): Decoration[] {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    // Only apply to text nodes
    if (node.isText && node.text) {
      // Don't apply inside code blocks or links if we can avoid it.
      // We can check node.marks for code or link marks.
      const hasCodeOrLink = node.marks.some(
        (mark) => mark.type.name === 'code' || mark.type.name === 'link'
      );
      
      if (!hasCodeOrLink) {
        let match;
        // reset regex state just in case
        HASHTAG_REGEX.lastIndex = 0;
        while ((match = HASHTAG_REGEX.exec(node.text)) !== null) {
          const hashtag = match[1];
          const start = pos + match[0].indexOf(hashtag);
          const end = start + hashtag.length;

          decorations.push(
            Decoration.inline(start, end, {
              class: 'text-blue-600 bg-blue-100 px-1 py-0.5 rounded-md font-medium cursor-pointer',
              'data-hashtag': hashtag,
            })
          );
        }
      }
    }
  });

  return decorations;
}

export const Hashtag = Extension.create({
  name: 'hashtag',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('hashtag'),
        state: {
          init(_, { doc }) {
            return DecorationSet.create(doc, findHashtags(doc));
          },
          apply(tr, old) {
            if (!tr.docChanged) {
              return old.map(tr.mapping, tr.doc);
            }
            return DecorationSet.create(tr.doc, findHashtags(tr.doc));
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
