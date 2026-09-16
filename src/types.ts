export interface Layer {
  id: string;
  name: string;
  accentColor: string;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  layerId: string;
  parentId?: string;
  title: string;
  content: string; // HTML or JSON from Tiptap
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  layers: Record<string, Layer>;
  notes: Record<string, Note>;
  
  // UI State
  selectedLayerId: string | null;
  selectedNoteId: string | null;
  openTabs: string[];
  searchQuery: string;
  isSearchOpen: boolean;
  searchMode?: 'navigate' | 'newTab';
}
