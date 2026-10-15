import React, { useState } from 'react';
import { TileType, TileCategory, Rotation } from '../types/mosaic';
import {
  createRectangularTile,
  createRoundTile,
  createCapsuleTile,
  createCustomSvgTile,
} from '../constants/legoTiles';
import { X, Plus, Sparkles, Upload, FileCode2, RotateCw } from 'lucide-react';

interface AddTileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTile: (tile: TileType) => void;
  selectedColor: string;
}

type ShapeKind = 'rect' | 'round' | 'capsule' | 'svg';

const SAMPLE_SVG_PRESETS = [
  {
    name: '1×1 Star Tile',
    part: 'Star',
    width: 1,
    height: 1,
    category: 'curved' as TileCategory,
    viewBox: '0 0 100 100',
    path: 'M 50,5 L 64,34 L 96,39 L 73,62 L 78,94 L 50,79 L 22,94 L 27,62 L 4,39 L 36,34 Z',
  },
  {
    name: '1×1 Diamond Tile',
    part: 'Diamond',
    width: 1,
    height: 1,
    category: '1x1' as TileCategory,
    viewBox: '0 0 100 100',
    path: 'M 50,6 L 94,50 L 50,94 L 6,50 Z',
  },
  {
    name: '2×2 Hexagon Tile',
    part: 'Hexagon',
    width: 2,
    height: 2,
    category: '2x2' as TileCategory,
    viewBox: '0 0 100 100',
    path: 'M 50,5 L 90,27.5 L 90,72.5 L 50,95 L 10,72.5 L 10,27.5 Z',
  },
  {
    name: '1×2 Shield Tile',
    part: 'Shield',
    width: 1,
    height: 2,
    category: 'bars' as TileCategory,
    viewBox: '0 0 100 100',
    path: 'M 10,8 L 90,8 L 90,60 C 90,85 50,95 50,95 C 50,95 10,85 10,60 Z',
  },
];

export const AddTileModal: React.FC<AddTileModalProps> = ({
  isOpen,
  onClose,
  onAddTile,
  selectedColor,
}) => {
  const [shapeKind, setShapeKind] = useState<ShapeKind>('svg');
  const [name, setName] = useState('1×1 Star Tile');
  const [partNumber, setPartNumber] = useState('Custom-SVG');
  const [studWidth, setStudWidth] = useState(1);
  const [studHeight, setStudHeight] = useState(1);
  const [diameter, setDiameter] = useState(3);
  const [category, setCategory] = useState<TileCategory>('curved');

  // SVG-specific states
  const [svgPath, setSvgPath] = useState(SAMPLE_SVG_PRESETS[0].path);
  const [viewBox, setViewBox] = useState('0 0 100 100');
  const [previewRot, setPreviewRot] = useState<Rotation>(0);

  if (!isOpen) return null;

  const handleWidthChange = (w: number) => {
    setStudWidth(w);
    if (shapeKind === 'rect') setName(`${w}×${studHeight} Flat Tile`);
    else if (shapeKind === 'capsule') setName(`${w}×${studHeight} Capsule`);
  };

  const handleHeightChange = (h: number) => {
    setStudHeight(h);
    if (shapeKind === 'rect') setName(`${studWidth}×${h} Flat Tile`);
    else if (shapeKind === 'capsule') setName(`${studWidth}×${h} Capsule`);
  };

  const handleDiameterChange = (d: number) => {
    setDiameter(d);
    setName(`${d}×${d} Round Tile`);
  };

  const handleApplyPreset = (preset: typeof SAMPLE_SVG_PRESETS[0]) => {
    setName(preset.name);
    setPartNumber(preset.part);
    setStudWidth(preset.width);
    setStudHeight(preset.height);
    setCategory(preset.category);
    setViewBox(preset.viewBox);
    setSvgPath(preset.path);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setSvgPath(text);
        const vbMatch = text.match(/viewBox=["']([^"']+)["']/i);
        if (vbMatch) {
          setViewBox(vbMatch[1].trim());
        }
        const fileName = file.name.replace(/\.[^/.]+$/, '').trim();
        if (fileName) {
          setName(`${fileName} Tile`);
          setPartNumber(fileName.toUpperCase().replace(/\s+/g, '-'));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    let newTile: TileType;
    const id = `custom_tile_${Date.now()}`;

    if (shapeKind === 'svg') {
      newTile = createCustomSvgTile({
        id,
        name: name.trim() || `${studWidth}×${studHeight} SVG Tile`,
        legoPartNumber: partNumber.trim() || 'Custom',
        studWidth,
        studHeight,
        category,
        svgPath: svgPath.trim(),
        viewBox: viewBox.trim(),
      });
    } else if (shapeKind === 'rect') {
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
  if (shapeKind === 'svg') {
    previewTile = createCustomSvgTile({
      id: 'preview',
      name,
      legoPartNumber: partNumber,
      studWidth,
      studHeight,
      svgPath: svgPath.trim(),
      viewBox: viewBox.trim(),
    });
  } else if (shapeKind === 'rect') {
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

  const previewStudSize = 24;
  const isRot = previewRot === 90 || previewRot === 270;
  const pw = (isRot ? previewTile.studHeight : previewTile.studWidth) * previewStudSize;
  const ph = (isRot ? previewTile.studWidth : previewTile.studHeight) * previewStudSize;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Add Tile Shape to Library</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Add official dimensions or import custom vector shapes via SVG.
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
            <label className="text-xs font-semibold text-neutral-300">Creation Method</label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setShapeKind('svg');
                  setName('Custom SVG Tile');
                  setPartNumber('SVG-Tile');
                }}
                className={`py-2 px-2 rounded-xl border text-center font-medium transition-all ${
                  shapeKind === 'svg'
                    ? 'bg-amber-400/10 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Custom SVG
              </button>
              <button
                type="button"
                onClick={() => {
                  setShapeKind('rect');
                  setName(`${studWidth}×${studHeight} Flat Tile`);
                }}
                className={`py-2 px-2 rounded-xl border text-center font-medium transition-all ${
                  shapeKind === 'rect'
                    ? 'bg-amber-400/10 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Rectangular
              </button>
              <button
                type="button"
                onClick={() => {
                  setShapeKind('round');
                  setName(`${diameter}×${diameter} Round Tile`);
                }}
                className={`py-2 px-2 rounded-xl border text-center font-medium transition-all ${
                  shapeKind === 'round'
                    ? 'bg-amber-400/10 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Circular
              </button>
              <button
                type="button"
                onClick={() => {
                  setShapeKind('capsule');
                  setName(`${studWidth}×${studHeight} Capsule`);
                }}
                className={`py-2 px-2 rounded-xl border text-center font-medium transition-all ${
                  shapeKind === 'capsule'
                    ? 'bg-amber-400/10 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Capsule / Oval
              </button>
            </div>
          </div>

          {/* SVG Input Controls */}
          {shapeKind === 'svg' && (
            <div className="space-y-3 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>SVG Source & Presets</span>
                </span>
                <label className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium rounded-lg cursor-pointer transition-colors border border-neutral-700">
                  <Upload className="w-3 h-3 text-amber-400" />
                  <span>Upload .SVG</span>
                  <input
                    type="file"
                    accept=".svg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sample Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-neutral-500">Presets:</span>
                {SAMPLE_SVG_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-300 rounded text-[11px] transition-colors"
                  >
                    {p.name.split(' ')[1]}
                  </button>
                ))}
              </div>

              {/* SVG Path / Markup */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">SVG Path Data (d=&quot;...&quot;) or &lt;svg&gt; Markup</span>
                </div>
                <textarea
                  rows={3}
                  value={svgPath}
                  onChange={(e) => setSvgPath(e.target.value)}
                  placeholder="Paste SVG path data d=&quot;M 10 10 L 90 10 ... Z&quot; or raw &lt;svg&gt;..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 font-mono text-[11px] text-neutral-200 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-neutral-400 block mb-1 text-[11px]">ViewBox</span>
                  <input
                    type="text"
                    value={viewBox}
                    onChange={(e) => setViewBox(e.target.value)}
                    placeholder="0 0 100 100"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 font-mono text-white text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <span className="text-neutral-400 block mb-1 text-[11px]">Width (Studs)</span>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={studWidth}
                    onChange={(e) => setStudWidth(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 font-mono text-white text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <span className="text-neutral-400 block mb-1 text-[11px]">Height (Studs)</span>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={studHeight}
                    onChange={(e) => setStudHeight(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 font-mono text-white text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dimension Controls for Standard Shapes */}
          {shapeKind === 'round' && (
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
          )}

          {(shapeKind === 'rect' || shapeKind === 'capsule') && (
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
                placeholder="e.g. 1×1 Star Tile"
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
                placeholder="e.g. Custom or 9999"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center p-2 relative overflow-hidden">
                <svg width={pw} height={ph} viewBox={`0 0 ${pw} ${ph}`}>
                  {previewTile.renderSvg(0, 0, previewStudSize, previewRot, selectedColor, 'modal-preview')}
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{name}</div>
                <div className="text-[11px] font-mono text-neutral-500">
                  #{partNumber || 'Custom'} · {previewTile.studWidth}×{previewTile.studHeight} studs
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewRot(((previewRot + 90) % 360) as Rotation)}
                title="Rotate preview"
                className="flex items-center gap-1 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] font-mono transition-colors"
              >
                <RotateCw className="w-3 h-3" />
                <span>{previewRot}°</span>
              </button>
              <span className="text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-mono">
                Live Preview
              </span>
            </div>
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
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg transition-colors shadow-sm"
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
