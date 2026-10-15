import { Rotation, PlacedTile } from '../types/mosaic';
import { TILE_MAP } from '../constants/legoTiles';

export interface GridCell {
  x: number;
  y: number;
}

export interface CollisionResult {
  valid: boolean;
  reason?: 'out-of-bounds' | 'overlap';
  occupiedCells: GridCell[];
  conflictingTileIds?: string[];
}

/**
 * Computes all grid cells occupied by a tile placed at (x, y) with a given rotation.
 */
export function getTileOccupiedAbsoluteCells(
  typeId: string,
  x: number,
  y: number,
  rotation: Rotation
): GridCell[] {
  const tileType = TILE_MAP.get(typeId);
  if (!tileType) {
    return [{ x, y }];
  }
  const relCells = tileType.getOccupiedCells(rotation);
  return relCells.map((c) => ({
    x: x + c.dx,
    y: y + c.dy,
  }));
}

/**
 * Builds a fast O(1) coordinate lookup map from cell string "x,y" to tile id.
 */
export function buildSpatialGrid(tiles: PlacedTile[]): Map<string, string> {
  const grid = new Map<string, string>();
  for (const tile of tiles) {
    const cells = getTileOccupiedAbsoluteCells(tile.typeId, tile.x, tile.y, tile.rotation);
    for (const cell of cells) {
      grid.set(`${cell.x},${cell.y}`, tile.id);
    }
  }
  return grid;
}

/**
 * Checks if a tile can be placed at (x, y) with rotation without colliding or leaving boundaries.
 */
export function checkTileCollision(
  typeId: string,
  x: number,
  y: number,
  rotation: Rotation,
  gridCols: number,
  gridRows: number,
  spatialGrid: Map<string, string>,
  ignoreTileId?: string
): CollisionResult {
  const cells = getTileOccupiedAbsoluteCells(typeId, x, y, rotation);
  const conflictingTileIds = new Set<string>();

  for (const cell of cells) {
    // 1. Boundary check
    if (cell.x < 0 || cell.x >= gridCols || cell.y < 0 || cell.y >= gridRows) {
      return {
        valid: false,
        reason: 'out-of-bounds',
        occupiedCells: cells,
      };
    }

    // 2. Collision check
    const existingTileId = spatialGrid.get(`${cell.x},${cell.y}`);
    if (existingTileId && existingTileId !== ignoreTileId) {
      conflictingTileIds.add(existingTileId);
    }
  }

  if (conflictingTileIds.size > 0) {
    return {
      valid: false,
      reason: 'overlap',
      occupiedCells: cells,
      conflictingTileIds: Array.from(conflictingTileIds),
    };
  }

  return {
    valid: true,
    occupiedCells: cells,
  };
}
