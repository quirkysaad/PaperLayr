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
import { useEffect, useState, useRef } from "react";
import { Home, ChevronRight, ChevronsRight, FileText, Pin } from "lucide-react";
import { emit, listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

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
    isSidebarOpen,
    toggleSidebar,
    setSelectedLayer,
    setSelectedNote,
    openInCurrentTab,
  } = useStore();
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

  const editor = useEditor({
    extensions: [
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
    ],
    content: note?.content || "",
    parseOptions: {
      preserveWhitespace: false,
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      updateNote(noteId, { content: newContent });
      emit("sync-note", { noteId, content: newContent, source: "main" });
    },
    editorProps: {
      transformPastedText,
      transformPastedHTML,
      attributes: {
        class: "prose prose-sm sm:prose-base focus:outline-none max-w-none",
      },
      handleDrop: function (view, event, _slice, moved) {
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
      handlePaste: function (_view, event, _slice) {
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
    },
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

  // Update editor content when switching notes or receiving sync event
  useEffect(() => {
    if (editor && note && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content || "");
    }
    if (note) {
      setTitle(note.title);
    }
  }, [noteId, editor]); // intentionally omitted note to prevent loop on every update

  // Reset scroll position when switching notes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [noteId]);

  useEffect(() => {
    const unlistenPromise = listen("sync-note", (event: any) => {
      const { noteId: id, content, source } = event.payload;
      if (id === noteId && source !== "main") {
        if (editor && editor.getHTML() !== content) {
          editor.commands.setContent(content);
          updateNote(noteId, { content });
        }
      }
    });

    return () => {
      unlistenPromise.then((fn) => fn()).catch(console.error);
    };
  }, [editor, noteId]);

  if (!note) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updateNote(noteId, { title: e.target.value });
    emit("sync-title", { noteId, title: e.target.value, source: "main" });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Breadcrumbs Header */}
      <div className="flex-shrink-0 h-12 flex items-center justify-between px-6 bg-white border-b border-transparent">
        <div className="flex items-center gap-1.5 text-[14px] text-gray-500 font-medium">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="mr-2 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Open sidebar (Cmd+.)"
            >
              <ChevronsRight size={16} />
            </button>
          )}
          <div
            className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded transition-colors"
            onClick={() => {
              if (layer) {
                setSelectedLayer(layer.id);
                setSelectedNote(null);
              }
            }}
          >
            <div className="w-5 h-5 bg-purple-100 rounded text-purple-600 flex items-center justify-center">
              <Home size={12} strokeWidth={2.5} />
            </div>
            <span className="text-gray-700">{layer?.name || "Workspace"}</span>
          </div>

          {note.parentId && notes[note.parentId] && (
            <>
              <ChevronRight size={14} className="text-gray-400 mx-0.5" />
              <div
                className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded transition-colors"
                onClick={() => {
                  setSelectedNote(note.parentId!);
                  openInCurrentTab(note.parentId!);
                }}
              >
                <FileText size={14} className="text-gray-400" />
                <span className="text-gray-700 truncate max-w-[150px]">
                  {notes[note.parentId].title || "Untitled"}
                </span>
              </div>
            </>
          )}

          <ChevronRight size={14} className="text-gray-400 mx-0.5" />
          <div className="px-1 py-0.5 text-gray-800 font-semibold truncate max-w-[200px]">
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
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Pin to Desktop"
          >
            <Pin size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto flex flex-col items-center"
      >
        <div className="w-full px-8 pt-8 pb-12 flex flex-col relative min-h-full">
          {/* Title */}
          <input
            className="text-4xl font-bold font-sans text-gray-900 border-none outline-none bg-transparent mb-6 w-full placeholder-gray-300"
            placeholder="Untitled"
            value={title}
            onChange={handleTitleChange}
          />

          {/* Editor */}
          <div className="flex-1 w-full text-gray-900 text-base">
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
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-[440px] p-6 relative z-10 border border-gray-100 font-sans">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Pasted Content Formatting
            </h3>
            <p className="text-[14.5px] text-gray-600 leading-relaxed mb-6">
              Multiple line breaks (
              <code className="px-1 py-0.5 bg-gray-100 rounded text-pink-600 text-xs font-mono">
                &lt;br /&gt;
              </code>
              ) or extra spaces (
              <code className="px-1 py-0.5 bg-gray-100 rounded text-pink-600 text-xs font-mono">
                &amp;nbsp;
              </code>
              ) were detected in the pasted content. Would you like to strip extra spaces?
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={handleKeepOriginal}
                className="px-4 py-2 text-[14px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Keep Original Spaces
              </button>
              <button
                onClick={handleStripSpaces}
                className="px-4 py-2 text-[14px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
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
