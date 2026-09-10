export interface Space {
  id: string;
  name: string;
  accentColor: string;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  spaceId: string;
  parentId?: string;
  title: string;
  content: string; // HTML or JSON from Tiptap
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  spaces: Record<string, Space>;
  notes: Record<string, Note>;
  
  // UI State
  selectedSpaceId: string | null;
  selectedNoteId: string | null;
  openTabs: string[];
  isSidebarOpen: boolean;
  searchQuery: string;
  isSearchOpen: boolean;
  searchMode?: 'navigate' | 'newTab';
}
