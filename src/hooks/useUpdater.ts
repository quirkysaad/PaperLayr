import { create } from 'zustand';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { getVersion } from '@tauri-apps/api/app';

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'up-to-date'
  | 'downloading'
  | 'ready'
  | 'error';

export interface UpdateInfo {
  version: string;
  currentVersion: string;
  body?: string;
  date?: string;
}

export interface DownloadProgress {
  downloaded: number;
  total: number;
  percentage: number;
}

interface UpdaterState {
  isOpen: boolean;
  status: UpdateStatus;
  hasUpdate: boolean;
  currentVersion: string;
  updateInfo: UpdateInfo | null;
  downloadProgress: DownloadProgress;
  errorMessage: string | null;

  setIsOpen: (isOpen: boolean) => void;
  checkForUpdates: (options?: { silentIfLatest?: boolean }) => Promise<void>;
  downloadAndInstall: () => Promise<void>;
  restartApp: () => Promise<void>;
  reset: () => void;
}

// In-memory reference to the active Update object from @tauri-apps/plugin-updater
let activeUpdate: Update | null = null;

export const useUpdater = create<UpdaterState>((set, get) => ({
  isOpen: false,
  status: 'idle',
  hasUpdate: false,
  currentVersion: '0.1.0',
  updateInfo: null,
  downloadProgress: { downloaded: 0, total: 0, percentage: 0 },
  errorMessage: null,

  setIsOpen: (isOpen: boolean) => set({ isOpen }),

  checkForUpdates: async (options = {}) => {
    const { silentIfLatest = false } = options;

    let appVersion = get().currentVersion;
    try {
      appVersion = await getVersion();
    } catch {
      // Fallback if not running in Tauri window
      appVersion = '0.1.0';
    }

    set({
      currentVersion: appVersion,
      status: 'checking',
      errorMessage: null,
      ...(silentIfLatest ? {} : { isOpen: true }),
    });

    try {
      const update = await check();

      if (update && update.available) {
        activeUpdate = update;
        set({
          status: 'available',
          hasUpdate: true,
          isOpen: true,
          updateInfo: {
            version: update.version,
            currentVersion: appVersion,
            body: update.body || undefined,
            date: update.date || undefined,
          },
        });
      } else {
        activeUpdate = null;
        set({
          status: 'up-to-date',
          hasUpdate: false,
          isOpen: silentIfLatest ? false : true,
          updateInfo: {
            version: appVersion,
            currentVersion: appVersion,
          },
        });
      }
    } catch (err: any) {
      console.warn('PaperLayr updater error:', err);
      activeUpdate = null;
      if (silentIfLatest) {
        // In silent startup check, do not pop open an error dialog
        set({ status: 'idle', hasUpdate: false });
      } else {
        const errorMsg =
          err?.message ||
          (typeof err === 'string'
            ? err
            : 'Could not connect to update server. Please check your internet connection or try again later.');
        set({
          status: 'error',
          isOpen: true,
          errorMessage: errorMsg,
        });
      }
    }
  },

  downloadAndInstall: async () => {
    if (!activeUpdate) {
      set({
        status: 'error',
        errorMessage: 'No update package is currently ready to download.',
      });
      return;
    }

    set({
      status: 'downloading',
      downloadProgress: { downloaded: 0, total: 0, percentage: 0 },
      errorMessage: null,
    });

    try {
      let contentLength = 0;
      let downloaded = 0;

      await activeUpdate.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          contentLength = event.data.contentLength || 0;
          set({
            downloadProgress: {
              downloaded: 0,
              total: contentLength,
              percentage: 0,
            },
          });
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength;
          const percentage =
            contentLength > 0
              ? Math.min(100, Math.round((downloaded / contentLength) * 100))
              : 0;
          set({
            downloadProgress: {
              downloaded,
              total: contentLength,
              percentage,
            },
          });
        } else if (event.event === 'Finished') {
          set({
            status: 'ready',
            downloadProgress: {
              downloaded: contentLength || downloaded,
              total: contentLength || downloaded,
              percentage: 100,
            },
          });
        }
      });

      set({ status: 'ready' });
    } catch (err: any) {
      console.error('Failed to download update:', err);
      set({
        status: 'error',
        errorMessage:
          err?.message ||
          'An error occurred during update download and installation.',
      });
    }
  },

  restartApp: async () => {
    try {
      await relaunch();
    } catch (err: any) {
      console.error('Failed to relaunch app:', err);
      set({
        status: 'error',
        errorMessage: 'Failed to restart automatically. Please restart PaperLayr manually.',
      });
    }
  },

  reset: () =>
    set({
      isOpen: false,
      status: 'idle',
      errorMessage: null,
      downloadProgress: { downloaded: 0, total: 0, percentage: 0 },
    }),
}));
