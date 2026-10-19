import React from 'react';
import { Upgrade, Resources, canAfford, getUpgradeCost } from '../utils/gameState';

interface UpgradePanelProps {
  upgrades: Upgrade[];
  resources: Resources;
  onUpgrade: (id: string) => void;
}

const UpgradePanel: React.FC<UpgradePanelProps> = ({ upgrades, resources, onUpgrade }) => {
  return (
    <div className="h-full flex flex-col bg-gray-800 border-l-2 border-amber-500/30">
      <div className="p-3 bg-gradient-to-r from-amber-900/50 to-gray-800 border-b border-amber-500/20">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          ⚙️ Mejoras
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
        {upgrades.map((upgrade) => {
          const cost = getUpgradeCost(upgrade);
          const affordable = canAfford(resources, cost);
          const maxed = upgrade.level >= upgrade.maxLevel;

          return (
            <div
              key={upgrade.id}
              className={`rounded-lg p-3 border transition-all ${
                maxed
                  ? 'bg-gray-700/50 border-gray-600 opacity-60'
                  : affordable
                  ? 'bg-gray-700/80 border-amber-500/40 hover:border-amber-400 hover:bg-gray-700'
                  : 'bg-gray-700/50 border-gray-600/50'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm text-white">{upgrade.name}</span>
                <span className="text-xs text-gray-400 bg-gray-600/50 px-1.5 py-0.5 rounded">
                  Nv.{upgrade.level}/{upgrade.maxLevel}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{upgrade.description}</p>
              <p className="text-xs text-green-400 mb-2">{upgrade.effect}</p>
              
              {!maxed && (
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(cost).map(([key, value]) => (
                      <span
                        key={key}
                        className={`text-xs px-1.5 py-0.5 rounded ${
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
                    className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                      affordable
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Mejorar
                  </button>
                </div>
              )}
              {maxed && (
                <span className="text-xs text-amber-400 font-bold">✅ MÁXIMO</span>
              )}
            </div>
          );
        })}
      </div>
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
