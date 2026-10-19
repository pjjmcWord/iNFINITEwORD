import React from 'react';
import { Upgrade, Resources, canAfford, getUpgradeCost } from '../utils/gameState';

interface UpgradePanelProps {
  upgrades: Upgrade[];
  resources: Resources;
  onUpgrade: (id: string) => void;
  population: number;
  totalBuildings: number;
  efficiency: number;
}

const UpgradePanel: React.FC<UpgradePanelProps> = ({ 
  upgrades, resources, onUpgrade, population, totalBuildings, efficiency 
}) => {
  const productionUpgrades = upgrades.filter(u => u.category === 'production');
  const infrastructureUpgrades = upgrades.filter(u => u.category === 'infrastructure');
  const expansionUpgrades = upgrades.filter(u => u.category === 'expansion');

  return (
    <div className="h-full flex flex-col bg-gray-800 border-l-2 border-amber-500/30">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-amber-900/50 to-gray-800 border-b border-amber-500/20">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          ⚙️ Mejoras
        </h2>
        <div className="flex items-center gap-3 mt-1 text-[10px]">
          <span className="text-gray-400">👥 {population} hab.</span>
          <span className="text-gray-400">🏗️ {totalBuildings} edif.</span>
          <span className={`font-bold ${
            efficiency >= 1 ? 'text-green-400' : 
            efficiency >= 0.5 ? 'text-yellow-400' : 'text-red-400'
          }`}>⚡ {(efficiency * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin">
        {/* Production Buildings */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
            🏭 Producción
          </h3>
          <div className="space-y-1.5">
            {productionUpgrades.map(upgrade => (
              <UpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                resources={resources}
                onUpgrade={onUpgrade}
                population={population}
                totalBuildings={totalBuildings}
                efficiency={efficiency}
              />
            ))}
          </div>
        </div>

        {/* Infrastructure */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
            🏗️ Infraestructura
          </h3>
          <div className="space-y-1.5">
            {infrastructureUpgrades.map(upgrade => (
              <UpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                resources={resources}
                onUpgrade={onUpgrade}
                population={population}
                totalBuildings={totalBuildings}
                efficiency={efficiency}
              />
            ))}
          </div>
        </div>

        {/* Expansion */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
            🗺️ Expansión
          </h3>
          <div className="space-y-1.5">
            {expansionUpgrades.map(upgrade => (
              <UpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                resources={resources}
                onUpgrade={onUpgrade}
                population={population}
                totalBuildings={totalBuildings}
                efficiency={efficiency}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface UpgradeCardProps {
  upgrade: Upgrade;
  resources: Resources;
  onUpgrade: (id: string) => void;
  population: number;
  totalBuildings: number;
  efficiency: number;
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({ 
  upgrade, resources, onUpgrade, population, totalBuildings, efficiency 
}) => {
  const cost = getUpgradeCost(upgrade);
  const affordable = canAfford(resources, cost);
  const maxed = upgrade.level >= upgrade.maxLevel;
  
  // Is this a production building?
  const isProductionBuilding = ['farm', 'quarry', 'brickworks', 'mine', 'lumbermill', 'market'].includes(upgrade.id);
  
  // Calculate workers needed for this building type
  const workersNeeded = isProductionBuilding ? upgrade.level * 2 : 0;
  const totalWorkersNeeded = totalBuildings * 2;
  const workersAvailable = population;

  return (
    <div
      className={`rounded-lg p-2.5 border transition-all ${
        maxed
          ? 'bg-gray-700/30 border-gray-600/50 opacity-50'
          : affordable
          ? 'bg-gray-700/80 border-amber-500/40 hover:border-amber-400 hover:bg-gray-700'
          : 'bg-gray-700/50 border-gray-600/50'
      }`}
    >
      <div className="flex justify-between items-start mb-0.5">
        <span className="font-semibold text-sm text-white">{upgrade.name}</span>
        <span className="text-[10px] text-gray-400 bg-gray-600/50 px-1.5 py-0.5 rounded">
          Nv.{upgrade.level}/{upgrade.maxLevel}
        </span>
      </div>
      <p className="text-[10px] text-gray-400 mb-1">{upgrade.description}</p>
      <p className="text-[10px] text-green-400 mb-1.5">{upgrade.effect}</p>
      
      {/* Worker requirement indicator for production buildings */}
      {isProductionBuilding && upgrade.level > 0 && (
        <div className="mb-1.5">
          <div className="flex items-center justify-between text-[9px] mb-0.5">
            <span className="text-gray-400">Trabajadores: {workersNeeded}/2 por edif.</span>
            <span className={`font-bold ${
              population >= totalWorkersNeeded ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {workersAvailable}/{totalWorkersNeeded} hab.
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all ${
                efficiency >= 1 ? 'bg-green-500' : 
                efficiency >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, efficiency * 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {!maxed && (
        <div className="flex justify-between items-center gap-1">
          <div className="flex flex-wrap gap-0.5 flex-1">
            {Object.entries(cost).map(([key, value]) => (
              <span
                key={key}
                className={`text-[9px] px-1 py-0.5 rounded ${
                  resources[key as keyof Resources] >= (value || 0)
                    ? 'bg-green-900/50 text-green-300'
                    : 'bg-red-900/50 text-red-300'
                }`}
              >
                {getResourceEmoji(key)} {value}
              </span>
            ))}
          </div>
          <button
            onClick={() => onUpgrade(upgrade.id)}
            disabled={!affordable}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all whitespace-nowrap ${
              affordable
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 active:scale-95'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Mejorar
          </button>
        </div>
      )}
      {maxed && (
        <span className="text-[10px] text-amber-400 font-bold">✅ MÁXIMO</span>
      )}
    </div>
  );
};

function getResourceEmoji(key: string): string {
  switch (key) {
    case 'wheat': return '🌾';
    case 'stone': return '🪨';
    case 'clay': return '🧱';
    case 'silver': return '💎';
    case 'wood': return '🪵';
    default: return '📦';
  }
}

export default UpgradePanel;
