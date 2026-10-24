import React from 'react';
import { CellCoord, Rotation, TileType, TileCategory } from '../types/mosaic';

// Helper to calculate proportional inward offset and corner radius
export const getTileGeometryParams = (s: number) => {
  const inset = Math.max(0.75, Number((s * 0.052).toFixed(2))); // ~1.25px at 24px stud (distinct seam gap between tiles)
  const radius = Math.max(1.2, Number((s * 0.088).toFixed(2))); // ~2.1px at 24px stud (softer, realistic corner rounding)
  return { inset, radius };
};

// Helper to rotate discrete occupied grid cells around bounding dimensions
export const rotateCells = (cells: CellCoord[], width: number, height: number, rot: Rotation): CellCoord[] => {
  if (rot === 0) return cells;
  return cells.map(({ dx, dy }) => {
    if (rot === 90) return { dx: height - 1 - dy, dy: dx };
    if (rot === 180) return { dx: width - 1 - dx, dy: height - 1 - dy };
    return { dx: dy, dy: width - 1 - dx };
  });
};

export const LEGO_TILES: TileType[] = [
  // 1. 1x1 Round Tile (#98138)
  {
    id: 'tile-1x1-round',
    name: '1×1 Round Tile',
    legoPartNumber: '98138',
    category: '1x1',
    studWidth: 1,
    studHeight: 1,
    getOccupiedCells: () => [{ dx: 0, dy: 0 }],
    renderSvg: (x, y, s, _rot, fill, id) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s / 2;
      const cy = y + s / 2;
      const r = s / 2 - inset;
      return (
        <circle
          key={id}
          cx={cx}
          cy={cy}
          r={r}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, _rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, s / 2 - inset, 0, Math.PI * 2);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, _rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s / 2;
      const cy = y + s / 2;
      const radius = s / 2 - inset;
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor newpath ${cx.toFixed(2)} ${cy.toFixed(2)} ${radius.toFixed(2)} 0 360 arc fill\n`;
    },
  },

  // 2. 1x1 Flat Square Tile (#3070b)
  {
    id: 'tile-1x1-square',
    name: '1×1 Flat Tile',
    legoPartNumber: '3070b',
    category: '1x1',
    studWidth: 1,
    studHeight: 1,
    getOccupiedCells: () => [{ dx: 0, dy: 0 }],
    renderSvg: (x, y, s, _rot, fill, id) => {
      const { inset, radius } = getTileGeometryParams(s);
      return (
        <rect
          key={id}
          x={x + inset}
          y={y + inset}
          width={s - 2 * inset}
          height={s - 2 * inset}
          rx={radius}
          ry={radius}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, _rot, fill) => {
      const { inset, radius } = getTileGeometryParams(s);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, s - 2 * inset, s - 2 * inset, radius);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, _rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const px = x + inset;
      const py = y + inset;
      const pw = s - 2 * inset;
      const ph = s - 2 * inset;
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor ${px.toFixed(2)} ${py.toFixed(2)} ${pw.toFixed(2)} ${ph.toFixed(2)} rectfill\n`;
    },
  },

  // 3. 1x1 Quarter Round Tile (#25269)
  {
    id: 'tile-1x1-quarter-round',
    name: '1×1 Quarter Round',
    legoPartNumber: '25269',
    category: 'curved',
    studWidth: 1,
    studHeight: 1,
    getOccupiedCells: () => [{ dx: 0, dy: 0 }],
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const arcR = s - 2 * inset;
      let pathData = '';

      if (rot === 0) {
        // Corner at top-left
        const x0 = x + inset;
        const y0 = y + inset;
        pathData = `M ${x0 + r} ${y0} L ${x0 + arcR} ${y0} A ${arcR} ${arcR} 0 0 1 ${x0} ${y0 + arcR} L ${x0} ${y0 + r} Q ${x0} ${y0} ${x0 + r} ${y0} Z`;
      } else if (rot === 90) {
        // Corner at top-right
        const x1 = x + s - inset;
        const y0 = y + inset;
        pathData = `M ${x1} ${y0 + r} L ${x1} ${y0 + arcR} A ${arcR} ${arcR} 0 0 1 ${x1 - arcR} ${y0} L ${x1 - r} ${y0} Q ${x1} ${y0} ${x1} ${y0 + r} Z`;
      } else if (rot === 180) {
        // Corner at bottom-right
        const x1 = x + s - inset;
        const y1 = y + s - inset;
        pathData = `M ${x1 - r} ${y1} L ${x1 - arcR} ${y1} A ${arcR} ${arcR} 0 0 1 ${x1} ${y1 - arcR} L ${x1} ${y1 - r} Q ${x1} ${y1} ${x1 - r} ${y1} Z`;
      } else {
        // Corner at bottom-left
        const x0 = x + inset;
        const y1 = y + s - inset;
        pathData = `M ${x0} ${y1 - r} L ${x0} ${y1 - arcR} A ${arcR} ${arcR} 0 0 1 ${x0 + arcR} ${y1} L ${x0 + r} ${y1} Q ${x0} ${y1} ${x0} ${y1 - r} Z`;
      }
      return <path key={id} d={pathData} fill={fill} stroke="none" />;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const arcR = s - 2 * inset;
      ctx.fillStyle = fill;
      ctx.beginPath();
      if (rot === 0) {
        ctx.moveTo(x + inset, y + inset);
        ctx.lineTo(x + inset + arcR, y + inset);
        ctx.arc(x + inset, y + inset, arcR, 0, Math.PI / 2);
      } else if (rot === 90) {
        ctx.moveTo(x + s - inset, y + inset);
        ctx.lineTo(x + s - inset, y + inset + arcR);
        ctx.arc(x + s - inset, y + inset, arcR, Math.PI / 2, Math.PI);
      } else if (rot === 180) {
        ctx.moveTo(x + s - inset, y + s - inset);
        ctx.lineTo(x + s - inset - arcR, y + s - inset);
        ctx.arc(x + s - inset, y + s - inset, arcR, Math.PI, (3 * Math.PI) / 2);
      } else {
        ctx.moveTo(x + inset, y + s - inset);
        ctx.lineTo(x + inset, y + s - inset - arcR);
        ctx.arc(x + inset, y + s - inset, arcR, (3 * Math.PI) / 2, 2 * Math.PI);
      }
      ctx.closePath();
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const arcR = s - 2 * inset;
      let arcCmd = '';
      if (rot === 0) {
        arcCmd = `${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)} moveto ${(x + inset + arcR).toFixed(2)} ${(y + inset).toFixed(2)} lineto ${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)} ${arcR.toFixed(2)} 0 90 arc closepath`;
      } else if (rot === 90) {
        arcCmd = `${(x + s - inset).toFixed(2)} ${(y + inset).toFixed(2)} moveto ${(x + s - inset).toFixed(2)} ${(y + inset + arcR).toFixed(2)} lineto ${(x + s - inset).toFixed(2)} ${(y + inset).toFixed(2)} ${arcR.toFixed(2)} 90 180 arc closepath`;
      } else if (rot === 180) {
        arcCmd = `${(x + s - inset).toFixed(2)} ${(y + s - inset).toFixed(2)} moveto ${(x + s - inset - arcR).toFixed(2)} ${(y + s - inset).toFixed(2)} lineto ${(x + s - inset).toFixed(2)} ${(y + s - inset).toFixed(2)} ${arcR.toFixed(2)} 180 270 arc closepath`;
      } else {
        arcCmd = `${(x + inset).toFixed(2)} ${(y + s - inset).toFixed(2)} moveto ${(x + inset).toFixed(2)} ${(y + s - inset - arcR).toFixed(2)} lineto ${(x + inset).toFixed(2)} ${(y + s - inset).toFixed(2)} ${arcR.toFixed(2)} 270 360 arc closepath`;
      }
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor newpath ${arcCmd} fill\n`;
    },
  },

  // 4. 1x2 Half Round Tile (#35399 / #1748 - Updated from 1x1 to official 1x2 Half Round!)
  {
    id: 'tile-1x2-half-round',
    name: '1×2 Half Round',
    legoPartNumber: '35399',
    category: 'curved',
    studWidth: 2,
    studHeight: 1,
    getOccupiedCells: (rot) => {
      if (rot === 0 || rot === 180) {
        return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }];
      }
      return [{ dx: 0, dy: 0 }, { dx: 0, dy: 1 }];
    },
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      let path = '';

      if (rot === 0) {
        // Flat base on bottom (length 2s), arched upwards to center top
        const left = x + inset;
        const right = x + 2 * s - inset;
        const bottom = y + s - inset;
        const rx = s - inset;
        const ry = s - 2 * inset;
        path = `M ${left + r} ${bottom} L ${right - r} ${bottom} Q ${right} ${bottom} ${right} ${bottom - r} A ${rx} ${ry} 0 0 0 ${left} ${bottom - r} Q ${left} ${bottom} ${left + r} ${bottom} Z`;
      } else if (rot === 90) {
        // Flat base on left (height 2s), arched rightwards
        const left = x + inset;
        const top = y + inset;
        const bottom = y + 2 * s - inset;
        const rx = s - 2 * inset;
        const ry = s - inset;
        path = `M ${left} ${top + r} L ${left} ${bottom - r} Q ${left} ${bottom} ${left + r} ${bottom} A ${rx} ${ry} 0 0 0 ${left + r} ${top} Q ${left} ${top} ${left} ${top + r} Z`;
      } else if (rot === 180) {
        // Flat base on top (length 2s), arched downwards
        const left = x + inset;
        const right = x + 2 * s - inset;
        const top = y + inset;
        const rx = s - inset;
        const ry = s - 2 * inset;
        path = `M ${right - r} ${top} L ${left + r} ${top} Q ${left} ${top} ${left} ${top + r} A ${rx} ${ry} 0 0 0 ${right} ${top + r} Q ${right} ${top} ${right - r} ${top} Z`;
      } else {
        // Flat base on right (height 2s), arched leftwards
        const right = x + s - inset;
        const top = y + inset;
        const bottom = y + 2 * s - inset;
        const rx = s - 2 * inset;
        const ry = s - inset;
        path = `M ${right} ${bottom - r} L ${right} ${top + r} Q ${right} ${top} ${right - r} ${top} A ${rx} ${ry} 0 0 0 ${right - r} ${bottom} Q ${right} ${bottom} ${right} ${bottom - r} Z`;
      }

      return <path key={id} d={path} fill={fill} stroke="none" />;
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      let path = '';

      if (rot === 0) {
        const left = x + inset;
        const right = x + 2 * s - inset;
        const bottom = y + s - inset;
        const rx = s - inset;
        const ry = s - 2 * inset;
        path = `M ${(left + r).toFixed(2)} ${bottom.toFixed(2)} L ${(right - r).toFixed(2)} ${bottom.toFixed(2)} Q ${right.toFixed(2)} ${bottom.toFixed(2)} ${right.toFixed(2)} ${(bottom - r).toFixed(2)} A ${rx.toFixed(2)} ${ry.toFixed(2)} 0 0 0 ${left.toFixed(2)} ${(bottom - r).toFixed(2)} Q ${left.toFixed(2)} ${bottom.toFixed(2)} ${(left + r).toFixed(2)} ${bottom.toFixed(2)} Z`;
      } else if (rot === 90) {
        const left = x + inset;
        const top = y + inset;
        const bottom = y + 2 * s - inset;
        const rx = s - 2 * inset;
        const ry = s - inset;
        path = `M ${left.toFixed(2)} ${(top + r).toFixed(2)} L ${left.toFixed(2)} ${(bottom - r).toFixed(2)} Q ${left.toFixed(2)} ${bottom.toFixed(2)} ${(left + r).toFixed(2)} ${bottom.toFixed(2)} A ${rx.toFixed(2)} ${ry.toFixed(2)} 0 0 0 ${(left + r).toFixed(2)} ${top.toFixed(2)} Q ${left.toFixed(2)} ${top.toFixed(2)} ${left.toFixed(2)} ${(top + r).toFixed(2)} Z`;
      } else if (rot === 180) {
        const left = x + inset;
        const right = x + 2 * s - inset;
        const top = y + inset;
        const rx = s - inset;
        const ry = s - 2 * inset;
        path = `M ${(right - r).toFixed(2)} ${top.toFixed(2)} L ${(left + r).toFixed(2)} ${top.toFixed(2)} Q ${left.toFixed(2)} ${top.toFixed(2)} ${left.toFixed(2)} ${(top + r).toFixed(2)} A ${rx.toFixed(2)} ${ry.toFixed(2)} 0 0 0 ${right.toFixed(2)} ${(top + r).toFixed(2)} Q ${right.toFixed(2)} ${top.toFixed(2)} ${(right - r).toFixed(2)} ${top.toFixed(2)} Z`;
      } else {
        const right = x + s - inset;
        const top = y + inset;
        const bottom = y + 2 * s - inset;
        const rx = s - 2 * inset;
        const ry = s - inset;
        path = `M ${right.toFixed(2)} ${(bottom - r).toFixed(2)} L ${right.toFixed(2)} ${(top + r).toFixed(2)} Q ${right.toFixed(2)} ${top.toFixed(2)} ${(right - r).toFixed(2)} ${top.toFixed(2)} A ${rx.toFixed(2)} ${ry.toFixed(2)} 0 0 0 ${(right - r).toFixed(2)} ${bottom.toFixed(2)} Q ${right.toFixed(2)} ${bottom.toFixed(2)} ${right.toFixed(2)} ${(bottom - r).toFixed(2)} Z`;
      }

      return `<path d="${path}" fill="${fill}" stroke="none"/>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      ctx.fillStyle = fill;
      ctx.beginPath();

      if (rot === 0) {
        const left = x + inset;
        const right = x + 2 * s - inset;
        const bottom = y + s - inset;
        const rx = s - inset;
        const ry = s - 2 * inset;
        ctx.moveTo(left + r, bottom);
        ctx.lineTo(right - r, bottom);
        ctx.quadraticCurveTo(right, bottom, right, bottom - r);
        ctx.ellipse(x + s, bottom, rx, ry, 0, 0, Math.PI, true);
        ctx.quadraticCurveTo(left, bottom, left + r, bottom);
      } else if (rot === 90) {
        const left = x + inset;
        const top = y + inset;
        const bottom = y + 2 * s - inset;
        const rx = s - 2 * inset;
        const ry = s - inset;
        ctx.moveTo(left, top + r);
        ctx.lineTo(left, bottom - r);
        ctx.quadraticCurveTo(left, bottom, left + r, bottom);
        ctx.ellipse(left, y + s, rx, ry, 0, Math.PI / 2, -Math.PI / 2, true);
        ctx.quadraticCurveTo(left, top, left, top + r);
      } else if (rot === 180) {
        const left = x + inset;
        const right = x + 2 * s - inset;
        const top = y + inset;
        const rx = s - inset;
        const ry = s - 2 * inset;
        ctx.moveTo(right - r, top);
        ctx.lineTo(left + r, top);
        ctx.quadraticCurveTo(left, top, left, top + r);
        ctx.ellipse(x + s, top, rx, ry, 0, Math.PI, 0, true);
        ctx.quadraticCurveTo(right, top, right - r, top);
      } else {
        const right = x + s - inset;
        const top = y + inset;
        const bottom = y + 2 * s - inset;
        const rx = s - 2 * inset;
        const ry = s - inset;
        ctx.moveTo(right, bottom - r);
        ctx.lineTo(right, top + r);
        ctx.quadraticCurveTo(right, top, right - r, top);
        ctx.ellipse(right, y + s, rx, ry, 0, -Math.PI / 2, Math.PI / 2, true);
        ctx.quadraticCurveTo(right, bottom, right, bottom - r);
      }
      ctx.closePath();
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      let cmd = '';
      if (rot === 0) {
        const cx = x + s;
        const cy = y + s - inset;
        const rx = s - inset;
        const ry = s - 2 * inset;
        cmd = `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rx.toFixed(2)} ${ry.toFixed(2)} scale\n0 0 1 180 360 arc\nclosepath fill\ngrestore\n`;
      } else if (rot === 90) {
        const cx = x + inset;
        const cy = y + s;
        const rx = s - 2 * inset;
        const ry = s - inset;
        cmd = `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rx.toFixed(2)} ${ry.toFixed(2)} scale\n0 0 1 270 90 arc\nclosepath fill\ngrestore\n`;
      } else if (rot === 180) {
        const cx = x + s;
        const cy = y + inset;
        const rx = s - inset;
        const ry = s - 2 * inset;
        cmd = `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rx.toFixed(2)} ${ry.toFixed(2)} scale\n0 0 1 0 180 arc\nclosepath fill\ngrestore\n`;
      } else {
        const cx = x + s - inset;
        const cy = y + s;
        const rx = s - 2 * inset;
        const ry = s - inset;
        cmd = `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rx.toFixed(2)} ${ry.toFixed(2)} scale\n0 0 1 90 270 arc\nclosepath fill\ngrestore\n`;
      }
      return cmd;
    },
  },

  // 5. 1x2 Flat Tile (#3069b)
  {
    id: 'tile-1x2',
    name: '1×2 Flat Tile',
    legoPartNumber: '3069b',
    category: 'bars',
    studWidth: 2,
    studHeight: 1,
    getOccupiedCells: (rot) => {
      if (rot === 0 || rot === 180) {
        return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }];
      }
      return [{ dx: 0, dy: 0 }, { dx: 0, dy: 1 }];
    },
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 2 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 2 * s) - 2 * inset;
      return (
        <rect
          key={id}
          x={x + inset}
          y={y + inset}
          width={w}
          height={h}
          rx={radius}
          ry={radius}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 2 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 2 * s) - 2 * inset;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, w, h, radius);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 2 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 2 * s) - 2 * inset;
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor ${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} rectfill\n`;
    },
  },

  // 6. 1x3 Flat Tile (#63864)
  {
    id: 'tile-1x3',
    name: '1×3 Flat Tile',
    legoPartNumber: '63864',
    category: 'bars',
    studWidth: 3,
    studHeight: 1,
    getOccupiedCells: (rot) => {
      if (rot === 0 || rot === 180) {
        return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 2, dy: 0 }];
      }
      return [{ dx: 0, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: 2 }];
    },
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 3 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 3 * s) - 2 * inset;
      return (
        <rect
          key={id}
          x={x + inset}
          y={y + inset}
          width={w}
          height={h}
          rx={radius}
          ry={radius}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 3 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 3 * s) - 2 * inset;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, w, h, radius);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 3 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 3 * s) - 2 * inset;
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor ${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} rectfill\n`;
    },
  },

  // 7. 1x4 Flat Tile (#2431)
  {
    id: 'tile-1x4',
    name: '1×4 Flat Tile',
    legoPartNumber: '2431',
    category: 'bars',
    studWidth: 4,
    studHeight: 1,
    getOccupiedCells: (rot) => {
      if (rot === 0 || rot === 180) {
        return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 2, dy: 0 }, { dx: 3, dy: 0 }];
      }
      return [{ dx: 0, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: 2 }, { dx: 0, dy: 3 }];
    },
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 4 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 4 * s) - 2 * inset;
      return (
        <rect
          key={id}
          x={x + inset}
          y={y + inset}
          width={w}
          height={h}
          rx={radius}
          ry={radius}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 4 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 4 * s) - 2 * inset;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, w, h, radius);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 4 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 4 * s) - 2 * inset;
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor ${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} rectfill\n`;
    },
  },

  // 8. 2x2 Flat Tile (#3068b)
  {
    id: 'tile-2x2-square',
    name: '2×2 Flat Tile',
    legoPartNumber: '3068b',
    category: '2x2',
    studWidth: 2,
    studHeight: 2,
    getOccupiedCells: () => [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
    ],
    renderSvg: (x, y, s, _rot, fill, id) => {
      const { inset, radius } = getTileGeometryParams(s);
      return (
        <rect
          key={id}
          x={x + inset}
          y={y + inset}
          width={2 * s - 2 * inset}
          height={2 * s - 2 * inset}
          rx={radius}
          ry={radius}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, _rot, fill) => {
      const { inset, radius } = getTileGeometryParams(s);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, 2 * s - 2 * inset, 2 * s - 2 * inset, radius);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, _rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor ${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)} ${(2 * s - 2 * inset).toFixed(2)} ${(2 * s - 2 * inset).toFixed(2)} rectfill\n`;
    },
  },

  // 9. 2x2 Round Tile (#14769)
  {
    id: 'tile-2x2-round',
    name: '2×2 Round Tile',
    legoPartNumber: '14769',
    category: '2x2',
    studWidth: 2,
    studHeight: 2,
    getOccupiedCells: () => [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
    ],
    renderSvg: (x, y, s, _rot, fill, id) => {
      const { inset } = getTileGeometryParams(s);
      return (
        <circle
          key={id}
          cx={x + s}
          cy={y + s}
          r={s - inset}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, _rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x + s, y + s, s - inset, 0, Math.PI * 2);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, _rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor newpath ${(x + s).toFixed(2)} ${(y + s).toFixed(2)} ${(s - inset).toFixed(2)} 0 360 arc fill\n`;
    },
  },

  // 10. 2x2 Corner Tile (L-shape #14719)
  {
    id: 'tile-2x2-corner',
    name: '2×2 Corner Tile',
    legoPartNumber: '14719',
    category: '2x2',
    studWidth: 2,
    studHeight: 2,
    getOccupiedCells: (rot) => {
      if (rot === 0) {
        return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }];
      } else if (rot === 90) {
        return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 1, dy: 1 }];
      } else if (rot === 180) {
        return [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }];
      } else {
        return [{ dx: 0, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }];
      }
    },
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const x0 = x + inset;
      const y0 = y + inset;
      const x2 = x + 2 * s - inset;
      const y2 = y + 2 * s - inset;
      let path = '';

      if (rot === 0) {
        const xm = x + s - inset;
        const ym = y + s - inset;
        path = `M ${x0 + r} ${y0} L ${x2 - r} ${y0} Q ${x2} ${y0} ${x2} ${y0 + r} L ${x2} ${ym - r} Q ${x2} ${ym} ${x2 - r} ${ym} L ${xm + r} ${ym} Q ${xm} ${ym} ${xm} ${ym + r} L ${xm} ${y2 - r} Q ${xm} ${y2} ${xm - r} ${y2} L ${x0 + r} ${y2} Q ${x0} ${y2} ${x0} ${y2 - r} L ${x0} ${y0 + r} Q ${x0} ${y0} ${x0 + r} ${y0} Z`;
      } else if (rot === 90) {
        const xm = x + s + inset;
        const ym = y + s - inset;
        path = `M ${x0 + r} ${y0} L ${x2 - r} ${y0} Q ${x2} ${y0} ${x2} ${y0 + r} L ${x2} ${y2 - r} Q ${x2} ${y2} ${x2 - r} ${y2} L ${xm + r} ${y2} Q ${xm} ${y2} ${xm} ${y2 - r} L ${xm} ${ym + r} Q ${xm} ${ym} ${xm - r} ${ym} L ${x0 + r} ${ym} Q ${x0} ${ym} ${x0} ${ym - r} L ${x0} ${y0 + r} Q ${x0} ${y0} ${x0 + r} ${y0} Z`;
      } else if (rot === 180) {
        const xm = x + s + inset;
        const ym = y + s + inset;
        path = `M ${xm + r} ${y0} L ${x2 - r} ${y0} Q ${x2} ${y0} ${x2} ${y0 + r} L ${x2} ${y2 - r} Q ${x2} ${y2} ${x2 - r} ${y2} L ${x0 + r} ${y2} Q ${x0} ${y2} ${x0} ${y2 - r} L ${x0} ${ym + r} Q ${x0} ${ym} ${x0 + r} ${ym} L ${xm - r} ${ym} Q ${xm} ${ym} ${xm} ${ym - r} L ${xm} ${y0 + r} Q ${xm} ${y0} ${xm + r} ${y0} Z`;
      } else {
        const xm = x + s - inset;
        const ym = y + s + inset;
        path = `M ${x0 + r} ${y0} L ${xm - r} ${y0} Q ${xm} ${y0} ${xm} ${y0 + r} L ${xm} ${ym - r} Q ${xm} ${ym} ${xm + r} ${ym} L ${x2 - r} ${ym} Q ${x2} ${ym} ${x2} ${ym + r} L ${x2} ${y2 - r} Q ${x2} ${y2} ${x2 - r} ${y2} L ${x0 + r} ${y2} Q ${x0} ${y2} ${x0} ${y2 - r} L ${x0} ${y0 + r} Q ${x0} ${y0} ${x0 + r} ${y0} Z`;
      }
      return <path key={id} d={path} fill={fill} stroke="none" />;
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const x0 = x + inset;
      const y0 = y + inset;
      const x2 = x + 2 * s - inset;
      const y2 = y + 2 * s - inset;
      let path = '';

      if (rot === 0) {
        const xm = x + s - inset;
        const ym = y + s - inset;
        path = `M ${(x0 + r).toFixed(2)} ${y0.toFixed(2)} L ${(x2 - r).toFixed(2)} ${y0.toFixed(2)} Q ${x2.toFixed(2)} ${y0.toFixed(2)} ${x2.toFixed(2)} ${(y0 + r).toFixed(2)} L ${x2.toFixed(2)} ${(ym - r).toFixed(2)} Q ${x2.toFixed(2)} ${ym.toFixed(2)} ${(x2 - r).toFixed(2)} ${ym.toFixed(2)} L ${(xm + r).toFixed(2)} ${ym.toFixed(2)} Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${xm.toFixed(2)} ${(ym + r).toFixed(2)} L ${xm.toFixed(2)} ${(y2 - r).toFixed(2)} Q ${xm.toFixed(2)} ${y2.toFixed(2)} ${(xm - r).toFixed(2)} ${y2.toFixed(2)} L ${(x0 + r).toFixed(2)} ${y2.toFixed(2)} Q ${x0.toFixed(2)} ${y2.toFixed(2)} ${x0.toFixed(2)} ${(y2 - r).toFixed(2)} L ${x0.toFixed(2)} ${(y0 + r).toFixed(2)} Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${(x0 + r).toFixed(2)} ${y0.toFixed(2)} Z`;
      } else if (rot === 90) {
        const xm = x + s + inset;
        const ym = y + s - inset;
        path = `M ${(x0 + r).toFixed(2)} ${y0.toFixed(2)} L ${(x2 - r).toFixed(2)} ${y0.toFixed(2)} Q ${x2.toFixed(2)} ${y0.toFixed(2)} ${x2.toFixed(2)} ${(y0 + r).toFixed(2)} L ${x2.toFixed(2)} ${(y2 - r).toFixed(2)} Q ${x2.toFixed(2)} ${y2.toFixed(2)} ${(x2 - r).toFixed(2)} ${y2.toFixed(2)} L ${(xm + r).toFixed(2)} ${y2.toFixed(2)} Q ${xm.toFixed(2)} ${y2.toFixed(2)} ${xm.toFixed(2)} ${(y2 - r).toFixed(2)} L ${xm.toFixed(2)} ${(ym + r).toFixed(2)} Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${(xm - r).toFixed(2)} ${ym.toFixed(2)} L ${(x0 + r).toFixed(2)} ${ym.toFixed(2)} Q ${x0.toFixed(2)} ${ym.toFixed(2)} ${x0.toFixed(2)} ${(ym - r).toFixed(2)} L ${x0.toFixed(2)} ${(y0 + r).toFixed(2)} Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${(x0 + r).toFixed(2)} ${y0.toFixed(2)} Z`;
      } else if (rot === 180) {
        const xm = x + s + inset;
        const ym = y + s + inset;
        path = `M ${(xm + r).toFixed(2)} ${y0.toFixed(2)} L ${(x2 - r).toFixed(2)} ${y0.toFixed(2)} Q ${x2.toFixed(2)} ${y0.toFixed(2)} ${x2.toFixed(2)} ${(y0 + r).toFixed(2)} L ${x2.toFixed(2)} ${(y2 - r).toFixed(2)} Q ${x2.toFixed(2)} ${y2.toFixed(2)} ${(x2 - r).toFixed(2)} ${y2.toFixed(2)} L ${(x0 + r).toFixed(2)} ${y2.toFixed(2)} Q ${x0.toFixed(2)} ${y2.toFixed(2)} ${x0.toFixed(2)} ${(y2 - r).toFixed(2)} L ${x0.toFixed(2)} ${(ym + r).toFixed(2)} Q ${x0.toFixed(2)} ${ym.toFixed(2)} ${(x0 + r).toFixed(2)} ${ym.toFixed(2)} L ${(xm - r).toFixed(2)} ${ym.toFixed(2)} Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${xm.toFixed(2)} ${(ym - r).toFixed(2)} L ${xm.toFixed(2)} ${(y0 + r).toFixed(2)} Q ${xm.toFixed(2)} ${y0.toFixed(2)} ${(xm + r).toFixed(2)} ${y0.toFixed(2)} Z`;
      } else {
        const xm = x + s - inset;
        const ym = y + s + inset;
        path = `M ${(x0 + r).toFixed(2)} ${y0.toFixed(2)} L ${(xm - r).toFixed(2)} ${y0.toFixed(2)} Q ${xm.toFixed(2)} ${y0.toFixed(2)} ${xm.toFixed(2)} ${(y0 + r).toFixed(2)} L ${xm.toFixed(2)} ${(ym - r).toFixed(2)} Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${(xm + r).toFixed(2)} ${ym.toFixed(2)} L ${(x2 - r).toFixed(2)} ${ym.toFixed(2)} Q ${x2.toFixed(2)} ${ym.toFixed(2)} ${x2.toFixed(2)} ${(ym + r).toFixed(2)} L ${x2.toFixed(2)} ${(y2 - r).toFixed(2)} Q ${x2.toFixed(2)} ${y2.toFixed(2)} ${(x2 - r).toFixed(2)} ${y2.toFixed(2)} L ${(x0 + r).toFixed(2)} ${y2.toFixed(2)} Q ${x0.toFixed(2)} ${y2.toFixed(2)} ${x0.toFixed(2)} ${(y2 - r).toFixed(2)} L ${x0.toFixed(2)} ${(y0 + r).toFixed(2)} Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${(x0 + r).toFixed(2)} ${y0.toFixed(2)} Z`;
      }
      return `<path d="${path}" fill="${fill}" stroke="none"/>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const x0 = x + inset;
      const y0 = y + inset;
      const x2 = x + 2 * s - inset;
      const y2 = y + 2 * s - inset;
      ctx.fillStyle = fill;
      ctx.beginPath();
      if (rot === 0) {
        const xm = x + s - inset;
        const ym = y + s - inset;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x2, y0);
        ctx.lineTo(x2, ym);
        ctx.lineTo(xm, ym);
        ctx.lineTo(xm, y2);
        ctx.lineTo(x0, y2);
      } else if (rot === 90) {
        const xm = x + s + inset;
        const ym = y + s - inset;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x2, y0);
        ctx.lineTo(x2, y2);
        ctx.lineTo(xm, y2);
        ctx.lineTo(xm, ym);
        ctx.lineTo(x0, ym);
      } else if (rot === 180) {
        const xm = x + s + inset;
        const ym = y + s + inset;
        ctx.moveTo(xm, y0);
        ctx.lineTo(x2, y0);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x0, y2);
        ctx.lineTo(x0, ym);
        ctx.lineTo(xm, ym);
      } else {
        const xm = x + s - inset;
        const ym = y + s + inset;
        ctx.moveTo(x0, y0);
        ctx.lineTo(xm, y0);
        ctx.lineTo(xm, ym);
        ctx.lineTo(x2, ym);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x0, y2);
      }
      ctx.closePath();
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const x0 = x + inset;
      const y0 = y + inset;
      const x2 = x + 2 * s - inset;
      const y2 = y + 2 * s - inset;
      let p = '';
      if (rot === 0) {
        const xm = x + s - inset;
        const ym = y + s - inset;
        p = `${x0.toFixed(2)} ${y0.toFixed(2)} moveto ${x2.toFixed(2)} ${y0.toFixed(2)} lineto ${x2.toFixed(2)} ${ym.toFixed(2)} lineto ${xm.toFixed(2)} ${ym.toFixed(2)} lineto ${xm.toFixed(2)} ${y2.toFixed(2)} lineto ${x0.toFixed(2)} ${y2.toFixed(2)} lineto closepath`;
      } else if (rot === 90) {
        const xm = x + s + inset;
        const ym = y + s - inset;
        p = `${x0.toFixed(2)} ${y0.toFixed(2)} moveto ${x2.toFixed(2)} ${y0.toFixed(2)} lineto ${x2.toFixed(2)} ${y2.toFixed(2)} lineto ${xm.toFixed(2)} ${y2.toFixed(2)} lineto ${xm.toFixed(2)} ${ym.toFixed(2)} lineto ${x0.toFixed(2)} ${ym.toFixed(2)} lineto closepath`;
      } else if (rot === 180) {
        const xm = x + s + inset;
        const ym = y + s + inset;
        p = `${xm.toFixed(2)} ${y0.toFixed(2)} moveto ${x2.toFixed(2)} ${y0.toFixed(2)} lineto ${x2.toFixed(2)} ${y2.toFixed(2)} lineto ${x0.toFixed(2)} ${y2.toFixed(2)} lineto ${x0.toFixed(2)} ${ym.toFixed(2)} lineto ${xm.toFixed(2)} ${ym.toFixed(2)} lineto closepath`;
      } else {
        const xm = x + s - inset;
        const ym = y + s + inset;
        p = `${x0.toFixed(2)} ${y0.toFixed(2)} moveto ${xm.toFixed(2)} ${y0.toFixed(2)} lineto ${xm.toFixed(2)} ${ym.toFixed(2)} lineto ${x2.toFixed(2)} ${ym.toFixed(2)} lineto ${x2.toFixed(2)} ${y2.toFixed(2)} lineto ${x0.toFixed(2)} ${y2.toFixed(2)} lineto closepath`;
      }
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor newpath ${p} fill\n`;
    },
  },

  // 11. 1x2 Capsule / Round Ends Tile (#1748)
  {
    id: 'tile-1x2-capsule',
    name: '1×2 Round Ends',
    legoPartNumber: '1748',
    category: 'curved',
    studWidth: 2,
    studHeight: 1,
    getOccupiedCells: (rot) => {
      if (rot === 0 || rot === 180) {
        return [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }];
      }
      return [{ dx: 0, dy: 0 }, { dx: 0, dy: 1 }];
    },
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 2 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 2 * s) - 2 * inset;
      const r = (isHoriz ? h : w) / 2;
      return (
        <rect
          key={id}
          x={x + inset}
          y={y + inset}
          width={w}
          height={h}
          rx={r}
          ry={r}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 2 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 2 * s) - 2 * inset;
      const r = (isHoriz ? h : w) / 2;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, w, h, r);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 2 * s : s) - 2 * inset;
      const h = (isHoriz ? s : 2 * s) - 2 * inset;
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor ${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} rectfill\n`;
    },
  },


  // 14. Tile, Round 2 x 4 Oval (#66857)
  {
    id: 'tile-2x4-oval',
    name: '2×4 Oval Tile',
    legoPartNumber: '66857',
    category: 'curved',
    studWidth: 4,
    studHeight: 2,
    getOccupiedCells: (rot) => {
      if (rot === 0 || rot === 180) {
        return [
          { dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 2, dy: 0 }, { dx: 3, dy: 0 },
          { dx: 0, dy: 1 }, { dx: 1, dy: 1 }, { dx: 2, dy: 1 }, { dx: 3, dy: 1 },
        ];
      }
      return [
        { dx: 0, dy: 0 }, { dx: 1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 1, dy: 1 },
        { dx: 0, dy: 2 }, { dx: 1, dy: 2 },
        { dx: 0, dy: 3 }, { dx: 1, dy: 3 },
      ];
    },
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 4 * s : 2 * s) - 2 * inset;
      const h = (isHoriz ? 2 * s : 4 * s) - 2 * inset;
      const r = Math.min(w, h) / 2;
      return (
        <rect
          key={id}
          x={x + inset}
          y={y + inset}
          width={w}
          height={h}
          rx={r}
          ry={r}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 4 * s : 2 * s) - 2 * inset;
      const h = (isHoriz ? 2 * s : 4 * s) - 2 * inset;
      const r = Math.min(w, h) / 2;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, w, h, r);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const isHoriz = rot === 0 || rot === 180;
      const w = (isHoriz ? 4 * s : 2 * s) - 2 * inset;
      const h = (isHoriz ? 2 * s : 4 * s) - 2 * inset;
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor ${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} rectfill\n`;
    },
  },



  // 18. Tile, Modified 2 x 2 Wedge Triangular (#35787)
  {
    id: 'tile-2x2-wedge-triangular',
    name: '2×2 Triangular Wedge',
    legoPartNumber: '35787',
    category: '2x2',
    studWidth: 2,
    studHeight: 2,
    getOccupiedCells: () => [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
    ],
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const half = s - inset;
      // Right triangle: top edge and left edge straight, diagonal hypotenuse
      const pathData = `M ${-half + r} ${-half} L ${half - r} ${-half} Q ${half} ${-half} ${half - r} ${-half + r} L ${-half + r} ${half - r} Q ${-half} ${half} ${-half} ${half - r} L ${-half} ${-half + r} Q ${-half} ${-half} ${-half + r} ${-half} Z`;

      return (
        <path
          key={id}
          d={pathData}
          fill={fill}
          stroke="none"
          transform={`translate(${cx}, ${cy}) rotate(${rot})`}
        />
      );
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const half = s - inset;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(-half + r, -half);
      ctx.lineTo(half - r, -half);
      ctx.quadraticCurveTo(half, -half, half - r, -half + r);
      ctx.lineTo(-half + r, half - r);
      ctx.quadraticCurveTo(-half, half, -half, half - r);
      ctx.lineTo(-half, -half + r);
      ctx.quadraticCurveTo(-half, -half, -half + r, -half);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const half = s - inset;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\nnewpath\n${(-half).toFixed(2)} ${(-half).toFixed(2)} moveto\n${half.toFixed(2)} ${(-half).toFixed(2)} lineto\n${(-half).toFixed(2)} ${half.toFixed(2)} lineto\nclosepath fill\ngrestore\n`;
    },
  },

  // 15. 1x1 U Tile (Arched Doorway shape matching attached SVG)
  {
    id: 'tile-1x1-u',
    name: '1×1 U Tile',
    legoPartNumber: '1x1-U',
    category: 'curved',
    studWidth: 1,
    studHeight: 1,
    getOccupiedCells: () => [{ dx: 0, dy: 0 }],
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s / 2;
      const cy = y + s / 2;
      const hw = s / 2 - inset;
      const hh = s / 2 - inset;
      const pathData = `M ${-hw + r} ${hh} L ${hw - r} ${hh} Q ${hw} ${hh} ${hw} ${hh - r} L ${hw} 0 A ${hw} ${hw} 0 0 0 ${-hw} 0 L ${-hw} ${hh - r} Q ${-hw} ${hh} ${-hw + r} ${hh} Z`;
      return (
        <path
          key={id}
          d={pathData}
          fill={fill}
          stroke="none"
          transform={`translate(${cx}, ${cy}) rotate(${rot})`}
        />
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s / 2;
      const cy = y + s / 2;
      const hw = s / 2 - inset;
      const hh = s / 2 - inset;
      const pathData = `M ${(-hw + r).toFixed(2)} ${hh.toFixed(2)} L ${(hw - r).toFixed(2)} ${hh.toFixed(2)} Q ${hw.toFixed(2)} ${hh.toFixed(2)} ${hw.toFixed(2)} ${(hh - r).toFixed(2)} L ${hw.toFixed(2)} 0 A ${hw.toFixed(2)} ${hw.toFixed(2)} 0 0 0 ${(-hw).toFixed(2)} 0 L ${(-hw).toFixed(2)} ${(hh - r).toFixed(2)} Q ${(-hw).toFixed(2)} ${hh.toFixed(2)} ${(-hw + r).toFixed(2)} ${hh.toFixed(2)} Z`;
      return `<path d="${pathData}" fill="${fill}" stroke="none" transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot})"/>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s / 2;
      const cy = y + s / 2;
      const hw = s / 2 - inset;
      const hh = s / 2 - inset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(-hw + r, hh);
      ctx.lineTo(hw - r, hh);
      ctx.quadraticCurveTo(hw, hh, hw, hh - r);
      ctx.lineTo(hw, 0);
      ctx.arc(0, 0, hw, 0, Math.PI, true);
      ctx.lineTo(-hw, hh - r);
      ctx.quadraticCurveTo(-hw, hh, -hw + r, hh);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset, radius } = getTileGeometryParams(s);
      const cx = x + s / 2;
      const cy = y + s / 2;
      const hw = s / 2 - inset;
      const hh = s / 2 - inset;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\nnewpath\n${(-hw + radius).toFixed(2)} ${hh.toFixed(2)} moveto\n${(hw - radius).toFixed(2)} ${hh.toFixed(2)} lineto\n${hw.toFixed(2)} 0 lineto\n0 0 ${hw.toFixed(2)} 0 180 arc\n${(-hw).toFixed(2)} ${(hh - radius).toFixed(2)} lineto\nclosepath fill\ngrestore\n`;
    },
  },


  // 20. 2x2 Curved Cutouts (#65617) - Matches attached SVG
  {
    id: 'tile-2x2-curved-cutouts',
    name: '2×2 Curved Cutouts',
    legoPartNumber: '65617',
    category: '2x2',
    studWidth: 2,
    studHeight: 2,
    getOccupiedCells: (rot) => {
      const base = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }];
      return rotateCells(base, 2, 2, rot);
    },
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const hw = s - inset;
      const hh = s - inset;
      const k = 13.25 / 24;
      const cp1 = -hh + k * hh;
      const cp2 = -hw + k * hw;
      const cp3 = hh - k * hh;
      const cp4 = hw - k * hw;
      const pathData = `M 0 ${-hh} C 0 ${cp1} ${cp2} 0 ${-hw} 0 L ${-hw} ${hh - r} Q ${-hw} ${hh} ${-hw + r} ${hh} L 0 ${hh} C 0 ${cp3} ${cp4} 0 ${hw} 0 L ${hw} ${-hh + r} Q ${hw} ${-hh} ${hw - r} ${-hh} Z`;
      return (
        <path
          key={id}
          d={pathData}
          fill={fill}
          stroke="none"
          transform={`translate(${cx}, ${cy}) rotate(${rot})`}
        />
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const hw = s - inset;
      const hh = s - inset;
      const k = 13.25 / 24;
      const cp1 = -hh + k * hh;
      const cp2 = -hw + k * hw;
      const cp3 = hh - k * hh;
      const cp4 = hw - k * hw;
      const pathData = `M 0 ${(-hh).toFixed(2)} C 0 ${cp1.toFixed(2)} ${cp2.toFixed(2)} 0 ${(-hw).toFixed(2)} 0 L ${(-hw).toFixed(2)} ${(hh - r).toFixed(2)} Q ${(-hw).toFixed(2)} ${hh.toFixed(2)} ${(-hw + r).toFixed(2)} ${hh.toFixed(2)} L 0 ${hh.toFixed(2)} C 0 ${cp3.toFixed(2)} ${cp4.toFixed(2)} 0 ${hw.toFixed(2)} 0 L ${hw.toFixed(2)} ${(-hh + r).toFixed(2)} Q ${hw.toFixed(2)} ${(-hh).toFixed(2)} ${(hw - r).toFixed(2)} ${(-hh).toFixed(2)} Z`;
      return `<path d="${pathData}" fill="${fill}" stroke="none" transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot})"/>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const hw = s - inset;
      const hh = s - inset;
      const k = 13.25 / 24;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.bezierCurveTo(0, -hh + k * hh, -hw + k * hw, 0, -hw, 0);
      ctx.lineTo(-hw, hh - r);
      ctx.quadraticCurveTo(-hw, hh, -hw + r, hh);
      ctx.lineTo(0, hh);
      ctx.bezierCurveTo(0, hh - k * hh, hw - k * hw, 0, hw, 0);
      ctx.lineTo(hw, -hh + r);
      ctx.quadraticCurveTo(hw, -hh, hw - r, -hh);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset, radius } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const hw = s - inset;
      const hh = s - inset;
      const k = 13.25 / 24;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\nnewpath\n0 ${(-hh).toFixed(2)} moveto\n0 ${(-hh + k * hh).toFixed(2)} ${(-hw + k * hw).toFixed(2)} 0 ${(-hw).toFixed(2)} 0 curveto\n${(-hw).toFixed(2)} ${(hh - radius).toFixed(2)} lineto\n${(-hw + radius).toFixed(2)} ${hh.toFixed(2)} lineto\n0 ${hh.toFixed(2)} lineto\n0 ${(hh - k * hh).toFixed(2)} ${(hw - k * hw).toFixed(2)} 0 ${hw.toFixed(2)} 0 curveto\n${hw.toFixed(2)} ${(-hh + radius).toFixed(2)} lineto\n${(hw - radius).toFixed(2)} ${(-hh).toFixed(2)} lineto\nclosepath fill\ngrestore\n`;
    },
  },

  // 21. 2x2 Macaroni Tile (#27925)
  {
    id: 'tile-2x2-macaroni',
    name: '2×2 Macaroni Tile',
    legoPartNumber: '27925',
    category: '2x2',
    studWidth: 2,
    studHeight: 2,
    getOccupiedCells: (rot) => {
      const base = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }];
      return rotateCells(base, 2, 2, rot);
    },
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const rOut = 2 * s - inset;
      const rIn = s + inset;
      const arcCenterX = -s + inset;
      const arcCenterY = -s + inset;
      const hw = s - inset;
      const pathData = `M ${arcCenterX + rIn + r} ${arcCenterY} L ${hw - r} ${arcCenterY} Q ${hw} ${arcCenterY} ${hw} ${arcCenterY + r} A ${rOut} ${rOut} 0 0 1 ${arcCenterX + r} ${hw} Q ${arcCenterX} ${hw} ${arcCenterX} ${hw - r} L ${arcCenterX} ${arcCenterY + rIn + r} Q ${arcCenterX} ${arcCenterY + rIn} ${arcCenterX + r} ${arcCenterY + rIn} A ${rIn} ${rIn} 0 0 0 ${arcCenterX + rIn} ${arcCenterY + r} Q ${arcCenterX + rIn} ${arcCenterY} ${arcCenterX + rIn + r} ${arcCenterY} Z`;
      return (
        <path
          key={id}
          d={pathData}
          fill={fill}
          stroke="none"
          transform={`translate(${cx}, ${cy}) rotate(${rot})`}
        />
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const rOut = 2 * s - inset;
      const rIn = s + inset;
      const arcCenterX = -s + inset;
      const arcCenterY = -s + inset;
      const hw = s - inset;
      const pathData = `M ${(arcCenterX + rIn + r).toFixed(2)} ${arcCenterY.toFixed(2)} L ${(hw - r).toFixed(2)} ${arcCenterY.toFixed(2)} Q ${hw.toFixed(2)} ${arcCenterY.toFixed(2)} ${hw.toFixed(2)} ${(arcCenterY + r).toFixed(2)} A ${rOut.toFixed(2)} ${rOut.toFixed(2)} 0 0 1 ${(arcCenterX + r).toFixed(2)} ${hw.toFixed(2)} Q ${arcCenterX.toFixed(2)} ${hw.toFixed(2)} ${arcCenterX.toFixed(2)} ${(hw - r).toFixed(2)} L ${arcCenterX.toFixed(2)} ${(arcCenterY + rIn + r).toFixed(2)} Q ${arcCenterX.toFixed(2)} ${(arcCenterY + rIn).toFixed(2)} ${(arcCenterX + r).toFixed(2)} ${(arcCenterY + rIn).toFixed(2)} A ${rIn.toFixed(2)} ${rIn.toFixed(2)} 0 0 0 ${(arcCenterX + rIn).toFixed(2)} ${(arcCenterY + r).toFixed(2)} Q ${(arcCenterX + rIn).toFixed(2)} ${arcCenterY.toFixed(2)} ${(arcCenterX + rIn + r).toFixed(2)} ${arcCenterY.toFixed(2)} Z`;
      return `<path d="${pathData}" fill="${fill}" stroke="none" transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot})"/>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const rOut = 2 * s - inset;
      const rIn = s + inset;
      const arcCenterX = -s + inset;
      const arcCenterY = -s + inset;
      const hw = s - inset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(arcCenterX + rIn + r, arcCenterY);
      ctx.lineTo(hw - r, arcCenterY);
      ctx.quadraticCurveTo(hw, arcCenterY, hw, arcCenterY + r);
      ctx.arc(arcCenterX, arcCenterY, rOut, 0, Math.PI / 2, false);
      ctx.lineTo(arcCenterX, arcCenterY + rIn + r);
      ctx.quadraticCurveTo(arcCenterX, arcCenterY + rIn, arcCenterX + r, arcCenterY + rIn);
      ctx.arc(arcCenterX, arcCenterY, rIn, Math.PI / 2, 0, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const rOut = 2 * s - inset;
      const rIn = s + inset;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\n${(-s + inset).toFixed(2)} ${(-s + inset).toFixed(2)} ${rOut.toFixed(2)} 0 90 arc\n${(-s + inset).toFixed(2)} ${(-s + inset).toFixed(2)} ${rIn.toFixed(2)} 90 0 arcn\nclosepath fill\ngrestore\n`;
    },
  },


  // 23. 2x2 U Tile (Arched Doorway shape matching attached SVG)
  {
    id: 'tile-2x2-u',
    name: '2×2 U Tile',
    legoPartNumber: '2x2-U',
    category: '2x2',
    studWidth: 2,
    studHeight: 2,
    getOccupiedCells: () => [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }],
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const hw = s - inset;
      const hh = s - inset;
      const pathData = `M ${-hw + r} ${hh} L ${hw - r} ${hh} Q ${hw} ${hh} ${hw} ${hh - r} L ${hw} 0 A ${hw} ${hw} 0 0 0 ${-hw} 0 L ${-hw} ${hh - r} Q ${-hw} ${hh} ${-hw + r} ${hh} Z`;
      return (
        <path
          key={id}
          d={pathData}
          fill={fill}
          stroke="none"
          transform={`translate(${cx}, ${cy}) rotate(${rot})`}
        />
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const hw = s - inset;
      const hh = s - inset;
      const pathData = `M ${(-hw + r).toFixed(2)} ${hh.toFixed(2)} L ${(hw - r).toFixed(2)} ${hh.toFixed(2)} Q ${hw.toFixed(2)} ${hh.toFixed(2)} ${hw.toFixed(2)} ${(hh - r).toFixed(2)} L ${hw.toFixed(2)} 0 A ${hw.toFixed(2)} ${hw.toFixed(2)} 0 0 0 ${(-hw).toFixed(2)} 0 L ${(-hw).toFixed(2)} ${(hh - r).toFixed(2)} Q ${(-hw).toFixed(2)} ${hh.toFixed(2)} ${(-hw + r).toFixed(2)} ${hh.toFixed(2)} Z`;
      return `<path d="${pathData}" fill="${fill}" stroke="none" transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot})"/>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const hw = s - inset;
      const hh = s - inset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(-hw + r, hh);
      ctx.lineTo(hw - r, hh);
      ctx.quadraticCurveTo(hw, hh, hw, hh - r);
      ctx.lineTo(hw, 0);
      ctx.arc(0, 0, hw, 0, Math.PI, true);
      ctx.lineTo(-hw, hh - r);
      ctx.quadraticCurveTo(-hw, hh, -hw + r, hh);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset, radius } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const hw = s - inset;
      const hh = s - inset;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\nnewpath\n${(-hw + radius).toFixed(2)} ${hh.toFixed(2)} moveto\n${(hw - radius).toFixed(2)} ${hh.toFixed(2)} lineto\n${hw.toFixed(2)} 0 lineto\n0 0 ${hw.toFixed(2)} 0 180 arc\n${(-hw).toFixed(2)} ${(hh - radius).toFixed(2)} lineto\nclosepath fill\ngrestore\n`;
    },
  },

  // 24. 3x3 Macaroni Tile
  {
    id: 'tile-3x3-macaroni',
    name: '3×3 Macaroni Tile',
    legoPartNumber: '3x3-Curved',
    category: 'curved',
    studWidth: 3,
    studHeight: 3,
    getOccupiedCells: (rot) => {
      const base = [
        { dx: 2, dy: 0 },
        { dx: 2, dy: 1 },
        { dx: 2, dy: 2 },
        { dx: 1, dy: 2 },
        { dx: 0, dy: 2 },
      ];
      return rotateCells(base, 3, 3, rot);
    },
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + 1.5 * s;
      const cy = y + 1.5 * s;
      const rOut = 3 * s - inset;
      const rIn = 2 * s + inset;
      const arcCenterX = -1.5 * s + inset;
      const arcCenterY = -1.5 * s + inset;
      const hw = 1.5 * s - inset;
      const pathData = `M ${arcCenterX + rIn + r} ${arcCenterY} L ${hw - r} ${arcCenterY} Q ${hw} ${arcCenterY} ${hw} ${arcCenterY + r} A ${rOut} ${rOut} 0 0 1 ${arcCenterX + r} ${hw} Q ${arcCenterX} ${hw} ${arcCenterX} ${hw - r} L ${arcCenterX} ${arcCenterY + rIn + r} Q ${arcCenterX} ${arcCenterY + rIn} ${arcCenterX + r} ${arcCenterY + rIn} A ${rIn} ${rIn} 0 0 0 ${arcCenterX + rIn} ${arcCenterY + r} Q ${arcCenterX + rIn} ${arcCenterY} ${arcCenterX + rIn + r} ${arcCenterY} Z`;
      return (
        <path
          key={id}
          d={pathData}
          fill={fill}
          stroke="none"
          transform={`translate(${cx}, ${cy}) rotate(${rot})`}
        />
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + 1.5 * s;
      const cy = y + 1.5 * s;
      const rOut = 3 * s - inset;
      const rIn = 2 * s + inset;
      const arcCenterX = -1.5 * s + inset;
      const arcCenterY = -1.5 * s + inset;
      const hw = 1.5 * s - inset;
      const pathData = `M ${(arcCenterX + rIn + r).toFixed(2)} ${arcCenterY.toFixed(2)} L ${(hw - r).toFixed(2)} ${arcCenterY.toFixed(2)} Q ${hw.toFixed(2)} ${arcCenterY.toFixed(2)} ${hw.toFixed(2)} ${(arcCenterY + r).toFixed(2)} A ${rOut.toFixed(2)} ${rOut.toFixed(2)} 0 0 1 ${(arcCenterX + r).toFixed(2)} ${hw.toFixed(2)} Q ${arcCenterX.toFixed(2)} ${hw.toFixed(2)} ${arcCenterX.toFixed(2)} ${(hw - r).toFixed(2)} L ${arcCenterX.toFixed(2)} ${(arcCenterY + rIn + r).toFixed(2)} Q ${arcCenterX.toFixed(2)} ${(arcCenterY + rIn).toFixed(2)} ${(arcCenterX + r).toFixed(2)} ${(arcCenterY + rIn).toFixed(2)} A ${rIn.toFixed(2)} ${rIn.toFixed(2)} 0 0 0 ${(arcCenterX + rIn).toFixed(2)} ${(arcCenterY + r).toFixed(2)} Q ${(arcCenterX + rIn).toFixed(2)} ${arcCenterY.toFixed(2)} ${(arcCenterX + rIn + r).toFixed(2)} ${arcCenterY.toFixed(2)} Z`;
      return `<path d="${pathData}" fill="${fill}" stroke="none" transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot})"/>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + 1.5 * s;
      const cy = y + 1.5 * s;
      const rOut = 3 * s - inset;
      const rIn = 2 * s + inset;
      const arcCenterX = -1.5 * s + inset;
      const arcCenterY = -1.5 * s + inset;
      const hw = 1.5 * s - inset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(arcCenterX + rIn + r, arcCenterY);
      ctx.lineTo(hw - r, arcCenterY);
      ctx.quadraticCurveTo(hw, arcCenterY, hw, arcCenterY + r);
      ctx.arc(arcCenterX, arcCenterY, rOut, 0, Math.PI / 2, false);
      ctx.lineTo(arcCenterX, arcCenterY + rIn + r);
      ctx.quadraticCurveTo(arcCenterX, arcCenterY + rIn, arcCenterX + r, arcCenterY + rIn);
      ctx.arc(arcCenterX, arcCenterY, rIn, Math.PI / 2, 0, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + 1.5 * s;
      const cy = y + 1.5 * s;
      const rOut = 3 * s - inset;
      const rIn = 2 * s + inset;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\n${(-1.5 * s + inset).toFixed(2)} ${(-1.5 * s + inset).toFixed(2)} ${rOut.toFixed(2)} 0 90 arc\n${(-1.5 * s + inset).toFixed(2)} ${(-1.5 * s + inset).toFixed(2)} ${rIn.toFixed(2)} 90 0 arcn\nclosepath fill\ngrestore\n`;
    },
  },

  // 25. 4x4 Macaroni Tile (#27507)
  {
    id: 'tile-4x4-macaroni',
    name: '4×4 Macaroni Tile',
    legoPartNumber: '27507',
    category: 'curved',
    studWidth: 4,
    studHeight: 4,
    getOccupiedCells: (rot) => {
      const base = [
        { dx: 3, dy: 0 },
        { dx: 3, dy: 1 },
        { dx: 3, dy: 2 },
        { dx: 3, dy: 3 },
        { dx: 2, dy: 3 },
        { dx: 1, dy: 3 },
        { dx: 0, dy: 3 },
      ];
      return rotateCells(base, 4, 4, rot);
    },
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + 2 * s;
      const cy = y + 2 * s;
      const rOut = 4 * s - inset;
      const rIn = 3 * s + inset;
      const arcCenterX = -2 * s + inset;
      const arcCenterY = -2 * s + inset;
      const hw = 2 * s - inset;
      const pathData = `M ${arcCenterX + rIn + r} ${arcCenterY} L ${hw - r} ${arcCenterY} Q ${hw} ${arcCenterY} ${hw} ${arcCenterY + r} A ${rOut} ${rOut} 0 0 1 ${arcCenterX + r} ${hw} Q ${arcCenterX} ${hw} ${arcCenterX} ${hw - r} L ${arcCenterX} ${arcCenterY + rIn + r} Q ${arcCenterX} ${arcCenterY + rIn} ${arcCenterX + r} ${arcCenterY + rIn} A ${rIn} ${rIn} 0 0 0 ${arcCenterX + rIn} ${arcCenterY + r} Q ${arcCenterX + rIn} ${arcCenterY} ${arcCenterX + rIn + r} ${arcCenterY} Z`;
      return (
        <path
          key={id}
          d={pathData}
          fill={fill}
          stroke="none"
          transform={`translate(${cx}, ${cy}) rotate(${rot})`}
        />
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + 2 * s;
      const cy = y + 2 * s;
      const rOut = 4 * s - inset;
      const rIn = 3 * s + inset;
      const arcCenterX = -2 * s + inset;
      const arcCenterY = -2 * s + inset;
      const hw = 2 * s - inset;
      const pathData = `M ${(arcCenterX + rIn + r).toFixed(2)} ${arcCenterY.toFixed(2)} L ${(hw - r).toFixed(2)} ${arcCenterY.toFixed(2)} Q ${hw.toFixed(2)} ${arcCenterY.toFixed(2)} ${hw.toFixed(2)} ${(arcCenterY + r).toFixed(2)} A ${rOut.toFixed(2)} ${rOut.toFixed(2)} 0 0 1 ${(arcCenterX + r).toFixed(2)} ${hw.toFixed(2)} Q ${arcCenterX.toFixed(2)} ${hw.toFixed(2)} ${arcCenterX.toFixed(2)} ${(hw - r).toFixed(2)} L ${arcCenterX.toFixed(2)} ${(arcCenterY + rIn + r).toFixed(2)} Q ${arcCenterX.toFixed(2)} ${(arcCenterY + rIn).toFixed(2)} ${(arcCenterX + r).toFixed(2)} ${(arcCenterY + rIn).toFixed(2)} A ${rIn.toFixed(2)} ${rIn.toFixed(2)} 0 0 0 ${(arcCenterX + rIn).toFixed(2)} ${(arcCenterY + r).toFixed(2)} Q ${(arcCenterX + rIn).toFixed(2)} ${arcCenterY.toFixed(2)} ${(arcCenterX + rIn + r).toFixed(2)} ${arcCenterY.toFixed(2)} Z`;
      return `<path d="${pathData}" fill="${fill}" stroke="none" transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot})"/>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius: r } = getTileGeometryParams(s);
      const cx = x + 2 * s;
      const cy = y + 2 * s;
      const rOut = 4 * s - inset;
      const rIn = 3 * s + inset;
      const arcCenterX = -2 * s + inset;
      const arcCenterY = -2 * s + inset;
      const hw = 2 * s - inset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(arcCenterX + rIn + r, arcCenterY);
      ctx.lineTo(hw - r, arcCenterY);
      ctx.quadraticCurveTo(hw, arcCenterY, hw, arcCenterY + r);
      ctx.arc(arcCenterX, arcCenterY, rOut, 0, Math.PI / 2, false);
      ctx.lineTo(arcCenterX, arcCenterY + rIn + r);
      ctx.quadraticCurveTo(arcCenterX, arcCenterY + rIn, arcCenterX + r, arcCenterY + rIn);
      ctx.arc(arcCenterX, arcCenterY, rIn, Math.PI / 2, 0, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + 2 * s;
      const cy = y + 2 * s;
      const rOut = 4 * s - inset;
      const rIn = 3 * s + inset;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\n${(-2 * s + inset).toFixed(2)} ${(-2 * s + inset).toFixed(2)} ${rOut.toFixed(2)} 0 90 arc\n${(-2 * s + inset).toFixed(2)} ${(-2 * s + inset).toFixed(2)} ${rIn.toFixed(2)} 90 0 arcn\nclosepath fill\ngrestore\n`;
    },
  },

  // 26. 1x2 Wedge Right (#29120) - Matches attached SVG
  {
    id: 'tile-1x2-wedge-right',
    name: '1×2 Wedge Right',
    legoPartNumber: '29120',
    category: 'bars',
    studWidth: 2,
    studHeight: 1,
    getOccupiedCells: (rot) => (rot === 90 || rot === 270 ? [{ dx: 0, dy: 0 }, { dx: 0, dy: 1 }] : [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }]),
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      const scaleX = innerW / 48;
      const scaleY = innerH / 24;
      return (
        <g
          key={id}
          transform={`translate(${cx}, ${cy}) rotate(${rot}) translate(${-innerW / 2}, ${-innerH / 2}) scale(${scaleX}, ${scaleY})`}
        >
          <path d="M24,0L0,0L0,24L24,24L48,0Z" fill={fill} stroke="none" />
        </g>
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      const scaleX = innerW / 48;
      const scaleY = innerH / 24;
      return `<g transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot}) translate(${(-innerW / 2).toFixed(2)}, ${(-innerH / 2).toFixed(2)}) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})"><path d="M24,0L0,0L0,24L24,24L48,0Z" fill="${fill}" stroke="none"/></g>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.translate(-innerW / 2, -innerH / 2);
      ctx.scale(innerW / 48, innerH / 24);
      ctx.fillStyle = fill;
      const p = new Path2D('M24,0L0,0L0,24L24,24L48,0Z');
      ctx.fill(p);
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\n${(innerW / 48).toFixed(4)} ${(innerH / 24).toFixed(4)} scale\n-24 -12 translate\nnewpath 24 0 moveto 0 0 lineto 0 24 lineto 24 24 lineto 48 0 lineto closepath fill\ngrestore\n`;
    },
  },

  // 27. 1x2 Wedge Left (#29119) - Matches attached SVG
  {
    id: 'tile-1x2-wedge-left',
    name: '1×2 Wedge Left',
    legoPartNumber: '29119',
    category: 'bars',
    studWidth: 2,
    studHeight: 1,
    getOccupiedCells: (rot) => (rot === 90 || rot === 270 ? [{ dx: 0, dy: 0 }, { dx: 0, dy: 1 }] : [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }]),
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      const scaleX = innerW / 48;
      const scaleY = innerH / 24;
      return (
        <g
          key={id}
          transform={`translate(${cx}, ${cy}) rotate(${rot}) translate(${-innerW / 2}, ${-innerH / 2}) scale(${scaleX}, ${scaleY})`}
        >
          <path d="M24,0L0,0L0,24L24,24L48,24L24,0Z" fill={fill} stroke="none" />
        </g>
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      const scaleX = innerW / 48;
      const scaleY = innerH / 24;
      return `<g transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot}) translate(${(-innerW / 2).toFixed(2)}, ${(-innerH / 2).toFixed(2)}) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})"><path d="M24,0L0,0L0,24L24,24L48,24L24,0Z" fill="${fill}" stroke="none"/></g>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.translate(-innerW / 2, -innerH / 2);
      ctx.scale(innerW / 48, innerH / 24);
      ctx.fillStyle = fill;
      const p = new Path2D('M24,0L0,0L0,24L24,24L48,24L24,0Z');
      ctx.fill(p);
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\n${(innerW / 48).toFixed(4)} ${(innerH / 24).toFixed(4)} scale\n-24 -12 translate\nnewpath 24 0 moveto 0 0 lineto 0 24 lineto 24 24 lineto 48 24 lineto closepath fill\ngrestore\n`;
    },
  },

  // 28. 1x1 Heart Tile (#39739) - Matches attached SVG
  {
    id: 'tile-1x1-heart',
    name: '1×1 Heart Tile',
    legoPartNumber: '39739',
    category: '1x1',
    studWidth: 1,
    studHeight: 1,
    getOccupiedCells: () => [{ dx: 0, dy: 0 }],
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s / 2;
      const cy = y + s / 2;
      const innerW = s - 2 * inset;
      const innerH = s - 2 * inset;
      const scaleX = innerW / 24;
      const scaleY = innerH / 24;
      return (
        <g
          key={id}
          transform={`translate(${cx}, ${cy}) rotate(${rot}) translate(${-innerW / 2}, ${-innerH / 2}) scale(${scaleX}, ${scaleY})`}
        >
          <path
            d="M16,0H0v16c0,4.42,3.58,8,8,8s8-3.58,8-8c4.42,0,8-3.58,8-8S20.42,0,16,0Z"
            fill={fill}
            stroke="none"
          />
        </g>
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s / 2;
      const cy = y + s / 2;
      const innerW = s - 2 * inset;
      const innerH = s - 2 * inset;
      const scaleX = innerW / 24;
      const scaleY = innerH / 24;
      return `<g transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot}) translate(${(-innerW / 2).toFixed(2)}, ${(-innerH / 2).toFixed(2)}) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})"><path d="M16,0H0v16c0,4.42,3.58,8,8,8s8-3.58,8-8c4.42,0,8-3.58,8-8S20.42,0,16,0Z" fill="${fill}" stroke="none"/></g>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s / 2;
      const cy = y + s / 2;
      const innerW = s - 2 * inset;
      const innerH = s - 2 * inset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.translate(-innerW / 2, -innerH / 2);
      ctx.scale(innerW / 24, innerH / 24);
      ctx.fillStyle = fill;
      const p = new Path2D('M16,0H0v16c0,4.42,3.58,8,8,8s8-3.58,8-8c4.42,0,8-3.58,8-8S20.42,0,16,0Z');
      ctx.fill(p);
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s / 2;
      const cy = y + s / 2;
      const innerW = s - 2 * inset;
      const innerH = s - 2 * inset;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\n${(innerW / 24).toFixed(4)} ${(innerH / 24).toFixed(4)} scale\n-12 -12 translate\nnewpath 16 0 moveto 0 0 lineto 0 16 lineto 0 20.42 3.58 24 8 24 curveto 12.42 24 16 20.42 16 16 curveto 20.42 16 24 12.42 24 8 curveto 24 3.58 20.42 0 16 0 curveto closepath fill\ngrestore\n`;
    },
  },

  // 29. 1x2 Grille Tile (#2412b) - Matches attached SVG
  {
    id: 'tile-1x2-grille',
    name: '1×2 Grille Tile',
    legoPartNumber: '2412b',
    category: 'bars',
    studWidth: 2,
    studHeight: 1,
    getOccupiedCells: (rot) => (rot === 90 || rot === 270 ? [{ dx: 0, dy: 0 }, { dx: 0, dy: 1 }] : [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }]),
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      const scaleX = innerW / 48;
      const scaleY = innerH / 24;
      return (
        <g
          key={id}
          transform={`translate(${cx}, ${cy}) rotate(${rot}) translate(${-innerW / 2}, ${-innerH / 2}) scale(${scaleX}, ${scaleY})`}
        >
          <path
            d="M48,19.87v4.13H0v-4.13h48ZM48,4.14V0H0v4.14h48ZM0,9.94v4.14h48v-4.14H0Z"
            fill={fill}
            stroke="none"
          />
        </g>
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      const scaleX = innerW / 48;
      const scaleY = innerH / 24;
      return `<g transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot}) translate(${(-innerW / 2).toFixed(2)}, ${(-innerH / 2).toFixed(2)}) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})"><path d="M48,19.87v4.13H0v-4.13h48ZM48,4.14V0H0v4.14h48ZM0,9.94v4.14h48v-4.14H0Z" fill="${fill}" stroke="none"/></g>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.translate(-innerW / 2, -innerH / 2);
      ctx.scale(innerW / 48, innerH / 24);
      ctx.fillStyle = fill;
      const p = new Path2D('M48,19.87v4.13H0v-4.13h48ZM48,4.14V0H0v4.14h48ZM0,9.94v4.14h48v-4.14H0Z');
      ctx.fill(p);
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = isRot ? s : 2 * s;
      const targetH = isRot ? 2 * s : s;
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = 2 * s - 2 * inset;
      const innerH = s - 2 * inset;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\n${(innerW / 48).toFixed(4)} ${(innerH / 24).toFixed(4)} scale\n-24 -12 translate\n0 0 48 4.14 rectfill\n0 9.94 48 4.14 rectfill\n0 19.87 48 4.13 rectfill\ngrestore\n`;
    },
  },

  // 30. 2x2 Corner Facet Tile (#27263) - Matches attached SVG
  {
    id: 'tile-2x2-corner-facet',
    name: '2×2 Corner Facet Tile',
    legoPartNumber: '27263',
    category: '2x2',
    studWidth: 2,
    studHeight: 2,
    getOccupiedCells: (rot) => rotateCells([{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }], 2, 2, rot),
    renderSvg: (x, y, s, rot, fill, id) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const innerW = 2 * s - 2 * inset;
      const innerH = 2 * s - 2 * inset;
      const scaleX = innerW / 48;
      const scaleY = innerH / 48;
      return (
        <g
          key={id}
          transform={`translate(${cx}, ${cy}) rotate(${rot}) translate(${-innerW / 2}, ${-innerH / 2}) scale(${scaleX}, ${scaleY})`}
        >
          <path
            d="M24,0L0,24L0,48L24,48L24,24L48,24L48,0L24,0Z"
            fill={fill}
            stroke="none"
          />
        </g>
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const innerW = 2 * s - 2 * inset;
      const innerH = 2 * s - 2 * inset;
      const scaleX = innerW / 48;
      const scaleY = innerH / 48;
      return `<g transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot}) translate(${(-innerW / 2).toFixed(2)}, ${(-innerH / 2).toFixed(2)}) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})"><path d="M24,0L0,24L0,48L24,48L24,24L48,24L48,0L24,0Z" fill="${fill}" stroke="none"/></g>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const innerW = 2 * s - 2 * inset;
      const innerH = 2 * s - 2 * inset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.translate(-innerW / 2, -innerH / 2);
      ctx.scale(innerW / 48, innerH / 48);
      ctx.fillStyle = fill;
      const p = new Path2D('M24,0L0,24L0,48L24,48L24,24L48,24L48,0L24,0Z');
      ctx.fill(p);
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const cx = x + s;
      const cy = y + s;
      const innerW = 2 * s - 2 * inset;
      const innerH = 2 * s - 2 * inset;
      return `gsave\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor\n${cx.toFixed(2)} ${cy.toFixed(2)} translate\n${rot} rotate\n${(innerW / 48).toFixed(4)} ${(innerH / 48).toFixed(4)} scale\n-24 -24 translate\nnewpath 24 0 moveto 0 24 lineto 0 48 lineto 24 48 lineto 24 24 lineto 48 24 lineto 48 0 lineto closepath fill\ngrestore\n`;
    },
  },
];

// ============================================================================
// CONVENIENCE FACTORIES: Use these to easily add new tiles in 1 line of code!
// ============================================================================

/**
 * Creates any rectangular tile of arbitrary width and height (e.g. 1x6, 1x8, 2x3, 2x4).
 */
export function createRectangularTile(params: {
  id: string;
  name: string;
  legoPartNumber: string;
  studWidth: number;
  studHeight: number;
  category?: TileCategory;
}): TileType {
  const { id, name, legoPartNumber, studWidth, studHeight, category = 'bars' } = params;

  return {
    id,
    name,
    legoPartNumber,
    category,
    studWidth,
    studHeight,
    getOccupiedCells: (rot) => {
      const isRotated = rot === 90 || rot === 270;
      const w = isRotated ? studHeight : studWidth;
      const h = isRotated ? studWidth : studHeight;
      const cells: CellCoord[] = [];
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          cells.push({ dx, dy });
        }
      }
      return cells;
    },
    renderSvg: (x, y, s, rot, fill, keyId) => {
      const { inset, radius } = getTileGeometryParams(s);
      const isRotated = rot === 90 || rot === 270;
      const w = (isRotated ? studHeight * s : studWidth * s) - 2 * inset;
      const h = (isRotated ? studWidth * s : studHeight * s) - 2 * inset;
      return (
        <rect
          key={keyId}
          x={x + inset}
          y={y + inset}
          width={w}
          height={h}
          rx={radius}
          ry={radius}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset, radius } = getTileGeometryParams(s);
      const isRotated = rot === 90 || rot === 270;
      const w = (isRotated ? studHeight * s : studWidth * s) - 2 * inset;
      const h = (isRotated ? studWidth * s : studHeight * s) - 2 * inset;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, w, h, radius);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const isRotated = rot === 90 || rot === 270;
      const w = (isRotated ? studHeight * s : studWidth * s) - 2 * inset;
      const h = (isRotated ? studWidth * s : studHeight * s) - 2 * inset;
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor ${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} rectfill\n`;
    },
  };
}

/**
 * Creates any circular round tile of arbitrary diameter in studs (e.g. 1x1 round, 2x2 round, 3x3 round, 4x4 round).
 */
export function createRoundTile(params: {
  id: string;
  name: string;
  legoPartNumber: string;
  diameter: number; // in studs
  category?: TileCategory;
}): TileType {
  const { id, name, legoPartNumber, diameter, category = 'curved' } = params;

  return {
    id,
    name,
    legoPartNumber,
    category,
    studWidth: diameter,
    studHeight: diameter,
    getOccupiedCells: () => {
      const cells: CellCoord[] = [];
      for (let dy = 0; dy < diameter; dy++) {
        for (let dx = 0; dx < diameter; dx++) {
          cells.push({ dx, dy });
        }
      }
      return cells;
    },
    renderSvg: (x, y, s, _rot, fill, keyId) => {
      const { inset } = getTileGeometryParams(s);
      const radius = (diameter * s) / 2 - inset;
      const cx = x + (diameter * s) / 2;
      const cy = y + (diameter * s) / 2;
      return (
        <circle
          key={keyId}
          cx={cx}
          cy={cy}
          r={radius}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, _rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const radius = (diameter * s) / 2 - inset;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x + (diameter * s) / 2, y + (diameter * s) / 2, radius, 0, Math.PI * 2);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, _rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const radius = (diameter * s) / 2 - inset;
      const cx = x + (diameter * s) / 2;
      const cy = y + (diameter * s) / 2;
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor newpath ${cx.toFixed(2)} ${cy.toFixed(2)} ${radius.toFixed(2)} 0 360 arc fill\n`;
    },
  };
}

/**
 * Creates any capsule (stadium / pill) shape tile with rounded ends.
 */
export function createCapsuleTile(params: {
  id: string;
  name: string;
  legoPartNumber: string;
  studWidth: number;
  studHeight: number;
  category?: TileCategory;
}): TileType {
  const { id, name, legoPartNumber, studWidth, studHeight, category = 'curved' } = params;

  return {
    id,
    name,
    legoPartNumber,
    category,
    studWidth,
    studHeight,
    getOccupiedCells: (rot) => {
      const isRotated = rot === 90 || rot === 270;
      const w = isRotated ? studHeight : studWidth;
      const h = isRotated ? studWidth : studHeight;
      const cells: CellCoord[] = [];
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          cells.push({ dx, dy });
        }
      }
      return cells;
    },
    renderSvg: (x, y, s, rot, fill, keyId) => {
      const { inset } = getTileGeometryParams(s);
      const isRotated = rot === 90 || rot === 270;
      const w = (isRotated ? studHeight * s : studWidth * s) - 2 * inset;
      const h = (isRotated ? studWidth * s : studHeight * s) - 2 * inset;
      const r = Math.min(w, h) / 2;
      return (
        <rect
          key={keyId}
          x={x + inset}
          y={y + inset}
          width={w}
          height={h}
          rx={r}
          ry={r}
          fill={fill}
          stroke="none"
        />
      );
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const isRotated = rot === 90 || rot === 270;
      const w = (isRotated ? studHeight * s : studWidth * s) - 2 * inset;
      const h = (isRotated ? studWidth * s : studHeight * s) - 2 * inset;
      const r = Math.min(w, h) / 2;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, w, h, r);
      ctx.fill();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const isRotated = rot === 90 || rot === 270;
      const w = (isRotated ? studHeight * s : studWidth * s) - 2 * inset;
      const h = (isRotated ? studWidth * s : studHeight * s) - 2 * inset;
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor ${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} rectfill\n`;
    },
  };
}

/**
 * Creates a custom tile from an SVG path or SVG markup.
 *
 * Parameters:
 * - id: Unique tile ID (e.g. 'custom-tile-star')
 * - name: Display name (e.g. '1×1 Star Tile')
 * - legoPartNumber: Optional part number or label (e.g. 'Custom', '99999')
 * - studWidth: Width in grid cells (studs)
 * - studHeight: Height in grid cells (studs)
 * - category: '1x1' | 'bars' | 'curved' | '2x2'
 * - svgPath: SVG path d="..." string or complete <svg> / <path> markup
 * - viewBox: Optional viewBox string, defaults to '0 0 100 100' or extracted from svg
 * - occupiedCells: Optional relative grid cells [{dx, dy}], defaults to all cells in studWidth x studHeight
 */
export interface CustomSvgTileOptions {
  id: string;
  name: string;
  legoPartNumber?: string;
  studWidth: number;
  studHeight: number;
  category?: TileCategory;
  svgPath: string;
  viewBox?: string;
  occupiedCells?: CellCoord[];
}

export function createCustomSvgTile(params: CustomSvgTileOptions): TileType {
  const {
    id,
    name,
    legoPartNumber = 'Custom',
    studWidth,
    studHeight,
    category = studWidth === 1 && studHeight === 1 ? '1x1' : studWidth <= 2 && studHeight <= 2 ? '2x2' : 'curved',
    svgPath,
    viewBox = '0 0 100 100',
    occupiedCells,
  } = params;

  // Extract path 'd' if wrapped in <svg> or <path>
  let cleanD = svgPath.trim();
  const dMatch = cleanD.match(/d=["']([^"']+)["']/i);
  if (dMatch) {
    cleanD = dMatch[1].trim();
  }

  // Extract viewBox if specified inside svg string
  let vb = viewBox.trim();
  const vbMatch = svgPath.match(/viewBox=["']([^"']+)["']/i);
  if (vbMatch) {
    vb = vbMatch[1].trim();
  }

  const parts = vb.split(/[\s,]+/).map(Number);
  const vbMinX = !isNaN(parts[0]) ? parts[0] : 0;
  const vbMinY = !isNaN(parts[1]) ? parts[1] : 0;
  const vbW = !isNaN(parts[2]) && parts[2] > 0 ? parts[2] : 100;
  const vbH = !isNaN(parts[3]) && parts[3] > 0 ? parts[3] : 100;

  return {
    id,
    name,
    legoPartNumber,
    category,
    studWidth,
    studHeight,
    getOccupiedCells: (rot) => {
      if (!occupiedCells || occupiedCells.length === 0) {
        const isRot = rot === 90 || rot === 270;
        const w = isRot ? studHeight : studWidth;
        const h = isRot ? studWidth : studHeight;
        const cells: CellCoord[] = [];
        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            cells.push({ dx, dy });
          }
        }
        return cells;
      }
      return occupiedCells.map(({ dx, dy }) => {
        if (rot === 0) return { dx, dy };
        if (rot === 90) return { dx: studHeight - 1 - dy, dy: dx };
        if (rot === 180) return { dx: studWidth - 1 - dx, dy: studHeight - 1 - dy };
        return { dx: dy, dy: studWidth - 1 - dx };
      });
    },
    renderSvg: (x, y, s, rot, fill, keyId) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = (isRot ? studHeight * s : studWidth * s);
      const targetH = (isRot ? studWidth * s : studHeight * s);
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = studWidth * s - 2 * inset;
      const innerH = studHeight * s - 2 * inset;
      const scaleX = innerW / vbW;
      const scaleY = innerH / vbH;

      return (
        <g
          key={keyId}
          transform={`translate(${cx}, ${cy}) rotate(${rot}) translate(${-innerW / 2}, ${-innerH / 2}) scale(${scaleX}, ${scaleY}) translate(${-vbMinX}, ${-vbMinY})`}
        >
          <path d={cleanD} fill={fill} stroke="none" />
        </g>
      );
    },
    renderSvgXml: (x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = (isRot ? studHeight * s : studWidth * s);
      const targetH = (isRot ? studWidth * s : studHeight * s);
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = studWidth * s - 2 * inset;
      const innerH = studHeight * s - 2 * inset;
      const scaleX = innerW / vbW;
      const scaleY = innerH / vbH;

      return `<g transform="translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) rotate(${rot}) translate(${(-innerW / 2).toFixed(2)}, ${(-innerH / 2).toFixed(2)}) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)}) translate(${-vbMinX}, ${-vbMinY})"><path d="${cleanD}" fill="${fill}" stroke="none"/></g>`;
    },
    drawCanvas: (ctx, x, y, s, rot, fill) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const targetW = (isRot ? studHeight * s : studWidth * s);
      const targetH = (isRot ? studWidth * s : studHeight * s);
      const cx = x + targetW / 2;
      const cy = y + targetH / 2;
      const innerW = studWidth * s - 2 * inset;
      const innerH = studHeight * s - 2 * inset;
      const scaleX = innerW / vbW;
      const scaleY = innerH / vbH;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.translate(-innerW / 2, -innerH / 2);
      ctx.scale(scaleX, scaleY);
      ctx.translate(-vbMinX, -vbMinY);
      ctx.fillStyle = fill;
      try {
        const p = new Path2D(cleanD);
        ctx.fill(p);
      } catch (err) {
        ctx.fillRect(vbMinX, vbMinY, vbW, vbH);
      }
      ctx.restore();
    },
    getEpsPostScript: (x, y, s, rot, r, g, b) => {
      const { inset } = getTileGeometryParams(s);
      const isRot = rot === 90 || rot === 270;
      const w = (isRot ? studHeight * s : studWidth * s) - 2 * inset;
      const h = (isRot ? studWidth * s : studHeight * s) - 2 * inset;
      return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor ${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} rectfill\n`;
    },
  };
}

// Map for quick O(1) tile lookup
export const TILE_MAP = new Map<string, TileType>(
  LEGO_TILES.map((t) => [t.id, t])
);

/**
 * Register a new tile into the runtime library and tile map.
 */
export function registerTile(tile: TileType) {
  const existingIdx = LEGO_TILES.findIndex((t) => t.id === tile.id);
  if (existingIdx >= 0) {
    LEGO_TILES[existingIdx] = tile;
  } else {
    LEGO_TILES.push(tile);
  }
  TILE_MAP.set(tile.id, tile);
}
