import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { X, Check } from 'lucide-react';

const ACCENT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
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
    <div
      className="fixed inset-0 bg-black/35 flex items-center justify-center z-[100] backdrop-blur-xs select-none"
      onClick={closeLayerModal}
    >
      <div 
        className="bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)] w-full max-w-md mx-4 overflow-hidden border border-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-[16px] font-bold text-zinc-900 tracking-tight">
            {isEdit ? 'Edit Layer' : 'Create New Layer'}
          </h2>
          <button 
            onClick={closeLayerModal}
            className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="layerName" className="block text-[13px] font-semibold text-zinc-700 mb-2">
              Layer Name
            </label>
            <input
              ref={inputRef}
              id="layerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-zinc-900 text-[14px] outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              placeholder="e.g. Personal, Work, Projects"
              autoFocus
            />
          </div>

          <div className="mb-8">
            <label className="block text-[13px] font-semibold text-zinc-700 mb-2.5">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {ACCENT_COLORS.map(color => {
                const isSelected = selectedColor === color;

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-2xs ${
                      isSelected ? 'scale-110 ring-2 ring-offset-2 ring-zinc-800' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  >
                    {isSelected && <Check size={14} className="text-white drop-shadow-xs" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={closeLayerModal}
              className="px-4 py-2 text-[13px] font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-zinc-900 hover:bg-black rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isEdit ? 'Save Changes' : 'Create Layer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
