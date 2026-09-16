import { useEffect, useRef, useState, useMemo } from "react";
import { useStore } from "../store";
import { useShallow } from "zustand/react/shallow";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { CustomImage } from "./editor/CustomImage";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { X, GripHorizontal } from "lucide-react";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { SlashCommand } from "./editor/SlashCommand";
import { FontSize } from "./editor/FontSize";
import { emit } from "@tauri-apps/api/event";
import {
  hasMultipleBrOrNbsp,
  stripExtraBrAndNbsp,
  formatOriginalContent,
  transformPastedText,
  transformPastedHTML,
} from "./editor/pasteUtils";

export const Widget = ({
  noteId,
  isSticky,
}: {
  noteId?: string;
  isSticky?: boolean;
}) => {
  const { notes, updateNote } = useStore(useShallow((state) => ({
    notes: state.notes,
    updateNote: state.updateNote,
  })));
  const note = noteId ? notes[noteId] : null;
  const [title, setTitle] = useState(note?.title || "");
  const [pasteModalData, setPasteModalData] = useState<{
    html: string;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (note) setTitle(note.title);
  }, [note?.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (noteId) {
      updateNote(noteId, { title: e.target.value });
      emit("sync-title", {
        noteId,
        title: e.target.value,
        source: getCurrentWindow().label,
      });
    }
  };
  useEffect(() => {
    document.documentElement.classList.add("is-widget");
    document.body.classList.add("is-widget");
    return () => {
      document.documentElement.classList.remove("is-widget");
      document.body.classList.remove("is-widget");
    };
  }, []);

  const extensions = useMemo(() => [
    StarterKit,
    TaskList,
    TaskItem.configure({ nested: true }),
    CustomImage.configure({
      allowBase64: true,
      HTMLAttributes: { class: "rounded-lg max-w-full" },
    }),
    Placeholder.configure({ placeholder: "Type '/' for commands" }),
    SlashCommand,
    Underline,
    TextStyle,
    FontSize,
  ], []);

  const editorProps = useMemo(() => ({
    transformPastedText,
    transformPastedHTML,
    attributes: {
      class: "prose prose-sm focus:outline-none max-w-none text-sm",
    },
    handlePaste: function (_view: any, event: any, _slice: any) {
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
      if (noteId) {
        const newContent = editor.getHTML();
        updateNote(noteId, { content: newContent });
        emit("sync-note", {
          noteId,
          content: newContent,
          source: getCurrentWindow().label,
        });
      }
    },
    editorProps,
  });

  const handleStripSpaces = () => {
    if (!pasteModalData || !editor) return;
    const { content } = stripExtraBrAndNbsp(
      pasteModalData.html,
      pasteModalData.text,
    );
    editor.commands.insertContent(content);
    setPasteModalData(null);
  };

  const handleKeepOriginal = () => {
    if (!pasteModalData || !editor) return;
    const content = formatOriginalContent(
      pasteModalData.html,
      pasteModalData.text,
    );
    editor.commands.insertContent(content);
    setPasteModalData(null);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editor && note && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content || "");
    }
  }, [editor, note?.content]);

  useEffect(() => {
    if (note && title !== note.title) {
      setTitle(note.title);
    }
  }, [note?.title]);

  if (noteId && !note) {
    return (
      <div
        className="w-full h-full bg-white border border-zinc-200/80 p-4 flex items-center justify-center text-zinc-500 text-sm rounded-2xl"
        data-tauri-drag-region
      >
        Note not found or deleted.
        <button
          onClick={() => getCurrentWindow().close()}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen p-3 bg-transparent box-border flex flex-col select-none">
      <div className="flex-1 w-full bg-white rounded-2xl border border-zinc-200/80 flex flex-col overflow-hidden transition-all duration-200">
        {/* Widget Header (Drag region) */}
        <div
          data-tauri-drag-region
          className="flex-shrink-0 h-10 flex items-center justify-between px-3.5 border-b border-zinc-100 bg-zinc-50/80 z-10 rounded-t-2xl"
        >
          <div
            data-tauri-drag-region
            className="flex items-center gap-2 text-zinc-400 cursor-grab active:cursor-grabbing w-full"
          >
            <GripHorizontal size={14} className="pointer-events-none text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-700 truncate pointer-events-none tracking-tight">
              {title || (isSticky ? "Sticky" : "Untitled")}
            </span>
          </div>
          <button
            onClick={() => getCurrentWindow().close()}
            className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 p-1 rounded-md transition-colors ml-2 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Widget Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 custom-scrollbar"
        >
          <input
            className="text-xl sm:text-2xl font-bold font-sans text-zinc-900 border-none outline-none bg-transparent mb-3 w-full placeholder-zinc-300 tracking-tight"
            placeholder={isSticky ? "Sticky" : "Untitled"}
            value={title}
            onChange={handleTitleChange}
          />
          <EditorContent editor={editor} />
        </div>

        {/* Save Sticky Button */}
        {isSticky && (
          <div className="flex-shrink-0 p-3 border-t border-zinc-100 bg-zinc-50/50 flex justify-end rounded-b-2xl">
            <button
              onClick={async () => {
                if (!noteId) {
                  await emit("save-sticky", {
                    title: title || "Sticky",
                    content: editor?.getHTML() || "",
                  });
                }
                await getCurrentWindow().close();
              }}
              className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Save Sticky
            </button>
          </div>
        )}
      </div>

      {/* Paste Options Modal */}
      {pasteModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={handleKeepOriginal} />
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)] w-[360px] p-5 relative z-10 border border-zinc-100 font-sans">
            <h3 className="text-base font-bold text-zinc-900 mb-2 tracking-tight">
              Formatting Options
            </h3>
            <p className="text-[13px] text-zinc-600 leading-relaxed mb-5">
              Extra line breaks or spacing were detected in your pasted text. Would you like to strip them?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleKeepOriginal}
                className="px-3 py-1.5 text-[12px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
              >
                Keep
              </button>
              <button
                onClick={handleStripSpaces}
                className="px-3 py-1.5 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Strip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
