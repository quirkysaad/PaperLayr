import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { NoteEditor } from './NoteEditor';
import { EmptyState } from './EmptyState';
import { TabBar } from './TabBar';
import { LayerView } from './LayerView';

export const MainContent = () => {
  const { layers, selectedLayerId, selectedNoteId } = useStore(useShallow((state) => ({
    layers: state.layers,
    selectedLayerId: state.selectedLayerId,
    selectedNoteId: state.selectedNoteId,
  })));

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
