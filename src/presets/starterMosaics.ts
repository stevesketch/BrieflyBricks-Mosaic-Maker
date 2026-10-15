import { PlacedTile, PaletteColor } from '../types/mosaic';

export interface StarterPreset {
  id: string;
  title: string;
  description: string;
  cols: number;
  rows: number;
  tiles: PlacedTile[];
}

export const STARTER_PRESETS: StarterPreset[] = [
  // 1. Classic Space Explorer Logo
  {
    id: 'classic-space',
    title: 'Classic Space Emblem',
    description: 'Iconic LEGO Space logo featuring the golden crescent, red spaceship delta, and deep blue cosmos.',
    cols: 32,
    rows: 32,
    tiles: (() => {
      const tiles: PlacedTile[] = [];
      let idCounter = 1;

      // Dark Blue / Blue circular planetoid
      for (let y = 8; y <= 23; y++) {
        for (let x = 8; x <= 23; x++) {
          const dx = x - 15.5;
          const dy = y - 15.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= 7.2) {
            tiles.push({
              id: `cs_${idCounter++}`,
              typeId: 'tile-1x1-round',
              x,
              y,
              rotation: 0,
              color: '#0055BF',
            });
          }
        }
      }

      // Golden Ring / Orbit curve (Yellow & Warm Gold)
      for (let i = 0; i < 28; i++) {
        const angle = -0.6 + (i / 28) * 3.4;
        const rx = 15.5 + Math.cos(angle) * 11;
        const ry = 15.5 + Math.sin(angle) * 5.5;
        const gx = Math.round(rx);
        const gy = Math.round(ry);
        if (gx >= 0 && gx < 32 && gy >= 0 && gy < 32) {
          // Check collision in preset generator
          if (!tiles.some((t) => t.x === gx && t.y === gy)) {
            tiles.push({
              id: `cs_ring_${idCounter++}`,
              typeId: 'tile-1x1-round',
              x: gx,
              y: gy,
              rotation: 0,
              color: '#F2CD37',
            });
          }
        }
      }

      // Red Arrow / Starship fuselage
      const shipCoords = [
        { x: 19, y: 11, type: 'tile-1x1-quarter-round', rot: 180, color: '#C91A09' },
        { x: 18, y: 12, type: 'tile-1x2', rot: 0, color: '#C91A09' },
        { x: 17, y: 13, type: 'tile-1x2', rot: 0, color: '#C91A09' },
        { x: 15, y: 14, type: 'tile-1x4', rot: 0, color: '#C91A09' },
        { x: 14, y: 15, type: 'tile-1x4', rot: 0, color: '#C91A09' },
        { x: 13, y: 16, type: 'tile-1x4', rot: 0, color: '#C91A09' },
        { x: 12, y: 17, type: 'tile-1x3', rot: 0, color: '#C91A09' },
        { x: 11, y: 18, type: 'tile-1x2', rot: 0, color: '#C91A09' },
        { x: 10, y: 19, type: 'tile-1x1-round', rot: 0, color: '#FFFFFF' },
      ];

      for (const sc of shipCoords) {
        // Remove background dots under ship
        const occ: { x: number; y: number }[] = [];
        if (sc.type === 'tile-1x4') {
          occ.push({ x: sc.x, y: sc.y }, { x: sc.x + 1, y: sc.y }, { x: sc.x + 2, y: sc.y }, { x: sc.x + 3, y: sc.y });
        } else if (sc.type === 'tile-1x3') {
          occ.push({ x: sc.x, y: sc.y }, { x: sc.x + 1, y: sc.y }, { x: sc.x + 2, y: sc.y });
        } else if (sc.type === 'tile-1x2') {
          occ.push({ x: sc.x, y: sc.y }, { x: sc.x + 1, y: sc.y });
        } else {
          occ.push({ x: sc.x, y: sc.y });
        }

        // Clean out colliding planet tiles
        for (let idx = tiles.length - 1; idx >= 0; idx--) {
          const t = tiles[idx];
          if (occ.some((o) => o.x === t.x && o.y === t.y)) {
            tiles.splice(idx, 1);
          }
        }

        tiles.push({
          id: `cs_ship_${idCounter++}`,
          typeId: sc.type,
          x: sc.x,
          y: sc.y,
          rotation: sc.rot as any,
          color: sc.color,
        });
      }

      return tiles;
    })(),
  },

  // 2. Retro Wooden Duck Tribute
  {
    id: 'retro-duck',
    title: 'Heritage Duck',
    description: 'The historic 1932 wooden duck recreated in bright yellow, orange bill, and wheels.',
    cols: 24,
    rows: 24,
    tiles: (() => {
      const tiles: PlacedTile[] = [];
      let id = 1;

      // Body (Yellow)
      const yellowBody = [
        { type: 'tile-2x2-square', x: 8, y: 10 },
        { type: 'tile-2x2-square', x: 10, y: 10 },
        { type: 'tile-2x2-square', x: 12, y: 10 },
        { type: 'tile-1x2', x: 14, y: 10, rot: 0 },
        { type: 'tile-2x2-square', x: 7, y: 12 },
        { type: 'tile-2x2-square', x: 9, y: 12 },
        { type: 'tile-2x2-square', x: 11, y: 12 },
        { type: 'tile-2x2-square', x: 13, y: 12 },
        { type: 'tile-1x2', x: 15, y: 12, rot: 0 },
        // Head
        { type: 'tile-2x2-square', x: 7, y: 6 },
        { type: 'tile-1x2', x: 9, y: 6, rot: 0 },
        { type: 'tile-2x2-square', x: 7, y: 8 },
        { type: 'tile-1x2', x: 9, y: 8, rot: 0 },
      ];

      for (const b of yellowBody) {
        tiles.push({
          id: `duck_${id++}`,
          typeId: b.type,
          x: b.x,
          y: b.y,
          rotation: (b.rot || 0) as any,
          color: '#F2CD37',
        });
      }

      // Eye
      tiles.push({
        id: `duck_${id++}`,
        typeId: 'tile-1x1-round',
        x: 8,
        y: 7,
        rotation: 0,
        color: '#1B1B1B',
      });

      // Orange Beak / Bill
      tiles.push({
        id: `duck_${id++}`,
        typeId: 'tile-1x2-capsule',
        x: 5,
        y: 7,
        rotation: 0,
        color: '#FE8A18',
      });
      tiles.push({
        id: `duck_${id++}`,
        typeId: 'tile-1x2',
        x: 5,
        y: 8,
        rotation: 0,
        color: '#FE8A18',
      });

      // Wheels (Red)
      tiles.push({
        id: `duck_${id++}`,
        typeId: 'tile-2x2-round',
        x: 7,
        y: 15,
        rotation: 0,
        color: '#C91A09',
      });
      tiles.push({
        id: `duck_${id++}`,
        typeId: 'tile-2x2-round',
        x: 13,
        y: 15,
        rotation: 0,
        color: '#C91A09',
      });

      // Hubcaps
      tiles.push({
        id: `duck_${id++}`,
        typeId: 'tile-1x1-round',
        x: 11,
        y: 16,
        rotation: 0,
        color: '#FFFFFF',
      });

      return tiles;
    })(),
  },

  // 3. DOTS Geometric Mandala
  {
    id: 'dots-mandala',
    title: 'DOTS Geometric Mandala',
    description: 'Hypnotic geometric rosette featuring 1x1 quarter-round and circular tiles in vibrant coral and azure.',
    cols: 20,
    rows: 20,
    tiles: (() => {
      const tiles: PlacedTile[] = [];
      let id = 1;

      // Center 2x2 round in bright pink
      tiles.push({
        id: `m_${id++}`,
        typeId: 'tile-2x2-round',
        x: 9,
        y: 9,
        rotation: 0,
        color: '#E4ADC8',
      });

      // Quarter-round ring forming circular accents
      const ring1 = [
        { x: 8, y: 8, rot: 0, color: '#36AEBF' },
        { x: 11, y: 8, rot: 90, color: '#36AEBF' },
        { x: 11, y: 11, rot: 180, color: '#36AEBF' },
        { x: 8, y: 11, rot: 270, color: '#36AEBF' },
      ];
      for (const r of ring1) {
        tiles.push({
          id: `m_${id++}`,
          typeId: 'tile-1x1-quarter-round',
          x: r.x,
          y: r.y,
          rotation: r.rot as any,
          color: r.color,
        });
      }

      // Outer petals
      const petals = [
        { x: 7, y: 9, rot: 0, color: '#F05E49' },
        { x: 7, y: 10, rot: 270, color: '#F05E49' },
        { x: 12, y: 9, rot: 90, color: '#F05E49' },
        { x: 12, y: 10, rot: 180, color: '#F05E49' },
        { x: 9, y: 7, rot: 0, color: '#F05E49' },
        { x: 10, y: 7, rot: 90, color: '#F05E49' },
        { x: 9, y: 12, rot: 270, color: '#F05E49' },
        { x: 10, y: 12, rot: 180, color: '#F05E49' },
      ];
      for (const p of petals) {
        tiles.push({
          id: `m_${id++}`,
          typeId: 'tile-1x1-quarter-round',
          x: p.x,
          y: p.y,
          rotation: p.rot as any,
          color: p.color,
        });
      }

      // 1x1 Round gem points
      const gems = [
        { x: 6, y: 6, color: '#F2CD37' },
        { x: 13, y: 6, color: '#F2CD37' },
        { x: 13, y: 13, color: '#F2CD37' },
        { x: 6, y: 13, color: '#F2CD37' },
        { x: 9, y: 5, color: '#BBE90B' },
        { x: 10, y: 5, color: '#BBE90B' },
        { x: 9, y: 14, color: '#BBE90B' },
        { x: 10, y: 14, color: '#BBE90B' },
        { x: 5, y: 9, color: '#BBE90B' },
        { x: 5, y: 10, color: '#BBE90B' },
        { x: 14, y: 9, color: '#BBE90B' },
        { x: 14, y: 10, color: '#BBE90B' },
      ];
      for (const g of gems) {
        tiles.push({
          id: `m_${id++}`,
          typeId: 'tile-1x1-round',
          x: g.x,
          y: g.y,
          rotation: 0,
          color: g.color,
        });
      }

      return tiles;
    })(),
  },

  // 4. Sunrise Waves (Showcasing the new 1x2 Half Round tiles)
  {
    id: 'sunrise-waves',
    title: 'Sunrise Waves',
    description: 'Vibrant geometric sunrise landscape composed of 1×2 Half Round tiles, quarter-rounds, and flat bars.',
    cols: 24,
    rows: 24,
    tiles: (() => {
      const tiles: PlacedTile[] = [];
      let id = 1;

      // Sun (Yellow & Orange concentric half-rounds and 2x2 round)
      tiles.push({
        id: `sw_${id++}`,
        typeId: 'tile-2x2-round',
        x: 11,
        y: 8,
        rotation: 0,
        color: '#F2CD37',
      });

      // 1x2 Half Rounds arching over the sun
      const sunRays = [
        { x: 9, y: 7, rot: 0, color: '#FE8A18' },
        { x: 11, y: 6, rot: 0, color: '#FE8A18' },
        { x: 13, y: 7, rot: 0, color: '#FE8A18' },
        { x: 7, y: 9, rot: 90, color: '#F8BB3D' },
        { x: 15, y: 9, rot: 270, color: '#F8BB3D' },
      ];
      for (const r of sunRays) {
        tiles.push({
          id: `sw_${id++}`,
          typeId: 'tile-1x2-half-round',
          x: r.x,
          y: r.y,
          rotation: r.rot as any,
          color: r.color,
        });
      }

      // Sea Waves (Medium Azure, Blue, Dark Turquoise 1x2 Half Rounds and bars)
      const waveRows = [
        { y: 13, color: '#36AEBF' },
        { y: 15, color: '#008F9B' },
        { y: 17, color: '#0055BF' },
        { y: 19, color: '#0A3463' },
      ];

      for (const wave of waveRows) {
        for (let x = 4; x <= 18; x += 2) {
          tiles.push({
            id: `sw_${id++}`,
            typeId: 'tile-1x2-half-round',
            x,
            y: wave.y,
            rotation: 0,
            color: wave.color,
          });
        }
      }

      return tiles;
    })(),
  },
];
