import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set as idbSet, del } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Note, Space } from './types';

// Custom storage engine using IndexedDB
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await idbSet(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface Store extends AppState {
  // Actions
  createSpace: (name: string, accentColor: string) => void;
  renameSpace: (id: string, name: string) => void;
  updateSpace: (id: string, updates: Partial<Space>) => void;
  deleteSpace: (id: string) => void;
  
  createNote: (spaceId: string, parentId?: string, title?: string, preventOpenTab?: boolean) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  
  // Tabs
  openTab: (id: string) => void;
  openInCurrentTab: (id: string) => void;
  closeTab: (id: string) => void;
  
  // UI Actions
  setSelectedSpace: (id: string | null) => void;
  setSelectedNote: (id: string | null) => void;
  toggleSidebar: () => void;
  setSearchOpen: (isOpen: boolean, mode?: 'navigate' | 'newTab') => void;
  setSearchQuery: (query: string) => void;
  
  // Confirm Modal
  confirmModal: { title: string; message: string; onConfirm: () => void } | null;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
  
  // Space Modal
  spaceModalConfig: { isOpen: boolean; mode: 'create' | 'edit'; spaceId?: string };
  openSpaceModal: (mode: 'create' | 'edit', spaceId?: string) => void;
  closeSpaceModal: () => void;
  
  // Sidebar resizer
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      spaces: {},
      notes: {},
      selectedSpaceId: null,
      selectedNoteId: null,
      openTabs: [],
      isSidebarOpen: true,
      searchQuery: '',
      isSearchOpen: false,
      searchMode: 'navigate',
      sidebarWidth: 256, // default to 256px (w-64)

      createSpace: (name, accentColor) => {
        const id = uuidv4();
        const now = Date.now();
        set((state) => ({
          spaces: {
            ...state.spaces,
            [id]: { id, name, accentColor, createdAt: now, updatedAt: now },
          },
          selectedSpaceId: id,
        }));
      },

      renameSpace: (id, name) => {
        set((state) => {
          const space = state.spaces[id];
          if (!space) return state;
          return {
            spaces: {
              ...state.spaces,
              [id]: { ...space, name, updatedAt: Date.now() },
            },
          };
        });
      },

      updateSpace: (id, updates) => {
        set((state) => {
          const space = state.spaces[id];
          if (!space) return state;
          return {
            spaces: {
              ...state.spaces,
              [id]: { ...space, ...updates, updatedAt: Date.now() },
            },
          };
        });
      },

      deleteSpace: (id) => {
        set((state) => {
          const { [id]: _, ...remainingSpaces } = state.spaces;
          
          // Delete associated notes
          const remainingNotes = Object.fromEntries(
            Object.entries(state.notes).filter(([_, note]) => note.spaceId !== id)
          );
          
          const newTabs = state.openTabs.filter(tabId => state.notes[tabId]?.spaceId !== id);
          let newSelected = state.selectedNoteId;
          if (state.selectedNoteId && state.notes[state.selectedNoteId]?.spaceId === id) {
            newSelected = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
          }

          return {
            spaces: remainingSpaces,
            notes: remainingNotes,
            openTabs: newTabs,
            selectedSpaceId: state.selectedSpaceId === id ? null : state.selectedSpaceId,
            selectedNoteId: newSelected,
          };
        });
      },

      createNote: (spaceId, parentId?: string, title = 'Untitled', preventOpenTab = false) => {
        const id = uuidv4();
        const now = Date.now();
        set((state) => ({
          notes: {
            ...state.notes,
            [id]: { id, spaceId, parentId, title, content: '', createdAt: now, updatedAt: now },
          },
          openTabs: preventOpenTab ? state.openTabs : [...state.openTabs, id],
          selectedNoteId: preventOpenTab ? state.selectedNoteId : id,
        }));
        return id;
      },

      updateNote: (id, updates) => {
        set((state) => {
          const note = state.notes[id];
          if (!note) return state;
          return {
            notes: {
              ...state.notes,
              [id]: { ...note, ...updates, updatedAt: Date.now() },
            },
          };
        });
      },

      deleteNote: (id) => {
        set((state) => {
          // Find all descendant note IDs to delete
          const getDescendants = (parentId: string): string[] => {
            const children = Object.values(state.notes).filter(n => n.parentId === parentId).map(n => n.id);
            return [...children, ...children.flatMap(getDescendants)];
          };
          
          const idsToDelete = [id, ...getDescendants(id)];
          
          const remainingNotes = Object.fromEntries(
            Object.entries(state.notes).filter(([noteId]) => !idsToDelete.includes(noteId))
          );
          
          const newTabs = state.openTabs.filter(t => !idsToDelete.includes(t));
          let newSelected = state.selectedNoteId;
          if (state.selectedNoteId && idsToDelete.includes(state.selectedNoteId)) {
            newSelected = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
          }
          return {
            notes: remainingNotes,
            openTabs: newTabs,
            selectedNoteId: newSelected,
          };
        });
      },

      duplicateNote: (id) => {
        set((state) => {
          const original = state.notes[id];
          if (!original) return state;
          
          const newId = uuidv4();
          const now = Date.now();
          const newNote = {
            ...original,
            id: newId,
            title: `${original.title} (Copy)`,
            createdAt: now,
            updatedAt: now,
          };
          return {
            notes: {
              ...state.notes,
              [newId]: newNote,
            }
          };
        });
      },


      openTab: (id) => set((state) => {
        const note = state.notes[id];
        if (!note) return state;
        const newTabs = state.openTabs.includes(id) ? state.openTabs : [...state.openTabs, id];
        return { openTabs: newTabs, selectedNoteId: id, selectedSpaceId: note.spaceId };
      }),

      openInCurrentTab: (id) => set((state) => {
        const note = state.notes[id];
        if (!note) return state;
        
        if (state.openTabs.includes(id)) {
          // If it's already open, just switch to it
          return { selectedNoteId: id, selectedSpaceId: note.spaceId };
        }
        
        // Otherwise, replace current tab with this note
        let newTabs = [...state.openTabs];
        if (state.selectedNoteId) {
          const activeIndex = newTabs.indexOf(state.selectedNoteId);
          if (activeIndex !== -1) {
            newTabs[activeIndex] = id;
          } else {
            newTabs.push(id);
          }
        } else {
          newTabs.push(id);
        }
        
        return { openTabs: newTabs, selectedNoteId: id, selectedSpaceId: note.spaceId };
      }),

      closeTab: (id) => set((state) => {
        const newTabs = state.openTabs.filter(t => t !== id);
        let newSelected = state.selectedNoteId;
        if (state.selectedNoteId === id) {
          newSelected = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
        }
        return { openTabs: newTabs, selectedNoteId: newSelected };
      }),

      setSelectedSpace: (id) => set({ selectedSpaceId: id }),
      setSelectedNote: (id) => set({ selectedNoteId: id }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSearchOpen: (isOpen, mode = 'navigate') => set((state) => ({ 
        isSearchOpen: isOpen, 
        searchMode: mode,
        searchQuery: isOpen ? state.searchQuery : '' 
      })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      
      confirmModal: null,
      openConfirm: (title, message, onConfirm) => set({ confirmModal: { title, message, onConfirm } }),
      closeConfirm: () => set({ confirmModal: null }),

      spaceModalConfig: { isOpen: false, mode: 'create' },
      openSpaceModal: (mode, spaceId) => set({ spaceModalConfig: { isOpen: true, mode, spaceId } }),
      closeSpaceModal: () => set({ spaceModalConfig: { isOpen: false, mode: 'create' } }),
    }),
    {
      name: 'paperlayr-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        spaces: state.spaces,
        notes: state.notes,
                selectedSpaceId: state.selectedSpaceId,
        selectedNoteId: state.selectedNoteId,
        openTabs: state.openTabs,
        isSidebarOpen: state.isSidebarOpen,
        sidebarWidth: state.sidebarWidth,
      }) as any, // Cast to any to avoid generic inference issues with Store
    }
  )
);
