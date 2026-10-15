import React, { useState } from 'react';
import { PaletteColor } from '../types/mosaic';
import { Plus, Edit2, Check, X, Pipette } from 'lucide-react';

interface PaletteManagerProps {
  palette: PaletteColor[];
  selectedColor: string;
  onSelectColor: (hex: string) => void;
  onAddColor: (color: PaletteColor) => void;
  onUpdateColor: (oldHex: string, newColor: PaletteColor, updateTiles: boolean) => void;
  onDeleteColor: (id: string) => void;
  isEyedropperActive: boolean;
  onToggleEyedropper: () => void;
}

export const PaletteManager: React.FC<PaletteManagerProps> = ({
  palette,
  selectedColor,
  onSelectColor,
  onAddColor,
  onUpdateColor,
  onDeleteColor,
  isEyedropperActive,
  onToggleEyedropper,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newHex, setNewHex] = useState('#FF5500');
  const [newName, setNewName] = useState('Bright Flame');

  const [editingColor, setEditingColor] = useState<PaletteColor | null>(null);
  const [editHex, setEditHex] = useState('');
  const [editName, setEditName] = useState('');
  const [updateExistingTiles, setUpdateExistingTiles] = useState(true);

  const activeColorObj = palette.find(
    (c) => c.hex.toLowerCase() === selectedColor.toLowerCase()
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHex) return;
    const cleanHex = newHex.startsWith('#') ? newHex : `#${newHex}`;
    onAddColor({
      id: `custom-${Date.now()}`,
      name: newName || cleanHex,
      hex: cleanHex.toUpperCase(),
      isOfficial: false,
    });
    onSelectColor(cleanHex.toUpperCase());
    setIsAdding(false);
  };

  const handleStartEdit = (col: PaletteColor, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingColor(col);
    setEditHex(col.hex);
    setEditName(col.name);
    setUpdateExistingTiles(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColor || !editHex) return;
    const cleanHex = editHex.startsWith('#') ? editHex : `#${editHex}`;
    onUpdateColor(
      editingColor.hex,
      {
        ...editingColor,
        name: editName || cleanHex,
        hex: cleanHex.toUpperCase(),
      },
      updateExistingTiles
    );
    setEditingColor(null);
  };

  return (
    <div className="flex flex-col bg-neutral-900 border-t border-neutral-800 p-3 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Color Palette
          </span>
          {activeColorObj && (
            <span className="text-xs text-neutral-300 font-medium truncate max-w-[120px]">
              {activeColorObj.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleEyedropper}
            title="Eyedropper: Pick color from canvas (Hotkey: I)"
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              isEyedropperActive
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Pipette className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            title="Add Custom Color"
            className="flex items-center gap-1 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Add Custom Color Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-2.5 mb-2 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-200">Add New Palette Color</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newHex}
              onChange={(e) => setNewHex(e.target.value)}
              className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={newHex}
              onChange={(e) => setNewHex(e.target.value)}
              placeholder="#HEX"
              className="w-20 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded font-mono text-neutral-200"
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Color name..."
              className="flex-1 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-neutral-200"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded text-xs transition-colors"
          >
            Add Color to Palette
          </button>
        </form>
      )}

      {/* Edit Color Modal / Popover */}
      {editingColor && (
        <form onSubmit={handleSaveEdit} className="p-2.5 mb-2 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-200">Update Palette Color</span>
            <button
              type="button"
              onClick={() => setEditingColor(null)}
              className="text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={editHex}
              onChange={(e) => setEditHex(e.target.value)}
              className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={editHex}
              onChange={(e) => setEditHex(e.target.value)}
              className="w-20 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded font-mono text-neutral-200"
            />
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-neutral-200"
            />
          </div>
          <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={updateExistingTiles}
              onChange={(e) => setUpdateExistingTiles(e.target.checked)}
              className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0"
            />
            <span>Update all canvas tiles using this color</span>
          </label>
          <div className="flex items-center gap-2">
            {!editingColor.isOfficial && (
              <button
                type="button"
                onClick={() => {
                  onDeleteColor(editingColor.id);
                  setEditingColor(null);
                }}
                className="px-2.5 py-1 text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded text-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Swatches Grid */}
      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
        {palette.map((color) => {
          const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase();
          return (
            <div
              key={color.id}
              onClick={() => onSelectColor(color.hex)}
              title={`${color.name} (${color.hex})`}
              className={`group relative w-7 h-7 rounded-md cursor-pointer transition-all flex items-center justify-center ${
                isSelected
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-105 z-10'
                  : 'hover:scale-105 border border-white/10'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && (
                <Check
                  className={`w-3.5 h-3.5 ${
                    // Optical contrast for checkmark
                    ['#ffffff', '#f2cd37', '#e4cd9e', '#bbe90b', '#adc3c0', '#e1d5ed', '#f8bb3d', '#ffe853', '#fff89c', '#86d5fb', '#ffc5e2', '#b9aada'].includes(
                      color.hex.toLowerCase()
                    )
                      ? 'text-neutral-950'
                      : 'text-white'
                  }`}
                />
              )}

              {/* Edit hover icon */}
              <button
                onClick={(e) => handleStartEdit(color, e)}
                title="Edit color"
                className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white"
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
