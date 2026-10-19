import { fbm, hash } from './noise';

export enum TileType {
  WATER = 'water',
  COAST = 'coast',
  GRASS = 'grass',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  DESERT = 'desert',
  SNOW = 'snow',
  WHEAT_FIELD = 'wheat_field',
  STONE_DEPOSIT = 'stone_deposit',
  CLAY_PIT = 'clay_pit',
  SILVER_VEIN = 'silver_vein',
  DENSE_FOREST = 'dense_forest',
  RUINS = 'ruins',
  OASIS = 'oasis',
}

export interface Village {
  x: number;
  y: number;
  name: string;
  population: number;
  isPlayer: boolean;
  color: string;
  borderRadius: number;
  maxBorderRadius: number;
  friendship: number; // -100 to 100
}

export interface Tile {
  type: TileType;
  elevation: number;
}

export const TILE_INFO: Record<TileType, { name: string; emoji: string; color: string; expansionDifficulty: number }> = {
  [TileType.WATER]: { name: 'Agua', emoji: '🌊', color: '#1a5276', expansionDifficulty: 0 },
  [TileType.COAST]: { name: 'Costa', emoji: '🏖️', color: '#5dade2', expansionDifficulty: 0.3 },
  [TileType.GRASS]: { name: 'Pradera', emoji: '🌿', color: '#52be80', expansionDifficulty: 1 },
  [TileType.FOREST]: { name: 'Bosque', emoji: '🌲', color: '#1e8449', expansionDifficulty: 0.7 },
  [TileType.MOUNTAIN]: { name: 'Montaña', emoji: '⛰️', color: '#6c6c6c', expansionDifficulty: 0.2 },
  [TileType.DESERT]: { name: 'Desierto', emoji: '🏜️', color: '#f4d03f', expansionDifficulty: 0.4 },
  [TileType.SNOW]: { name: 'Nieve', emoji: '❄️', color: '#d5dbdb', expansionDifficulty: 0.1 },
  [TileType.WHEAT_FIELD]: { name: 'Campo de Trigo', emoji: '🌾', color: '#f9e79f', expansionDifficulty: 1 },
  [TileType.STONE_DEPOSIT]: { name: 'Depósito de Piedra', emoji: '🪨', color: '#808b96', expansionDifficulty: 0.5 },
  [TileType.CLAY_PIT]: { name: 'Arcillal', emoji: '🧱', color: '#ca6f1e', expansionDifficulty: 0.8 },
  [TileType.SILVER_VEIN]: { name: 'Veta de Plata', emoji: '💎', color: '#aeb6bf', expansionDifficulty: 0.3 },
  [TileType.DENSE_FOREST]: { name: 'Bosque Denso', emoji: '🌳', color: '#145a32', expansionDifficulty: 0.5 },
  [TileType.RUINS]: { name: 'Ruinas', emoji: '🏛️', color: '#7d6608', expansionDifficulty: 0.6 },
  [TileType.OASIS]: { name: 'Oasis', emoji: '🌴', color: '#45b39d', expansionDifficulty: 0.9 },
};

const VILLAGE_NAMES = [
  'Valle Verde', 'Piedra Alta', 'Río Claro', 'Bosque Oscuro',
  'Monte Blanco', 'Costa Dorada', 'Lago Azul', 'Colina Roja',
  'Puente Viejo', 'Torre Negra', 'Prado Dulce', 'Arena Fina',
  'Nido del Águila', 'Puerto Norte', 'Villa Sol', 'Cueva Profunda',
  'Arboleda', 'Manantial', 'Cumbre', 'Bahía Serena',
  'Aldea Nueva', 'Cerro Alto', 'Llanura', 'Sendero',
];

const villageCache = new Map<string, Village | null>();

export function getTile(x: number, y: number): Tile {
  if (x === 0 && y === 0) {
    return { type: TileType.GRASS, elevation: 0.5 };
  }

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
    if (temperature > 0.6 && moisture < 0.35) {
      type = resourceNoise > 0.82 ? TileType.OASIS : TileType.DESERT;
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
    type = resourceNoise > 0.88 ? TileType.SILVER_VEIN : TileType.SNOW;
  }

  if ((type === TileType.GRASS || type === TileType.FOREST) && hash(x * 3, y * 5, 888) > 0.97) {
    type = TileType.RUINS;
  }

  return { type, elevation };
}

function generateVillageColor(x: number, y: number): string {
  const r = Math.floor(hash(x * 11, y * 17, 123) * 155 + 100);
  const g = Math.floor(hash(x * 13, y * 19, 456) * 155 + 100);
  const b = Math.floor(hash(x * 17, y * 23, 789) * 155 + 100);
  return `rgb(${r}, ${g}, ${b})`;
}

export function calculateMaxBorderRadius(population: number): number {
  return 1 + Math.floor(population / 5);
}

export function getVillageAt(x: number, y: number): Village | null {
  const key = `${x},${y}`;
  
  if (villageCache.has(key)) {
    return villageCache.get(key)!;
  }

  if (x === 0 && y === 0) {
    const village: Village = {
      x: 0, y: 0,
      name: 'Tu Capital',
      population: 10,
      isPlayer: true,
      color: 'rgb(245, 158, 11)',
      borderRadius: 3,
      maxBorderRadius: 3,
      friendship: 100,
    };
    villageCache.set(key, village);
    return village;
  }

  const distToCapital = Math.abs(x) + Math.abs(y);
  if (distToCapital < 5) {
    villageCache.set(key, null);
    return null;
  }

  const villageChance = hash(x * 7, y * 13, 999);
  if (villageChance >= 0.025) {
    villageCache.set(key, null);
    return null;
  }

  const tile = getTile(x, y);
  const villageTiles = [TileType.GRASS, TileType.FOREST, TileType.COAST, TileType.WHEAT_FIELD, TileType.DENSE_FOREST];
  
  if (!villageTiles.includes(tile.type)) {
    villageCache.set(key, null);
    return null;
  }

  const nameIdx = Math.floor(hash(x, y, 555) * VILLAGE_NAMES.length);
  const pop = Math.floor(hash(x, y, 777) * 20) + 5;
  const color = generateVillageColor(x, y);
  const maxBorder = calculateMaxBorderRadius(pop);

  const village: Village = {
    x, y,
    name: VILLAGE_NAMES[nameIdx],
    population: pop,
    isPlayer: false,
    color,
    borderRadius: 1,
    maxBorderRadius: maxBorder,
    friendship: 0,
  };

  villageCache.set(key, village);
  return village;
}

export function isTileInVillageBorder(tileX: number, tileY: number, village: Village): boolean {
  const dist = Math.abs(tileX - village.x) + Math.abs(tileY - village.y);
  return dist <= village.borderRadius;
}

export function getTileNaturalProduction(type: TileType): { wheat: number; stone: number; clay: number; silver: number; wood: number } {
  const prod = { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 };
  switch (type) {
    case TileType.WHEAT_FIELD: prod.wheat = 0.8; break;
    case TileType.STONE_DEPOSIT: prod.stone = 0.6; break;
    case TileType.CLAY_PIT: prod.clay = 0.6; break;
    case TileType.SILVER_VEIN: prod.silver = 0.4; break;
    case TileType.DENSE_FOREST: prod.wood = 0.7; break;
    case TileType.FOREST: prod.wood = 0.2; break;
    case TileType.OASIS: prod.wheat = 0.3; break;
  }
  return prod;
}

export function clearVillageCache(): void {
  villageCache.clear();
}
