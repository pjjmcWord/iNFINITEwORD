import { fbm, hash } from './noise';
import { getWorldSeed } from './seed';

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
  color: string; // RGB color
  borderRadius: number; // Current border radius
  maxBorderRadius: number; // Max border based on population
}

export interface Tile {
  type: TileType;
  elevation: number;
}

export interface TileInfo {
  name: string;
  emoji: string;
  color: string;
  description: string;
  resource?: string;
  expansionDifficulty: number; // 0 = impossible, 1 = easy
}

export const TILE_INFO: Record<TileType, TileInfo> = {
  [TileType.WATER]: { name: 'Agua', emoji: '🌊', color: '#1a5276', description: 'Océano profundo', expansionDifficulty: 0 },
  [TileType.COAST]: { name: 'Costa', emoji: '🏖️', color: '#5dade2', description: 'Arena junto al mar', expansionDifficulty: 0.3 },
  [TileType.GRASS]: { name: 'Pradera', emoji: '🌿', color: '#52be80', description: 'Tierra fértil', expansionDifficulty: 1 },
  [TileType.FOREST]: { name: 'Bosque', emoji: '🌲', color: '#1e8449', description: 'Árboles dispersos', expansionDifficulty: 0.7 },
  [TileType.MOUNTAIN]: { name: 'Montaña', emoji: '⛰️', color: '#6c6c6c', description: 'Terreno rocoso', expansionDifficulty: 0.2 },
  [TileType.DESERT]: { name: 'Desierto', emoji: '🏜️', color: '#f4d03f', description: 'Arida y calurosa', expansionDifficulty: 0.4 },
  [TileType.SNOW]: { name: 'Nieve', emoji: '❄️', color: '#d5dbdb', description: 'Helado permanente', expansionDifficulty: 0.1 },
  [TileType.WHEAT_FIELD]: { name: 'Campo de Trigo', emoji: '🌾', color: '#f9e79f', description: '+0.5 trigo/tick natural', resource: 'wheat', expansionDifficulty: 1 },
  [TileType.STONE_DEPOSIT]: { name: 'Depósito de Piedra', emoji: '🪨', color: '#808b96', description: '+0.5 piedra/tick natural', resource: 'stone', expansionDifficulty: 0.5 },
  [TileType.CLAY_PIT]: { name: 'Arcillal', emoji: '🧱', color: '#ca6f1e', description: '+0.5 arcilla/tick natural', resource: 'clay', expansionDifficulty: 0.8 },
  [TileType.SILVER_VEIN]: { name: 'Veta de Plata', emoji: '💎', color: '#aeb6bf', description: '+0.3 plata/tick natural', resource: 'silver', expansionDifficulty: 0.3 },
  [TileType.DENSE_FOREST]: { name: 'Bosque Denso', emoji: '🌳', color: '#145a32', description: '+0.5 madera/tick natural', resource: 'wood', expansionDifficulty: 0.5 },
  [TileType.RUINS]: { name: 'Ruinas', emoji: '🏛️', color: '#7d6608', description: 'Antiguas ruinas misteriosas', expansionDifficulty: 0.6 },
  [TileType.OASIS]: { name: 'Oasis', emoji: '🌴', color: '#45b39d', description: 'Refugio en el desierto', expansionDifficulty: 0.9 },
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

// Cache for villages
const villageCache = new Map<string, Village | null>();

export function getTile(x: number, y: number): Tile {
  // Capital position (0,0) is always grass
  if (x === 0 && y === 0) {
    return { type: TileType.GRASS, elevation: 0.5 };
  }

  const scale = 0.04;
  const worldSeed = getWorldSeed();
  const elevation = fbm(x * scale, y * scale, 5, worldSeed);
  const moisture = fbm(x * scale * 0.7, y * scale * 0.7, 4, worldSeed + 137);
  const temperature = fbm(x * scale * 0.5, y * scale * 0.5, 3, worldSeed + 271);
  const resourceNoise = fbm(x * scale * 1.2, y * scale * 1.2, 3, worldSeed + 555);

  let type: TileType;

  if (elevation < 0.28) {
    type = TileType.WATER;
  } else if (elevation < 0.33) {
    type = TileType.COAST;
  } else if (elevation < 0.42) {
    if (temperature > 0.6 && moisture < 0.35) {
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
    if (resourceNoise > 0.88) {
      type = TileType.SILVER_VEIN;
    } else {
      type = TileType.SNOW;
    }
  }

  if ((type === TileType.GRASS || type === TileType.FOREST) && hash(x * 3, y * 5, worldSeed + 888) > 0.97) {
    type = TileType.RUINS;
  }

  return { type, elevation };
}

/**
 * Generate a random RGB color for a village
 */
function generateVillageColor(x: number, y: number): string {
  const worldSeed = getWorldSeed();
  const r = Math.floor(hash(x * 11, y * 17, worldSeed + 123) * 155 + 100);
  const g = Math.floor(hash(x * 13, y * 19, worldSeed + 456) * 155 + 100);
  const b = Math.floor(hash(x * 17, y * 23, worldSeed + 789) * 155 + 100);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Calculate max border radius based on population
 * Every 5 population = +1 border radius
 */
export function calculateMaxBorderRadius(population: number): number {
  return 1 + Math.floor(population / 5);
}

/**
 * Check if there's a village within minimum distance
 */
function hasNearbyVillage(x: number, y: number, minDistance: number): boolean {
  const worldSeed = getWorldSeed();
  
  // Check all positions within minDistance
  for (let dy = -minDistance; dy <= minDistance; dy++) {
    for (let dx = -minDistance; dx <= minDistance; dx++) {
      // Skip the position itself
      if (dx === 0 && dy === 0) continue;
      
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist > minDistance) continue;
      
      const checkX = x + dx;
      const checkY = y + dy;
      
      // Check if this position would be a village
      const checkChance = hash(checkX * 7, checkY * 13, worldSeed + 999);
      if (checkChance < 0.025) {
        // This position is a village candidate, check if it's valid
        const tile = getTile(checkX, checkY);
        const villageTiles = [
          TileType.GRASS, TileType.FOREST, TileType.COAST, 
          TileType.WHEAT_FIELD, TileType.DENSE_FOREST
        ];
        
        if (villageTiles.includes(tile.type)) {
          // There's a valid village nearby
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Get village at position, with territory
 */
export function getVillageAt(x: number, y: number): Village | null {
  const key = `${x},${y}`;
  
  if (villageCache.has(key)) {
    return villageCache.get(key)!;
  }

  // Player's capital
  if (x === 0 && y === 0) {
    const village: Village = {
      x: 0,
      y: 0,
      name: 'Tu Capital',
      population: 10,
      isPlayer: true,
      color: 'rgb(245, 158, 11)', // Gold
      borderRadius: 3,
      maxBorderRadius: 3,
    };
    villageCache.set(key, village);
    return village;
  }

  // Minimum distance from capital (0,0)
  const distToCapital = Math.abs(x) + Math.abs(y);
  if (distToCapital < 5) {
    villageCache.set(key, null);
    return null;
  }

  // Check if there's another village too close (minimum 5 tiles apart)
  if (hasNearbyVillage(x, y, 4)) {
    villageCache.set(key, null);
    return null;
  }

  // Check if this position is a village center
  const worldSeed = getWorldSeed();
  const villageChance = hash(x * 7, y * 13, worldSeed + 999);
  if (villageChance >= 0.025) {
    villageCache.set(key, null);
    return null;
  }

  const tile = getTile(x, y);
  const villageTiles = [
    TileType.GRASS, TileType.FOREST, TileType.COAST, 
    TileType.WHEAT_FIELD, TileType.DENSE_FOREST
  ];
  
  if (!villageTiles.includes(tile.type)) {
    villageCache.set(key, null);
    return null;
  }

  const nameIdx = Math.floor(hash(x, y, worldSeed + 555) * VILLAGE_NAMES.length);
  const pop = Math.floor(hash(x, y, worldSeed + 777) * 20) + 5;
  const color = generateVillageColor(x, y);
  const maxBorder = calculateMaxBorderRadius(pop);

  const village: Village = {
    x,
    y,
    name: VILLAGE_NAMES[nameIdx],
    population: pop,
    isPlayer: false,
    color,
    borderRadius: 1, // Start with 1 (3x3 area)
    maxBorderRadius: maxBorder,
  };

  villageCache.set(key, village);
  return village;
}

/**
 * Check if a tile is within a village's border
 */
export function isTileInVillageBorder(tileX: number, tileY: number, village: Village): boolean {
  const dist = Math.abs(tileX - village.x) + Math.abs(tileY - village.y);
  return dist <= village.borderRadius;
}

/**
 * Find which village owns a tile (if any)
 */
export function getVillageOwner(tileX: number, tileY: number): Village | null {
  // Check all villages in range
  const searchRadius = 20;
  for (let dy = -searchRadius; dy <= searchRadius; dy++) {
    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
      const vx = tileX + dx;
      const vy = tileY + dy;
      const village = getVillageAt(vx, vy);
      if (village && isTileInVillageBorder(tileX, tileY, village)) {
        return village;
      }
    }
  }
  return null;
}

export function getTileColor(type: TileType): string {
  return TILE_INFO[type]?.color || '#52be80';
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

/**
 * Get expansion candidates for a village
 * Returns tiles that are adjacent to current border and can be expanded
 */
export function getExpansionCandidates(village: Village): { x: number; y: number; difficulty: number }[] {
  const candidates: { x: number; y: number; difficulty: number }[] = [];
  const radius = village.borderRadius;

  // Check all tiles at the border edge
  for (let dy = -radius - 1; dy <= radius + 1; dy++) {
    for (let dx = -radius - 1; dx <= radius + 1; dx++) {
      const dist = Math.abs(dx) + Math.abs(dy);
      
      // Only check tiles at the border edge
      if (dist === radius + 1) {
        const tileX = village.x + dx;
        const tileY = village.y + dy;
        const tile = getTile(tileX, tileY);
        const tileInfo = TILE_INFO[tile.type];
        
        // Can't expand to water
        if (tileInfo.expansionDifficulty === 0) continue;
        
        // Check if not owned by another village
        const owner = getVillageOwner(tileX, tileY);
        if (owner && owner !== village) continue;

        candidates.push({
          x: tileX,
          y: tileY,
          difficulty: tileInfo.expansionDifficulty,
        });
      }
    }
  }

  return candidates;
}

/**
 * Clear the village cache (called when world seed changes)
 */
export function clearVillageCache(): void {
  villageCache.clear();
}
