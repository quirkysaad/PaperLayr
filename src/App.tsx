import { useEffect } from 'react';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

import { listen } from '@tauri-apps/api/event';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Search } from './components/Search';
import { ConfirmModal } from './components/ConfirmModal';
import { SpaceModal } from './components/SpaceModal';
import { Widget } from './components/Widget';
import { useStore } from './store';

function App() {
  const { spaces, isSidebarOpen } = useStore();
  const urlParams = new URLSearchParams(window.location.search);
  const widgetId = urlParams.get('widget');

  // Create default space on first launch if nothing exists
  useEffect(() => {
    const spaceKeys = Object.keys(spaces);
    if (spaceKeys.length === 0) {
      // Small timeout to allow hydration
      setTimeout(() => {
        // Double check after hydration
        const currentSpaces = useStore.getState().spaces;
        if (Object.keys(currentSpaces).length === 0) {
          useStore.getState().createSpace('Personal', '#0ea5e9'); // default sky color
        }
      }, 100);
    }
  }, [spaces]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N -> New Note in current space
      if ((e.metaKey || e.ctrlKey) && !(e.metaKey && e.ctrlKey) && !e.shiftKey && e.key === 'n') {
        e.preventDefault();
        const state = useStore.getState();
        if (state.selectedSpaceId) {
          const noteId = state.createNote(state.selectedSpaceId);
          state.setSelectedNote(noteId);
        }
      }
      
      // Cmd/Ctrl + Shift + N -> New Space
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'n') {
        e.preventDefault();
        useStore.getState().openSpaceModal('create');
      }

      // Cmd/Ctrl + . -> Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        useStore.getState().toggleSidebar();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for Global Shortcut from Rust
  useEffect(() => {
    if (widgetId) return;

    const unlistenCapturePromise = listen('capture-shortcut', () => {
      openCaptureWidget();
    });

    const unlistenSavePromise = listen('save-capture', (event: any) => {
      const { title, content } = event.payload;
      const state = useStore.getState();
      const newNoteId = state.createNote('captures', undefined, title || 'Quick Capture', true);
      state.updateNote(newNoteId, { content });
    });

    return () => {
      unlistenCapturePromise.then(fn => fn()).catch(console.error);
      unlistenSavePromise.then(fn => fn()).catch(console.error);
    };
  }, [widgetId]);

  const openCaptureWidget = async () => {
    const widgetLabel = 'capture-widget';
    try {
      const existing = await WebviewWindow.getByLabel(widgetLabel);
      if (existing) {
        await existing.unminimize();
        await existing.setFocus();
        return;
      }
    } catch (e) {
      console.warn('Error checking for existing widget:', e);
    }
    
    const windowOptions: any = {
      url: `/?capture=true`,
      title: 'Quick Capture',
      width: 352,
      height: 480,
      transparent: true,
      decorations: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      shadow: false,
      backgroundColor: [0, 0, 0, 0],
      focus: true,
    };

    // By omitting x, y, and center here, we allow macOS to natively place the 
    // new invisible window on the currently focused Space/Monitor instead of the primary monitor.
    const webview = new WebviewWindow(widgetLabel, windowOptions);
    
    webview.once('tauri://created', async () => {
      try {
        // Once created on the active monitor, we tell Tauri to center it 
        // relative to whatever monitor it was placed on.
        await webview.center();
        await webview.setFocus();
      } catch (err) {
        console.warn('Failed to center widget on active monitor', err);
      }
    });
  };

  const isCaptureMode = urlParams.get('capture') === 'true';
  if (widgetId || isCaptureMode) {
    return <Widget noteId={widgetId || undefined} isCapture={isCaptureMode} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900 font-sans">
      {isSidebarOpen && <Sidebar />}
      <MainContent />
      <Search />
      <ConfirmModal />
      <SpaceModal />
    </div>
  );
}

export default App;
