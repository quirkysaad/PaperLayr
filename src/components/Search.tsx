import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { Search as SearchIcon, FileText, Folder, CornerDownLeft, ArrowDown, ArrowUp } from 'lucide-react';

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
  } = useStore(useShallow((state) => ({
    isSearchOpen: state.isSearchOpen,
    searchQuery: state.searchQuery,
    setSearchOpen: state.setSearchOpen,
    setSearchQuery: state.setSearchQuery,
    layers: state.layers,
    notes: state.notes,
    setSelectedLayer: state.setSelectedLayer,
    setSelectedNote: state.setSelectedNote,
    openTab: state.openTab,
    openInCurrentTab: state.openInCurrentTab,
    searchMode: state.searchMode,
  })));
  
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

  const query = searchQuery.toLowerCase().trim();
  
  let results: { id: string, type: 'layer'|'note', title: string, subtitle?: string, layerId: string, accentColor?: string }[] = [];
  
  if (query) {
    // Search layers
    Object.values(layers).forEach(layer => {
      if (layer.name.toLowerCase().includes(query)) {
        results.push({
          id: layer.id,
          type: 'layer',
          title: layer.name,
          layerId: layer.id,
          accentColor: layer.accentColor,
        });
      }
    });

    // Search notes
    Object.values(notes).forEach(note => {
      if (note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)) {
        const layer = layers[note.layerId];
        const layerName = note.layerId === 'stickies' ? 'Stickies' : (layer?.name || 'Workspace');
        results.push({ 
          id: note.id, 
          type: 'note', 
          title: note.title || 'Untitled', 
          subtitle: layerName,
          layerId: note.layerId,
          accentColor: layer?.accentColor,
        });
      }
    });
  } else {
    // When query is empty, show recent notes
    Object.values(notes)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8)
      .forEach(note => {
        const layer = layers[note.layerId];
        const layerName = note.layerId === 'stickies' ? 'Stickies' : (layer?.name || 'Workspace');
        results.push({
          id: note.id,
          type: 'note',
          title: note.title || 'Untitled',
          subtitle: layerName,
          layerId: note.layerId,
          accentColor: layer?.accentColor,
        });
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] bg-black/30 backdrop-blur-xs select-none"
      onClick={() => setSearchOpen(false)}
    >
      <div 
        className="w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden border border-zinc-200/80 flex flex-col mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-100">
          <SearchIcon size={18} className="text-zinc-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-base text-zinc-900 placeholder-zinc-400 font-medium"
            placeholder={searchMode === 'newTab' ? "Open note in new tab..." : "Search notes and layers..."}
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
          {searchMode === 'newTab' && (
            <span className="text-[11px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mr-2">
              New Tab
            </span>
          )}
          <kbd className="text-[10px] font-semibold text-zinc-400 bg-zinc-100 border border-zinc-200/80 px-1.5 py-0.5 rounded shadow-2xs">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-1.5 space-y-0.5">
          {!query && results.length > 0 && (
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Recent Notes
            </div>
          )}

          {results.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-zinc-400">
              No results found for "{searchQuery}"
            </div>
          ) : (
            results.map((result, index) => {
              const isSelected = index === selectedIndex;

              return (
                <div 
                  key={`${result.type}-${result.id}`}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-xl transition-colors ${
                    isSelected ? 'bg-zinc-100 text-zinc-900' : 'hover:bg-zinc-50 text-zinc-700'
                  }`}
                  onClick={() => handleSelectResult(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-500">
                      {result.type === 'layer' ? (
                        <Folder size={15} />
                      ) : (
                        <FileText size={15} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[13.5px] truncate tracking-tight text-zinc-900">
                        {result.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-3">
                    {result.subtitle && (
                      <span className="text-[11px] font-medium text-zinc-400 bg-zinc-100/80 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                        {result.accentColor && (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: result.accentColor }}
                          />
                        )}
                        {result.subtitle}
                      </span>
                    )}

                    {isSelected && (
                      <CornerDownLeft size={13} className="text-zinc-400 ml-1" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ArrowUp size={11} />
              <ArrowDown size={11} /> Navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft size={11} /> Select
            </span>
          </div>
          <span>PaperLayr Search</span>
        </div>
      </div>
    </div>
  );
};
