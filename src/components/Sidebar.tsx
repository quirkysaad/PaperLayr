// @ts-nocheck
import { useState, useMemo } from "react";
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

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    Object.values(notes).forEach(note => {
      if (note.tags && note.tags.length > 0) {
        note.tags.forEach(t => tags.add(t));
      } else if (note.content) {
        const textContent = note.content.replace(/<[^>]*>?/gm, ' ');
        const regex = /(?:^|\s)(#[\w-]+)/g;
        let match;
        while ((match = regex.exec(textContent)) !== null) {
          tags.add(match[1].toLowerCase());
        }
      }
    });
    return Array.from(tags).sort();
  }, [notes]);

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
          className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-[13px] font-medium transition-all ${
            selectedNoteId === note.id
              ? "bg-zinc-200/80 text-zinc-900 font-semibold shadow-xs"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70"
          }`}
        >
          <div className="flex items-center gap-1">
            {childNotes.length > 0 && !isSpecialSection && (
              <div
                onClick={(e) => toggleNote(note.id, e)}
                className="p-0.5 hover:bg-zinc-200 rounded text-zinc-400 -ml-1 transition-colors"
              >
                {expandedNotes[note.id] !== false ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
              </div>
            )}
            <FileText
              size={14}
              className={
                selectedNoteId === note.id ? "text-zinc-700" : "text-zinc-400"
              }
              strokeWidth={selectedNoteId === note.id ? 2.2 : 1.8}
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
              className="flex-1 bg-white text-zinc-900 px-1.5 py-0.5 text-[13px] outline-none rounded border border-blue-500 shadow-xs ring-2 ring-blue-500/20"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate tracking-tight">{note.title || "Untitled"}</span>
          )}

          <div
            className={`flex items-center transition-opacity ${
              contextMenuNoteId === contextId || addMenuNoteId === contextId
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {!isSpecialSection && depth < 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addMenuNoteId === contextId
                    ? setAddMenuNoteId(null)
                    : openMenu(e, setAddMenuNoteId, contextId);
                }}
                className="p-1 hover:bg-zinc-200/80 rounded text-zinc-400 hover:text-zinc-700 mr-0.5 transition-colors"
                title="Add nested note"
              >
                <Plus size={13} strokeWidth={2} />
              </button>
            )}
            <button
              onClick={(e) =>
                contextMenuNoteId === contextId
                  ? setContextMenuNoteId(null)
                  : openMenu(e, setContextMenuNoteId, contextId)
              }
              className="p-1 hover:bg-zinc-200/80 rounded text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <MoreHorizontal size={13} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Note Context Menu */}
        {contextMenuNoteId === contextId && (
          <div
            className="fixed w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.06)] z-50 p-1"
            style={{ top: menuPos.top, left: menuPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-2.5 py-1.5 text-[13px] text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2.5 font-medium transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openTab(note.id);
                setContextMenuNoteId(null);
              }}
            >
              <Plus size={14} className="text-zinc-400" /> Open in new tab
            </button>

            {!isSpecialSection && depth < 1 && (
              <button
                className="w-full text-left px-2.5 py-1.5 text-[13px] text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2.5 font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  addMenuNoteId === contextId
                    ? setAddMenuNoteId(null)
                    : openMenu(e, setAddMenuNoteId, contextId);
                }}
              >
                <FileText size={14} className="text-zinc-400" /> Add nested note
              </button>
            )}

            <button
              className="w-full text-left px-2.5 py-1.5 text-[13px] text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2.5 font-medium transition-colors"
              onClick={(e) =>
                handleToggleFavorite(note.id, note.isFavorite || false, e)
              }
            >
              <Star
                size={14}
                className={
                  note.isFavorite
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-400"
                }
              />{" "}
              {note.isFavorite ? "Remove Favorite" : "Add to Favorite"}
            </button>

            <button
              className="w-full text-left px-2.5 py-1.5 text-[13px] text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2.5 font-medium transition-colors"
              onClick={(e) => handleDuplicateNote(note.id, e)}
            >
              <Copy size={14} className="text-zinc-400" /> Duplicate
            </button>

            <div className="relative group/move">
              <button
                className="w-full text-left px-2.5 py-1.5 text-[13px] text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg flex items-center justify-between font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoveMenuForNoteId(
                    showMoveMenuForNoteId === contextId ? null : contextId,
                  );
                }}
              >
                <div className="flex items-center gap-2.5">
                  <FolderInput size={14} className="text-zinc-400" /> Move to
                </div>
                <ChevronRight size={13} className="text-zinc-400" />
              </button>

              {/* Move Submenu */}
              {showMoveMenuForNoteId === contextId && (
                <div className="absolute left-full top-0 ml-1 w-44 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.06)] p-1 z-50">
                  {Object.values(layers).filter((s) => s.id !== note.layerId)
                    .length === 0 ? (
                    <div className="px-2.5 py-1.5 text-[12px] text-zinc-400 italic">
                      No other layers
                    </div>
                  ) : (
                    Object.values(layers)
                      .filter((s) => s.id !== note.layerId)
                      .map((s) => (
                        <button
                          key={s.id}
                          className="w-full text-left px-2.5 py-1.5 text-[13px] hover:bg-zinc-100/80 text-zinc-700 hover:text-zinc-900 rounded-lg font-medium truncate transition-colors flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveNote(note.id, s.id);
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: s.accentColor || "#a1a1aa" }}
                          />
                          <span className="truncate">{s.name}</span>
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>

            <button
              className="w-full text-left px-2.5 py-1.5 text-[13px] text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2.5 font-medium transition-colors"
              onClick={(e) => startRenameNote(note.id, note.title, e)}
            >
              <Edit2 size={14} className="text-zinc-400" /> Rename
            </button>

            <div className="h-px bg-zinc-100 my-1"></div>

            <button
              className="w-full text-left px-2.5 py-1.5 text-[13px] text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 font-medium transition-colors"
              onClick={(e) => handleDeleteNote(note.id, e)}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}

        {/* Add Note Context Menu */}
        {addMenuNoteId === contextId && (
          <div
            className="fixed w-40 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.06)] z-50 p-1"
            style={{ top: menuPos.top, left: menuPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-2.5 py-1.5 text-[13px] text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2.5 font-medium transition-colors"
              onClick={(e) => {
                handleCreateNestedNote(note.layerId, note.id, e);
                setAddMenuNoteId(null);
              }}
            >
              <FileText size={14} className="text-zinc-400" /> Empty Note
            </button>
          </div>
        )}

        {/* Nested children notes */}
        {childNotes.length > 0 &&
          expandedNotes[note.id] !== false &&
          !isSpecialSection && (
            <div className="ml-[14px] pl-2 border-l border-zinc-200/80 mt-0.5 space-y-0.5">
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
      className="bg-[#F8F9FA] h-screen flex flex-col border-r border-zinc-200/80 select-none relative flex-shrink-0"
      style={{ width: sidebarWidth }}
    >
      {/* Window Drag & Brand Header */}
      <div
        data-tauri-drag-region
        className="h-[44px] flex items-center justify-between px-3 border-b border-zinc-200/70 bg-zinc-50/40 drag-region shrink-0"
      >
        {/* On macOS traffic lights take ~68px on left */}
        <div data-tauri-drag-region className="flex items-center gap-2 pl-[68px] select-none">
          <div className="w-5 h-5 rounded-md bg-zinc-900 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
            P
          </div>
          <span className="font-semibold text-[13.5px] text-zinc-800 tracking-tight">PaperLayr</span>
        </div>

        <div className="flex items-center gap-1 text-zinc-500">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1 px-1.5 py-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-md transition-colors text-xs"
            title="Search notes (Cmd+K)"
          >
            <Search size={14} strokeWidth={2} />
            <kbd className="text-[10px] font-medium bg-zinc-200/70 text-zinc-500 px-1 py-0.5 rounded leading-none">⌘K</kbd>
          </button>

          <div className="relative">
            <button
              onClick={openSettingsMenu}
              className={`p-1 rounded-md transition-colors relative ${
                isSettingsOpen
                  ? "text-zinc-900 bg-zinc-200"
                  : "hover:text-zinc-900 hover:bg-zinc-200/60 text-zinc-400"
              }`}
              title="Settings & Updates"
            >
              <Settings size={15} strokeWidth={1.75} />
              {hasUpdate && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {isSettingsOpen && (
              <div
                className="fixed w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)] p-1 z-50 text-[13px]"
                style={{ top: settingsMenuPos.top, left: settingsMenuPos.left }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-zinc-800">PaperLayr</div>
                    <div className="text-[11px] text-zinc-400">v{currentVersion}</div>
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
                    className="w-full text-left px-2.5 py-1.5 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg flex items-center justify-between transition-colors font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw size={14} className="text-zinc-400" />
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
                    className="w-full text-left px-2.5 py-1.5 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg flex items-center justify-between transition-colors font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink size={14} className="text-zinc-400" />
                      GitHub Repository
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400/50 active:bg-blue-500 z-50 transition-colors"
        onMouseDown={startResizing}
      />

      <div className="flex-1 overflow-y-auto pt-4 pb-6 space-y-5 px-2">
        {favoriteNotes.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2.5 mb-1.5 group">
              <span className="text-[11px] text-zinc-400 tracking-wider font-semibold uppercase select-none">
                Favorites
              </span>
            </div>
            <div className="space-y-0.5">
              {favoriteNotes.map((note) => renderNoteItem(note, "favorites"))}
            </div>
          </div>
        )}

        {stickyNotes.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2.5 mb-1.5 group">
              <span className="text-[11px] text-zinc-400 tracking-wider font-semibold uppercase select-none">
                Stickies
              </span>
            </div>
            <div className="space-y-0.5">
              {stickyNotes.map((note) => renderNoteItem(note, "stickies"))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between px-2.5 mb-1.5 group">
            <span className="text-[11px] text-zinc-400 tracking-wider font-semibold uppercase select-none">
              Tags
            </span>
          </div>
          <div className="space-y-0.5">
            {allTags.length === 0 ? (
              <div className="px-3 py-1.5 text-[12px] text-zinc-400 italic">
                No tags yet. Type #tag in a note
              </div>
            ) : (
              allTags.map((tag) => (
                <div
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    setSearchOpen(true, 'navigate');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer text-[13px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 transition-all"
                >
                  <span className="text-zinc-400 font-bold opacity-60">#</span>
                  <span className="flex-1 truncate tracking-tight">{tag.substring(1)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-2.5 mb-1.5 group">
            <span className="text-[11px] text-zinc-400 tracking-wider font-semibold uppercase select-none">
              Layers
            </span>
            <button
              onClick={handleCreateLayer}
              className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 p-1 rounded-md transition-colors cursor-pointer"
              title="Create new layer"
            >
              <Plus size={14} strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-1">
            {layerList.map((layer) => {
              const isLayerViewActive =
                selectedLayerId === layer.id && !selectedNoteId;
              const isLayerParentActive =
                selectedLayerId === layer.id && !!selectedNoteId;

              let layerClassName =
                "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 border border-transparent";
              if (isLayerViewActive) {
                layerClassName =
                  "bg-zinc-200/80 text-zinc-900 font-semibold shadow-xs border border-transparent";
              } else if (isLayerParentActive) {
                layerClassName =
                  "text-zinc-900 bg-zinc-100 font-medium border border-transparent";
              }

              return (
                <div key={layer.id} className="group/layer">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-[13.5px] font-medium transition-colors ${layerClassName}`}
                    onClick={(e) => {
                      toggleLayer(layer.id, e);
                      setSelectedLayer(layer.id);
                      setSelectedNote(null);
                    }}
                  >
                    <div className="text-zinc-400 hover:text-zinc-700 transition-colors p-0.5 -ml-1">
                      {expandedLayers[layer.id] !== false ? (
                        <ChevronDown size={14} strokeWidth={1.8} />
                      ) : (
                        <ChevronRight size={14} strokeWidth={1.8} />
                      )}
                    </div>
                    <div
                      className="w-2.5 h-2.5 rounded-full mr-0.5 flex-shrink-0 shadow-xs ring-1 ring-black/10"
                      style={{ backgroundColor: layer.accentColor || "#a1a1aa" }}
                    />
                    <span className="flex-1 truncate tracking-tight">{layer.name}</span>

                    <div
                      className={`flex items-center transition-opacity ${
                        contextMenuLayerId === layer.id || addMenuLayerId === layer.id
                          ? "opacity-100"
                          : "opacity-0 group-hover/layer:opacity-100"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addMenuLayerId === layer.id
                            ? setAddMenuLayerId(null)
                            : openMenu(e, setAddMenuLayerId, layer.id);
                        }}
                        className="p-1 hover:bg-zinc-200/80 rounded text-zinc-400 hover:text-zinc-700 mr-0.5 transition-colors"
                        title="Add note in layer"
                      >
                        <Plus size={14} strokeWidth={2} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          contextMenuLayerId === layer.id
                            ? setContextMenuLayerId(null)
                            : openMenu(e, setContextMenuLayerId, layer.id);
                        }}
                        className="p-1 hover:bg-zinc-200/80 rounded text-zinc-400 hover:text-zinc-700 transition-colors"
                      >
                        <MoreHorizontal size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  {/* Add Note Menu */}
                  {addMenuLayerId === layer.id && (
                    <div
                      className="fixed w-40 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.06)] z-50 p-1"
                      style={{ top: menuPos.top, left: menuPos.left }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="w-full text-left px-2.5 py-1.5 text-[13px] text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2 font-medium transition-colors"
                        onClick={(e) => {
                          handleCreateNote(layer.id, e);
                          setAddMenuLayerId(null);
                        }}
                      >
                        <FileText size={14} className="text-zinc-400" /> Empty Note
                      </button>
                    </div>
                  )}

                  {/* Context Menu */}
                  {contextMenuLayerId === layer.id && (
                    <div
                      className="fixed w-36 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.06)] z-50 p-1"
                      style={{ top: menuPos.top, left: menuPos.left }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="w-full text-left px-2.5 py-1.5 text-[13px] text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 rounded-lg flex items-center gap-2 font-medium transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLayerModal("edit", layer.id);
                          setContextMenuLayerId(null);
                        }}
                      >
                        <Edit2 size={14} className="text-zinc-400" /> Edit Layer
                      </button>
                      <button
                        className="w-full text-left px-2.5 py-1.5 text-[13px] text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium transition-colors"
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
                    <div className="ml-[18px] pl-2 border-l border-zinc-200/80 my-1 space-y-0.5 pr-1">
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
        </div>
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
