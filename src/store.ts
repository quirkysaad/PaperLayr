import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set as idbSet, del } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Note, Layer } from './types';

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
  createLayer: (name: string, accentColor: string) => void;
  renameLayer: (id: string, name: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  
  createNote: (layerId: string, parentId?: string, title?: string, preventOpenTab?: boolean) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  
  // Tabs
  openTab: (id: string) => void;
  openInCurrentTab: (id: string) => void;
  closeTab: (id: string) => void;
  
  // UI Actions
  setSelectedLayer: (id: string | null) => void;
  setSelectedNote: (id: string | null) => void;
  toggleSidebar: () => void;
  setSearchOpen: (isOpen: boolean, mode?: 'navigate' | 'newTab') => void;
  setSearchQuery: (query: string) => void;
  
  // Confirm Modal
  confirmModal: { title: string; message: string; onConfirm: () => void } | null;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
  
  // Layer Modal
  layerModalConfig: { isOpen: boolean; mode: 'create' | 'edit'; layerId?: string };
  openLayerModal: (mode: 'create' | 'edit', layerId?: string) => void;
  closeLayerModal: () => void;
  
  // Sidebar resizer
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      layers: {},
      notes: {},
      selectedLayerId: null,
      selectedNoteId: null,
      openTabs: [],
      isSidebarOpen: true,
      searchQuery: '',
      isSearchOpen: false,
      searchMode: 'navigate',
      sidebarWidth: 256, // default to 256px (w-64)

      createLayer: (name, accentColor) => {
        const id = uuidv4();
        const now = Date.now();
        set((state) => ({
          layers: {
            ...state.layers,
            [id]: { id, name, accentColor, createdAt: now, updatedAt: now },
          },
          selectedLayerId: id,
        }));
      },

      renameLayer: (id, name) => {
        set((state) => {
          const layer = state.layers[id];
          if (!layer) return state;
          return {
            layers: {
              ...state.layers,
              [id]: { ...layer, name, updatedAt: Date.now() },
            },
          };
        });
      },

      updateLayer: (id, updates) => {
        set((state) => {
          const layer = state.layers[id];
          if (!layer) return state;
          return {
            layers: {
              ...state.layers,
              [id]: { ...layer, ...updates, updatedAt: Date.now() },
            },
          };
        });
      },

      deleteLayer: (id) => {
        set((state) => {
          const { [id]: _, ...remainingLayers } = state.layers;
          
          // Delete associated notes
          const remainingNotes = Object.fromEntries(
            Object.entries(state.notes).filter(([_, note]) => note.layerId !== id)
          );
          
          const newTabs = state.openTabs.filter(tabId => state.notes[tabId]?.layerId !== id);
          let newSelected = state.selectedNoteId;
          if (state.selectedNoteId && state.notes[state.selectedNoteId]?.layerId === id) {
            newSelected = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
          }

          return {
            layers: remainingLayers,
            notes: remainingNotes,
            openTabs: newTabs,
            selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
            selectedNoteId: newSelected,
          };
        });
      },

      createNote: (layerId, parentId?: string, title = 'Untitled', preventOpenTab = false) => {
        const id = uuidv4();
        const now = Date.now();
        set((state) => ({
          notes: {
            ...state.notes,
            [id]: { id, layerId, parentId, title, content: '', createdAt: now, updatedAt: now },
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
        return { openTabs: newTabs, selectedNoteId: id, selectedLayerId: note.layerId };
      }),

      openInCurrentTab: (id) => set((state) => {
        const note = state.notes[id];
        if (!note) return state;
        
        if (state.openTabs.includes(id)) {
          // If it's already open, just switch to it
          return { selectedNoteId: id, selectedLayerId: note.layerId };
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
        
        return { openTabs: newTabs, selectedNoteId: id, selectedLayerId: note.layerId };
      }),

      closeTab: (id) => set((state) => {
        const newTabs = state.openTabs.filter(t => t !== id);
        let newSelected = state.selectedNoteId;
        if (state.selectedNoteId === id) {
          newSelected = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
        }
        return { openTabs: newTabs, selectedNoteId: newSelected };
      }),

      setSelectedLayer: (id) => set({ selectedLayerId: id }),
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

      layerModalConfig: { isOpen: false, mode: 'create' },
      openLayerModal: (mode, layerId) => set({ layerModalConfig: { isOpen: true, mode, layerId } }),
      closeLayerModal: () => set({ layerModalConfig: { isOpen: false, mode: 'create' } }),
    }),
    {
      name: 'paperlayr-storage',
      storage: createJSONStorage(() => idbStorage),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || version === 1) {
          if (persistedState.spaces) {
            persistedState.layers = persistedState.spaces;
            delete persistedState.spaces;
          }
          if (persistedState.selectedSpaceId) {
            persistedState.selectedLayerId = persistedState.selectedSpaceId === 'captures' ? 'stickies' : persistedState.selectedSpaceId;
            delete persistedState.selectedSpaceId;
          }
          if (persistedState.notes) {
            const validLayerIds = new Set([
              ...(persistedState.layers ? Object.keys(persistedState.layers) : []),
              'stickies'
            ]);
            
            let recoveredLayerId = null;

            Object.values(persistedState.notes).forEach((note: any) => {
              if (note.spaceId) {
                note.layerId = note.spaceId === 'captures' ? 'stickies' : note.spaceId;
                delete note.spaceId;
              }
              
              // Rescue orphaned notes
              if (note.layerId && !validLayerIds.has(note.layerId)) {
                if (!recoveredLayerId) {
                  recoveredLayerId = "recovered-" + Date.now();
                  persistedState.layers = persistedState.layers || {};
                  persistedState.layers[recoveredLayerId] = {
                    id: recoveredLayerId,
                    name: "Recovered Notes",
                    accentColor: "#f59e0b",
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                  };
                  validLayerIds.add(recoveredLayerId);
                }
                note.layerId = recoveredLayerId;
              }
            });
          }
        }
        return persistedState;
      },
      partialize: (state) => ({
        layers: state.layers,
        notes: state.notes,
                selectedLayerId: state.selectedLayerId,
        selectedNoteId: state.selectedNoteId,
        openTabs: state.openTabs,
        isSidebarOpen: state.isSidebarOpen,
        sidebarWidth: state.sidebarWidth,
      }) as any, // Cast to any to avoid generic inference issues with Store
    }
  )
);
