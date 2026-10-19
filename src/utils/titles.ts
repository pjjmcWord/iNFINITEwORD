import { Resources } from './gameState';

export interface Title {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cost: Partial<Resources>;
  buffs: TitleBuff[];
  unlocked: boolean;
  active: boolean;
  requirement?: string;
}

export interface TitleBuff {
  type: 'production' | 'consumption' | 'population' | 'border' | 'vision' | 'efficiency';
  resource?: 'wheat' | 'stone' | 'clay' | 'silver' | 'wood';
  value: number;
  label: string;
}

export const ALL_TITLES: Title[] = [
  {
    id: 'farmer_lord',
    name: 'Señor de las Cosechas',
    description: 'Maestro de la agricultura',
    emoji: '🌾',
    cost: { wheat: 100, wood: 30 },
    buffs: [
      { type: 'production', resource: 'wheat', value: 2, label: '+2 trigo/tick' },
      { type: 'consumption', resource: 'wheat', value: -0.02, label: '-0.02 consumo/hab' },
    ],
    unlocked: false,
    active: false,
    requirement: 'Tener 5 granjas',
  },
  {
    id: 'stone_mason',
    name: 'Maestro Cantero',
    description: 'Experto en extracción de piedra',
    emoji: '⛏️',
    cost: { stone: 100, wood: 30 },
    buffs: [
      { type: 'production', resource: 'stone', value: 2, label: '+2 piedra/tick' },
      { type: 'efficiency', value: 0.1, label: '+10% eficiencia edificios' },
    ],
    unlocked: false,
    active: false,
    requirement: 'Tener 5 canteras',
  },
  {
    id: 'silver_king',
    name: 'Rey de la Plata',
    description: 'Riqueza infinita',
    emoji: '👑',
    cost: { silver: 50, stone: 50 },
    buffs: [
      { type: 'production', resource: 'silver', value: 1.5, label: '+1.5 plata/tick' },
      { type: 'efficiency', value: 0.1, label: '+10% eficiencia edificios' },
    ],
    unlocked: false,
    active: false,
    requirement: 'Tener 3 minas de plata',
  },
  {
    id: 'forest_guardian',
    name: 'Guardián del Bosque',
    description: 'Protector de la naturaleza',
    emoji: '🌳',
    cost: { wood: 120, clay: 40 },
    buffs: [
      { type: 'production', resource: 'wood', value: 2, label: '+2 madera/tick' },
      { type: 'population', value: 5, label: '+5 población máxima' },
    ],
    unlocked: false,
    active: false,
    requirement: 'Tener 5 aserraderos',
  },
  {
    id: 'clay_master',
    name: 'Maestro Alfarero',
    description: 'Señor del barro y la arcilla',
    emoji: '🏺',
    cost: { clay: 100, stone: 40 },
    buffs: [
      { type: 'production', resource: 'clay', value: 2, label: '+2 arcilla/tick' },
      { type: 'efficiency', value: 0.05, label: '+5% eficiencia edificios' },
    ],
    unlocked: false,
    active: false,
    requirement: 'Tener 5 ladrilleras',
  },
  {
    id: 'explorer',
    name: 'Explorador Legendario',
    description: 'Conocedor de tierras lejanas',
    emoji: '🧭',
    cost: { wood: 80, silver: 30 },
    buffs: [
      { type: 'vision', value: 3, label: '+3 radio de visión' },
      { type: 'border', value: 2, label: '+2 radio de frontera' },
    ],
    unlocked: false,
    active: false,
    requirement: 'Descubrir 5 pueblos',
  },
  {
    id: 'feast_master',
    name: 'Maestro del Banquete',
    description: 'Nadie pasa hambre en tu reino',
    emoji: '🍖',
    cost: { wheat: 200, silver: 40 },
    buffs: [
      { type: 'consumption', resource: 'wheat', value: -0.03, label: '-0.03 consumo/hab' },
      { type: 'population', value: 10, label: '+10 población máxima' },
    ],
    unlocked: false,
    active: false,
    requirement: 'Alcanzar 30 población',
  },
  {
    id: 'warlord',
    name: 'Señor de la Guerra',
    description: 'Tu poder militar es temido',
    emoji: '⚔️',
    cost: { stone: 150, silver: 80, wood: 100 },
    buffs: [
      { type: 'border', value: 4, label: '+4 radio de frontera' },
      { type: 'efficiency', value: 0.15, label: '+15% eficiencia edificios' },
    ],
    unlocked: false,
    active: false,
    requirement: 'Frontera nivel 5',
  },
  {
    id: 'merchant_prince',
    name: 'Príncipe Mercader',
    description: 'El comercio fluye como ríos de oro',
    emoji: '💰',
    cost: { silver: 100, wood: 80, clay: 60 },
    buffs: [
      { type: 'production', resource: 'wheat', value: 1, label: '+1 trigo/tick' },
      { type: 'production', resource: 'stone', value: 1, label: '+1 piedra/tick' },
      { type: 'production', resource: 'clay', value: 1, label: '+1 arcilla/tick' },
      { type: 'production', resource: 'silver', value: 0.5, label: '+0.5 plata/tick' },
      { type: 'production', resource: 'wood', value: 1, label: '+1 madera/tick' },
    ],
    unlocked: false,
    active: false,
    requirement: 'Tener 3 mercados',
  },
  {
    id: 'emperor',
    name: 'Emperador del Mundo',
    description: 'El título supremo',
    emoji: '🏛️',
    cost: { wheat: 500, stone: 500, clay: 300, silver: 200, wood: 400 },
    buffs: [
      { type: 'production', resource: 'wheat', value: 3, label: '+3 trigo/tick' },
      { type: 'production', resource: 'stone', value: 3, label: '+3 piedra/tick' },
      { type: 'production', resource: 'clay', value: 3, label: '+3 arcilla/tick' },
      { type: 'production', resource: 'silver', value: 2, label: '+2 plata/tick' },
      { type: 'production', resource: 'wood', value: 3, label: '+3 madera/tick' },
      { type: 'population', value: 20, label: '+20 población máxima' },
      { type: 'border', value: 3, label: '+3 radio de frontera' },
    ],
    unlocked: false,
    active: false,
    requirement: 'Tener todos los demás títulos',
  },
];

export function canAffordTitle(resources: Resources, cost: Partial<Resources>): boolean {
  for (const [key, value] of Object.entries(cost)) {
    if (resources[key as keyof Resources] < (value || 0)) {
      return false;
    }
  }
  return true;
}
