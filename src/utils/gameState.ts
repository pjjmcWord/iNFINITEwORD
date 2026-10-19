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
}

export interface GameState {
  resources: Resources;
  production: ResourceProduction;
  population: number;
  maxPopulation: number;
  upgrades: Upgrade[];
  playerX: number;
  playerY: number;
  tick: number;
  villagesExplored: number;
}

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'farm',
    name: '🌾 Granja',
    description: 'Aumenta la producción de trigo',
    cost: { wheat: 10, wood: 5 },
    effect: '+1 trigo/tick',
    level: 0,
    maxLevel: 50,
    multiplier: 1.5,
  },
  {
    id: 'quarry',
    name: '⛏️ Cantera',
    description: 'Aumenta la producción de piedra',
    cost: { stone: 10, wood: 5 },
    effect: '+1 piedra/tick',
    level: 0,
    maxLevel: 50,
    multiplier: 1.5,
  },
  {
    id: 'brickworks',
    name: '🧱 Ladrillera',
    description: 'Aumenta la producción de arcilla',
    cost: { clay: 10, wood: 5 },
    effect: '+1 arcilla/tick',
    level: 0,
    maxLevel: 50,
    multiplier: 1.5,
  },
  {
    id: 'mine',
    name: '💎 Mina de Plata',
    description: 'Aumenta la producción de plata',
    cost: { silver: 10, stone: 15 },
    effect: '+1 plata/tick',
    level: 0,
    maxLevel: 50,
    multiplier: 1.5,
  },
  {
    id: 'lumbermill',
    name: '🪓 Aserradero',
    description: 'Aumenta la producción de madera',
    cost: { wood: 10, stone: 5 },
    effect: '+1 madera/tick',
    level: 0,
    maxLevel: 50,
    multiplier: 1.5,
  },
  {
    id: 'house',
    name: '🏠 Casas',
    description: 'Aumenta la población máxima',
    cost: { wood: 15, stone: 10, clay: 5 },
    effect: '+5 población máxima',
    level: 0,
    maxLevel: 30,
    multiplier: 1.8,
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
  },
  {
    id: 'expedition',
    name: '🗺️ Expedición',
    description: 'Descubre pueblos más rápido',
    cost: { wood: 20, silver: 10 },
    effect: 'Visión del mapa +1',
    level: 0,
    maxLevel: 10,
    multiplier: 2.5,
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
