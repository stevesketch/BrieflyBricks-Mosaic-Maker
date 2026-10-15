import React, { useState } from 'react';
import { LEGO_TILES } from '../constants/legoTiles';
import { Rotation, TileCategory, TileType } from '../types/mosaic';
import { RotateCw, Search, Plus } from 'lucide-react';

interface TileLibraryProps {
  selectedTileType: TileType;
  selectedColor: string;
  rotation: Rotation;
  onSelectTileType: (tile: TileType) => void;
  onRotate: () => void;
  onDragStartTile: (tileType: TileType) => void;
  onOpenAddTile?: () => void;
}

export const TileLibrary: React.FC<TileLibraryProps> = ({
  selectedTileType,
  selectedColor,
  rotation,
  onSelectTileType,
  onRotate,
  onDragStartTile,
  onOpenAddTile,
}) => {
  const [filterCategory, setFilterCategory] = useState<TileCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTiles = LEGO_TILES.filter((tile) => {
    const matchesCategory = filterCategory === 'all' || tile.category === filterCategory;
    const matchesSearch =
      tile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tile.legoPartNumber.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800 w-72 shrink-0 select-none">
      {/* Title & Rotation Bar */}
      <div className="p-4 border-b border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Tile Library
          </span>
          <div className="flex items-center gap-1.5">
            {onOpenAddTile && (
              <button
                onClick={onOpenAddTile}
                title="Add custom tile to library"
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tile</span>
              </button>
            )}
            <button
              onClick={onRotate}
              title="Rotate current tile 90° clockwise (Hotkey: R)"
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">{rotation}°</span>
              <kbd className="text-[10px] bg-neutral-900 px-1 rounded text-neutral-400">R</kbd>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search part name or #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800/80 text-[11px] overflow-x-auto">
          {(['all', '1x1', 'bars', 'curved', '2x2'] as TileCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 font-medium rounded capitalize whitespace-nowrap transition-colors ${
                filterCategory === cat
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tiles Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {filteredTiles.map((tile) => {
            const isSelected = selectedTileType.id === tile.id;
            const previewSize = 28;
            const containerWidth = 48;
            const containerHeight = 48;

            return (
              <div
                key={tile.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', tile.id);
                  onDragStartTile(tile);
                }}
                onClick={() => onSelectTileType(tile)}
                className={`group relative flex flex-col items-center justify-between p-2.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing text-left ${
                  isSelected
                    ? 'bg-neutral-800/80 border-amber-500/80 ring-1 ring-amber-500/30'
                    : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-800/40'
                }`}
              >
                {/* Vector Preview with pure fill, zero stroke */}
                <div className="w-12 h-12 flex items-center justify-center p-1 rounded bg-neutral-900/50">
                  <svg
                    width={containerWidth}
                    height={containerHeight}
                    viewBox={`0 0 ${containerWidth} ${containerHeight}`}
                    className="overflow-visible drop-shadow-sm"
                  >
                    {/* Render tile centered inside preview */}
                    <g transform={`translate(${(containerWidth - tile.studWidth * previewSize) / 2}, ${(containerHeight - tile.studHeight * previewSize) / 2})`}>
                      {tile.renderSvg(0, 0, previewSize, isSelected ? rotation : 0, selectedColor, `lib_${tile.id}`)}
                    </g>
                  </svg>
                </div>

                {/* Meta details */}
                <div className="mt-2 w-full text-center">
                  <div className="text-xs font-medium text-neutral-200 truncate group-hover:text-white">
                    {tile.name}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 font-mono mt-0.5">
                    <span>#{tile.legoPartNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>{tile.studWidth}×{tile.studHeight}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTiles.length === 0 && (
          <div className="p-6 text-center text-xs text-neutral-500">
            No matching tile shapes found.
          </div>
        )}
      </div>

      {/* Drag Helper Tip */}
      <div className="p-3 border-t border-neutral-800 text-[11px] text-neutral-400 bg-neutral-950/40 flex items-center justify-between">
        <span>Drag part or click to place</span>
        <span className="font-mono text-neutral-500">Grid Snap</span>
      </div>
    </div>
  );
};
