import { useStore } from '../store';
import { Plus, Star, ChevronsRight, FileText } from 'lucide-react';

const PASTEL_COLORS = [
  'bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-900',
  'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-900',
  'bg-green-50 border-green-200 hover:bg-green-100 text-green-900',
  'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900',
  'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-900',
  'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-900',
  'bg-pink-50 border-pink-200 hover:bg-pink-100 text-pink-900',
  'bg-teal-50 border-teal-200 hover:bg-teal-100 text-teal-900',
  'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-900',
];

const getNoteColorClasses = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PASTEL_COLORS[hash % PASTEL_COLORS.length];
};

export const SpaceView = ({ spaceId }: { spaceId: string }) => {
  const { spaces, notes, openInCurrentTab, createNote, isSidebarOpen, toggleSidebar } = useStore();
  const space = spaces[spaceId] || (spaceId === 'captures' ? { id: 'captures', name: 'Captures', accentColor: '#gray' } : null);

  if (!space) return null;

  // Filter root notes for this space (we only want top-level notes in this view)
  const spaceNotes = Object.values(notes).filter(n => n.spaceId === spaceId && !n.parentId);

  return (
    <div className="flex-1 overflow-y-auto bg-white flex flex-col pt-8">
      {!isSidebarOpen && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-md transition-colors shadow-sm border border-gray-100"
            title="Open sidebar (Cmd+.)"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      )}

      <div className="px-12 py-8 flex-1 max-w-5xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">{space.name}</h1>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-700">Documents</h2>
          <button
            onClick={() => createNote(space.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-[14px] rounded-lg transition-colors"
          >
            <Plus size={16} /> New Document
          </button>
        </div>

        {spaceNotes.length === 0 ? (
          <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">
            <p className="mb-2 text-[15px]">No documents in this space yet.</p>
            <button
              onClick={() => createNote(space.id)}
              className="text-blue-500 font-medium hover:underline text-[15px]"
            >
              Create one
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {spaceNotes.map(note => {
              const colorClasses = getNoteColorClasses(note.id);
              
              return (
                <div
                  key={note.id}
                  onClick={() => openInCurrentTab(note.id)}
                  className={`group rounded-xl p-4 border transition-all cursor-pointer flex flex-col h-[140px] relative ${colorClasses} hover:shadow-md`}
                >
                  {note.isFavorite && (
                    <div className="absolute top-4 right-4 text-yellow-500">
                      <Star size={14} className="fill-yellow-500" />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2.5">
                    <FileText size={16} className="shrink-0 mt-0.5 opacity-60" />
                    <div className="text-[15px] font-medium leading-snug line-clamp-2 pr-6">
                      {note.title || 'Untitled'}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="text-[13px] font-medium opacity-60">
                      Last updated: {new Date(note.updatedAt).toLocaleDateString('en-US')}
                    </div>
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
