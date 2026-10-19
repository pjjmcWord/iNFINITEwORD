import { Resources } from './gameState';
import { Title, ALL_TITLES, canAffordTitle } from './titles';

export interface TitleState {
  titles: Title[];
  activeTitleIds: string[];
}

export interface TitleBuff {
  type: 'production' | 'consumption' | 'population' | 'border' | 'vision' | 'efficiency';
  resource?: 'wheat' | 'stone' | 'clay' | 'silver' | 'wood';
  value: number;
  label: string;
}

/**
 * Calculate total buffs from all active titles
 */
export function getActiveBuffs(titles: Title[], activeIds: string[]): TitleBuff[] {
  const allBuffs: TitleBuff[] = [];
  for (const title of titles) {
    if (activeIds.includes(title.id)) {
      allBuffs.push(...title.buffs);
    }
  }
  return allBuffs;
}

/**
 * Get production bonus from active titles
 */
export function getTitleProductionBonus(
  titles: Title[], 
  activeIds: string[], 
  resource: 'wheat' | 'stone' | 'clay' | 'silver' | 'wood'
): number {
  const buffs = getActiveBuffs(titles, activeIds);
  let bonus = 0;
  for (const buff of buffs) {
    if (buff.type === 'production' && buff.resource === resource) {
      bonus += buff.value;
    }
  }
  return bonus;
}

/**
 * Get consumption reduction from active titles
 */
export function getTitleConsumptionReduction(titles: Title[], activeIds: string[]): number {
  const buffs = getActiveBuffs(titles, activeIds);
  let reduction = 0;
  for (const buff of buffs) {
    if (buff.type === 'consumption' && buff.resource === 'wheat') {
      reduction += buff.value; // negative value reduces consumption
    }
  }
  return reduction;
}

/**
 * Get extra max population from active titles
 */
export function getTitlePopulationBonus(titles: Title[], activeIds: string[]): number {
  const buffs = getActiveBuffs(titles, activeIds);
  let bonus = 0;
  for (const buff of buffs) {
    if (buff.type === 'population') {
      bonus += buff.value;
    }
  }
  return bonus;
}

/**
 * Get extra border radius from active titles
 */
export function getTitleBorderBonus(titles: Title[], activeIds: string[]): number {
  const buffs = getActiveBuffs(titles, activeIds);
  let bonus = 0;
  for (const buff of buffs) {
    if (buff.type === 'border') {
      bonus += buff.value;
    }
  }
  return bonus;
}

/**
 * Get extra vision radius from active titles
 */
export function getTitleVisionBonus(titles: Title[], activeIds: string[]): number {
  const buffs = getActiveBuffs(titles, activeIds);
  let bonus = 0;
  for (const buff of buffs) {
    if (buff.type === 'vision') {
      bonus += buff.value;
    }
  }
  return bonus;
}

/**
 * Get efficiency bonus from active titles
 */
export function getTitleEfficiencyBonus(titles: Title[], activeIds: string[]): number {
  const buffs = getActiveBuffs(titles, activeIds);
  let bonus = 0;
  for (const buff of buffs) {
    if (buff.type === 'efficiency') {
      bonus += buff.value;
    }
  }
  return bonus;
}

export function createInitialTitleState(): TitleState {
  return {
    titles: ALL_TITLES.map(t => ({ ...t, unlocked: false, active: false })),
    activeTitleIds: [],
  };
}
