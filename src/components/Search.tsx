import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { Search as SearchIcon, FileText, Folder } from 'lucide-react';

export const Search = () => {
  const { 
    isSearchOpen, 
    searchQuery, 
    setSearchOpen, 
    setSearchQuery,
    layers,
    notes,
    setSelectedLayer,
    setSelectedNote,
    openTab,
    openInCurrentTab,
    searchMode
  } = useStore();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen, 'navigate');
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const query = searchQuery.toLowerCase();
  
  let results: { id: string, type: 'layer'|'note', title: string, subtitle?: string, layerId: string }[] = [];
  
  if (query.trim()) {
    // Search layers
    Object.values(layers).forEach(layer => {
      if (layer.name.toLowerCase().includes(query)) {
        results.push({ id: layer.id, type: 'layer', title: layer.name, layerId: layer.id });
      }
    });

    // Search notes
    Object.values(notes).forEach(note => {
      if (note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)) {
        const layerName = note.layerId === 'stickies' ? 'Stickies' : (layers[note.layerId]?.name || 'Unknown Layer');
        results.push({ 
          id: note.id, 
          type: 'note', 
          title: note.title || 'Untitled', 
          subtitle: `in ${layerName}`,
          layerId: note.layerId 
        });
      }
    });
  }

  const handleSelectResult = (result: typeof results[0]) => {
    if (result.type === 'note') {
      if (searchMode === 'newTab') {
        openTab(result.id);
      } else {
        openInCurrentTab(result.id);
      }
    } else {
      setSelectedLayer(result.layerId);
      setSelectedNote(null);
    }
    setSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/20" onClick={() => setSearchOpen(false)}>
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <SearchIcon size={20} className="text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-gray-900 placeholder-gray-400"
            placeholder={searchMode === 'newTab' ? "Search notes to open in new tab..." : "Search layers and notes..."}
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
              } else if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault();
                handleSelectResult(results[selectedIndex]);
              }
            }}
          />
          <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">ESC</div>
        </div>

        {query.trim() && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="py-8 text-center text-gray-400">No results found for "{query}"</div>
            ) : (
              results.map((result, index) => (
                <div 
                  key={`${result.type}-${result.id}`}
                  className={`flex items-center px-4 py-3 cursor-pointer rounded-lg ${index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  onClick={() => handleSelectResult(result)}
                >
                  <div className="mr-4 text-gray-400">
                    {result.type === 'layer' && <Folder size={18} />}
                    {result.type === 'note' && <FileText size={18} />}
                  </div>
                  <div>
                    <div className="text-gray-900 font-medium">{result.title}</div>
                    {result.subtitle && <div className="text-xs text-gray-400">{result.subtitle}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
