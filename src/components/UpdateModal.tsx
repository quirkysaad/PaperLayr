import {
  X,
  Sparkles,
  ArrowUpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useUpdater } from '../hooks/useUpdater';

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const UpdateModal = () => {
  const {
    isOpen,
    status,
    currentVersion,
    updateInfo,
    downloadProgress,
    errorMessage,
    setIsOpen,
    checkForUpdates,
    downloadAndInstall,
    restartApp,
  } = useUpdater();

  if (!isOpen) return null;

  const handleClose = () => {
    // Prevent closing during active download to avoid inconsistent state
    if (status === 'downloading') return;
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 backdrop-blur-[1px] select-none">
      <div className="fixed inset-0" onClick={handleClose} />

      <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.14)] border border-gray-100 w-[420px] max-w-[90vw] p-6 relative z-10 overflow-hidden">
        {/* Close Button */}
        {status !== 'downloading' && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Header Icon + Title */}
        <div className="flex items-center gap-3 mb-4">
          {status === 'checking' && (
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Loader2 size={22} className="animate-spin" />
            </div>
          )}
          {status === 'up-to-date' && (
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={22} />
            </div>
          )}
          {status === 'available' && (
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={22} />
            </div>
          )}
          {status === 'downloading' && (
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <ArrowUpCircle size={22} className="animate-pulse" />
            </div>
          )}
          {status === 'ready' && (
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={22} />
            </div>
          )}
          {status === 'error' && (
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={22} />
            </div>
          )}

          <div>
            <h3 className="text-[17px] font-bold text-gray-900 leading-snug">
              {status === 'checking' && 'Checking for Updates'}
              {status === 'up-to-date' && "You're Up to Date"}
              {status === 'available' && 'Update Available'}
              {status === 'downloading' && 'Downloading Update'}
              {status === 'ready' && 'Ready to Restart'}
              {status === 'error' && 'Update Check Failed'}
            </h3>
            <p className="text-[12px] text-gray-500">
              Current version: v{currentVersion}
            </p>
          </div>
        </div>

        {/* Content based on state */}
        <div className="mb-6">
          {/* Checking */}
          {status === 'checking' && (
            <div className="py-4 text-center">
              <p className="text-[14px] text-gray-600">
                Checking GitHub for the latest PaperLayr releases...
              </p>
            </div>
          )}

          {/* Up to date */}
          {status === 'up-to-date' && (
            <div className="py-2 text-[14px] text-gray-600 leading-relaxed">
              PaperLayr <span className="font-semibold text-gray-800">v{currentVersion}</span> is currently the newest version available. You have all the latest improvements!
            </div>
          )}

          {/* Available */}
          {status === 'available' && updateInfo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-[13px]">
                <span className="text-gray-500">New Version:</span>
                <span className="font-semibold text-blue-600">
                  v{updateInfo.version}
                </span>
              </div>

              {updateInfo.body && (
                <div>
                  <div className="text-[12px] font-medium text-gray-500 mb-1">
                    Release Notes
                  </div>
                  <div className="max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg text-[13px] text-gray-700 leading-relaxed border border-gray-100 whitespace-pre-wrap">
                    {updateInfo.body}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Downloading */}
          {status === 'downloading' && (
            <div className="space-y-3 py-2">
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[12px] text-gray-500">
                <span>{downloadProgress.percentage}% completed</span>
                {downloadProgress.total > 0 && (
                  <span>
                    {formatBytes(downloadProgress.downloaded)} / {formatBytes(downloadProgress.total)}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-gray-400 text-center pt-1">
                Please wait while the update is being downloaded and verified...
              </p>
            </div>
          )}

          {/* Ready */}
          {status === 'ready' && (
            <div className="py-2 text-[14px] text-gray-600 leading-relaxed">
              The update has been downloaded successfully. Restart PaperLayr to apply the new version.
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="py-2 text-[13px] text-gray-600 leading-relaxed bg-amber-50/60 p-3 rounded-lg border border-amber-100">
              <p className="font-medium text-amber-800 mb-1">Notice</p>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          {status === 'checking' && (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}

          {status === 'up-to-date' && (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-gray-900 hover:bg-black rounded-lg transition-colors"
            >
              Done
            </button>
          )}

          {status === 'available' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Later
              </button>
              <button
                onClick={() => downloadAndInstall()}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ArrowUpCircle size={16} />
                Update Now
              </button>
            </>
          )}

          {status === 'downloading' && (
            <button
              disabled
              className="px-4 py-2 text-[13px] font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed flex items-center gap-2"
            >
              <Loader2 size={14} className="animate-spin" />
              Downloading...
            </button>
          )}

          {status === 'ready' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Restart Later
              </button>
              <button
                onClick={() => restartApp()}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw size={16} />
                Restart Now
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => checkForUpdates()}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
