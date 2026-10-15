import { PaletteColor } from '../types/mosaic';

export const INITIAL_LEGO_PALETTE: PaletteColor[] = [
  // Briefly Bricks Signature Palette (from Briefly Bricks Colour Palette)
  { id: 'briefly-deep-azure', name: 'Briefly Deep Azure', hex: '#0090D7', isOfficial: true },
  { id: 'briefly-bright-azure', name: 'Briefly Bright Azure', hex: '#00A3F0', isOfficial: true },
  { id: 'briefly-sky-blue', name: 'Briefly Sky Blue', hex: '#86D5FB', isOfficial: true },
  { id: 'briefly-dusty-rose', name: 'Briefly Dusty Rose', hex: '#C85786', isOfficial: true },
  { id: 'briefly-bright-pink', name: 'Briefly Bright Pink', hex: '#FF6EA7', isOfficial: true },
  { id: 'briefly-pastel-pink', name: 'Briefly Pastel Pink', hex: '#FFC5E2', isOfficial: true },
  { id: 'briefly-lilac-purple', name: 'Briefly Lilac Purple', hex: '#9684BE', isOfficial: true },
  { id: 'briefly-soft-lavender', name: 'Briefly Soft Lavender', hex: '#B9AADA', isOfficial: true },
  { id: 'briefly-sun-yellow', name: 'Briefly Sun Yellow', hex: '#FFE853', isOfficial: true },
  { id: 'briefly-pastel-yellow', name: 'Briefly Pastel Yellow', hex: '#FFF89C', isOfficial: true },

  // Core & Neutrals
  { id: 'lego-white', name: 'White', hex: '#FFFFFF', isOfficial: true },
  { id: 'lego-black', name: 'Black', hex: '#1B1B1B', isOfficial: true },
  { id: 'lego-light-bluish-gray', name: 'Light Bluish Gray', hex: '#A0A5A9', isOfficial: true },
  { id: 'lego-dark-bluish-gray', name: 'Dark Bluish Gray', hex: '#595D60', isOfficial: true },
  { id: 'lego-tan', name: 'Tan', hex: '#E4CD9E', isOfficial: true },
  { id: 'lego-dark-tan', name: 'Dark Tan', hex: '#958A73', isOfficial: true },
  { id: 'lego-reddish-brown', name: 'Reddish Brown', hex: '#583927', isOfficial: true },
  { id: 'lego-dark-brown', name: 'Dark Brown', hex: '#352100', isOfficial: true },

  // Reds & Pinks
  { id: 'lego-red', name: 'Red', hex: '#C91A09', isOfficial: true },
  { id: 'lego-dark-red', name: 'Dark Red', hex: '#720E0F', isOfficial: true },
  { id: 'lego-coral', name: 'Coral', hex: '#F05E49', isOfficial: true },
  { id: 'lego-bright-pink', name: 'Bright Pink', hex: '#E4ADC8', isOfficial: true },
  { id: 'lego-magenta', name: 'Magenta', hex: '#92397B', isOfficial: true },

  // Oranges & Yellows
  { id: 'lego-orange', name: 'Orange', hex: '#FE8A18', isOfficial: true },
  { id: 'lego-bright-light-orange', name: 'Bright Light Orange', hex: '#F8BB3D', isOfficial: true },
  { id: 'lego-yellow', name: 'Yellow', hex: '#F2CD37', isOfficial: true },
  { id: 'lego-warm-gold', name: 'Warm Gold', hex: '#AA7F2E', isOfficial: true },

  // Greens
  { id: 'lego-lime', name: 'Lime', hex: '#BBE90B', isOfficial: true },
  { id: 'lego-bright-green', name: 'Bright Green', hex: '#4B9F4A', isOfficial: true },
  { id: 'lego-green', name: 'Green', hex: '#237841', isOfficial: true },
  { id: 'lego-dark-green', name: 'Dark Green', hex: '#184E32', isOfficial: true },
  { id: 'lego-sand-green', name: 'Sand Green', hex: '#A0BCAC', isOfficial: true },
  { id: 'lego-olive-green', name: 'Olive Green', hex: '#9B9A5A', isOfficial: true },

  // Blues & Teals
  { id: 'lego-dark-turquoise', name: 'Dark Turquoise', hex: '#008F9B', isOfficial: true },
  { id: 'lego-medium-azure', name: 'Medium Azure', hex: '#36AEBF', isOfficial: true },
  { id: 'lego-light-aqua', name: 'Light Aqua', hex: '#ADC3C0', isOfficial: true },
  { id: 'lego-blue', name: 'Blue', hex: '#0055BF', isOfficial: true },
  { id: 'lego-dark-blue', name: 'Dark Blue', hex: '#0A3463', isOfficial: true },
  { id: 'lego-sand-blue', name: 'Sand Blue', hex: '#6074A1', isOfficial: true },

  // Purples
  { id: 'lego-lavender', name: 'Lavender', hex: '#E1D5ED', isOfficial: true },
  { id: 'lego-medium-lilac', name: 'Dark Purple', hex: '#3F3691', isOfficial: true },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const intVal = parseInt(cleanHex, 16);
  return {
    r: ((intVal >> 16) & 255) / 255,
    g: ((intVal >> 8) & 255) / 255,
    b: (intVal & 255) / 255,
  };
}
