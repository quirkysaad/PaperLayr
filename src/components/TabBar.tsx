// @ts-nocheck
import { useStore } from "../store";
import { useShallow } from "zustand/react/shallow";
import { X, Plus, FileText } from "lucide-react";

export const TabBar = () => {
  const { openTabs, selectedNoteId, notes, layers, openTab, closeTab, setSearchOpen } =
    useStore(useShallow((state) => ({
      openTabs: state.openTabs,
      selectedNoteId: state.selectedNoteId,
      notes: state.notes,
      layers: state.layers,
      openTab: state.openTab,
      closeTab: state.closeTab,
      setSearchOpen: state.setSearchOpen,
    })));

  return (
    <div
      data-tauri-drag-region
      className="h-[44px] flex items-center px-2 bg-[#F8F9FA] border-b border-zinc-200/80 drag-region shrink-0 select-none overflow-hidden"
    >
      <div data-tauri-drag-region className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {openTabs.map((tabId) => {
          const note = notes[tabId];
          if (!note) return null;
          const isActive = selectedNoteId === tabId;
          const layer = layers[note.layerId];

          return (
            <div
              key={tabId}
              onClick={() => openTab(tabId)}
              className={`group flex items-center gap-2 h-[32px] px-2.5 cursor-pointer transition-all max-w-[210px] rounded-lg relative ${isActive
                ? "bg-white text-zinc-900 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]"
                : "text-zinc-500 font-medium hover:text-zinc-800 hover:bg-zinc-200/50"
                }`}
            >
              {layer?.accentColor ? (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: layer.accentColor }}
                />
              ) : (
                <FileText size={13} className="shrink-0 text-zinc-400" />
              )}

              <span className="truncate text-[13px] tracking-tight flex-1">
                {note.title || "Untitled"}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tabId);
                }}
                className={`p-0.5 rounded-md hover:bg-zinc-200/80 transition-all ${isActive
                  ? "text-zinc-400 hover:text-zinc-700 opacity-60 hover:opacity-100"
                  : "text-zinc-400 hover:text-zinc-700 opacity-0 group-hover:opacity-100"
                  }`}
                title="Close tab"
              >
                <X size={13} strokeWidth={2} />
              </button>
            </div>
          );
        })}

        <button
          onClick={() => setSearchOpen(true, "newTab")}
          className="h-[30px] w-[30px] flex items-center justify-center hover:bg-zinc-200/70 rounded-lg transition-colors text-zinc-500 hover:text-zinc-800 shrink-0 cursor-pointer"
          title="Open note in new tab (Cmd+K)"
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
