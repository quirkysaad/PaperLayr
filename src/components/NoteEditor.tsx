import { useEditor, EditorContent } from "@tiptap/react";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "./editor/FontSize";
import { EditorBubbleMenu } from "./editor/EditorBubbleMenu";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { CustomImage } from "./editor/CustomImage";
import { useStore } from "../store";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useState, useRef, useMemo } from "react";
import { ChevronRight, FileText, Pin } from "lucide-react";
import { emit } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { SlashCommand } from "./editor/SlashCommand";
import {
  hasMultipleBrOrNbsp,
  stripExtraBrAndNbsp,
  formatOriginalContent,
  transformPastedText,
  transformPastedHTML,
} from "./editor/pasteUtils";

export const NoteEditor = ({ noteId }: { noteId: string }) => {
  const {
    notes,
    layers,
    updateNote,
    setSelectedLayer,
    setSelectedNote,
    openInCurrentTab,
  } = useStore(useShallow((state) => ({
    notes: state.notes,
    layers: state.layers,
    updateNote: state.updateNote,
    setSelectedLayer: state.setSelectedLayer,
    setSelectedNote: state.setSelectedNote,
    openInCurrentTab: state.openInCurrentTab,
  })));
  const note = notes[noteId];
  const layer = note
    ? layers[note.layerId] ||
    (note.layerId === "stickies"
      ? { id: "stickies", name: "Stickies" }
      : null)
    : null;
  const [title, setTitle] = useState(note?.title || "");
  const [pasteModalData, setPasteModalData] = useState<{
    html: string;
    text: string;
  } | null>(null);

  const extensions = useMemo(() => [
    StarterKit,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Placeholder.configure({
      placeholder: "Type '/' for commands",
    }),
    CustomImage.configure({
      allowBase64: true,
      HTMLAttributes: {
        class: "rounded-lg max-w-full",
      },
    }),
    SlashCommand,
    Underline,
    TextStyle,
    Color,
    FontSize,
    Highlight.configure({ multicolor: true }),
  ], []);

  const editorProps = useMemo(() => ({
    transformPastedText,
    transformPastedHTML,
    attributes: {
      class: "prose prose-sm sm:prose-base focus:outline-none max-w-none",
    },
    handleDrop: function (view: any, event: any, _slice: any, moved: any) {
      if (
        !moved &&
        event.dataTransfer &&
        event.dataTransfer.files &&
        event.dataTransfer.files[0]
      ) {
        const file = event.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const { schema } = view.state;
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            const node = schema.nodes.image.create({
              src: e.target?.result as string,
            });
            const transaction = view.state.tr.insert(
              coordinates?.pos || 0,
              node,
            );
            view.dispatch(transaction);
          };
          reader.readAsDataURL(file);
          return true;
        }
      }
      return false;
    },
    handlePaste: function (_view: any, event: any, _slice: any) {
      if (
        event.clipboardData &&
        event.clipboardData.files &&
        event.clipboardData.files[0]
      ) {
        const file = event.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const { schema } = _view.state;
            const node = schema.nodes.image.create({
              src: e.target?.result as string,
            });
            const transaction = _view.state.tr.replaceSelectionWith(node);
            _view.dispatch(transaction);
          };
          reader.readAsDataURL(file);
          return true;
        }
      }

      const html = event.clipboardData?.getData("text/html") || "";
      const text = event.clipboardData?.getData("text/plain") || "";

      if (hasMultipleBrOrNbsp(html, text)) {
        event.preventDefault();
        setPasteModalData({ html, text });
        return true;
      }

      return false;
    },
  }), []);

  const editor = useEditor({
    extensions,
    content: note?.content || "",
    parseOptions: {
      preserveWhitespace: false,
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      updateNote(noteId, { content: newContent });
      emit("sync-note", { noteId, content: newContent, source: getCurrentWindow().label });
    },
    editorProps,
  });

  const handleStripSpaces = () => {
    if (!pasteModalData || !editor) return;
    const { content } = stripExtraBrAndNbsp(
      pasteModalData.html,
      pasteModalData.text
    );
    editor.commands.insertContent(content);
    setPasteModalData(null);
  };

  const handleKeepOriginal = () => {
    if (!pasteModalData || !editor) return;
    const content = formatOriginalContent(
      pasteModalData.html,
      pasteModalData.text
    );
    editor.commands.insertContent(content);
    setPasteModalData(null);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  // Update editor content when switching notes or receiving sync event from Zustand
  useEffect(() => {
    if (editor && note && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content || "");
    }
  }, [noteId, editor, note?.content]);

  useEffect(() => {
    if (note && title !== note.title) {
      setTitle(note.title);
    }
  }, [note?.title]);

  // Reset scroll position when switching notes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [noteId]);

  if (!note) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updateNote(noteId, { title: e.target.value });
    emit("sync-title", { noteId, title: e.target.value, source: getCurrentWindow().label });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Breadcrumbs Header */}
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-1 bg-white border-b border-zinc-100 select-none">
        <div className="flex items-center gap-1.5 text-[13px] text-zinc-500 font-medium">
          <div
            className="flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100/70 px-2 py-1 rounded-md transition-colors"
            onClick={() => {
              if (layer) {
                setSelectedLayer(layer.id);
                setSelectedNote(null);
              }
            }}
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: layer?.accentColor ? `${layer.accentColor}25` : '#f4f4f5',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: layer?.accentColor || '#71717a' }}
              />
            </div>
            <span className="text-zinc-700 font-medium">{layer?.name || "Workspace"}</span>
          </div>

          {note.parentId && notes[note.parentId] && (
            <>
              <ChevronRight size={13} className="text-zinc-300 mx-0.5" />
              <div
                className="flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100/70 px-2 py-1 rounded-md transition-colors"
                onClick={() => {
                  setSelectedNote(note.parentId!);
                  openInCurrentTab(note.parentId!);
                }}
              >
                <FileText size={13} className="text-zinc-400" />
                <span className="text-zinc-700 truncate max-w-[160px]">
                  {notes[note.parentId].title || "Untitled"}
                </span>
              </div>
            </>
          )}

          <ChevronRight size={13} className="text-zinc-300 mx-0.5" />
          <div className="px-2 py-1 text-zinc-900 font-semibold truncate max-w-[220px]">
            {note.title || "Untitled"}
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={async () => {
              const widgetLabel = `widget-${noteId}`;
              const existing = await WebviewWindow.getByLabel(widgetLabel);
              if (existing) {
                await existing.unminimize();
                await existing.setFocus();
                return;
              }
              const widgetWindow = new WebviewWindow(widgetLabel, {
                url: `/?widget=${noteId}`,
                title: note.title || "Widget",
                width: 352,
                height: 432,
                transparent: true,
                decorations: false,
                alwaysOnTop: true,
                skipTaskbar: true,
                shadow: false,
                backgroundColor: [0, 0, 0, 0],
              });

              widgetWindow.once("tauri://created", () => {
                console.log("Widget window successfully created");
              });
              widgetWindow.once("tauri://error", (e) => {
                console.error("Error creating widget window:", e);
              });
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            title="Pin note to desktop as widget"
          >
            <Pin size={13} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto flex flex-col items-center"
      >
        <div className="w-full max-w-3xl px-8 pt-10 pb-20 flex flex-col relative min-h-full">
          {/* Title */}
          <input
            className="text-3xl sm:text-4xl font-bold font-sans text-zinc-900 border-none outline-none bg-transparent mb-6 w-full placeholder-zinc-300 tracking-tight"
            placeholder="Untitled"
            value={title}
            onChange={handleTitleChange}
          />

          {/* Editor */}
          <div className="flex-1 w-full text-zinc-900 text-base">
            {editor && <EditorBubbleMenu editor={editor} />}
            <EditorContent editor={editor} className="min-h-full" />
          </div>
        </div>
      </div>

      {/* Paste Options Modal */}
      {pasteModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={handleKeepOriginal}
          />
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)] w-[420px] p-6 relative z-10 border border-zinc-100 font-sans">
            <h3 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">
              Pasted Content Formatting
            </h3>
            <p className="text-[14px] text-zinc-600 leading-relaxed mb-6">
              Multiple line breaks (
              <code className="px-1 py-0.5 bg-zinc-100 rounded text-pink-600 text-xs font-mono">
                &lt;br /&gt;
              </code>
              ) or extra spaces (
              <code className="px-1 py-0.5 bg-zinc-100 rounded text-pink-600 text-xs font-mono">
                &amp;nbsp;
              </code>
              ) were detected in the pasted content. Would you like to strip extra spaces?
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={handleKeepOriginal}
                className="px-3.5 py-2 text-[13px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
              >
                Keep Original Spaces
              </button>
              <button
                onClick={handleStripSpaces}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Strip Extra Spaces
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
