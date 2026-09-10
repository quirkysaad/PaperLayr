// @ts-nocheck
import { useStore } from "../store";
import { X, Plus, ArrowLeft, ArrowRight } from "lucide-react";

export const TabBar = () => {
  const { openTabs, selectedNoteId, notes, openTab, closeTab, setSearchOpen } =
    useStore();

  return (
    <div
      data-tauri-drag-region
      className="flex items-end px-2 pt-2 bg-[#F1F3F5] drag-region relative shrink-0"
    >
      <div data-tauri-drag-region className="flex-1 flex items-end overflow-x-auto scrollbar-hide pl-2">
        {openTabs.map((tabId) => {
          const note = notes[tabId];
          if (!note) return null;
          const isActive = selectedNoteId === tabId;

          return (
            <div
              key={tabId}
              onClick={() => openTab(tabId)}
              className={`group flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors max-w-[200px] shrink-0 relative ${
                isActive
                  ? "bg-white text-gray-900 font-medium rounded-t-xl tab-active-curve z-10"
                  : "text-gray-500 font-medium hover:bg-[#E5E7EB] rounded-t-lg z-0"
              }`}
            >
              <span className="truncate text-[14px]">
                {note.title || "Untitled"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tabId);
                }}
                className={`p-0.5 rounded-md hover:bg-gray-200 transition-colors ${isActive ? "text-gray-400" : "text-gray-400 opacity-50 hover:opacity-100"}`}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
        <button
          onClick={() => setSearchOpen(true, "newTab")}
          className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-500 ml-2 mb-1.5 shrink-0"
        >
          <Plus size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};
