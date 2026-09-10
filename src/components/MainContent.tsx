import { useStore } from '../store';
import { NoteEditor } from './NoteEditor';
import { EmptyState } from './EmptyState';
import { TabBar } from './TabBar';
import { SpaceView } from './SpaceView';

export const MainContent = () => {
  const { spaces, selectedSpaceId, selectedNoteId } = useStore();

  if (!selectedSpaceId) {
    return <EmptyState type="no-space" />;
  }

  const space = spaces[selectedSpaceId];
  if (!space && selectedSpaceId !== 'captures') {
    return <EmptyState type="no-space" />;
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <TabBar />
      {selectedNoteId ? (
        <NoteEditor noteId={selectedNoteId} />
      ) : (
        <SpaceView spaceId={selectedSpaceId} />
      )}
    </div>
  );
};
