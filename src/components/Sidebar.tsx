// @ts-nocheck
import { useState } from "react";
import {
  Settings,
  Bell,
  Home,
  File,
  Folder,
  Clock,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  FileText,
  MoreHorizontal,
  Trash2,
  Edit2,
  Star,
  Copy,
  FolderInput,
  ChevronsLeft,
  RefreshCw,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useStore } from "../store";
import { useUpdater } from "../hooks/useUpdater";
import { openUrl } from "@tauri-apps/plugin-opener";

import { Layer } from "../types";
import { useShallow } from "zustand/react/shallow";

export const Sidebar = () => {
  const {
    openTab,
    openInCurrentTab,
    openTabs,
    layers,
    notes,
    selectedLayerId,
    selectedNoteId,
    setSelectedLayer,
    setSelectedNote,
    createLayer,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    deleteLayer,
    renameLayer,
    setSearchOpen,
    openConfirm,
    openLayerModal,
    sidebarWidth,
    setSidebarWidth,
    toggleSidebar,
  } = useStore(useShallow((state) => ({
    openTab: state.openTab,
    openInCurrentTab: state.openInCurrentTab,
    openTabs: state.openTabs,
    layers: state.layers,
    notes: state.notes,
    selectedLayerId: state.selectedLayerId,
    selectedNoteId: state.selectedNoteId,
    setSelectedLayer: state.setSelectedLayer,
    setSelectedNote: state.setSelectedNote,
    createLayer: state.createLayer,
    createNote: state.createNote,
    updateNote: state.updateNote,
    deleteNote: state.deleteNote,
    duplicateNote: state.duplicateNote,
    deleteLayer: state.deleteLayer,
    renameLayer: state.renameLayer,
    setSearchOpen: state.setSearchOpen,
    openConfirm: state.openConfirm,
    openLayerModal: state.openLayerModal,
    sidebarWidth: state.sidebarWidth,
    setSidebarWidth: state.setSidebarWidth,
    toggleSidebar: state.toggleSidebar,
  })));

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(480, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const favoriteNotes = Object.values(notes).filter((n) => n.isFavorite);
  const stickyNotes = Object.values(notes).filter(
    (n) => n.layerId === "stickies",
  );

  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(
    {},
  );

  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editLayerName, setEditLayerName] = useState("");

  const [contextMenuLayerId, setContextMenuLayerId] = useState<string | null>(
    null,
  );
  const [addMenuLayerId, setAddMenuLayerId] = useState<string | null>(null);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteName, setEditNoteName] = useState("");
  const [contextMenuNoteId, setContextMenuNoteId] = useState<string | null>(
    null,
  );
  const [addMenuNoteId, setAddMenuNoteId] = useState<string | null>(null);
  const [showMoveMenuForNoteId, setShowMoveMenuForNoteId] = useState<
    string | null
  >(null);

  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const openMenu = (
    e: React.MouseEvent,
    setter: (id: string | null) => void,
    id: string,
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.left });

    // Close others
    setContextMenuLayerId(null);
    setAddMenuLayerId(null);
    setContextMenuNoteId(null);
    setAddMenuNoteId(null);
    setShowMoveMenuForNoteId(null);

    // Open target
    setter(id);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsMenuPos, setSettingsMenuPos] = useState({ top: 0, left: 0 });
  const { hasUpdate, currentVersion, checkForUpdates } = useUpdater();

  const openSettingsMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setSettingsMenuPos({
      top: rect.bottom + 6,
      left: Math.max(8, rect.left - 180 + rect.width),
    });

    // Close other menus
    setContextMenuLayerId(null);
    setAddMenuLayerId(null);
    setContextMenuNoteId(null);
    setAddMenuNoteId(null);
    setShowMoveMenuForNoteId(null);

    setIsSettingsOpen((prev) => !prev);
  };

  const toggleLayer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateLayer = () => {
    openLayerModal("create");
  };

  const handleCreateNote = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expandedLayers[layerId]) {
      setExpandedLayers((prev) => ({ ...prev, [layerId]: true }));
    }
    const noteId = createNote(layerId, undefined);
    setSelectedLayer(layerId);
    setSelectedNote(noteId);
    setAddMenuLayerId(null);
  };

  const handleCreateNestedNote = (
    layerId: string,
    parentId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!expandedNotes[parentId]) {
      setExpandedNotes((prev) => ({ ...prev, [parentId]: true }));
    }
    const noteId = createNote(layerId, parentId);
    setSelectedLayer(layerId);
    setSelectedNote(noteId);
    setContextMenuNoteId(null);
  };

  const startRenameLayer = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLayerId(layer.id);
    setEditLayerName(layer.name);
    setContextMenuLayerId(null);
  };

  const submitRenameLayer = (id: string) => {
    if (editingLayerId !== id) return;
    if (editLayerName.trim()) {
      renameLayer(id, editLayerName.trim());
    }
    setEditingLayerId(null);
  };

  const handleDeleteLayer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirm(
      "Delete Layer",
      "Are you sure you want to delete this layer and all its contents? This action cannot be undone.",
      () => deleteLayer(id),
    );
    setContextMenuLayerId(null);
  };

  const startRenameNote = (
    noteId: string,
    title: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setEditingNoteId(noteId);
    setEditNoteName(title || "Untitled");
    setContextMenuNoteId(null);
  };

  const submitRenameNote = (id: string) => {
    if (editingNoteId !== id) return;
    updateNote(id, { title: editNoteName.trim() });
    setEditingNoteId(null);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const note = notes[id];
    if (!note) return;

    openConfirm(
      "Delete Note",
      "Are you sure you want to delete this note?",
      () => {
        deleteNote(id);

        // Auto-delete layer if empty
        const layerNotes = Object.values(notes).filter(
          (n) => n.layerId === note.layerId && n.id !== id,
        );
        if (layerNotes.length === 0) {
          deleteLayer(note.layerId);
        } else if (selectedNoteId === id) {
          if (layerNotes.length > 0) {
            setSelectedNote(layerNotes[0].id);
          } else {
            setSelectedLayer(null);
          }
        }
      },
    );
    setContextMenuNoteId(null);
  };

  const handleDuplicateNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNote(id);
    setContextMenuNoteId(null);
  };

  const handleToggleFavorite = (
    id: string,
    isFavorite: boolean,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    updateNote(id, { isFavorite: !isFavorite });
    setContextMenuNoteId(null);
  };

  const handleMoveNote = (noteId: string, newLayerId: string) => {
    // We should move this note to the root of the new layer
    updateNote(noteId, { layerId: newLayerId, parentId: undefined });

    // Also update layerId for all descendant notes to keep them attached
    const updateDescendantsLayer = (parentId: string, newLayer: string) => {
      Object.values(notes)
        .filter((n) => n.parentId === parentId)
        .forEach((child) => {
          updateNote(child.id, { layerId: newLayer });
          updateDescendantsLayer(child.id, newLayer);
        });
    };
    updateDescendantsLayer(noteId, newLayerId);

    setContextMenuNoteId(null);
    setShowMoveMenuForNoteId(null);
  };

  const layerList = Object.values(layers).sort(
    (a, b) => a.createdAt - b.createdAt,
  );

  const renderNoteItem = (
    note: Note,
    sectionName: "favorites" | "stickies" | "default" = "default",
    depth: number = 0,
  ) => {
    const isSpecialSection = sectionName !== "default";
    const contextId = isSpecialSection ? `${sectionName}-${note.id}` : note.id;
    const childNotes = Object.values(notes)
      .filter((n) => n.parentId === note.id)
      .sort((a, b) => a.createdAt - b.createdAt);

    return (
      <div key={contextId} className="relative">
        <div
          onClick={(e) => {
            e.stopPropagation();
            openInCurrentTab(note.id);
          }}
          className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md cursor-pointer text-[14px] font-medium transition-colors ${selectedNoteId === note.id ? "bg-[#E5E7EB] text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <div className="flex items-center gap-1">
            {childNotes.length > 0 && !isSpecialSection && (
              <div
                onClick={(e) => toggleNote(note.id, e)}
                className="p-0.5 hover:bg-gray-200 rounded text-gray-400 -ml-1"
              >
                {expandedNotes[note.id] !== false ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </div>
            )}
            <FileText
              size={14}
              className={
                selectedNoteId === note.id ? "text-gray-600" : "text-gray-400"
              }
              strokeWidth={selectedNoteId === note.id ? 2.5 : 2}
            />
          </div>

          {editingNoteId === note.id && !isSpecialSection ? (
            <input
              autoFocus
              value={editNoteName}
              onChange={(e) => setEditNoteName(e.target.value)}
              onBlur={() => submitRenameNote(note.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRenameNote(note.id);
                if (e.key === "Escape") setEditingNoteId(null);
              }}
              className="flex-1 bg-white text-gray-900 px-1 outline-none rounded border border-gray-300"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate">{note.title || "Untitled"}</span>
          )}

          <div
            className={`flex items-center transition-opacity ${contextMenuNoteId === contextId || addMenuNoteId === contextId ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            {!isSpecialSection && depth < 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addMenuNoteId === contextId
                    ? setAddMenuNoteId(null)
                    : openMenu(e, setAddMenuNoteId, contextId);
                }}
                className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 mr-0.5"
                title="Add nested note"
              >
                <Plus size={14} />
              </button>
            )}
            <button
              onClick={(e) =>
                contextMenuNoteId === contextId
                  ? setContextMenuNoteId(null)
                  : openMenu(e, setContextMenuNoteId, contextId)
              }
              className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Note Context Menu */}
        {contextMenuNoteId === contextId && (
          <div
            className="fixed w-48 bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 z-50 py-1.5"
            style={{ top: menuPos.top, left: menuPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-3 py-1.5 text-[14px] text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 font-medium"
              onClick={(e) => {
                e.stopPropagation();
                openTab(note.id);
                setContextMenuNoteId(null);
              }}
            >
              <Plus size={15} className="text-gray-500" /> Open in new tab
            </button>

            {!isSpecialSection && depth < 1 && (
              <button
                className="w-full text-left px-3 py-1.5 text-[14px] text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  addMenuNoteId === contextId
                    ? setAddMenuNoteId(null)
                    : openMenu(e, setAddMenuNoteId, contextId);
                }}
              >
                <FileText size={15} className="text-gray-500" /> Add nested note
              </button>
            )}

            <button
              className="w-full text-left px-3 py-1.5 text-[14px] text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 font-medium"
              onClick={(e) =>
                handleToggleFavorite(note.id, note.isFavorite || false, e)
              }
            >
              <Star
                size={15}
                className={
                  note.isFavorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-500"
                }
              />{" "}
              {note.isFavorite ? "Remove Favorite" : "Add to Favorite"}
            </button>

            <button
              className="w-full text-left px-3 py-1.5 text-[14px] text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 font-medium"
              onClick={(e) => handleDuplicateNote(note.id, e)}
            >
              <Copy size={15} className="text-gray-500" /> Duplicate
            </button>

            <div className="relative group/move">
              <button
                className="w-full text-left px-3 py-1.5 text-[14px] text-gray-700 hover:bg-gray-50 flex items-center justify-between font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoveMenuForNoteId(
                    showMoveMenuForNoteId === contextId ? null : contextId,
                  );
                }}
              >
                <div className="flex items-center gap-2.5">
                  <FolderInput size={15} className="text-gray-500" /> Move to
                </div>
                <ChevronRight size={14} className="text-gray-400" />
              </button>

              {/* Move Submenu */}
              {showMoveMenuForNoteId === contextId && (
                <div className="absolute left-full top-0 ml-1 w-40 bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-gray-100 py-1.5 z-50">
                  {Object.values(layers).filter((s) => s.id !== note.layerId)
                    .length === 0 ? (
                    <div className="px-3 py-1.5 text-[13px] text-gray-400 italic">
                      No other layers
                    </div>
                  ) : (
                    Object.values(layers)
                      .filter((s) => s.id !== note.layerId)
                      .map((s) => (
                        <button
                          key={s.id}
                          className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-gray-50 text-gray-600 hover:text-gray-900 font-medium truncate transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveNote(note.id, s.id);
                          }}
                        >
                          {s.name}
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>

            <button
              className="w-full text-left px-3 py-1.5 text-[14px] text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 font-medium"
              onClick={(e) => startRenameNote(note.id, note.title, e)}
            >
              <Edit2 size={15} className="text-gray-500" /> Rename
            </button>

            <div className="h-px bg-gray-100 my-1"></div>

            <button
              className="w-full text-left px-3 py-1.5 text-[14px] text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium"
              onClick={(e) => handleDeleteNote(note.id, e)}
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        )}

        {/* Add Note Context Menu */}
        {addMenuNoteId === contextId && (
          <div
            className="fixed w-40 bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 z-50 py-1"
            style={{ top: menuPos.top, left: menuPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-3 py-1.5 text-[14px] text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 font-medium"
              onClick={(e) => {
                handleCreateNestedNote(note.layerId, note.id, e);
                setAddMenuNoteId(null);
              }}
            >
              <FileText size={14} className="text-gray-500" /> Empty Note
            </button>
          </div>
        )}

        {/* Nested children notes */}
        {childNotes.length > 0 &&
          expandedNotes[note.id] !== false &&
          !isSpecialSection && (
            <div className="ml-[16px] pl-2 border-l border-gray-200 mt-0.5 space-y-0.5">
              {childNotes.map((child) =>
                renderNoteItem(child, "default", depth + 1),
              )}
            </div>
          )}
      </div>
    );
  };

  return (
    <div
      className="bg-[#F9FAFB] h-screen flex flex-col border-r border-gray-200 select-none relative flex-shrink-0"
      style={{ width: sidebarWidth }}
    >
      {/* Traffic Lights & Drag Region */}
      <div
        data-tauri-drag-region
        className="h-[48px] w-full flex-shrink-0 drag-region relative"
      ></div>

      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-gray-200 active:bg-gray-300 z-50 transition-colors"
        onMouseDown={startResizing}
      />

      <div className="px-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[15px] text-gray-800">PaperLayr</span>
          <div className="flex items-center gap-1.5 text-gray-500">
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded transition-colors"
              title="Search notes"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <div className="relative">
              <button
                onClick={openSettingsMenu}
                className={`p-1.5 rounded transition-colors relative ${
                  isSettingsOpen
                    ? "text-gray-900 bg-gray-200"
                    : "hover:text-gray-800 hover:bg-gray-100 text-gray-500"
                }`}
                title="Settings & Updates"
              >
                <Settings size={18} strokeWidth={1.5} />
                {hasUpdate && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                )}
              </button>

              {isSettingsOpen && (
                <div
                  className="fixed w-56 bg-white rounded-xl shadow-[0_10px_38px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5 z-50 text-[13px]"
                  style={{ top: settingsMenuPos.top, left: settingsMenuPos.left }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3.5 py-2 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">PaperLayr</div>
                      <div className="text-[11px] text-gray-400">v{currentVersion}</div>
                    </div>
                    {hasUpdate && (
                      <span className="text-[11px] bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles size={10} /> Update
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        checkForUpdates();
                      }}
                      className="w-full text-left px-3.5 py-2 text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCw size={14} className="text-gray-400" />
                        Check for Updates...
                      </span>
                      {hasUpdate && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </button>

                    <button
                      onClick={async () => {
                        setIsSettingsOpen(false);
                        try {
                          await openUrl("https://github.com/quirkysaad/PaperLayr");
                        } catch {
                          window.open("https://github.com/quirkysaad/PaperLayr", "_blank");
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink size={14} className="text-gray-400" />
                        GitHub Repository
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-6">
        {favoriteNotes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-5 mb-2 group">
              <span className="text-[13px] text-gray-400 tracking-wider font-medium">
                FAVORITES
              </span>
            </div>
            <div className="px-3 space-y-0.5">
              {favoriteNotes.map((note) => renderNoteItem(note, "favorites"))}
            </div>
          </div>
        )}

        {stickyNotes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-5 mb-2 group">
              <span className="text-[13px] text-gray-400 tracking-wider font-medium">
                STICKIES
              </span>
            </div>
            <div className="px-3 space-y-0.5">
              {stickyNotes.map((note) => renderNoteItem(note, "stickies"))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-5 mb-2 group">
          <span className="text-[13px] text-gray-400 tracking-wider font-medium">
            LAYERS
          </span>
          <button
            onClick={handleCreateLayer}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>

        {layerList.map((layer) => {
          const isLayerViewActive =
            selectedLayerId === layer.id && !selectedNoteId;
          const isLayerParentActive =
            selectedLayerId === layer.id && !!selectedNoteId;

          let layerClassName =
            "text-gray-600 hover:bg-gray-100 border border-transparent";
          if (isLayerViewActive) {
            layerClassName =
              "bg-[#E5E7EB] text-gray-900 border border-transparent";
          } else if (isLayerParentActive) {
            layerClassName =
              "border border-dashed text-gray-800 bg-gray-50/50 hover:bg-gray-100";
          }

          return (
            <div key={layer.id} className="mb-1">
              <div
                className={`group flex items-center gap-1.5 px-2 py-1 mx-1 rounded-md cursor-pointer text-[15px] font-medium transition-colors ${layerClassName}`}
                style={
                  isLayerParentActive
                    ? { borderColor: layer.accentColor || "#d1d5db" }
                    : undefined
                }
                onClick={(e) => {
                  toggleLayer(layer.id, e);
                  setSelectedLayer(layer.id);
                  setSelectedNote(null);
                }}
              >
                <div className="text-gray-400 mr-0.5">
                  {expandedLayers[layer.id] !== false ? (
                    <ChevronDown size={16} strokeWidth={1.5} />
                  ) : (
                    <ChevronRight size={16} strokeWidth={1.5} />
                  )}
                </div>
                <div
                  className="w-2.5 h-2.5 rounded-full mr-1 flex-shrink-0"
                  style={{ backgroundColor: layer.accentColor || "#d1d5db" }}
                />
                <span className="flex-1 truncate">{layer.name}</span>

                <div
                  className={`flex items-center transition-opacity ${contextMenuLayerId === layer.id || addMenuLayerId === layer.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addMenuLayerId === layer.id
                        ? setAddMenuLayerId(null)
                        : openMenu(e, setAddMenuLayerId, layer.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 mr-0.5"
                    title="Add new note"
                  >
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      contextMenuLayerId === layer.id
                        ? setContextMenuLayerId(null)
                        : openMenu(e, setContextMenuLayerId, layer.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"
                  >
                    <MoreHorizontal size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Add Note Menu */}
              {addMenuLayerId === layer.id && (
                <div
                  className="fixed w-40 bg-white rounded-md shadow-lg border border-gray-100 z-50 py-1"
                  style={{ top: menuPos.top, left: menuPos.left }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={(e) => {
                      handleCreateNote(layer.id, e);
                      setAddMenuLayerId(null);
                    }}
                  >
                    <FileText size={14} /> Empty Note
                  </button>
                </div>
              )}

              {/* Context Menu */}
              {contextMenuLayerId === layer.id && (
                <div
                  className="fixed w-32 bg-white rounded-md shadow-lg border border-gray-100 z-50 py-1"
                  style={{ top: menuPos.top, left: menuPos.left }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLayerModal("edit", layer.id);
                      setContextMenuLayerId(null);
                    }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    className="w-full text-left px-3 py-1.5 text-[13px] text-red-500 hover:bg-gray-50 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLayer(layer.id, e);
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}

              {/* Layer Notes */}
              {expandedLayers[layer.id] !== false && (
                <div className="ml-[22px] pl-2 border-l border-gray-200 my-1 space-y-0.5 pr-2">
                  {Object.values(notes)
                    .filter((n) => n.layerId === layer.id && !n.parentId)
                    .sort((a, b) => a.createdAt - b.createdAt)
                    .map((note) => renderNoteItem(note, "default"))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Click outside context menus */}
      {(contextMenuLayerId ||
        addMenuLayerId ||
        contextMenuNoteId ||
        addMenuNoteId ||
        isSettingsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setContextMenuLayerId(null);
            setAddMenuLayerId(null);
            setContextMenuNoteId(null);
            setAddMenuNoteId(null);
            setShowMoveMenuForNoteId(null);
            setIsSettingsOpen(false);
          }}
        />
      )}
    </div>
  );
};
