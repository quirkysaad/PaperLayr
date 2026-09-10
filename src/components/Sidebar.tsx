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
} from "lucide-react";
import { useStore } from "../store";

import { Space } from "../types";

export const Sidebar = () => {
  const { openTab, openInCurrentTab, openTabs } = useStore();
  const {
    spaces,
    notes,
    selectedSpaceId,
    selectedNoteId,
    setSelectedSpace,
    setSelectedNote,
    createSpace,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    deleteSpace,
    renameSpace,
    setSearchOpen,
    openConfirm,
    openSpaceModal,
    sidebarWidth,
    setSidebarWidth,
    toggleSidebar,
  } = useStore();

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
  const captureNotes = Object.values(notes).filter(
    (n) => n.spaceId === "captures",
  );

  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(
    {},
  );

  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [editSpaceName, setEditSpaceName] = useState("");

  const [contextMenuSpaceId, setContextMenuSpaceId] = useState<string | null>(
    null,
  );
  const [addMenuSpaceId, setAddMenuSpaceId] = useState<string | null>(null);

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
    setContextMenuSpaceId(null);
    setAddMenuSpaceId(null);
    setContextMenuNoteId(null);
    setAddMenuNoteId(null);
    setShowMoveMenuForNoteId(null);

    // Open target
    setter(id);
  };

  const toggleSpace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSpaces((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateSpace = () => {
    openSpaceModal("create");
  };

  const handleCreateNote = (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expandedSpaces[spaceId]) {
      setExpandedSpaces((prev) => ({ ...prev, [spaceId]: true }));
    }
    const noteId = createNote(spaceId, undefined);
    setSelectedSpace(spaceId);
    setSelectedNote(noteId);
    setAddMenuSpaceId(null);
  };

  const handleCreateNestedNote = (
    spaceId: string,
    parentId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!expandedNotes[parentId]) {
      setExpandedNotes((prev) => ({ ...prev, [parentId]: true }));
    }
    const noteId = createNote(spaceId, parentId);
    setSelectedSpace(spaceId);
    setSelectedNote(noteId);
    setContextMenuNoteId(null);
  };

  const startRenameSpace = (space: Space, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSpaceId(space.id);
    setEditSpaceName(space.name);
    setContextMenuSpaceId(null);
  };

  const submitRenameSpace = (id: string) => {
    if (editingSpaceId !== id) return;
    if (editSpaceName.trim()) {
      renameSpace(id, editSpaceName.trim());
    }
    setEditingSpaceId(null);
  };

  const handleDeleteSpace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirm(
      "Delete Space",
      "Are you sure you want to delete this space and all its contents? This action cannot be undone.",
      () => deleteSpace(id),
    );
    setContextMenuSpaceId(null);
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

        // Auto-delete space if empty
        const spaceNotes = Object.values(notes).filter(
          (n) => n.spaceId === note.spaceId && n.id !== id,
        );
        if (spaceNotes.length === 0) {
          deleteSpace(note.spaceId);
        } else if (selectedNoteId === id) {
          if (spaceNotes.length > 0) {
            setSelectedNote(spaceNotes[0].id);
          } else {
            setSelectedSpace(null);
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

  const handleMoveNote = (noteId: string, newSpaceId: string) => {
    // We should move this note to the root of the new space
    updateNote(noteId, { spaceId: newSpaceId, parentId: undefined });

    // Also update spaceId for all descendant notes to keep them attached
    const updateDescendantsSpace = (parentId: string, newSpace: string) => {
      Object.values(notes)
        .filter((n) => n.parentId === parentId)
        .forEach((child) => {
          updateNote(child.id, { spaceId: newSpace });
          updateDescendantsSpace(child.id, newSpace);
        });
    };
    updateDescendantsSpace(noteId, newSpaceId);

    setContextMenuNoteId(null);
    setShowMoveMenuForNoteId(null);
  };

  const spaceList = Object.values(spaces).sort(
    (a, b) => a.createdAt - b.createdAt,
  );

  const renderNoteItem = (
    note: Note,
    sectionName: "favorites" | "captures" | "default" = "default",
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
                  {Object.values(spaces).filter((s) => s.id !== note.spaceId)
                    .length === 0 ? (
                    <div className="px-3 py-1.5 text-[13px] text-gray-400 italic">
                      No other spaces
                    </div>
                  ) : (
                    Object.values(spaces)
                      .filter((s) => s.id !== note.spaceId)
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
                handleCreateNestedNote(note.spaceId, note.id, e);
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

      <div className="px-4 mt-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[15px] text-gray-800">PaperLayr</span>
          <div className="flex items-center gap-2 text-gray-500">
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
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

        {captureNotes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-5 mb-2 group">
              <span className="text-[13px] text-gray-400 tracking-wider font-medium">
                CAPTURES
              </span>
            </div>
            <div className="px-3 space-y-0.5">
              {captureNotes.map((note) => renderNoteItem(note, "captures"))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-5 mb-2 group">
          <span className="text-[13px] text-gray-400 tracking-wider font-medium">
            SPACES
          </span>
          <button
            onClick={handleCreateSpace}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>

        {spaceList.map((space) => {
          const isSpaceViewActive =
            selectedSpaceId === space.id && !selectedNoteId;
          const isSpaceParentActive =
            selectedSpaceId === space.id && !!selectedNoteId;

          let spaceClassName =
            "text-gray-600 hover:bg-gray-100 border border-transparent";
          if (isSpaceViewActive) {
            spaceClassName =
              "bg-[#E5E7EB] text-gray-900 border border-transparent";
          } else if (isSpaceParentActive) {
            spaceClassName =
              "border border-dashed text-gray-800 bg-gray-50/50 hover:bg-gray-100";
          }

          return (
            <div key={space.id} className="mb-1">
              <div
                className={`group flex items-center gap-1.5 px-2 py-1 mx-1 rounded-md cursor-pointer text-[15px] font-medium transition-colors ${spaceClassName}`}
                style={
                  isSpaceParentActive
                    ? { borderColor: space.accentColor || "#d1d5db" }
                    : undefined
                }
                onClick={(e) => {
                  toggleSpace(space.id, e);
                  setSelectedSpace(space.id);
                  setSelectedNote(null);
                }}
              >
                <div className="text-gray-400 mr-0.5">
                  {expandedSpaces[space.id] !== false ? (
                    <ChevronDown size={16} strokeWidth={1.5} />
                  ) : (
                    <ChevronRight size={16} strokeWidth={1.5} />
                  )}
                </div>
                <div
                  className="w-2.5 h-2.5 rounded-full mr-1 flex-shrink-0"
                  style={{ backgroundColor: space.accentColor || "#d1d5db" }}
                />
                <span className="flex-1 truncate">{space.name}</span>

                <div
                  className={`flex items-center transition-opacity ${contextMenuSpaceId === space.id || addMenuSpaceId === space.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addMenuSpaceId === space.id
                        ? setAddMenuSpaceId(null)
                        : openMenu(e, setAddMenuSpaceId, space.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 mr-0.5"
                    title="Add new note"
                  >
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      contextMenuSpaceId === space.id
                        ? setContextMenuSpaceId(null)
                        : openMenu(e, setContextMenuSpaceId, space.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"
                  >
                    <MoreHorizontal size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Add Note Menu */}
              {addMenuSpaceId === space.id && (
                <div
                  className="fixed w-40 bg-white rounded-md shadow-lg border border-gray-100 z-50 py-1"
                  style={{ top: menuPos.top, left: menuPos.left }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={(e) => {
                      handleCreateNote(space.id, e);
                      setAddMenuSpaceId(null);
                    }}
                  >
                    <FileText size={14} /> Empty Note
                  </button>
                </div>
              )}

              {/* Context Menu */}
              {contextMenuSpaceId === space.id && (
                <div
                  className="fixed w-32 bg-white rounded-md shadow-lg border border-gray-100 z-50 py-1"
                  style={{ top: menuPos.top, left: menuPos.left }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSpaceModal("edit", space.id);
                      setContextMenuSpaceId(null);
                    }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    className="w-full text-left px-3 py-1.5 text-[13px] text-red-500 hover:bg-gray-50 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSpace(space.id, e);
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}

              {/* Space Notes */}
              {expandedSpaces[space.id] !== false && (
                <div className="ml-[22px] pl-2 border-l border-gray-200 my-1 space-y-0.5 pr-2">
                  {Object.values(notes)
                    .filter((n) => n.spaceId === space.id && !n.parentId)
                    .sort((a, b) => a.createdAt - b.createdAt)
                    .map((note) => renderNoteItem(note, "default"))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Click outside context menus */}
      {(contextMenuSpaceId ||
        addMenuSpaceId ||
        contextMenuNoteId ||
        addMenuNoteId) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setContextMenuSpaceId(null);
            setAddMenuSpaceId(null);
            setContextMenuNoteId(null);
            setAddMenuNoteId(null);
            setShowMoveMenuForNoteId(null);
          }}
        />
      )}
    </div>
  );
};
