import React from 'react';
import {
  Undo2,
  Redo2,
  FolderOpen,
  Sparkles,
  Grid3X3,
  ListFilter,
  Trash2,
  Download,
} from 'lucide-react';

interface HeaderProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSavedDesigns: () => void;
  onOpenPresets: () => void;
  onOpenSizeModal: () => void;
  onOpenBOM: () => void;
  onClear: () => void;
  onOpenExport: () => void;
  tileCount: number;
  gridDimensions: { cols: number; rows: number };
}

export const Header: React.FC<HeaderProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenSavedDesigns,
  onOpenPresets,
  onOpenSizeModal,
  onOpenBOM,
  onClear,
  onOpenExport,
  tileCount,
  gridDimensions,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur z-20">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap">
          <span className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-neutral-950 font-black text-xs shadow-sm">
            B
          </span>
          BrickMosaic Studio
        </a>
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400 pl-2 border-l border-neutral-800">
          <span className="font-mono tabular-nums">{gridDimensions.cols}×{gridDimensions.rows}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{tileCount} tiles</span>
        </div>
      </div>

      {/* Zone 2: Actions / Tools */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z / Cmd+Z)"
          aria-label="Undo"
          className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y / Cmd+Shift+Z)"
          aria-label="Redo"
          className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-1 hidden sm:block" />

        <button
          onClick={onOpenSavedDesigns}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>My Designs</span>
        </button>

        <button
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Presets</span>
        </button>

        <button
          onClick={onOpenSizeModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Grid3X3 className="w-3.5 h-3.5 text-neutral-400" />
          <span>Baseplate</span>
        </button>

        <button
          onClick={onOpenBOM}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <ListFilter className="w-3.5 h-3.5 text-neutral-400" />
          <span>Parts List</span>
        </button>

        <button
          onClick={onClear}
          title="Clear canvas"
          aria-label="Clear canvas"
          className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </nav>

      {/* Zone 3: 1 Primary CTA */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 text-neutral-950" />
          <span>Export Mosaic</span>
        </button>
      </div>
    </header>
  );
};
