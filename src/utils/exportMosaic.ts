import { MosaicState, PlacedTile, PartCountItem } from '../types/mosaic';
import { TILE_MAP } from '../constants/legoTiles';
import { hexToRgb } from '../constants/legoColors';

export interface ExportOptions {
  studSize?: number;
  transparentBg?: boolean;
  tightlyFit?: boolean;
  scale?: number; // 1, 2, 4 for PNG
}

/**
 * Downloads a string or blob as a file in the browser.
 */
export function downloadFile(content: Blob | string, filename: string, mimeType: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates raw SVG markup containing only vector shapes with no stroke and no background.
 */
export function generateSvgString(mosaic: MosaicState, studSize = 24): string {
  const width = mosaic.cols * studSize;
  const height = mosaic.rows * studSize;
  const inset = Math.max(0.5, Number((studSize * 0.032).toFixed(2)));
  const radius = Math.max(0.8, Number((studSize * 0.055).toFixed(2)));

  let shapesSvg = '';

  for (const tile of mosaic.tiles) {
    const tileType = TILE_MAP.get(tile.typeId);
    if (!tileType) continue;

    const x = tile.x * studSize;
    const y = tile.y * studSize;
    const s = studSize;
    const rot = tile.rotation;
    const fill = tile.color;

    if (tile.typeId === 'tile-1x1-round') {
      const cx = x + s / 2;
      const cy = y + s / 2;
      const r = s / 2 - inset;
      shapesSvg += `  <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="${fill}" stroke="none"/>\n`;
    } else if (tile.typeId === 'tile-1x1-square') {
      shapesSvg += `  <rect x="${(x + inset).toFixed(2)}" y="${(y + inset).toFixed(2)}" width="${(s - 2 * inset).toFixed(2)}" height="${(s - 2 * inset).toFixed(2)}" rx="${radius.toFixed(2)}" ry="${radius.toFixed(2)}" fill="${fill}" stroke="none"/>\n`;
    } else if (tile.typeId === 'tile-1x1-quarter-round') {
      const arcR = s - 2 * inset;
      let pathData = '';
      if (rot === 0) {
        const x0 = x + inset;
        const y0 = y + inset;
        pathData = `M ${(x0 + radius).toFixed(2)} ${y0.toFixed(2)} L ${(x0 + arcR).toFixed(2)} ${y0.toFixed(2)} A ${arcR.toFixed(2)} ${arcR.toFixed(2)} 0 0 1 ${x0.toFixed(2)} ${(y0 + arcR).toFixed(2)} L ${x0.toFixed(2)} ${(y0 + radius).toFixed(2)} Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${(x0 + radius).toFixed(2)} ${y0.toFixed(2)} Z`;
      } else if (rot === 90) {
        const x1 = x + s - inset;
        const y0 = y + inset;
        pathData = `M ${x1.toFixed(2)} ${(y0 + radius).toFixed(2)} L ${x1.toFixed(2)} ${(y0 + arcR).toFixed(2)} A ${arcR.toFixed(2)} ${arcR.toFixed(2)} 0 0 1 ${(x1 - arcR).toFixed(2)} ${y0.toFixed(2)} L ${(x1 - radius).toFixed(2)} ${y0.toFixed(2)} Q ${x1.toFixed(2)} ${y0.toFixed(2)} ${x1.toFixed(2)} ${(y0 + radius).toFixed(2)} Z`;
      } else if (rot === 180) {
        const x1 = x + s - inset;
        const y1 = y + s - inset;
        pathData = `M ${(x1 - radius).toFixed(2)} ${y1.toFixed(2)} L ${(x1 - arcR).toFixed(2)} ${y1.toFixed(2)} A ${arcR.toFixed(2)} ${arcR.toFixed(2)} 0 0 1 ${x1.toFixed(2)} ${(y1 - arcR).toFixed(2)} L ${x1.toFixed(2)} ${(y1 - radius).toFixed(2)} Q ${x1.toFixed(2)} ${y1.toFixed(2)} ${(x1 - radius).toFixed(2)} ${y1.toFixed(2)} Z`;
      } else {
        const x0 = x + inset;
        const y1 = y + s - inset;
        pathData = `M ${x0.toFixed(2)} ${(y1 - radius).toFixed(2)} L ${x0.toFixed(2)} ${(y1 - arcR).toFixed(2)} A ${arcR.toFixed(2)} ${arcR.toFixed(2)} 0 0 1 ${(x0 + arcR).toFixed(2)} ${y1.toFixed(2)} L ${(x0 + radius).toFixed(2)} ${y1.toFixed(2)} Q ${x0.toFixed(2)} ${y1.toFixed(2)} ${x0.toFixed(2)} ${(y1 - radius).toFixed(2)} Z`;
      }
      shapesSvg += `  <path d="${pathData}" fill="${fill}" stroke="none"/>\n`;
    } else if (tile.typeId === 'tile-1x2-half-round') {
      let path = '';
      const arcR = s - inset;
      if (rot === 0) {
        const left = x + inset;
        const right = x + 2 * s - inset;
        const bottom = y + s - inset;
        path = `M ${(left + radius).toFixed(2)} ${bottom.toFixed(2)} L ${(right - radius).toFixed(2)} ${bottom.toFixed(2)} Q ${right.toFixed(2)} ${bottom.toFixed(2)} ${right.toFixed(2)} ${(bottom - radius).toFixed(2)} A ${arcR.toFixed(2)} ${arcR.toFixed(2)} 0 0 0 ${left.toFixed(2)} ${(bottom - radius).toFixed(2)} Q ${left.toFixed(2)} ${bottom.toFixed(2)} ${(left + radius).toFixed(2)} ${bottom.toFixed(2)} Z`;
      } else if (rot === 90) {
        const left = x + inset;
        const top = y + inset;
        const bottom = y + 2 * s - inset;
        path = `M ${left.toFixed(2)} ${(top + radius).toFixed(2)} L ${left.toFixed(2)} ${(bottom - radius).toFixed(2)} Q ${left.toFixed(2)} ${bottom.toFixed(2)} ${(left + radius).toFixed(2)} ${bottom.toFixed(2)} A ${arcR.toFixed(2)} ${arcR.toFixed(2)} 0 0 0 ${(left + radius).toFixed(2)} ${top.toFixed(2)} Q ${left.toFixed(2)} ${top.toFixed(2)} ${left.toFixed(2)} ${(top + radius).toFixed(2)} Z`;
      } else if (rot === 180) {
        const left = x + inset;
        const right = x + 2 * s - inset;
        const top = y + inset;
        path = `M ${(right - radius).toFixed(2)} ${top.toFixed(2)} L ${(left + radius).toFixed(2)} ${top.toFixed(2)} Q ${left.toFixed(2)} ${top.toFixed(2)} ${left.toFixed(2)} ${(top + radius).toFixed(2)} A ${arcR.toFixed(2)} ${arcR.toFixed(2)} 0 0 0 ${right.toFixed(2)} ${(top + radius).toFixed(2)} Q ${right.toFixed(2)} ${top.toFixed(2)} ${(right - radius).toFixed(2)} ${top.toFixed(2)} Z`;
      } else {
        const right = x + s - inset;
        const top = y + inset;
        const bottom = y + 2 * s - inset;
        path = `M ${right.toFixed(2)} ${(bottom - radius).toFixed(2)} L ${right.toFixed(2)} ${(top + radius).toFixed(2)} Q ${right.toFixed(2)} ${top.toFixed(2)} ${(right - radius).toFixed(2)} ${top.toFixed(2)} A ${arcR.toFixed(2)} ${arcR.toFixed(2)} 0 0 0 ${(right - radius).toFixed(2)} ${bottom.toFixed(2)} Q ${right.toFixed(2)} ${bottom.toFixed(2)} ${right.toFixed(2)} ${(bottom - radius).toFixed(2)} Z`;
      }
      shapesSvg += `  <path d="${path}" fill="${fill}" stroke="none"/>\n`;
    } else if (tile.typeId === 'tile-1x2') {
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 2 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 2 * s) - 2 * inset;
      shapesSvg += `  <rect x="${(x + inset).toFixed(2)}" y="${(y + inset).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="${radius.toFixed(2)}" ry="${radius.toFixed(2)}" fill="${fill}" stroke="none"/>\n`;
    } else if (tile.typeId === 'tile-1x3') {
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 3 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 3 * s) - 2 * inset;
      shapesSvg += `  <rect x="${(x + inset).toFixed(2)}" y="${(y + inset).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="${radius.toFixed(2)}" ry="${radius.toFixed(2)}" fill="${fill}" stroke="none"/>\n`;
    } else if (tile.typeId === 'tile-1x4') {
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 4 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 4 * s) - 2 * inset;
      shapesSvg += `  <rect x="${(x + inset).toFixed(2)}" y="${(y + inset).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="${radius.toFixed(2)}" ry="${radius.toFixed(2)}" fill="${fill}" stroke="none"/>\n`;
    } else if (tile.typeId === 'tile-2x2-square') {
      shapesSvg += `  <rect x="${(x + inset).toFixed(2)}" y="${(y + inset).toFixed(2)}" width="${(2 * s - 2 * inset).toFixed(2)}" height="${(2 * s - 2 * inset).toFixed(2)}" rx="${radius.toFixed(2)}" ry="${radius.toFixed(2)}" fill="${fill}" stroke="none"/>\n`;
    } else if (tile.typeId === 'tile-2x2-round') {
      shapesSvg += `  <circle cx="${(x + s).toFixed(2)}" cy="${(y + s).toFixed(2)}" r="${(s - inset).toFixed(2)}" fill="${fill}" stroke="none"/>\n`;
    } else if (tile.typeId === 'tile-2x2-corner') {
      const x0 = x + inset;
      const y0 = y + inset;
      const x2 = x + 2 * s - inset;
      const y2 = y + 2 * s - inset;
      let path = '';
      if (rot === 0) {
        const xm = x + s + inset;
        const ym = y + s + inset;
        path = `M ${(x0 + radius).toFixed(2)} ${y0.toFixed(2)} L ${(x2 - radius).toFixed(2)} ${y0.toFixed(2)} Q ${x2.toFixed(2)} ${y0.toFixed(2)} ${x2.toFixed(2)} ${(y0 + radius).toFixed(2)} L ${x2.toFixed(2)} ${(ym - radius).toFixed(2)} Q ${x2.toFixed(2)} ${ym.toFixed(2)} ${(x2 - radius).toFixed(2)} ${ym.toFixed(2)} L ${(xm + radius).toFixed(2)} ${ym.toFixed(2)} Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${xm.toFixed(2)} ${(ym + radius).toFixed(2)} L ${xm.toFixed(2)} ${(y2 - radius).toFixed(2)} Q ${xm.toFixed(2)} ${y2.toFixed(2)} ${(xm - radius).toFixed(2)} ${y2.toFixed(2)} L ${(x0 + radius).toFixed(2)} ${y2.toFixed(2)} Q ${x0.toFixed(2)} ${y2.toFixed(2)} ${x0.toFixed(2)} ${(y2 - radius).toFixed(2)} L ${x0.toFixed(2)} ${(y0 + radius).toFixed(2)} Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${(x0 + radius).toFixed(2)} ${y0.toFixed(2)} Z`;
      } else if (rot === 90) {
        const xm = x + s - inset;
        const ym = y + s + inset;
        path = `M ${(x0 + radius).toFixed(2)} ${y0.toFixed(2)} L ${(x2 - radius).toFixed(2)} ${y0.toFixed(2)} Q ${x2.toFixed(2)} ${y0.toFixed(2)} ${x2.toFixed(2)} ${(y0 + radius).toFixed(2)} L ${x2.toFixed(2)} ${(y2 - radius).toFixed(2)} Q ${x2.toFixed(2)} ${y2.toFixed(2)} ${(x2 - radius).toFixed(2)} ${y2.toFixed(2)} L ${(xm + radius).toFixed(2)} ${y2.toFixed(2)} Q ${xm.toFixed(2)} ${y2.toFixed(2)} ${xm.toFixed(2)} ${(y2 - radius).toFixed(2)} L ${xm.toFixed(2)} ${(ym + radius).toFixed(2)} Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${(xm - radius).toFixed(2)} ${ym.toFixed(2)} L ${(x0 + radius).toFixed(2)} ${ym.toFixed(2)} Q ${x0.toFixed(2)} ${ym.toFixed(2)} ${x0.toFixed(2)} ${(ym - radius).toFixed(2)} L ${x0.toFixed(2)} ${(y0 + radius).toFixed(2)} Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${(x0 + radius).toFixed(2)} ${y0.toFixed(2)} Z`;
      } else if (rot === 180) {
        const xm = x + s - inset;
        const ym = y + s - inset;
        path = `M ${(xm + radius).toFixed(2)} ${y0.toFixed(2)} L ${(x2 - radius).toFixed(2)} ${y0.toFixed(2)} Q ${x2.toFixed(2)} ${y0.toFixed(2)} ${x2.toFixed(2)} ${(y0 + radius).toFixed(2)} L ${x2.toFixed(2)} ${(y2 - radius).toFixed(2)} Q ${x2.toFixed(2)} ${y2.toFixed(2)} ${(x2 - radius).toFixed(2)} ${y2.toFixed(2)} L ${(x0 + radius).toFixed(2)} ${y2.toFixed(2)} Q ${x0.toFixed(2)} ${y2.toFixed(2)} ${x0.toFixed(2)} ${(y2 - radius).toFixed(2)} L ${x0.toFixed(2)} ${(ym + radius).toFixed(2)} Q ${x0.toFixed(2)} ${ym.toFixed(2)} ${(x0 + radius).toFixed(2)} ${ym.toFixed(2)} L ${(xm - radius).toFixed(2)} ${ym.toFixed(2)} Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${xm.toFixed(2)} ${(ym - radius).toFixed(2)} L ${xm.toFixed(2)} ${(y0 + radius).toFixed(2)} Q ${xm.toFixed(2)} ${y0.toFixed(2)} ${(xm + radius).toFixed(2)} ${y0.toFixed(2)} Z`;
      } else {
        const xm = x + s + inset;
        const ym = y + s - inset;
        path = `M ${(x0 + radius).toFixed(2)} ${y0.toFixed(2)} L ${(xm - radius).toFixed(2)} ${y0.toFixed(2)} Q ${xm.toFixed(2)} ${y0.toFixed(2)} ${xm.toFixed(2)} ${(y0 + radius).toFixed(2)} L ${xm.toFixed(2)} ${(ym - radius).toFixed(2)} Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${(xm + radius).toFixed(2)} ${ym.toFixed(2)} L ${(x2 - radius).toFixed(2)} ${ym.toFixed(2)} Q ${x2.toFixed(2)} ${ym.toFixed(2)} ${x2.toFixed(2)} ${(ym + radius).toFixed(2)} L ${x2.toFixed(2)} ${(y2 - radius).toFixed(2)} Q ${x2.toFixed(2)} ${y2.toFixed(2)} ${(x2 - radius).toFixed(2)} ${y2.toFixed(2)} L ${(x0 + radius).toFixed(2)} ${y2.toFixed(2)} Q ${x0.toFixed(2)} ${y2.toFixed(2)} ${x0.toFixed(2)} ${(y2 - radius).toFixed(2)} L ${x0.toFixed(2)} ${(y0 + radius).toFixed(2)} Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${(x0 + radius).toFixed(2)} ${y0.toFixed(2)} Z`;
      }
      shapesSvg += `  <path d="${path}" fill="${fill}" stroke="none"/>\n`;
    } else if (tile.typeId === 'tile-1x2-capsule') {
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 2 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 2 * s) - 2 * inset;
      const r = (isHoriz ? h : w) / 2;
      shapesSvg += `  <rect x="${(x + inset).toFixed(2)}" y="${(y + inset).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="${r.toFixed(2)}" ry="${r.toFixed(2)}" fill="${fill}" stroke="none"/>\n`;
    } else if (tile.typeId === 'tile-1x1-heart') {
      const scaleS = s - 2 * inset;
      const transform = `translate(${(x + s / 2).toFixed(2)}, ${(y + s / 2).toFixed(2)}) rotate(${rot}) translate(${(-scaleS / 2).toFixed(2)}, ${(-scaleS / 2).toFixed(2)}) scale(${scaleS.toFixed(2)})`;
      shapesSvg += `  <path d="M 0.5 0.85 C 0.5 0.85 0.08 0.55 0.08 0.3 C 0.08 0.12 0.22 0.05 0.35 0.05 C 0.44 0.05 0.48 0.1 0.5 0.16 C 0.52 0.1 0.56 0.05 0.65 0.05 C 0.78 0.05 0.92 0.12 0.92 0.3 C 0.92 0.55 0.5 0.85 0.5 0.85 Z" fill="${fill}" stroke="none" transform="${transform}"/>\n`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Generated by BrickMosaic Studio: Vector LEGO Mosaic (No background, No strokes, Inward Offset & Rounded Corners) -->
  <g id="lego-tiles" stroke="none">
${shapesSvg}  </g>
</svg>`;
}

/**
 * Exports canvas as SVG vector file with no background.
 */
export function exportToSVG(mosaic: MosaicState, options: ExportOptions = {}) {
  const studSize = options.studSize ?? 24;
  const svgString = generateSvgString(mosaic, studSize);
  const timestamp = Date.now();
  downloadFile(svgString, `brick_mosaic_${mosaic.cols}x${mosaic.rows}_${timestamp}.svg`, 'image/svg+xml');
}

/**
 * Generates pure vector EPS (Encapsulated PostScript Level 3) vector code with zero background.
 */
export function generateEpsString(mosaic: MosaicState, studSize = 24): string {
  const width = mosaic.cols * studSize;
  const height = mosaic.rows * studSize;

  let body = '';
  for (const tile of mosaic.tiles) {
    const tileType = TILE_MAP.get(tile.typeId);
    if (!tileType) continue;

    const x = tile.x * studSize;
    const y = tile.y * studSize;
    const { r, g, b } = hexToRgb(tile.color);

    body += tileType.getEpsPostScript(x, y, studSize, tile.rotation, r, g, b);
  }

  return `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${width} ${height}
%%Title: LEGO Tile Mosaic Vector
%%Creator: BrickMosaic Studio
%%CreationDate: ${new Date().toISOString()}
%%Pages: 1
%%DocumentData: Clean7Bit
%%EndComments
%%Page: 1 1
save
0 ${height} translate
1 -1 scale
% LEGO Tile Vector Shapes (No stroke, Fill only, No background)
${body}restore
showpage
%%EOF
`;
}

/**
 * Exports canvas as EPS vector file with no background.
 */
export function exportToEPS(mosaic: MosaicState, options: ExportOptions = {}) {
  const studSize = options.studSize ?? 24;
  const epsString = generateEpsString(mosaic, studSize);
  const timestamp = Date.now();
  downloadFile(epsString, `brick_mosaic_${mosaic.cols}x${mosaic.rows}_${timestamp}.eps`, 'application/postscript');
}

/**
 * Exports canvas as high-res PNG image with transparent background.
 */
export async function exportToPNG(mosaic: MosaicState, options: ExportOptions = {}) {
  const studSize = options.studSize ?? 24;
  const scale = options.scale ?? 2;
  const width = mosaic.cols * studSize * scale;
  const height = mosaic.rows * studSize * scale;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear with transparent background
  ctx.clearRect(0, 0, width, height);

  ctx.scale(scale, scale);

  // Render every vector tile
  for (const tile of mosaic.tiles) {
    const tileType = TILE_MAP.get(tile.typeId);
    if (!tileType) continue;

    const x = tile.x * studSize;
    const y = tile.y * studSize;
    tileType.drawCanvas(ctx, x, y, studSize, tile.rotation, tile.color);
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const timestamp = Date.now();
    downloadFile(blob, `brick_mosaic_${mosaic.cols}x${mosaic.rows}_${scale}x_${timestamp}.png`, 'image/png');
  }, 'image/png');
}

/**
 * Exports the complete project configuration as JSON.
 */
export function exportToJSON(mosaic: MosaicState) {
  const jsonStr = JSON.stringify(mosaic, null, 2);
  const timestamp = Date.now();
  downloadFile(jsonStr, `brick_mosaic_project_${timestamp}.json`, 'application/json');
}

/**
 * Generates the Bill of Materials inventory count list.
 */
export function generateBOM(mosaic: MosaicState): PartCountItem[] {
  const countMap = new Map<string, PartCountItem>();

  for (const tile of mosaic.tiles) {
    const tileType = TILE_MAP.get(tile.typeId);
    const typeName = tileType ? tileType.name : tile.typeId;
    const legoPartNumber = tileType ? tileType.legoPartNumber : 'Unknown';

    // Find color name
    const paletteItem = mosaic.palette.find((p) => p.hex.toLowerCase() === tile.color.toLowerCase());
    const colorName = paletteItem ? paletteItem.name : tile.color;

    const key = `${tile.typeId}__${tile.color.toLowerCase()}`;
    const existing = countMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      countMap.set(key, {
        typeId: tile.typeId,
        typeName,
        legoPartNumber,
        colorHex: tile.color,
        colorName,
        count: 1,
      });
    }
  }

  return Array.from(countMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * Generates CSV string for Bill of Materials.
 */
export function generateBOMCsv(bom: PartCountItem[]): string {
  const headers = ['Part Name', 'LEGO Element #', 'Color Name', 'Hex Color', 'Quantity'];
  const rows = bom.map((item) => [
    `"${item.typeName}"`,
    `"${item.legoPartNumber}"`,
    `"${item.colorName}"`,
    `"${item.colorHex}"`,
    item.count.toString(),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
