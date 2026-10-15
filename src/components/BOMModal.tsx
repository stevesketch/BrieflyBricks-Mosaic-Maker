import React, { useState } from 'react';
import { MosaicState } from '../types/mosaic';
import { generateBOM, generateBOMCsv, downloadFile } from '../utils/exportMosaic';
import { TILE_MAP } from '../constants/legoTiles';
import { X, Download, Copy, Check } from 'lucide-react';

interface BOMModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosaic: MosaicState;
}

export const BOMModal: React.FC<BOMModalProps> = ({
  isOpen,
  onClose,
  mosaic,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const bom = generateBOM(mosaic);
  const totalTiles = mosaic.tiles.length;

  const handleCopy = () => {
    const summary = bom
      .map(
        (item) =>
          `${item.count}x ${item.typeName} (#${item.legoPartNumber}) - ${item.colorName} (${item.colorHex})`
      )
      .join('\n');
    navigator.clipboard.writeText(`LEGO Mosaic Bill of Materials (${totalTiles} total pieces):\n\n${summary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csv = generateBOMCsv(bom);
    downloadFile(csv, `lego_mosaic_bom_${Date.now()}.csv`, 'text/csv');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Parts Inventory / Bill of Materials</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Exact element breakdown of official LEGO tiles used in this mosaic.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-3 py-4 shrink-0">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
            <span className="text-[10px] text-neutral-500 uppercase font-mono block">Total Tiles</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums">{totalTiles}</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
            <span className="text-[10px] text-neutral-500 uppercase font-mono block">Unique Tile Types</span>
            <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
              {new Set(bom.map((b) => b.typeId)).size}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
            <span className="text-[10px] text-neutral-500 uppercase font-mono block">Unique Colors</span>
            <span className="text-lg font-bold font-mono text-sky-400 tabular-nums">
              {new Set(bom.map((b) => b.colorHex)).size}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto border border-neutral-800 rounded-xl bg-neutral-950/60 my-2">
          {bom.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              No tiles placed yet. Drag tiles onto the grid to populate the inventory.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-900 sticky top-0 border-b border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-2.5 px-3">Shape</th>
                  <th className="py-2.5 px-3">Part Name</th>
                  <th className="py-2.5 px-3">Element #</th>
                  <th className="py-2.5 px-3">Color</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-neutral-300">
                {bom.map((item, idx) => {
                  const tileType = TILE_MAP.get(item.typeId);
                  const percentage = totalTiles > 0 ? ((item.count / totalTiles) * 100).toFixed(1) : '0';

                  return (
                    <tr key={idx} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-2 px-3">
                        <div className="w-6 h-6 flex items-center justify-center bg-neutral-900 rounded border border-neutral-800">
                          {tileType && (
                            <svg width={18} height={18} viewBox="0 0 24 24">
                              <g transform="scale(0.8)">
                                {tileType.renderSvg(0, 0, 24, 0, item.colorHex)}
                              </g>
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-sans font-medium text-white">{item.typeName}</td>
                      <td className="py-2 px-3 text-neutral-400">#{item.legoPartNumber}</td>
                      <td className="py-2 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          <span className="truncate max-w-[120px] text-neutral-200">{item.colorName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-white tabular-nums">{item.count}</td>
                      <td className="py-2 px-3 text-right text-neutral-500 tabular-nums">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-500 font-mono">Compatible with BrickLink / Rebrickable</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={bom.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy List'}</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              disabled={bom.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-semibold transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
