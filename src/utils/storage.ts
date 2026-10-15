import { SavedDesign, PlacedTile, PaletteColor } from '../types/mosaic';
import { generateSvgString, downloadFile } from './exportMosaic';

const STORAGE_KEY = 'brick_mosaic_saved_designs';

/**
 * Loads all saved designs from local storage.
 */
export function getSavedDesigns(): SavedDesign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return [];
  } catch (err) {
    console.error('Failed to load saved designs from localStorage', err);
    return [];
  }
}

/**
 * Saves or updates a design in local storage.
 */
export function saveDesignToStorage(
  name: string,
  cols: number,
  rows: number,
  tiles: PlacedTile[],
  palette: PaletteColor[],
  existingId?: string
): SavedDesign {
  const currentDesigns = getSavedDesigns();
  const now = Date.now();

  let target: SavedDesign;

  if (existingId) {
    const foundIdx = currentDesigns.findIndex((d) => d.id === existingId);
    if (foundIdx >= 0) {
      target = {
        ...currentDesigns[foundIdx],
        name,
        cols,
        rows,
        tiles,
        palette,
        updatedAt: now,
      };
      currentDesigns[foundIdx] = target;
    } else {
      target = {
        id: existingId,
        name,
        cols,
        rows,
        tiles,
        palette,
        createdAt: now,
        updatedAt: now,
      };
      currentDesigns.unshift(target);
    }
  } else {
    target = {
      id: `design_${now}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim() || `Mosaic ${new Date(now).toLocaleDateString()}`,
      cols,
      rows,
      tiles,
      palette,
      createdAt: now,
      updatedAt: now,
    };
    currentDesigns.unshift(target);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDesigns));
  } catch (err) {
    console.error('Failed to persist to localStorage', err);
  }

  return target;
}

/**
 * Deletes a design from local storage.
 */
export function deleteDesignFromStorage(id: string): void {
  const currentDesigns = getSavedDesigns().filter((d) => d.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDesigns));
  } catch (err) {
    console.error('Failed to delete design from localStorage', err);
  }
}

/**
 * Duplicates an existing design.
 */
export function duplicateDesignInStorage(id: string): SavedDesign | null {
  const currentDesigns = getSavedDesigns();
  const found = currentDesigns.find((d) => d.id === id);
  if (!found) return null;

  const now = Date.now();
  const copy: SavedDesign = {
    ...found,
    id: `design_${now}_${Math.random().toString(36).substring(2, 6)}`,
    name: `${found.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };

  currentDesigns.unshift(copy);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDesigns));
  } catch (err) {
    console.error('Failed to duplicate design', err);
  }
  return copy;
}

/**
 * Generates an SVG string thumbnail for a design.
 */
export function getDesignThumbnailSvg(design: { cols: number; rows: number; tiles: PlacedTile[]; palette: PaletteColor[] }): string {
  return generateSvgString(design, 12);
}
