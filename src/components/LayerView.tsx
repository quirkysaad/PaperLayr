import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { Plus, Star, FileText, Clock } from 'lucide-react';

function getExcerpt(html?: string): string {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').trim();
}

export const LayerView = ({ layerId }: { layerId: string }) => {
  const { layers, notes, openInCurrentTab, createNote } = useStore(useShallow((state) => ({
    layers: state.layers,
    notes: state.notes,
    openInCurrentTab: state.openInCurrentTab,
    createNote: state.createNote,
  })));
  const layer = layers[layerId] || (layerId === 'stickies' ? { id: 'stickies', name: 'Stickies', accentColor: '#71717a' } : null);

  if (!layer) return null;

  // Filter root notes for this layer (we only want top-level notes in this view)
  const layerNotes = Object.values(notes).filter(n => n.layerId === layerId && !n.parentId);

  return (
    <div className="flex-1 overflow-y-auto bg-white flex flex-col pt-6 select-none">

      <div className="px-10 py-6 flex-1 max-w-6xl w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 mb-8 border-b border-zinc-100 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-xs ring-2 ring-white"
                style={{ backgroundColor: layer.accentColor || '#71717a' }}
              />
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
                {layer.name}
              </h1>
            </div>
            <p className="text-zinc-500 text-[13px] font-medium pl-6.5">
              {layerNotes.length} {layerNotes.length === 1 ? 'document' : 'documents'}
            </p>
          </div>

          <button
            onClick={() => createNote(layer.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-black text-white text-[13px] font-semibold rounded-xl transition-all shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.2} /> New Document
          </button>
        </div>

        {layerNotes.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-zinc-200/80 rounded-2xl bg-zinc-50/40 max-w-md mx-auto my-8 p-8">
            <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-center mx-auto mb-4 text-zinc-400 shadow-xs">
              <FileText size={22} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-zinc-800 mb-1">No documents yet</h3>
            <p className="text-[13px] text-zinc-500 mb-5 leading-relaxed">
              Start writing ideas, thoughts, or plans in {layer.name}.
            </p>
            <button
              onClick={() => createNote(layer.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-black text-white text-[13px] font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Create Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {layerNotes.map((note) => {
              const excerpt = getExcerpt(note.content);

              return (
                <div
                  key={note.id}
                  onClick={() => openInCurrentTab(note.id)}
                  className="group bg-white hover:bg-zinc-50/60 border border-zinc-200/80 hover:border-zinc-300 rounded-2xl p-4.5 transition-all duration-150 cursor-pointer flex flex-col h-[155px] relative shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText size={15} className="shrink-0 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                      <span className="text-[14.5px] font-semibold text-zinc-900 truncate tracking-tight group-hover:text-blue-600 transition-colors">
                        {note.title || 'Untitled'}
                      </span>
                    </div>

                    {note.isFavorite && (
                      <Star size={14} className="fill-amber-400 text-amber-400 shrink-0 mt-0.5" />
                    )}
                  </div>

                  <p className="text-[13px] text-zinc-500 line-clamp-2 leading-relaxed mb-auto">
                    {excerpt || 'Empty note...'}
                  </p>

                  <div className="pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[11.5px] text-zinc-400 font-medium">
                    <Clock size={12} className="text-zinc-300" />
                    <span>
                      {new Date(note.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
