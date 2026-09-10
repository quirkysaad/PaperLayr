import { Plus, ChevronsRight } from 'lucide-react';
import { useStore } from '../store';

export const EmptyState = ({ type }: { type: 'no-space' | 'no-note' }) => {
  const { openSpaceModal, isSidebarOpen, toggleSidebar } = useStore();

  if (type === 'no-space') {
    return (
      <div className="flex-1 h-screen flex flex-col bg-paper text-gray-500 relative">
        <div data-tauri-drag-region className="h-[48px] w-full absolute top-0 left-0 drag-region flex items-end pb-2.5 px-2">
          {!isSidebarOpen && (
            <button 
              onClick={toggleSidebar}
              className="ml-[70px] p-1.5 text-ink-light hover:text-ink hover:bg-paper rounded-md transition-colors z-10 relative"
              title="Open sidebar (Cmd+.)"
            >
              <ChevronsRight size={16} />
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-ink-faint/30 rounded-2xl flex items-center justify-center mb-6 text-ink-light">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
        </div>
        <h2 className="text-xl font-medium text-ink mb-2">Nothing here yet</h2>
        <p className="text-sm mb-6 text-center max-w-sm">Create a space to start writing.</p>
        <button 
          onClick={() => openSpaceModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md font-medium transition-colors"
        >
          <Plus size={18} />
          Create Space
        </button>
        </div>
      </div>
    );
  }

  return null;
};
