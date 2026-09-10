---
name: draggable-blocks-context
description: Architectural context for implementing Notion/AppFlowy style draggable blocks using Tiptap and React.
---

# Draggable Blocks Implementation Context

When the user asks to implement draggable blocks (like Notion or AppFlowy) in this project, use this context:

## AppFlowy Architecture Reference
AppFlowy implements draggable blocks by using a custom block-based editor (`appflowy_editor`) and wrapping block action buttons (the six dots) with their native framework's drag-and-drop primitives (Flutter's `Draggable<Node>`). 
During the drag update, they track the cursor position relative to the block bounding boxes to draw a drop indicator.
On drop, they dispatch a transaction to the `EditorState` to `moveNode` from the old path to the new path.

## PaperLayr Implementation Strategy (React + Tiptap)
This project uses **React** and **Tiptap**. Tiptap is a wrapper around ProseMirror, which natively supports block-based documents.

To implement the AppFlowy/Notion style drag-and-drop:
1. **Community Package**: Use the popular `tiptap-extension-global-drag-handle` package.
2. **How it works**: It injects a ProseMirror plugin that tracks mouse hover. When hovered near a block, it absolutely positions a drag handle next to the active block.
3. **Execution**: The drag handle utilizes HTML5 drag-and-drop and maps to ProseMirror's node indices to execute a document node move transaction upon drop.
4. **Alternative**: You can use the official `@tiptap/extension-drag-handle-react` package if deeper customization of the context menu is required.

Always refer to this strategy before attempting to implement drag-and-drop for the Tiptap editor in this workspace.
