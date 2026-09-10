import { useStore } from '../store';
import { NoteEditor } from './NoteEditor';
import { EmptyState } from './EmptyState';
import { TabBar } from './TabBar';
import { LayerView } from './LayerView';

export const MainContent = () => {
  const { layers, selectedLayerId, selectedNoteId } = useStore();

  if (!selectedLayerId) {
    return <EmptyState type="no-layer" />;
  }

  const layer = layers[selectedLayerId];
  if (!layer && selectedLayerId !== 'stickies') {
    return <EmptyState type="no-layer" />;
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <TabBar />
      {selectedNoteId ? (
        <NoteEditor noteId={selectedNoteId} />
      ) : (
        <LayerView layerId={selectedLayerId} />
      )}
    </div>
  );
};
