import type { ReactNode } from 'react';

export type Rotation = 0 | 90 | 180 | 270;

export interface CellCoord {
  dx: number;
  dy: number;
}

export type TileCategory = 'all' | '1x1' | 'bars' | 'curved' | '2x2';

export interface TileType {
  id: string;
  name: string;
  legoPartNumber: string;
  category: TileCategory;
  studWidth: number;   // at rotation 0
  studHeight: number;  // at rotation 0
  // Returns relative grid cells occupied when placed with given rotation
  getOccupiedCells: (rotation: Rotation) => CellCoord[];
  // SVG path or element generator at given size (S = stud size in px), offset (x, y)
  renderSvg: (x: number, y: number, s: number, rotation: Rotation, fill: string, id?: string) => ReactNode;
  // Raw SVG XML markup generator for SVG exports
  renderSvgXml?: (x: number, y: number, s: number, rotation: Rotation, fill: string) => string;
  // Canvas 2D path drawer
  drawCanvas: (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rotation: Rotation, fill: string) => void;
  // EPS vector PostScript code generator
  getEpsPostScript: (x: number, y: number, s: number, rotation: Rotation, r: number, g: number, b: number) => string;
}

export interface PlacedTile {
  id: string;
  typeId: string;
  x: number;          // grid stud x (0 to cols-1)
  y: number;          // grid stud y (0 to rows-1)
  rotation: Rotation; // 0, 90, 180, 270
  color: string;      // hex color (e.g. #C91A09)
  paletteId?: string; // id of palette color if linked
}

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
  isOfficial?: boolean;
}

export type ToolType = 'select' | 'place' | 'recolor' | 'eraser' | 'eyedropper';

export interface BaseplateConfig {
  name: string;
  cols: number;
  rows: number;
}

export interface MosaicState {
  cols: number;
  rows: number;
  tiles: PlacedTile[];
  palette: PaletteColor[];
}

export interface PartCountItem {
  typeId: string;
  typeName: string;
  legoPartNumber: string;
  colorHex: string;
  colorName: string;
  count: number;
}

export interface SavedDesign {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  cols: number;
  rows: number;
  tiles: PlacedTile[];
  palette: PaletteColor[];
}
