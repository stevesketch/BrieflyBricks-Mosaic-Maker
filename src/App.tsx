import React, { useState, useCallback, useEffect } from 'react';
import {
  BaseplateConfig,
  PaletteColor,
  PlacedTile,
  Rotation,
  TileType,
  ToolType,
  MosaicState,
  SavedDesign,
} from './types/mosaic';
import { LEGO_TILES, registerTile } from './constants/legoTiles';
import { INITIAL_LEGO_PALETTE } from './constants/legoColors';
import { STARTER_PRESETS, StarterPreset } from './presets/starterMosaics';
import { Header } from './components/Header';
import { TileLibrary } from './components/TileLibrary';
import { PaletteManager } from './components/PaletteManager';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { ExportModal } from './components/ExportModal';
import { BOMModal } from './components/BOMModal';
import { BaseplateModal } from './components/BaseplateModal';
import { PresetModal } from './components/PresetModal';
import { SavedDesignsModal } from './components/SavedDesignsModal';
import { AddTileModal } from './components/AddTileModal';

const MAX_HISTORY = 40;

export default function App() {
  // Grid Dimensions
  const [cols, setCols] = useState<number>(32);
  const [rows, setRows] = useState<number>(32);

  // Active saved design ID (if loaded or saved)
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null);

  // Initial starter preset: Classic Space Logo
  const initialPreset = STARTER_PRESETS[0];

  // Placed Tiles & History Stack
  const [tiles, setTiles] = useState<PlacedTile[]>(() => initialPreset.tiles);
  const [history, setHistory] = useState<PlacedTile[][]>(() => [initialPreset.tiles]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Palette State
  const [palette, setPalette] = useState<PaletteColor[]>(INITIAL_LEGO_PALETTE);
  const [selectedColor, setSelectedColor] = useState<string>('#0090D7'); // Briefly Deep Azure

  // Tile Selection & Rotation
  const [selectedTileType, setSelectedTileType] = useState<TileType>(LEGO_TILES[0]);
  const [rotation, setRotation] = useState<Rotation>(0);

  // Active Tool
  const [activeTool, setActiveTool] = useState<ToolType>('place');

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBOMOpen, setIsBOMOpen] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isSavedDesignsOpen, setIsSavedDesignsOpen] = useState(false);
  const [isAddTileOpen, setIsAddTileOpen] = useState(false);

  // Push new state onto history stack
  const commitTiles = useCallback(
    (newTiles: PlacedTile[]) => {
      setTiles(newTiles);
      setHistory((prev) => {
        const nextHistory = prev.slice(0, historyIndex + 1);
        if (nextHistory.length >= MAX_HISTORY) {
          nextHistory.shift();
        }
        return [...nextHistory, newTiles];
      });
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    },
    [historyIndex]
  );

  // Undo / Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setTiles(history[nextIndex]);
  }, [canUndo, historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setTiles(history[nextIndex]);
  }, [canRedo, historyIndex, history]);

  // Global Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z')) ||
        ((e.metaKey || e.ctrlKey) && (e.key === 'y' || e.key === 'Y'))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Tile Placement
  const handlePlaceTile = useCallback(
    (tile: PlacedTile) => {
      commitTiles([...tiles, tile]);
    },
    [tiles, commitTiles]
  );

  // Tile Move
  const handleMoveTile = useCallback(
    (tileId: string, newX: number, newY: number) => {
      const nextTiles = tiles.map((t) =>
        t.id === tileId ? { ...t, x: newX, y: newY } : t
      );
      commitTiles(nextTiles);
    },
    [tiles, commitTiles]
  );

  // Tile Rotate
  const handleRotateTile = useCallback(
    (tileId: string, newRotation: Rotation) => {
      const nextTiles = tiles.map((t) =>
        t.id === tileId ? { ...t, rotation: newRotation } : t
      );
      commitTiles(nextTiles);
    },
    [tiles, commitTiles]
  );

  // Tile Recolor
  const handleRecolorTile = useCallback(
    (tileId: string, newColor: string) => {
      const nextTiles = tiles.map((t) =>
        t.id === tileId ? { ...t, color: newColor } : t
      );
      commitTiles(nextTiles);
    },
    [tiles, commitTiles]
  );

  // Tile Delete
  const handleDeleteTile = useCallback(
    (tileId: string) => {
      const nextTiles = tiles.filter((t) => t.id !== tileId);
      commitTiles(nextTiles);
    },
    [tiles, commitTiles]
  );

  // Clear Canvas
  const handleClear = useCallback(() => {
    if (tiles.length === 0) return;
    if (window.confirm('Are you sure you want to clear the entire canvas? This action can be undone.')) {
      commitTiles([]);
    }
  }, [tiles, commitTiles]);

  // Rotation toggle
  const handleRotateCurrent = useCallback(() => {
    setRotation((prev) => ((prev + 90) % 360) as Rotation);
  }, []);

  // Palette Handlers
  const handleAddPaletteColor = (newCol: PaletteColor) => {
    setPalette((prev) => [...prev, newCol]);
  };

  const handleUpdatePaletteColor = (
    oldHex: string,
    newColor: PaletteColor,
    updateTiles: boolean
  ) => {
    setPalette((prev) =>
      prev.map((c) => (c.hex.toLowerCase() === oldHex.toLowerCase() ? newColor : c))
    );
    if (selectedColor.toLowerCase() === oldHex.toLowerCase()) {
      setSelectedColor(newColor.hex);
    }
    if (updateTiles) {
      const nextTiles = tiles.map((t) =>
        t.color.toLowerCase() === oldHex.toLowerCase()
          ? { ...t, color: newColor.hex }
          : t
      );
      commitTiles(nextTiles);
    }
  };

  const handleDeletePaletteColor = (id: string) => {
    setPalette((prev) => prev.filter((c) => c.id !== id));
  };

  // Eyedropper pick
  const handlePickColorAndType = (colorHex: string, typeId: string) => {
    setSelectedColor(colorHex);
    const tileDef = LEGO_TILES.find((t) => t.id === typeId);
    if (tileDef) {
      setSelectedTileType(tileDef);
    }
  };

  // Load Preset
  const handleSelectPreset = (preset: StarterPreset) => {
    setActiveDesignId(null);
    setCols(preset.cols);
    setRows(preset.rows);
    commitTiles(preset.tiles);
  };

  // Load Saved Design from library or imported file
  const handleLoadSavedDesign = (design: SavedDesign) => {
    setActiveDesignId(design.id);
    setCols(design.cols);
    setRows(design.rows);
    if (design.palette && design.palette.length > 0) {
      setPalette(design.palette);
    }
    commitTiles(design.tiles);
  };

  // Resize Baseplate Grid
  const handleApplyBaseplateSize = (newCols: number, newRows: number) => {
    setCols(newCols);
    setRows(newRows);
    // Filter tiles that stay inside bounds
    const insideTiles = tiles.filter(
      (t) => t.x >= 0 && t.x < newCols && t.y >= 0 && t.y < newRows
    );
    if (insideTiles.length !== tiles.length) {
      commitTiles(insideTiles);
    }
  };

  const mosaicState: MosaicState = {
    cols,
    rows,
    tiles,
    palette,
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100">
      {/* Top Header */}
      <Header
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenSavedDesigns={() => setIsSavedDesignsOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenSizeModal={() => setIsSizeModalOpen(true)}
        onOpenBOM={() => setIsBOMOpen(true)}
        onClear={handleClear}
        onOpenExport={() => setIsExportOpen(true)}
        tileCount={tiles.length}
        gridDimensions={{ cols, rows }}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Tile Library & Palette Manager */}
        <aside className="flex flex-col w-72 shrink-0 border-r border-neutral-800 bg-neutral-900 overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            <TileLibrary
              selectedTileType={selectedTileType}
              selectedColor={selectedColor}
              rotation={rotation}
              onSelectTileType={(t) => {
                setSelectedTileType(t);
                setActiveTool('place');
              }}
              onRotate={handleRotateCurrent}
              onDragStartTile={(t) => {
                setSelectedTileType(t);
                setActiveTool('place');
              }}
              onOpenAddTile={() => setIsAddTileOpen(true)}
            />
          </div>

          <PaletteManager
            palette={palette}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            onAddColor={handleAddPaletteColor}
            onUpdateColor={handleUpdatePaletteColor}
            onDeleteColor={handleDeletePaletteColor}
            isEyedropperActive={activeTool === 'eyedropper'}
            onToggleEyedropper={() =>
              setActiveTool(activeTool === 'eyedropper' ? 'place' : 'eyedropper')
            }
          />
        </aside>

        {/* Right Canvas: Interactive Grid & High-Performance Vector Board */}
        <main className="flex-1 h-full overflow-hidden flex flex-col">
          <CanvasWorkspace
            cols={cols}
            rows={rows}
            tiles={tiles}
            selectedTileType={selectedTileType}
            selectedColor={selectedColor}
            rotation={rotation}
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            onRotate={handleRotateCurrent}
            onPlaceTile={handlePlaceTile}
            onMoveTile={handleMoveTile}
            onRotateTile={handleRotateTile}
            onRecolorTile={handleRecolorTile}
            onDeleteTile={handleDeleteTile}
            onPickColorAndType={handlePickColorAndType}
          />
        </main>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        mosaic={mosaicState}
      />

      <BOMModal
        isOpen={isBOMOpen}
        onClose={() => setIsBOMOpen(false)}
        mosaic={mosaicState}
      />

      <BaseplateModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        currentCols={cols}
        currentRows={rows}
        onApplySize={handleApplyBaseplateSize}
        tileCount={tiles.length}
      />

      <PresetModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <SavedDesignsModal
        isOpen={isSavedDesignsOpen}
        onClose={() => setIsSavedDesignsOpen(false)}
        currentCols={cols}
        currentRows={rows}
        currentTiles={tiles}
        currentPalette={palette}
        activeDesignId={activeDesignId}
        onLoadDesign={handleLoadSavedDesign}
        onDesignSaved={(design) => setActiveDesignId(design.id)}
      />

      <AddTileModal
        isOpen={isAddTileOpen}
        onClose={() => setIsAddTileOpen(false)}
        selectedColor={selectedColor}
        onAddTile={(newTile) => {
          registerTile(newTile);
          setSelectedTileType(newTile);
          setActiveTool('place');
        }}
      />
    </div>
  );
}
