import React, { useState } from 'react';
import { MosaicState } from '../types/mosaic';
import {
  exportToSVG,
  exportToEPS,
  exportToPNG,
  exportToJSON,
  generateSvgString,
} from '../utils/exportMosaic';
import { X, FileCode, Image, FileText, Check, Copy } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosaic: MosaicState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  mosaic,
}) => {
  const [pngScale, setPngScale] = useState<number>(2);
  const [copiedSvg, setCopiedSvg] = useState(false);

  if (!isOpen) return null;

  const handleCopySvg = () => {
    const svgCode = generateSvgString(mosaic);
    navigator.clipboard.writeText(svgCode);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-white">Export Mosaic</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Pure vectors, no strokes, with transparent background.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mosaic summary info */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs text-center font-mono">
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase">Baseplate</span>
            <span className="text-neutral-200 font-bold">{mosaic.cols} × {mosaic.rows}</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase">Tiles</span>
            <span className="text-neutral-200 font-bold">{mosaic.tiles.length}</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase">Background</span>
            <span className="text-emerald-400 font-medium">Transparent</span>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          {/* 1. Vector SVG */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Vector SVG (.svg)</h4>
                <p className="text-xs text-neutral-400">
                  Infinitely scalable SVG paths. No strokes, fill only, zero background.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySvg}
                title="Copy SVG XML to clipboard"
                className="px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1"
              >
                {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSvg ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => exportToSVG(mosaic)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          {/* 2. Vector EPS */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Vector EPS (.eps)</h4>
                <p className="text-xs text-neutral-400">
                  Encapsulated PostScript for Adobe Illustrator, CorelDraw & laser cutting.
                </p>
              </div>
            </div>
            <button
              onClick={() => exportToEPS(mosaic)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-colors"
            >
              Download
            </button>
          </div>

          {/* 3. Transparent PNG */}
          <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Transparent PNG (.png)</h4>
                  <p className="text-xs text-neutral-400">
                    High-resolution raster export with alpha channel (no background).
                  </p>
                </div>
              </div>
              <button
                onClick={() => exportToPNG(mosaic, { scale: pngScale })}
                className="px-3.5 py-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white rounded-lg transition-colors"
              >
                Download
              </button>
            </div>

            {/* Resolution selector */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
              <span className="text-neutral-400">Resolution scale:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 4].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => setPngScale(scale)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      pngScale === scale
                        ? 'bg-neutral-800 text-white font-bold border border-neutral-700'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {scale}x ({mosaic.cols * 24 * scale}px)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Project backup */}
        <div className="pt-2 flex items-center justify-between text-xs text-neutral-400">
          <span>Need to save for later editing?</span>
          <button
            onClick={() => exportToJSON(mosaic)}
            className="text-amber-400 hover:underline font-medium"
          >
            Save Project File (.json)
          </button>
        </div>
      </div>
    </div>
  );
};
