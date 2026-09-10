import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { X } from 'lucide-react';

const ACCENT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#6366f1', // indigo
  '#d946ef', // fuchsia
  '#db2777', // pink
];

export const LayerModal = () => {
  const { layerModalConfig, closeLayerModal, createLayer, updateLayer, layers } = useStore();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(ACCENT_COLORS[4]); // default to sky
  const inputRef = useRef<HTMLInputElement>(null);

  const isEdit = layerModalConfig.mode === 'edit';
  const layerToEdit = isEdit && layerModalConfig.layerId ? layers[layerModalConfig.layerId] : null;

  useEffect(() => {
    if (layerModalConfig.isOpen) {
      if (isEdit && layerToEdit) {
        setName(layerToEdit.name);
        setSelectedColor(layerToEdit.accentColor || ACCENT_COLORS[4]);
      } else {
        setName(`New Layer ${Object.keys(layers).length + 1}`);
        setSelectedColor(ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]);
      }
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.select();
        }
      }, 50);
    }
  }, [layerModalConfig.isOpen, isEdit, layerToEdit, layers]);

  if (!layerModalConfig.isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    
    if (isEdit && layerToEdit) {
      updateLayer(layerToEdit.id, { name: name.trim(), accentColor: selectedColor });
    } else {
      createLayer(name.trim(), selectedColor);
    }
    closeLayerModal();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Layer' : 'Create New Layer'}</h2>
          <button 
            onClick={closeLayerModal}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="layerName" className="block text-sm font-medium text-gray-700 mb-2">
              Layer Name
            </label>
            <input
              ref={inputRef}
              id="layerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              placeholder="e.g. Personal, Work, Project X"
              autoFocus
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${selectedColor === color ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-110'}`}
                  style={{ 
                    backgroundColor: color,
                    boxShadow: selectedColor === color ? `0 0 0 2px ${color}80` : 'none'
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeLayerModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEdit ? 'Save Changes' : 'Create Layer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
