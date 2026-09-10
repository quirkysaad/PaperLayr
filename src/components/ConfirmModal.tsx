import { useStore } from '../store';

export const ConfirmModal = () => {
  const { confirmModal, closeConfirm } = useStore();

  if (!confirmModal) return null;

  const handleConfirm = () => {
    confirmModal.onConfirm();
    closeConfirm();
  };

  const isDelete = confirmModal.title.toLowerCase().includes('delete');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20">
      <div 
        className="fixed inset-0"
        onClick={closeConfirm}
      />
      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-[400px] p-6 relative z-10">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{confirmModal.title}</h3>
        <p className="text-[15px] text-gray-700 leading-relaxed mb-8">{confirmModal.message}</p>
        <div className="flex justify-end gap-2">
          <button 
            onClick={closeConfirm} 
            className="px-4 py-2 text-[14px] font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className={`px-4 py-2 text-[14px] font-semibold text-white rounded-lg transition-colors ${
              isDelete ? 'bg-[#E50000] hover:bg-[#CC0000]' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isDelete ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
