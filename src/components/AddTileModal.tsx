import React, { useState } from 'react';
import { TileType, TileCategory } from '../types/mosaic';
import {
  createRectangularTile,
  createRoundTile,
  createCapsuleTile,
} from '../constants/legoTiles';
import { X, Plus, Sparkles } from 'lucide-react';

interface AddTileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTile: (tile: TileType) => void;
  selectedColor: string;
}

type ShapeKind = 'rect' | 'round' | 'capsule';

export const AddTileModal: React.FC<AddTileModalProps> = ({
  isOpen,
  onClose,
  onAddTile,
  selectedColor,
}) => {
  const [shapeKind, setShapeKind] = useState<ShapeKind>('rect');
  const [name, setName] = useState('1×6 Flat Tile');
  const [partNumber, setPartNumber] = useState('6636');
  const [studWidth, setStudWidth] = useState(6);
  const [studHeight, setStudHeight] = useState(1);
  const [diameter, setDiameter] = useState(3);
  const [category, setCategory] = useState<TileCategory>('bars');

  if (!isOpen) return null;

  // Auto-suggest name and category when dimensions change
  const handleWidthChange = (w: number) => {
    setStudWidth(w);
    setName(`${w}×${studHeight} Flat Tile`);
  };

  const handleHeightChange = (h: number) => {
    setStudHeight(h);
    setName(`${studWidth}×${h} Flat Tile`);
  };

  const handleDiameterChange = (d: number) => {
    setDiameter(d);
    setName(`${d}×${d} Round Tile`);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    let newTile: TileType;

    const id = `custom_tile_${Date.now()}`;

    if (shapeKind === 'rect') {
      newTile = createRectangularTile({
        id,
        name: name.trim() || `${studWidth}×${studHeight} Tile`,
        legoPartNumber: partNumber.trim() || 'Custom',
        studWidth,
        studHeight,
        category,
      });
    } else if (shapeKind === 'round') {
      newTile = createRoundTile({
        id,
        name: name.trim() || `${diameter}×${diameter} Round Tile`,
        legoPartNumber: partNumber.trim() || 'Custom',
        diameter,
        category: 'curved',
      });
    } else {
      newTile = createCapsuleTile({
        id,
        name: name.trim() || `${studWidth}×${studHeight} Capsule`,
        legoPartNumber: partNumber.trim() || 'Custom',
        studWidth,
        studHeight,
        category: 'curved',
      });
    }

    onAddTile(newTile);
    onClose();
  };

  // Preview instance
  let previewTile: TileType;
  if (shapeKind === 'rect') {
    previewTile = createRectangularTile({
      id: 'preview',
      name,
      legoPartNumber: partNumber,
      studWidth,
      studHeight,
    });
  } else if (shapeKind === 'round') {
    previewTile = createRoundTile({
      id: 'preview',
      name,
      legoPartNumber: partNumber,
      diameter,
    });
  } else {
    previewTile = createCapsuleTile({
      id: 'preview',
      name,
      legoPartNumber: partNumber,
      studWidth,
      studHeight,
    });
  }

  const previewStudSize = 20;
  const pw = previewTile.studWidth * previewStudSize;
  const ph = previewTile.studHeight * previewStudSize;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Add Custom Tile to Library</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Define dimensions, shape geometry, and official element code.
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

        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          {/* Shape selection tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Shape Geometry</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShapeKind('rect');
                  setName(`${studWidth}×${studHeight} Flat Tile`);
                }}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                  shapeKind === 'rect'
                    ? 'bg-amber-400/10 border-amber-500 text-amber-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Rectangular Tile
              </button>
              <button
                type="button"
                onClick={() => {
                  setShapeKind('round');
                  setName(`${diameter}×${diameter} Round Tile`);
                }}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                  shapeKind === 'round'
                    ? 'bg-amber-400/10 border-amber-500 text-amber-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Circular Tile
              </button>
              <button
                type="button"
                onClick={() => {
                  setShapeKind('capsule');
                  setName(`${studWidth}×${studHeight} Capsule`);
                }}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                  shapeKind === 'capsule'
                    ? 'bg-amber-400/10 border-amber-500 text-amber-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Capsule / Oval
              </button>
            </div>
          </div>

          {/* Dimension Controls */}
          {shapeKind === 'round' ? (
            <div className="space-y-1">
              <span className="text-neutral-400">Diameter (Studs): <strong>{diameter} studs</strong></span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 6].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDiameterChange(d)}
                    className={`flex-1 py-1.5 rounded-lg border font-mono ${
                      diameter === d
                        ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    {d}×{d}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-neutral-400 block mb-1">Width (Studs): <strong>{studWidth}</strong></span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={studWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <span className="text-neutral-400 block mb-1">Height (Studs): <strong>{studHeight}</strong></span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={studHeight}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Name & Part Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-neutral-400 block mb-1">Part Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 1×6 Flat Tile"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <span className="text-neutral-400 block mb-1">LEGO Element / Part #</span>
              <input
                type="text"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="e.g. 6636"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center p-2">
                <svg width={pw} height={ph} viewBox={`0 0 ${pw} ${ph}`}>
                  {previewTile.renderSvg(0, 0, previewStudSize, 0, selectedColor, 'modal-preview')}
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{name}</div>
                <div className="text-[11px] font-mono text-neutral-500">
                  #{partNumber || 'Custom'} · {previewTile.studWidth}×{previewTile.studHeight} studs
                </div>
              </div>
            </div>
            <span className="text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-mono">
              Live Preview
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Library</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
