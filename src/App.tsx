import { useEffect } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { listen } from "@tauri-apps/api/event";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { Search } from "./components/Search";
import { ConfirmModal } from "./components/ConfirmModal";
import { LayerModal } from "./components/LayerModal";
import { UpdateModal } from "./components/UpdateModal";
import { Widget } from "./components/Widget";
import { useStore } from "./store";
import { useUpdater } from "./hooks/useUpdater";
import { useShallow } from "zustand/react/shallow";

function App() {
  const { layers, isSidebarOpen } = useStore(useShallow((state) => ({
    layers: state.layers,
    isSidebarOpen: state.isSidebarOpen,
  })));
  const urlParams = new URLSearchParams(window.location.search);
  const widgetId = urlParams.get("widget");
  const isStickyMode = urlParams.get("sticky") === "true";

  // Create default layer on first launch if nothing exists
  useEffect(() => {
    const layerKeys = Object.keys(layers);
    if (layerKeys.length === 0) {
      // Small timeout to allow hydration
      setTimeout(() => {
        // Double check after hydration
        const currentLayers = useStore.getState().layers;
        if (Object.keys(currentLayers).length === 0) {
          useStore.getState().createLayer("Personal", "#0ea5e9"); // default sky color
        }
      }, 100);
    }
  }, [layers]);

  // Check for updates on initial app launch
  useEffect(() => {
    if (widgetId || isStickyMode) return;
    const timer = setTimeout(() => {
      useUpdater.getState().checkForUpdates({ silentIfLatest: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [widgetId, isStickyMode]);

  // Global Sync Listeners
  useEffect(() => {
    const unlistenSyncNote = listen("sync-note", (event: any) => {
      const { noteId, content, source } = event.payload;
      if (source !== getCurrentWindow().label) {
        useStore.getState().updateNote(noteId, { content });
      }
    });

    const unlistenSyncTitle = listen("sync-title", (event: any) => {
      const { noteId, title, source } = event.payload;
      if (source !== getCurrentWindow().label) {
        useStore.getState().updateNote(noteId, { title });
      }
    });

    return () => {
      unlistenSyncNote.then((fn) => fn()).catch(console.error);
      unlistenSyncTitle.then((fn) => fn()).catch(console.error);
    };
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N -> New Note in current layer
      if (
        (e.metaKey || e.ctrlKey) &&
        !(e.metaKey && e.ctrlKey) &&
        !e.shiftKey &&
        e.key === "n"
      ) {
        e.preventDefault();
        const state = useStore.getState();
        if (state.selectedLayerId) {
          const noteId = state.createNote(state.selectedLayerId);
          state.setSelectedNote(noteId);
        }
      }

      // Cmd/Ctrl + Shift + N -> New Layer
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "n") {
        e.preventDefault();
        useStore.getState().openLayerModal("create");
      }

      // Cmd/Ctrl + . -> Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        useStore.getState().toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for Global Shortcut from Rust
  useEffect(() => {
    if (widgetId) return;

    const unlistenStickyPromise = listen("sticky-shortcut", () => {
      openStickyWidget();
    });

    const unlistenSavePromise = listen("save-sticky", (event: any) => {
      const { title, content } = event.payload;
      const state = useStore.getState();
      const newNoteId = state.createNote(
        "stickies",
        undefined,
        title || "Sticky",
        true,
      );
      state.updateNote(newNoteId, { content });
    });

    return () => {
      unlistenStickyPromise.then((fn) => fn()).catch(console.error);
      unlistenSavePromise.then((fn) => fn()).catch(console.error);
    };
  }, [widgetId]);

  const openStickyWidget = async () => {
    const widgetLabel = "sticky-widget";
    try {
      const existing = await WebviewWindow.getByLabel(widgetLabel);
      if (existing) {
        await existing.unminimize();
        await existing.setFocus();
        return;
      }
    } catch (e) {
      console.warn("Error checking for existing widget:", e);
    }

    const windowOptions: any = {
      url: `/?sticky=true`,
      title: "Sticky",
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
    // new invisible window on the currently focused Layer/Monitor instead of the primary monitor.
    const webview = new WebviewWindow(widgetLabel, windowOptions);

    webview.once("tauri://created", async () => {
      try {
        // Once created on the active monitor, we tell Tauri to center it
        // relative to whatever monitor it was placed on.
        await webview.center();
        await webview.setFocus();
      } catch (err) {
        console.warn("Failed to center widget on active monitor", err);
      }
    });
  };

  if (widgetId || isStickyMode) {
    return <Widget noteId={widgetId || undefined} isSticky={isStickyMode} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900 font-sans">
      {isSidebarOpen && <Sidebar />}
      <MainContent />
      <Search />
      <ConfirmModal />
      <LayerModal />
      <UpdateModal />
    </div>
  );
}

export default App;
