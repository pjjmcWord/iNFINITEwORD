export interface Resources {
  wheat: number;
  stone: number;
  clay: number;
  silver: number;
  wood: number;
}

export interface ResourceProduction {
  wheat: number;
  stone: number;
  clay: number;
  silver: number;
  wood: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: Partial<Resources>;
  effect: string;
  level: number;
  maxLevel: number;
  multiplier: number;
  category: 'production' | 'infrastructure' | 'expansion';
}

export interface GameState {
  resources: Resources;
  baseProduction: ResourceProduction;
  effectiveProduction: ResourceProduction;
  population: number;
  maxPopulation: number;
  upgrades: Upgrade[];
  cameraX: number;
  cameraY: number;
  tick: number;
  villagesExplored: number;
  efficiency: number;
  wheatConsumption: number;
  totalBuildings: number;
  borderRadius: number;
  starving: boolean;
}

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'farm',
    name: '🌾 Granja',
    description: 'Produce trigo. Necesita 2 hab.',
    cost: { wheat: 10, wood: 5 },
    effect: '+2 trigo/tick',
    level: 0,
    maxLevel: 50,
    multiplier: 1.4,
    category: 'production',
  },
  {
    id: 'quarry',
    name: '⛏️ Cantera',
    description: 'Produce piedra. Necesita 2 hab.',
    cost: { stone: 10, wood: 5 },
    effect: '+2 piedra/tick',
    level: 0,
    maxLevel: 50,
    multiplier: 1.4,
    category: 'production',
  },
  {
    id: 'brickworks',
    name: '🧱 Ladrillera',
    description: 'Produce arcilla. Necesita 2 hab.',
    cost: { clay: 10, wood: 5 },
    effect: '+2 arcilla/tick',
    level: 0,
    maxLevel: 50,
    multiplier: 1.4,
    category: 'production',
  },
  {
    id: 'mine',
    name: '💎 Mina de Plata',
    description: 'Produce plata. Necesita 2 hab.',
    cost: { silver: 10, stone: 15 },
    effect: '+2 plata/tick',
    level: 0,
    maxLevel: 50,
    multiplier: 1.4,
    category: 'production',
  },
  {
    id: 'lumbermill',
    name: '🪓 Aserradero',
    description: 'Produce madera. Necesita 2 hab.',
    cost: { wood: 10, stone: 5 },
    effect: '+2 madera/tick',
    level: 0,
    maxLevel: 50,
    multiplier: 1.4,
    category: 'production',
  },
  {
    id: 'house',
    name: '🏠 Casas',
    description: 'Aumenta población máxima (+5)',
    cost: { wood: 15, stone: 10, clay: 5 },
    effect: '+5 población máxima',
    level: 0,
    maxLevel: 30,
    multiplier: 1.6,
    category: 'infrastructure',
  },
  {
    id: 'market',
    name: '🏪 Mercado',
    description: 'Todos los recursos +0.5/tick',
    cost: { silver: 20, wood: 15, stone: 15 },
    effect: '+0.5 todos los recursos',
    level: 0,
    maxLevel: 20,
    multiplier: 2.0,
    category: 'production',
  },
  {
    id: 'expedition',
    name: '🗺️ Expedición',
    description: 'Radio de visión +1',
    cost: { wood: 20, silver: 10 },
    effect: 'Visión del mapa +1',
    level: 0,
    maxLevel: 10,
    multiplier: 2.5,
    category: 'expansion',
  },
  {
    id: 'border',
    name: '🛡️ Frontera',
    description: 'Expande el territorio del pueblo',
    cost: { stone: 25, wood: 20, silver: 5 },
    effect: '+1 radio de frontera',
    level: 0,
    maxLevel: 15,
    multiplier: 2.0,
    category: 'expansion',
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

/**
 * Calculate total number of production buildings (excluding house, expedition, border)
 */
export function getTotalProductionBuildings(upgrades: Upgrade[]): number {
  const productionIds = ['farm', 'quarry', 'brickworks', 'mine', 'lumbermill', 'market'];
  return upgrades
    .filter(u => productionIds.includes(u.id))
    .reduce((sum, u) => sum + u.level, 0);
}

/**
 * Calculate efficiency based on population and buildings
 * Each building needs 2 inhabitants to work at 100%
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
  let production: ResourceProduction = { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 };

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
    }
  });

  return production;
}

/**
 * Calculate wheat consumption per tick (each population consumes 0.1 wheat/tick)
 * Tick is 1 second, so 0.1 wheat per second per population
 */
export function calculateWheatConsumption(population: number): number {
  return population * 0.1;
}

/**
 * Get border radius for the player's village
 */
export function getBorderRadius(borderUpgradeLevel: number): number {
  return 3 + borderUpgradeLevel;
}
