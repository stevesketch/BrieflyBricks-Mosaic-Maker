import React, { useState } from 'react';
import { BaseplateConfig } from '../types/mosaic';
import { X, Check } from 'lucide-react';

interface BaseplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCols: number;
  currentRows: number;
  onApplySize: (cols: number, rows: number) => void;
  tileCount: number;
}

const PRESET_SIZES: BaseplateConfig[] = [
  { name: 'Small Plate (16×16)', cols: 16, rows: 16 },
  { name: 'Studio Medium (24×24)', cols: 24, rows: 24 },
  { name: 'LEGO Art Official (32×32)', cols: 32, rows: 32 },
  { name: 'Large Baseplate (48×48)', cols: 48, rows: 48 },
  { name: 'Epic Studio (64×64)', cols: 64, rows: 64 },
];

export const BaseplateModal: React.FC<BaseplateModalProps> = ({
  isOpen,
  onClose,
  currentCols,
  currentRows,
  onApplySize,
  tileCount,
}) => {
  const [cols, setCols] = useState(currentCols);
  const [rows, setRows] = useState(currentRows);

  if (!isOpen) return null;

  const handleApply = () => {
    const validCols = Math.min(Math.max(cols, 8), 96);
    const validRows = Math.min(Math.max(rows, 8), 96);
    onApplySize(validCols, validRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-white">Baseplate Grid Size</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select standard LEGO baseplate dimensions or configure custom studs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset choices */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Standard Presets
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {PRESET_SIZES.map((preset) => {
              const isSelected = cols === preset.cols && rows === preset.rows;
              return (
                <button
                  key={preset.name}
                  onClick={() => {
                    setCols(preset.cols);
                    setRows(preset.rows);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <span>{preset.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-500 tabular-nums">
                      {preset.cols * preset.rows} studs
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Custom Dimensions (Studs)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-neutral-400 block mb-1">Width (Columns)</span>
              <input
                type="number"
                min={8}
                max={96}
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 16)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 block mb-1">Height (Rows)</span>
              <input
                type="number"
                min={8}
                max={96}
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 16)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {tileCount > 0 && (cols < currentCols || rows < currentRows) && (
          <p className="text-[11px] text-amber-400 bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40">
            Shrinking baseplate will automatically trim tiles that fall outside the new boundaries.
          </p>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg transition-colors"
          >
            Apply Grid Size
          </button>
        </div>
      </div>
    </div>
  );
};
