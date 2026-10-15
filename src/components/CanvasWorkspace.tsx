import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  PlacedTile,
  Rotation,
  TileType,
  ToolType,
} from '../types/mosaic';
import { TILE_MAP } from '../constants/legoTiles';
import {
  checkTileCollision,
  getTileOccupiedAbsoluteCells,
  buildSpatialGrid,
  GridCell,
} from '../utils/collision';
import {
  MousePointer,
  Stamp,
  Paintbrush,
  Eraser,
  Pipette,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

interface CanvasWorkspaceProps {
  cols: number;
  rows: number;
  tiles: PlacedTile[];
  selectedTileType: TileType;
  selectedColor: string;
  rotation: Rotation;
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onRotate: () => void;
  onPlaceTile: (tile: PlacedTile) => void;
  onMoveTile: (tileId: string, newX: number, newY: number) => void;
  onRotateTile: (tileId: string, newRotation: Rotation) => void;
  onRecolorTile: (tileId: string, newColor: string) => void;
  onDeleteTile: (tileId: string) => void;
  onPickColorAndType: (colorHex: string, typeId: string) => void;
}

const STUD_SIZE = 24; // Base pixels per LEGO stud

// Memoized placed tiles SVG layer to avoid re-rendering thousands of shapes on pointermove
const PlacedTilesLayer = React.memo<{
  tiles: PlacedTile[];
  studSize: number;
  selectedTileId: string | null;
}>(({ tiles, studSize, selectedTileId }) => {
  return (
    <g id="placed-tiles-layer" stroke="none">
      {tiles.map((tile) => {
        const tileType = TILE_MAP.get(tile.typeId);
        if (!tileType) return null;

        const x = tile.x * studSize;
        const y = tile.y * studSize;
        const isSelected = tile.id === selectedTileId;

        return (
          <g key={tile.id} className={isSelected ? 'filter drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]' : ''}>
            {tileType.renderSvg(x, y, studSize, tile.rotation, tile.color, tile.id)}
            {isSelected && (
              <rect
                x={x - 1}
                y={y - 1}
                width={tileType.studWidth * studSize + 2}
                height={tileType.studHeight * studSize + 2}
                fill="none"
                stroke="#FBBF24"
                strokeWidth={2}
                strokeDasharray="4 2"
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}
    </g>
  );
});

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  cols,
  rows,
  tiles,
  selectedTileType,
  selectedColor,
  rotation,
  activeTool,
  onSelectTool,
  onRotate,
  onPlaceTile,
  onMoveTile,
  onRotateTile,
  onRecolorTile,
  onDeleteTile,
  onPickColorAndType,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1.2);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Grid visual guide toggle
  const [showGridLines, setShowGridLines] = useState(true);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Hover & selection state
  const [hoverStud, setHoverStud] = useState<GridCell | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [isDraggingExistingTile, setIsDraggingExistingTile] = useState(false);
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);

  // Continuous pointer down state for brush/eraser
  const [isPointerDown, setIsPointerDown] = useState(false);

  // Fast O(1) spatial grid
  const spatialGrid = useMemo(() => buildSpatialGrid(tiles), [tiles]);

  // Selected tile object
  const selectedTile = useMemo(
    () => tiles.find((t) => t.id === selectedTileId) ?? null,
    [tiles, selectedTileId]
  );

  // Auto-center canvas on initial mount or baseplate size change
  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const boardW = cols * STUD_SIZE;
    const boardH = rows * STUD_SIZE;
    const padding = 60;

    const scaleX = (clientWidth - padding) / boardW;
    const scaleY = (clientHeight - padding) / boardH;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.4), 2.5);

    const newPanX = (clientWidth - boardW * newZoom) / 2;
    const newPanY = (clientHeight - boardH * newZoom) / 2;

    setZoom(newZoom);
    setPan({ x: Math.max(10, newPanX), y: Math.max(10, newPanY) });
  }, [cols, rows]);

  useEffect(() => {
    fitToView();
  }, [cols, rows, fitToView]);

  // Calculate stud coordinate from viewport mouse event
  const getStudCoords = useCallback(
    (clientX: number, clientY: number): GridCell | null => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const localX = (clientX - rect.left - pan.x) / zoom;
      const localY = (clientY - rect.top - pan.y) / zoom;

      const studX = Math.floor(localX / STUD_SIZE);
      const studY = Math.floor(localY / STUD_SIZE);

      if (studX < 0 || studX >= cols || studY < 0 || studY >= rows) {
        return null;
      }
      return { x: studX, y: studY };
    },
    [pan, zoom, cols, rows]
  );

  // Check collision for prospective placement or move
  const prospectivePlacement = useMemo(() => {
    if (!hoverStud) return null;

    if (activeTool === 'select' && isDraggingExistingTile && selectedTile) {
      // Moving existing tile
      const result = checkTileCollision(
        selectedTile.typeId,
        hoverStud.x,
        hoverStud.y,
        selectedTile.rotation,
        cols,
        rows,
        spatialGrid,
        selectedTile.id
      );
      return {
        typeId: selectedTile.typeId,
        x: hoverStud.x,
        y: hoverStud.y,
        rotation: selectedTile.rotation,
        color: selectedTile.color,
        valid: result.valid,
        reason: result.reason,
        occupiedCells: result.occupiedCells,
      };
    }

    if (activeTool === 'place') {
      const result = checkTileCollision(
        selectedTileType.id,
        hoverStud.x,
        hoverStud.y,
        rotation,
        cols,
        rows,
        spatialGrid
      );
      return {
        typeId: selectedTileType.id,
        x: hoverStud.x,
        y: hoverStud.y,
        rotation,
        color: selectedColor,
        valid: result.valid,
        reason: result.reason,
        occupiedCells: result.occupiedCells,
      };
    }

    return null;
  }, [
    hoverStud,
    activeTool,
    isDraggingExistingTile,
    selectedTile,
    selectedTileType,
    rotation,
    selectedColor,
    cols,
    rows,
    spatialGrid,
  ]);

  // Handle keyboard shortcuts (R for rotate, V, P, B, E, I, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        setIsSpacePressed(true);
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (selectedTileId && activeTool === 'select' && selectedTile) {
          const nextRot: Rotation = ((selectedTile.rotation + 90) % 360) as Rotation;
          const result = checkTileCollision(
            selectedTile.typeId,
            selectedTile.x,
            selectedTile.y,
            nextRot,
            cols,
            rows,
            spatialGrid,
            selectedTile.id
          );
          if (result.valid) {
            onRotateTile(selectedTile.id, nextRot);
            setCollisionWarning(null);
          } else {
            setCollisionWarning('Cannot rotate: tile would collide with another piece');
            setTimeout(() => setCollisionWarning(null), 2500);
          }
        } else {
          onRotate();
        }
      } else if (e.key === 'v' || e.key === 'V') {
        onSelectTool('select');
      } else if (e.key === 'p' || e.key === 'P') {
        onSelectTool('place');
      } else if (e.key === 'b' || e.key === 'B') {
        onSelectTool('recolor');
      } else if (e.key === 'e' || e.key === 'E') {
        onSelectTool('eraser');
      } else if (e.key === 'i' || e.key === 'I') {
        onSelectTool('eyedropper');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTileId) {
          e.preventDefault();
          onDeleteTile(selectedTileId);
          setSelectedTileId(null);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    selectedTileId,
    activeTool,
    selectedTile,
    cols,
    rows,
    spatialGrid,
    onRotate,
    onRotateTile,
    onSelectTool,
    onDeleteTile,
  ]);

  // Pointer interactions on canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Middle click or Space held -> start pan
    if (e.button === 1 || isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return; // Only primary mouse button

    setIsPointerDown(true);
    const stud = getStudCoords(e.clientX, e.clientY);
    if (!stud) {
      setSelectedTileId(null);
      return;
    }

    const clickedTileId = spatialGrid.get(`${stud.x},${stud.y}`);

    if (activeTool === 'select') {
      if (clickedTileId) {
        setSelectedTileId(clickedTileId);
        setIsDraggingExistingTile(true);
      } else {
        setSelectedTileId(null);
      }
    } else if (activeTool === 'place') {
      if (prospectivePlacement?.valid) {
        onPlaceTile({
          id: `tile_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          typeId: selectedTileType.id,
          x: stud.x,
          y: stud.y,
          rotation,
          color: selectedColor,
        });
        setCollisionWarning(null);
      } else if (prospectivePlacement && !prospectivePlacement.valid) {
        setCollisionWarning('Piece collides with an existing tile or edge');
        setTimeout(() => setCollisionWarning(null), 2000);
      }
    } else if (activeTool === 'recolor') {
      if (clickedTileId) {
        onRecolorTile(clickedTileId, selectedColor);
      }
    } else if (activeTool === 'eraser') {
      if (clickedTileId) {
        onDeleteTile(clickedTileId);
        if (selectedTileId === clickedTileId) setSelectedTileId(null);
      }
    } else if (activeTool === 'eyedropper') {
      if (clickedTileId) {
        const targetTile = tiles.find((t) => t.id === clickedTileId);
        if (targetTile) {
          onPickColorAndType(targetTile.color, targetTile.typeId);
          onSelectTool('place');
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const stud = getStudCoords(e.clientX, e.clientY);
    setHoverStud(stud);

    // Continuous brush / erase while dragging
    if (isPointerDown && stud) {
      const tileId = spatialGrid.get(`${stud.x},${stud.y}`);
      if (activeTool === 'recolor' && tileId) {
        onRecolorTile(tileId, selectedColor);
      } else if (activeTool === 'eraser' && tileId) {
        onDeleteTile(tileId);
        if (selectedTileId === tileId) setSelectedTileId(null);
      }
    }
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // If moving an existing tile and dropping in a valid spot
    if (activeTool === 'select' && isDraggingExistingTile && selectedTile && hoverStud) {
      if (prospectivePlacement?.valid) {
        onMoveTile(selectedTile.id, hoverStud.x, hoverStud.y);
        setCollisionWarning(null);
      } else if (prospectivePlacement && !prospectivePlacement.valid) {
        setCollisionWarning('Cannot place here: piece overlaps with another tile');
        setTimeout(() => setCollisionWarning(null), 2000);
      }
      setIsDraggingExistingTile(false);
    }

    setIsPointerDown(false);
  };

  // Drag-and-drop from external TileLibrary onto canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const stud = getStudCoords(e.clientX, e.clientY);
    setHoverStud(stud);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const typeId = e.dataTransfer.getData('text/plain');
    const tileType = TILE_MAP.get(typeId);
    if (!tileType) return;

    const stud = getStudCoords(e.clientX, e.clientY);
    if (!stud) return;

    // Check collision for dropped piece
    const result = checkTileCollision(
      tileType.id,
      stud.x,
      stud.y,
      rotation,
      cols,
      rows,
      spatialGrid
    );

    if (result.valid) {
      onPlaceTile({
        id: `tile_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        typeId: tileType.id,
        x: stud.x,
        y: stud.y,
        rotation,
        color: selectedColor,
      });
      setCollisionWarning(null);
    } else {
      setCollisionWarning('Cannot drop part: collides with an existing tile');
      setTimeout(() => setCollisionWarning(null), 2500);
    }
  };

  // Zoom wheel handling
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.4), 3.0));
    }
  };

  const boardWidth = cols * STUD_SIZE;
  const boardHeight = rows * STUD_SIZE;

  return (
    <div className="relative flex-1 h-full bg-neutral-950 overflow-hidden select-none flex flex-col">
      {/* Floating Toolbar (Tools, Rotate, View Controls) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 bg-neutral-900/90 backdrop-blur border border-neutral-800 rounded-xl shadow-lg">
        {/* Tool buttons */}
        <button
          onClick={() => onSelectTool('select')}
          title="Select / Move tool (Hotkey: V)"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'select'
              ? 'bg-amber-400 text-neutral-950 font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Select</span>
        </button>

        <button
          onClick={() => onSelectTool('place')}
          title="Place / Stamp tool (Hotkey: P)"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'place'
              ? 'bg-amber-400 text-neutral-950 font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Stamp className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Stamp</span>
        </button>

        <button
          onClick={() => onSelectTool('recolor')}
          title="Brush / Recolor tool (Hotkey: B)"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'recolor'
              ? 'bg-amber-400 text-neutral-950 font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Paintbrush className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Paint</span>
        </button>

        <button
          onClick={() => onSelectTool('eraser')}
          title="Eraser tool (Hotkey: E)"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'eraser'
              ? 'bg-rose-500 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Eraser className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Erase</span>
        </button>

        <button
          onClick={() => onSelectTool('eyedropper')}
          title="Eyedropper tool (Hotkey: I)"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTool === 'eyedropper'
              ? 'bg-amber-400 text-neutral-950 font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Pipette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pick</span>
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-1" />

        {/* Rotate Button */}
        <button
          onClick={onRotate}
          title="Rotate piece 90° (Hotkey: R)"
          className="flex items-center gap-1 px-2 py-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg text-xs font-medium transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="font-mono tabular-nums">{rotation}°</span>
        </button>
      </div>

      {/* Floating Canvas Controls (Zoom, Fit, Grid Toggle) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 p-1 bg-neutral-900/90 backdrop-blur border border-neutral-800 rounded-xl shadow-lg">
        <button
          onClick={() => setShowGridLines(!showGridLines)}
          title={showGridLines ? 'Hide stud grid lines' : 'Show stud grid lines'}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            showGridLines ? 'text-amber-400 bg-neutral-800' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {showGridLines ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
          title="Zoom Out"
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg text-xs transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] font-mono text-neutral-400 px-1 tabular-nums">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 3.0))}
          title="Zoom In"
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg text-xs transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={fitToView}
          title="Fit baseplate to viewport"
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg text-xs transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Collision Warning Banner */}
      {collisionWarning && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-500/90 text-white text-xs font-semibold shadow-lg backdrop-blur animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{collisionWarning}</span>
        </div>
      )}

      {/* Main Interactive SVG Canvas Area */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setHoverStud(null);
          setIsPointerDown(false);
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onWheel={handleWheel}
        className="flex-1 w-full h-full cursor-crosshair overflow-hidden touch-none"
      >
        <svg
          width="100%"
          height="100%"
          className="w-full h-full block"
        >
          <defs>
            {/* Stud dot pattern for official LEGO baseplate texture */}
            <pattern
              id="stud-pattern"
              width={STUD_SIZE}
              height={STUD_SIZE}
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx={STUD_SIZE / 2}
                cy={STUD_SIZE / 2}
                r={STUD_SIZE * 0.28}
                fill="#262626"
                stroke="#171717"
                strokeWidth={0.8}
              />
            </pattern>

            {/* Subtle grid lines */}
            <pattern
              id="grid-pattern"
              width={STUD_SIZE}
              height={STUD_SIZE}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${STUD_SIZE} 0 L 0 0 0 ${STUD_SIZE}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth={1}
              />
            </pattern>
          </defs>

          {/* Canvas Pan & Zoom Group */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Baseplate Container */}
            <rect
              x={0}
              y={0}
              width={boardWidth}
              height={boardHeight}
              fill="#1e1e1e"
              stroke="#2e2e2e"
              strokeWidth={2}
              rx={4}
              className="drop-shadow-2xl"
            />

            {/* Stud Texture */}
            <rect
              x={0}
              y={0}
              width={boardWidth}
              height={boardHeight}
              fill="url(#stud-pattern)"
              pointerEvents="none"
            />

            {/* Grid Line Guides */}
            {showGridLines && (
              <rect
                x={0}
                y={0}
                width={boardWidth}
                height={boardHeight}
                fill="url(#grid-pattern)"
                pointerEvents="none"
              />
            )}

            {/* 1. Memoized Placed Tiles Vector Layer (NO stroke, Fill only) */}
            <PlacedTilesLayer
              tiles={tiles}
              studSize={STUD_SIZE}
              selectedTileId={selectedTileId}
            />

            {/* 2. Interactive Overlay Layer (Ghost, Snap Lines, Collision Guides) */}
            <g id="interactive-overlay" pointerEvents="none">
              {/* Collision Cells Red Highlight */}
              {prospectivePlacement && !prospectivePlacement.valid && (
                <g>
                  {prospectivePlacement.occupiedCells.map((cell, idx) => (
                    <rect
                      key={idx}
                      x={cell.x * STUD_SIZE}
                      y={cell.y * STUD_SIZE}
                      width={STUD_SIZE}
                      height={STUD_SIZE}
                      fill="rgba(239, 68, 68, 0.35)"
                      stroke="#EF4444"
                      strokeWidth={1.5}
                      strokeDasharray="3 2"
                    />
                  ))}
                </g>
              )}

              {/* Placement Snap Ghost (Green guide if valid) */}
              {prospectivePlacement && (
                <g opacity={prospectivePlacement.valid ? 0.75 : 0.4}>
                  {TILE_MAP.get(prospectivePlacement.typeId)?.renderSvg(
                    prospectivePlacement.x * STUD_SIZE,
                    prospectivePlacement.y * STUD_SIZE,
                    STUD_SIZE,
                    prospectivePlacement.rotation,
                    prospectivePlacement.valid ? prospectivePlacement.color : '#EF4444',
                    'preview-ghost'
                  )}
                  {/* Subtle snap boundary indicator */}
                  {prospectivePlacement.valid && (
                    <rect
                      x={prospectivePlacement.x * STUD_SIZE - 1}
                      y={prospectivePlacement.y * STUD_SIZE - 1}
                      width={
                        (TILE_MAP.get(prospectivePlacement.typeId)?.studWidth ?? 1) * STUD_SIZE + 2
                      }
                      height={
                        (TILE_MAP.get(prospectivePlacement.typeId)?.studHeight ?? 1) * STUD_SIZE + 2
                      }
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                    />
                  )}
                </g>
              )}

              {/* Cursor Stud Coordinate Highlight */}
              {hoverStud && !prospectivePlacement && (
                <rect
                  x={hoverStud.x * STUD_SIZE}
                  y={hoverStud.y * STUD_SIZE}
                  width={STUD_SIZE}
                  height={STUD_SIZE}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={1}
                />
              )}
            </g>
          </g>
        </svg>
      </div>

      {/* Bottom Status Information Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-t border-neutral-800 text-xs text-neutral-400 select-none">
        <div className="flex items-center gap-3">
          <span>
            Tool: <strong className="text-neutral-200 capitalize">{activeTool}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Tile: <strong className="text-neutral-200">{selectedTileType.name}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <span>Color:</span>
            <div
              className="w-3.5 h-3.5 rounded-full border border-white/20"
              style={{ backgroundColor: selectedColor }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          {hoverStud ? (
            <span>
              Stud: X {hoverStud.x}, Y {hoverStud.y}
            </span>
          ) : (
            <span>Hover over baseplate</span>
          )}
          <span aria-hidden="true">·</span>
          <span>{tiles.length} tiles placed</span>
        </div>
      </div>
    </div>
  );
};
