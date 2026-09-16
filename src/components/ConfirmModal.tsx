import { useStore } from '../store';
import { AlertTriangle, Trash2 } from 'lucide-react';

export const ConfirmModal = () => {
  const { confirmModal, closeConfirm } = useStore();

  if (!confirmModal) return null;

  const handleConfirm = () => {
    confirmModal.onConfirm();
    closeConfirm();
  };

  const isDelete = confirmModal.title.toLowerCase().includes('delete');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 backdrop-blur-xs select-none">
      <div 
        className="fixed inset-0"
        onClick={closeConfirm}
      />
      <div className="bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)] w-[400px] p-6 relative z-10 border border-zinc-100 mx-4">
        <div className="flex items-start gap-3.5 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDelete ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
          }`}>
            {isDelete ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 leading-snug tracking-tight">
              {confirmModal.title}
            </h3>
            <p className="text-[13.5px] text-zinc-600 leading-relaxed mt-1">
              {confirmModal.message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6 pt-3 border-t border-zinc-100">
          <button 
            onClick={closeConfirm} 
            className="px-4 py-2 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className={`px-4 py-2 text-[13px] font-semibold text-white rounded-xl transition-colors cursor-pointer shadow-xs ${
              isDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-900 hover:bg-black'
            }`}
          >
            {isDelete ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
