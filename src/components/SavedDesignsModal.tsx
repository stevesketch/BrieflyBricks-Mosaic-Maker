import React, { useState, useEffect, useRef } from 'react';
import { SavedDesign, PlacedTile, PaletteColor } from '../types/mosaic';
import {
  getSavedDesigns,
  saveDesignToStorage,
  deleteDesignFromStorage,
  duplicateDesignInStorage,
} from '../utils/storage';
import { downloadFile, generateSvgString } from '../utils/exportMosaic';
import {
  X,
  Save,
  FolderOpen,
  Upload,
  Download,
  Trash2,
  Copy,
  Clock,
  Grid3X3,
  Check,
  Edit2,
} from 'lucide-react';

interface SavedDesignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCols: number;
  currentRows: number;
  currentTiles: PlacedTile[];
  currentPalette: PaletteColor[];
  activeDesignId: string | null;
  onLoadDesign: (design: SavedDesign) => void;
  onDesignSaved: (design: SavedDesign) => void;
}

export const SavedDesignsModal: React.FC<SavedDesignsModalProps> = ({
  isOpen,
  onClose,
  currentCols,
  currentRows,
  currentTiles,
  currentPalette,
  activeDesignId,
  onLoadDesign,
  onDesignSaved,
}) => {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [designName, setDesignName] = useState('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDesigns = () => {
    setDesigns(getSavedDesigns());
  };

  useEffect(() => {
    if (isOpen) {
      loadDesigns();
      setSavedSuccessMsg(null);
      // Pre-fill name if current active design
      const active = getSavedDesigns().find((d) => d.id === activeDesignId);
      if (active) {
        setDesignName(active.name);
      } else {
        setDesignName(`Mosaic ${new Date().toLocaleDateString()}`);
      }
    }
  }, [isOpen, activeDesignId]);

  if (!isOpen) return null;

  const handleSaveAsNew = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveDesignToStorage(
      designName,
      currentCols,
      currentRows,
      currentTiles,
      currentPalette
    );
    loadDesigns();
    onDesignSaved(saved);
    setSavedSuccessMsg(`Saved "${saved.name}" successfully!`);
    setTimeout(() => setSavedSuccessMsg(null), 2500);
  };

  const handleUpdateCurrent = () => {
    if (!activeDesignId) return;
    const saved = saveDesignToStorage(
      designName,
      currentCols,
      currentRows,
      currentTiles,
      currentPalette,
      activeDesignId
    );
    loadDesigns();
    onDesignSaved(saved);
    setSavedSuccessMsg(`Updated "${saved.name}"!`);
    setTimeout(() => setSavedSuccessMsg(null), 2500);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete saved design "${name}"?`)) {
      deleteDesignFromStorage(id);
      loadDesigns();
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateDesignInStorage(id);
    loadDesigns();
  };

  const handleExportJson = (design: SavedDesign) => {
    const jsonStr = JSON.stringify(design, null, 2);
    downloadFile(jsonStr, `${design.name.toLowerCase().replace(/\s+/g, '_')}.json`, 'application/json');
  };

  const handleStartRename = (design: SavedDesign) => {
    setEditingId(design.id);
    setEditNameText(design.name);
  };

  const handleSaveRename = (design: SavedDesign) => {
    if (!editNameText.trim()) return;
    saveDesignToStorage(
      editNameText,
      design.cols,
      design.rows,
      design.tiles,
      design.palette,
      design.id
    );
    setEditingId(null);
    loadDesigns();
  };

  // Import JSON File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.tiles) && typeof parsed.cols === 'number') {
          const imported = saveDesignToStorage(
            file.name.replace(/\.json$/i, ''),
            parsed.cols,
            parsed.rows,
            parsed.tiles,
            parsed.palette || currentPalette
          );
          loadDesigns();
          onLoadDesign(imported);
          onClose();
        } else {
          alert('Invalid mosaic JSON file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Saved Designs</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Save, load, and manage your custom LEGO mosaics.
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

        {/* Quick Save Current Canvas Bar */}
        <div className="py-3 px-4 my-3 bg-neutral-950 border border-neutral-800 rounded-xl shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Current Canvas: <strong className="text-white font-mono">{currentCols}×{currentRows}</strong> ({currentTiles.length} tiles)</span>
            {savedSuccessMsg && (
              <span className="text-emerald-400 font-medium flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                {savedSuccessMsg}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAsNew} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Design title..."
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            {activeDesignId && (
              <button
                type="button"
                onClick={handleUpdateCurrent}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Update Existing
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as New</span>
            </button>
          </form>
        </div>

        {/* Saved Designs List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {designs.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl my-4">
              <FolderOpen className="w-8 h-8 text-neutral-600 mx-auto mb-2 opacity-50" />
              No saved designs in your browser yet. Type a name above and click &quot;Save as New&quot;.
            </div>
          ) : (
            designs.map((design) => {
              const isEditing = editingId === design.id;
              const dateStr = new Date(design.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={design.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 transition-all gap-4"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* SVG Mini Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <div
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{
                          __html: generateSvgString(design, 4),
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editNameText}
                            onChange={(e) => setEditNameText(e.target.value)}
                            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-xs text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(design)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-neutral-500 hover:text-neutral-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {design.name}
                          </h4>
                          <button
                            onClick={() => handleStartRename(design)}
                            className="text-neutral-500 hover:text-neutral-300 transition-colors"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono mt-0.5">
                        <span className="flex items-center gap-1">
                          <Grid3X3 className="w-3 h-3 text-neutral-500" />
                          {design.cols}×{design.rows}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{design.tiles.length} tiles</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleExportJson(design)}
                      title="Export design as JSON file"
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(design.id)}
                      title="Duplicate design"
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(design.id, design.name)}
                      title="Delete design"
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onLoadDesign(design);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 hover:text-amber-300 text-white rounded-lg transition-colors whitespace-nowrap ml-1"
                    >
                      Load
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with JSON file import */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-neutral-400" />
            <span>Import JSON File</span>
          </button>

          <span className="text-[11px] text-neutral-500 font-mono">
            {designs.length} designs stored locally
          </span>
        </div>
      </div>
    </div>
  );
};
