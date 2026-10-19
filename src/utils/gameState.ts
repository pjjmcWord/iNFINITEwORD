export interface Resources {
  wheat: number;
  stone: number;
  clay: number;
  silver: number;
  wood: number;
  science: number;
  culture: number;
  faith: number;
}

export interface ResourceProduction {
  wheat: number;
  stone: number;
  clay: number;
  silver: number;
  wood: number;
  science: number;
  culture: number;
  faith: number;
}

export type UpgradeCategory = 'buildings' | 'technologies' | 'culture' | 'religion';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: Partial<Resources>;
  effect: string;
  level: number;
  maxLevel: number;
  multiplier: number;
  category: UpgradeCategory;
  limit?: number; // Maximum level (for buildings)
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  baseCost: number; // Base science cost
  multiplier: number; // Cost multiplier per level
  level: number;
  maxLevel: number;
  effect: string;
  active: boolean; // Is this the currently researched technology?
}

export interface GameState {
  resources: Resources;
  baseProduction: ResourceProduction;
  effectiveProduction: ResourceProduction;
  capitalProduction: ResourceProduction;
  naturalProduction: ResourceProduction;
  titleProduction: ResourceProduction;
  population: number;
  maxPopulation: number;
  upgrades: Upgrade[];
  technologies: Technology[];
  activeTechnologyId: string | null;
  cameraX: number;
  cameraY: number;
  tick: number;
  villagesExplored: number;
  efficiency: number;
  wheatConsumption: number;
  totalBuildings: number;
  borderRadius: number;
  starving: boolean;
  titles: import('./titles').Title[];
  activeTitleIds: string[];
}

// Capital base production
export const CAPITAL_BASE_PRODUCTION: ResourceProduction = {
  wheat: 2,
  stone: 1.5,
  clay: 1.5,
  silver: 0.8,
  wood: 1.5,
  science: 0.5,
  culture: 0.2,
  faith: 0.2,
};

// Building upgrades (limited by technology)
export const INITIAL_BUILDINGS: Upgrade[] = [
  {
    id: 'farm',
    name: '🌾 Granja',
    description: 'Produce trigo. Necesita 2 hab.',
    cost: { wheat: 8, wood: 3 },
    effect: '+2 trigo/tick',
    level: 0,
    maxLevel: 5, // Base limit
    multiplier: 1.3,
    category: 'buildings',
    limit: 5,
  },
  {
    id: 'quarry',
    name: '⛏️ Cantera',
    description: 'Produce piedra. Necesita 2 hab.',
    cost: { stone: 8, wood: 3 },
    effect: '+2 piedra/tick',
    level: 0,
    maxLevel: 5,
    multiplier: 1.3,
    category: 'buildings',
    limit: 5,
  },
  {
    id: 'brickworks',
    name: '🧱 Ladrillera',
    description: 'Produce arcilla. Necesita 2 hab.',
    cost: { clay: 8, wood: 3 },
    effect: '+2 arcilla/tick',
    level: 0,
    maxLevel: 5,
    multiplier: 1.3,
    category: 'buildings',
    limit: 5,
  },
  {
    id: 'mine',
    name: '💎 Mina de Plata',
    description: 'Produce plata. Necesita 2 hab.',
    cost: { silver: 8, stone: 10 },
    effect: '+2 plata/tick',
    level: 0,
    maxLevel: 5,
    multiplier: 1.4,
    category: 'buildings',
    limit: 5,
  },
  {
    id: 'lumbermill',
    name: '🪓 Aserradero',
    description: 'Produce madera. Necesita 2 hab.',
    cost: { wood: 10, stone: 5 },
    effect: '+2 madera/tick',
    level: 0,
    maxLevel: 5,
    multiplier: 1.4,
    category: 'buildings',
    limit: 5,
  },
  {
    id: 'house',
    name: '🏠 Casas',
    description: 'Aumenta población máxima (+5)',
    cost: { wood: 10, stone: 8, clay: 5 },
    effect: '+5 población máxima',
    level: 0,
    maxLevel: 30,
    multiplier: 1.4,
    category: 'buildings',
  },
  {
    id: 'market',
    name: '🏪 Mercado',
    description: 'Todos los recursos +0.5/tick',
    cost: { silver: 15, wood: 10, stone: 10 },
    effect: '+0.5 todos los recursos',
    level: 0,
    maxLevel: 3,
    multiplier: 1.6,
    category: 'buildings',
    limit: 3,
  },
  {
    id: 'library',
    name: '📚 Biblioteca',
    description: 'Produce ciencia. Necesita 2 hab.',
    cost: { wood: 15, stone: 10, clay: 5 },
    effect: '+1 ciencia/tick',
    level: 0,
    maxLevel: 5,
    multiplier: 1.5,
    category: 'buildings',
    limit: 5,
  },
];

// Technology upgrades (cost science, increase building limits)
export const INITIAL_TECHNOLOGIES: Technology[] = [
  {
    id: 'agriculture',
    name: '🌾 Agricultura Avanzada',
    description: 'Aumenta el límite de granjas en +2',
    baseCost: 50,
    multiplier: 2.0,
    level: 0,
    maxLevel: 10,
    effect: '+2 límite de granjas',
    active: false,
  },
  {
    id: 'mining',
    name: '⛏️ Minería Avanzada',
    description: 'Aumenta el límite de canteras en +2',
    baseCost: 50,
    multiplier: 2.0,
    level: 0,
    maxLevel: 10,
    effect: '+2 límite de canteras',
    active: false,
  },
  {
    id: 'masonry',
    name: '🧱 Albañilería',
    description: 'Aumenta el límite de ladrilleras en +2',
    baseCost: 50,
    multiplier: 2.0,
    level: 0,
    maxLevel: 10,
    effect: '+2 límite de ladrilleras',
    active: false,
  },
  {
    id: 'metallurgy',
    name: '💎 Metalurgia',
    description: 'Aumenta el límite de minas de plata en +2',
    baseCost: 80,
    multiplier: 2.2,
    level: 0,
    maxLevel: 10,
    effect: '+2 límite de minas',
    active: false,
  },
  {
    id: 'forestry',
    name: '🪓 Silvicultura',
    description: 'Aumenta el límite de aserraderos en +2',
    baseCost: 50,
    multiplier: 2.0,
    level: 0,
    maxLevel: 10,
    effect: '+2 límite de aserraderos',
    active: false,
  },
  {
    id: 'education',
    name: '📚 Educación',
    description: 'Aumenta el límite de bibliotecas en +2',
    baseCost: 100,
    multiplier: 2.5,
    level: 0,
    maxLevel: 10,
    effect: '+2 límite de bibliotecas',
    active: false,
  },
  {
    id: 'commerce',
    name: '🏪 Comercio',
    description: 'Aumenta el límite de mercados en +1',
    baseCost: 150,
    multiplier: 3.0,
    level: 0,
    maxLevel: 5,
    effect: '+1 límite de mercados',
    active: false,
  },
];

export function canAfford(resources: Resources, cost: Partial<Resources>): boolean {
  for (const [key, value] of Object.entries(cost)) {
    if (resources[key as keyof Resources] < (value || 0)) {
      return false;
    }
  }
  return true;
}

export function getUpgradeCost(upgrade: Upgrade): Partial<Resources> {
  const cost: Partial<Resources> = {};
  for (const [key, value] of Object.entries(upgrade.cost)) {
    cost[key as keyof Resources] = Math.floor((value || 0) * Math.pow(upgrade.multiplier, upgrade.level));
  }
  return cost;
}

export function getTechnologyCost(tech: Technology): number {
  return Math.floor(tech.baseCost * Math.pow(tech.multiplier, tech.level));
}

/**
 * Get building limit based on technology levels
 */
export function getBuildingLimit(buildingId: string, technologies: Technology[]): number {
  const baseLimits: Record<string, number> = {
    farm: 5,
    quarry: 5,
    brickworks: 5,
    mine: 5,
    lumbermill: 5,
    market: 3,
    library: 5,
  };

  const baseLimit = baseLimits[buildingId] || 999;
  let bonus = 0;

  technologies.forEach(tech => {
    if (tech.level > 0) {
      switch (tech.id) {
        case 'agriculture':
          if (buildingId === 'farm') bonus += tech.level * 2;
          break;
        case 'mining':
          if (buildingId === 'quarry') bonus += tech.level * 2;
          break;
        case 'masonry':
          if (buildingId === 'brickworks') bonus += tech.level * 2;
          break;
        case 'metallurgy':
          if (buildingId === 'mine') bonus += tech.level * 2;
          break;
        case 'forestry':
          if (buildingId === 'lumbermill') bonus += tech.level * 2;
          break;
        case 'education':
          if (buildingId === 'library') bonus += tech.level * 2;
          break;
        case 'commerce':
          if (buildingId === 'market') bonus += tech.level;
          break;
      }
    }
  });

  return baseLimit + bonus;
}

/**
 * Calculate total number of production buildings
 */
export function getTotalProductionBuildings(upgrades: Upgrade[]): number {
  const productionIds = ['farm', 'quarry', 'brickworks', 'mine', 'lumbermill', 'market', 'library'];
  return upgrades
    .filter(u => productionIds.includes(u.id))
    .reduce((sum, u) => sum + u.level, 0);
}

/**
 * Calculate efficiency based on population and buildings
 */
export function calculateEfficiency(population: number, totalBuildings: number): number {
  if (totalBuildings === 0) return 1;
  const neededPopulation = totalBuildings * 2;
  return Math.min(1, population / neededPopulation);
}

/**
 * Calculate effective production considering efficiency
 */
export function calculateEffectiveProduction(
  upgrades: Upgrade[],
  efficiency: number
): ResourceProduction {
  let production: ResourceProduction = { 
    wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0,
    science: 0, culture: 0, faith: 0
  };

  upgrades.forEach(upgrade => {
    const effectiveLevel = upgrade.level * efficiency;
    switch (upgrade.id) {
      case 'farm':
        production.wheat += effectiveLevel * 2;
        break;
      case 'quarry':
        production.stone += effectiveLevel * 2;
        break;
      case 'brickworks':
        production.clay += effectiveLevel * 2;
        break;
      case 'mine':
        production.silver += effectiveLevel * 2;
        break;
      case 'lumbermill':
        production.wood += effectiveLevel * 2;
        break;
      case 'market':
        production.wheat += effectiveLevel * 0.5;
        production.stone += effectiveLevel * 0.5;
        production.clay += effectiveLevel * 0.5;
        production.silver += effectiveLevel * 0.5;
        production.wood += effectiveLevel * 0.5;
        break;
      case 'library':
        production.science += effectiveLevel * 1;
        break;
    }
  });

  return production;
}

/**
 * Calculate wheat consumption per tick
 */
export function calculateWheatConsumption(population: number): number {
  return population * 0.05;
}

/**
 * Get border radius for the player's village (fixed at 3, expands with population)
 */
export function getBorderRadius(): number {
  return 3;
}
