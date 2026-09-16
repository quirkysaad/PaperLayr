import { Plus, Layers } from 'lucide-react';
import { useStore } from '../store';

export const EmptyState = ({ type }: { type: 'no-layer' | 'no-note' }) => {
  const { openLayerModal } = useStore();

  if (type === 'no-layer') {
    return (
      <div className="flex-1 h-screen flex flex-col bg-white text-zinc-500 relative select-none">
        <div
          data-tauri-drag-region
          className="h-[44px] w-full absolute top-0 left-0 drag-region flex items-center px-4 bg-[#F8F9FA] border-b border-zinc-200/80"
        />

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 bg-zinc-100/80 rounded-2xl flex items-center justify-center mb-5 text-zinc-600 border border-zinc-200/60 shadow-xs">
            <Layers size={28} strokeWidth={1.75} />
          </div>

          <h2 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">
            Create your first layer
          </h2>
          <p className="text-[14px] text-zinc-500 leading-relaxed mb-6">
            Layers organize your notes into projects, topics, or workflows. Create one to get started.
          </p>

          <button 
            onClick={() => openLayerModal('create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-black text-white text-[13px] font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.2} />
            Create Layer
          </button>
        </div>
      </div>
    );
  }

  return null;
};
