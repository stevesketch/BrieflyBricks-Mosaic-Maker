import React from 'react';
import { STARTER_PRESETS, StarterPreset } from '../presets/starterMosaics';
import { X, Sparkles } from 'lucide-react';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: StarterPreset) => void;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Starter Mosaic Presets</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Load official LEGO-inspired vector mosaics to explore and customize.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {STARTER_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="group p-4 rounded-xl border border-neutral-800 bg-neutral-950/70 hover:border-amber-500/60 hover:bg-neutral-800/40 cursor-pointer transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {preset.title}
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
                    {preset.cols}×{preset.rows}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 font-mono">
                <span>{preset.tiles.length} tiles</span>
                <span className="text-amber-400 font-sans font-medium text-xs group-hover:translate-x-0.5 transition-transform">
                  Load Design →
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-xs text-neutral-500">
          Loading a preset will replace current canvas contents (Undo is available).
        </div>
      </div>
    </div>
  );
};
