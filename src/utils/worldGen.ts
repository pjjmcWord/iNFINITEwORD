import { fbm, hash } from './noise';

export enum TileType {
  WATER = 'water',
  COAST = 'coast',
  GRASS = 'grass',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  DESERT = 'desert',
  SNOW = 'snow',
  // Resource tiles
  WHEAT_FIELD = 'wheat_field',
  STONE_DEPOSIT = 'stone_deposit',
  CLAY_PIT = 'clay_pit',
  SILVER_VEIN = 'silver_vein',
  DENSE_FOREST = 'dense_forest',
  // Special
  RUINS = 'ruins',
  OASIS = 'oasis',
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

export interface TileInfo {
  name: string;
  emoji: string;
  color: string;
  description: string;
  resource?: string;
}

export const TILE_INFO: Record<TileType, TileInfo> = {
  [TileType.WATER]: { name: 'Agua', emoji: '🌊', color: '#1a5276', description: 'Océano profundo' },
  [TileType.COAST]: { name: 'Costa', emoji: '🏖️', color: '#5dade2', description: 'Arena junto al mar' },
  [TileType.GRASS]: { name: 'Pradera', emoji: '🌿', color: '#52be80', description: 'Tierra fértil' },
  [TileType.FOREST]: { name: 'Bosque', emoji: '🌲', color: '#1e8449', description: 'Árboles dispersos' },
  [TileType.MOUNTAIN]: { name: 'Montaña', emoji: '⛰️', color: '#6c6c6c', description: 'Terreno rocoso' },
  [TileType.DESERT]: { name: 'Desierto', emoji: '🏜️', color: '#f4d03f', description: 'Arida y calurosa' },
  [TileType.SNOW]: { name: 'Nieve', emoji: '❄️', color: '#d5dbdb', description: 'Helado permanente' },
  [TileType.WHEAT_FIELD]: { name: 'Campo de Trigo', emoji: '🌾', color: '#f9e79f', description: '+0.5 trigo/tick natural', resource: 'wheat' },
  [TileType.STONE_DEPOSIT]: { name: 'Depósito de Piedra', emoji: '🪨', color: '#808b96', description: '+0.5 piedra/tick natural', resource: 'stone' },
  [TileType.CLAY_PIT]: { name: 'Arcillal', emoji: '🧱', color: '#ca6f1e', description: '+0.5 arcilla/tick natural', resource: 'clay' },
  [TileType.SILVER_VEIN]: { name: 'Veta de Plata', emoji: '💎', color: '#aeb6bf', description: '+0.3 plata/tick natural', resource: 'silver' },
  [TileType.DENSE_FOREST]: { name: 'Bosque Denso', emoji: '🌳', color: '#145a32', description: '+0.5 madera/tick natural', resource: 'wood' },
  [TileType.RUINS]: { name: 'Ruinas', emoji: '🏛️', color: '#7d6608', description: 'Antiguas ruinas misteriosas' },
  [TileType.OASIS]: { name: 'Oasis', emoji: '🌴', color: '#45b39d', description: 'Refugio en el desierto' },
};

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
  const resourceNoise = fbm(x * scale * 1.2, y * scale * 1.2, 3, 555);

  let type: TileType;

  if (elevation < 0.28) {
    type = TileType.WATER;
  } else if (elevation < 0.33) {
    type = TileType.COAST;
  } else if (elevation < 0.42) {
    // Low land
    if (temperature > 0.6 && moisture < 0.35) {
      // Desert area - check for oasis
      if (resourceNoise > 0.82) {
        type = TileType.OASIS;
      } else {
        type = TileType.DESERT;
      }
    } else if (moisture > 0.65 && resourceNoise > 0.7) {
      type = TileType.WHEAT_FIELD;
    } else if (moisture > 0.55) {
      type = TileType.FOREST;
    } else if (resourceNoise > 0.78) {
      type = TileType.CLAY_PIT;
    } else {
      type = TileType.GRASS;
    }
  } else if (elevation < 0.55) {
    // Mid land
    if (moisture > 0.6 && resourceNoise > 0.72) {
      type = TileType.DENSE_FOREST;
    } else if (moisture > 0.5) {
      type = TileType.FOREST;
    } else if (temperature > 0.65 && moisture < 0.3) {
      type = TileType.DESERT;
    } else if (resourceNoise > 0.75) {
      type = TileType.WHEAT_FIELD;
    } else {
      type = TileType.GRASS;
    }
  } else if (elevation < 0.65) {
    // Higher terrain
    if (resourceNoise > 0.78) {
      type = TileType.STONE_DEPOSIT;
    } else if (resourceNoise > 0.85 && moisture > 0.4) {
      type = TileType.SILVER_VEIN;
    } else {
      type = TileType.MOUNTAIN;
    }
  } else if (elevation < 0.75) {
    type = TileType.MOUNTAIN;
  } else {
    // Snow peaks - check for silver
    if (resourceNoise > 0.88) {
      type = TileType.SILVER_VEIN;
    } else {
      type = TileType.SNOW;
    }
  }

  // Rare ruins on grass/forest
  if ((type === TileType.GRASS || type === TileType.FOREST) && hash(x * 3, y * 5, 888) > 0.97) {
    type = TileType.RUINS;
  }

  return { type, elevation };
}

export function getVillageAt(x: number, y: number): Village | null {
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
  const villageTiles = [
    TileType.GRASS, TileType.FOREST, TileType.COAST, 
    TileType.WHEAT_FIELD, TileType.DENSE_FOREST
  ];
  if (!villageTiles.includes(tile.type)) {
    return null;
  }

  const villageChance = hash(x * 7, y * 13, 999);
  if (villageChance < 0.025) {
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
  return TILE_INFO[type]?.color || '#52be80';
}

export function getTileEmoji(type: TileType): string {
  return TILE_INFO[type]?.emoji || '🌿';
}

/**
 * Get natural resource production from a tile (for tiles within border)
 */
export function getTileNaturalProduction(type: TileType): { wheat: number; stone: number; clay: number; silver: number; wood: number } {
  const prod = { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 };
  switch (type) {
    case TileType.WHEAT_FIELD: prod.wheat = 0.5; break;
    case TileType.STONE_DEPOSIT: prod.stone = 0.5; break;
    case TileType.CLAY_PIT: prod.clay = 0.5; break;
    case TileType.SILVER_VEIN: prod.silver = 0.3; break;
    case TileType.DENSE_FOREST: prod.wood = 0.5; break;
    case TileType.FOREST: prod.wood = 0.1; break;
    case TileType.OASIS: prod.wheat = 0.2; break;
  }
  return prod;
}
