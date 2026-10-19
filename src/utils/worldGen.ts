import { fbm, hash } from './noise';

export enum TileType {
  WATER = 'water',
  COAST = 'coast',
  GRASS = 'grass',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  DESERT = 'desert',
  SNOW = 'snow',
}

export interface Village {
  x: number;
  y: number;
  name: string;
  population: number;
  isPlayer: boolean;
}

export interface Tile {
  type: TileType;
  elevation: number;
  village?: Village;
}

const VILLAGE_NAMES = [
  'Valle Verde', 'Piedra Alta', 'Río Claro', 'Bosque Oscuro',
  'Monte Blanco', 'Costa Dorada', 'Lago Azul', 'Colina Roja',
  'Puente Viejo', 'Torre Negra', 'Prado Dulce', 'Arena Fina',
  'Nido del Águila', 'Puerto Norte', 'Villa Sol', 'Cueva Profunda',
  'Arboleda', 'Manantial', 'Cumbre', 'Bahía Serena',
  'Aldea Nueva', 'Cerro Alto', 'Llanura', 'Sendero',
  'Refugio', 'Atalaya', 'Hondonada', 'Pinar',
  'Encinar', 'Robledal', 'Olmeda', 'Cerezal'
];

export function getTile(x: number, y: number): Tile {
  const scale = 0.04;
  const elevation = fbm(x * scale, y * scale, 5, 42);
  const moisture = fbm(x * scale * 0.7, y * scale * 0.7, 4, 137);
  const temperature = fbm(x * scale * 0.5, y * scale * 0.5, 3, 271);

  let type: TileType;

  if (elevation < 0.28) {
    type = TileType.WATER;
  } else if (elevation < 0.33) {
    type = TileType.COAST;
  } else if (elevation < 0.42) {
    // Low land - depends on moisture and temperature
    if (temperature > 0.6 && moisture < 0.35) {
      type = TileType.DESERT;
    } else if (moisture > 0.55) {
      type = TileType.FOREST;
    } else {
      type = TileType.GRASS;
    }
  } else if (elevation < 0.55) {
    // Mid land
    if (moisture > 0.5) {
      type = TileType.FOREST;
    } else if (temperature > 0.65 && moisture < 0.3) {
      type = TileType.DESERT;
    } else {
      type = TileType.GRASS;
    }
  } else if (elevation < 0.7) {
    type = TileType.MOUNTAIN;
  } else {
    type = TileType.SNOW;
  }

  return { type, elevation };
}

export function getVillageAt(x: number, y: number): Village | null {
  // Player's starting village is always at (0, 0)
  if (x === 0 && y === 0) {
    return {
      x: 0,
      y: 0,
      name: 'Tu Pueblo',
      population: 10,
      isPlayer: true,
    };
  }

  const tile = getTile(x, y);
  // Villages can only be on grass, forest, or coast tiles
  if (tile.type !== TileType.GRASS && tile.type !== TileType.FOREST && tile.type !== TileType.COAST) {
    return null;
  }

  // Use hash to determine if there's a village here
  const villageChance = hash(x * 7, y * 13, 999);
  if (villageChance < 0.025) { // 2.5% chance
    const nameIdx = Math.floor(hash(x, y, 555) * VILLAGE_NAMES.length);
    const pop = Math.floor(hash(x, y, 777) * 20) + 5;
    return {
      x,
      y,
      name: VILLAGE_NAMES[nameIdx],
      population: pop,
      isPlayer: false,
    };
  }
  return null;
}

export function getTileColor(type: TileType): string {
  switch (type) {
    case TileType.WATER: return '#1a5276';
    case TileType.COAST: return '#5dade2';
    case TileType.GRASS: return '#52be80';
    case TileType.FOREST: return '#1e8449';
    case TileType.MOUNTAIN: return '#6c6c6c';
    case TileType.DESERT: return '#f4d03f';
    case TileType.SNOW: return '#ecf0f1';
    default: return '#52be80';
  }
}

export function getTileEmoji(type: TileType): string {
  switch (type) {
    case TileType.WATER: return '🌊';
    case TileType.COAST: return '🏖️';
    case TileType.GRASS: return '🌿';
    case TileType.FOREST: return '🌲';
    case TileType.MOUNTAIN: return '⛰️';
    case TileType.DESERT: return '🏜️';
    case TileType.SNOW: return '❄️';
    default: return '🌿';
  }
}
