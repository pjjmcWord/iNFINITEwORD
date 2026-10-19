import React, { useState } from 'react';
import { Upgrade, Technology, Resources, canAfford, getUpgradeCost, getTechnologyCost, getBuildingLimit } from '../utils/gameState';

interface UpgradePanelProps {
  upgrades: Upgrade[];
  technologies: Technology[];
  resources: Resources;
  activeTechnologyId: string | null;
  onUpgrade: (id: string) => void;
  onSelectTechnology: (id: string) => void;
  population: number;
  totalBuildings: number;
  efficiency: number;
}

type TabType = 'buildings' | 'technologies' | 'culture' | 'religion';

const UpgradePanel: React.FC<UpgradePanelProps> = ({ 
  upgrades, technologies, resources, activeTechnologyId,
  onUpgrade, onSelectTechnology, population, totalBuildings, efficiency 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('buildings');

  const buildings = upgrades.filter(u => u.category === 'buildings');
  const tabs: { id: TabType; label: string; emoji: string }[] = [
    { id: 'buildings', label: 'Construcciones', emoji: '🏗️' },
    { id: 'technologies', label: 'Tecnologías', emoji: '🔬' },
    { id: 'culture', label: 'Cultura', emoji: '🎭' },
    { id: 'religion', label: 'Religión', emoji: '🙏' },
  ];

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

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-2 py-2 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-gray-700 text-amber-400 border-b-2 border-amber-400'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
            }`}
          >
            <span className="block text-sm">{tab.emoji}</span>
            <span className="block text-[9px] mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
        {activeTab === 'buildings' && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 px-1">
              Los límites de edificios se aumentan con tecnologías
            </p>
            {buildings.map(upgrade => {
              const limit = getBuildingLimit(upgrade.id, technologies);
              const isAtLimit = upgrade.level >= limit;
              const cost = getUpgradeCost(upgrade);
              const affordable = canAfford(resources, cost);

              return (
                <div
                  key={upgrade.id}
                  className={`rounded-lg p-2.5 border transition-all ${
                    isAtLimit
                      ? 'bg-gray-700/30 border-gray-600/50 opacity-60'
                      : affordable
                      ? 'bg-gray-700/80 border-amber-500/40 hover:border-amber-400'
                      : 'bg-gray-700/50 border-gray-600/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-semibold text-sm text-white">{upgrade.name}</span>
                    <span className="text-[10px] text-gray-400 bg-gray-600/50 px-1.5 py-0.5 rounded">
                      {upgrade.level}/{limit}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-1">{upgrade.description}</p>
                  <p className="text-[10px] text-green-400 mb-1.5">{upgrade.effect}</p>
                  
                  {!isAtLimit && (
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
                        Construir
                      </button>
                    </div>
                  )}
                  {isAtLimit && (
                    <span className="text-[10px] text-amber-400 font-bold">🔒 Límite alcanzado</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'technologies' && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 px-1">
              Selecciona una tecnología para investigar. Usa ciencia generada por bibliotecas.
            </p>
            {technologies.map(tech => {
              const cost = getTechnologyCost(tech);
              const isActive = activeTechnologyId === tech.id;
              const canAffordTech = resources.science >= cost;
              const isMaxed = tech.level >= tech.maxLevel;

              return (
                <div
                  key={tech.id}
                  className={`rounded-lg p-2.5 border transition-all ${
                    isMaxed
                      ? 'bg-green-900/20 border-green-500/30'
                      : isActive
                      ? 'bg-blue-900/30 border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-gray-700/50 border-gray-600/50 hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-semibold text-sm text-white">{tech.name}</span>
                    <span className="text-[10px] text-gray-400 bg-gray-600/50 px-1.5 py-0.5 rounded">
                      Nv.{tech.level}/{tech.maxLevel}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-1">{tech.description}</p>
                  <p className="text-[10px] text-blue-400 mb-1.5">{tech.effect}</p>
                  
                  {!isMaxed && (
                    <div className="flex justify-between items-center gap-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        canAffordTech ? 'bg-blue-900/50 text-blue-300' : 'bg-red-900/50 text-red-300'
                      }`}>
                        🔬 {cost} ciencia
                      </span>
                      <button
                        onClick={() => onSelectTechnology(tech.id)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-600 hover:bg-blue-600 text-gray-300 hover:text-white'
                        }`}
                      >
                        {isActive ? '🔬 Investigando...' : 'Seleccionar'}
                      </button>
                    </div>
                  )}
                  {isMaxed && (
                    <span className="text-[10px] text-green-400 font-bold">✅ COMPLETADA</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'culture' && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-4xl mb-2">🎭</p>
              <p className="text-sm text-gray-400 font-bold">Próximamente</p>
              <p className="text-xs text-gray-500 mt-1">Sistema de cultura en desarrollo</p>
            </div>
          </div>
        )}

        {activeTab === 'religion' && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-4xl mb-2">🙏</p>
              <p className="text-sm text-gray-400 font-bold">Próximamente</p>
              <p className="text-xs text-gray-500 mt-1">Sistema de religión en desarrollo</p>
            </div>
          </div>
        )}
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
    case 'science': return '🔬';
    case 'culture': return '🎭';
    case 'faith': return '🙏';
    default: return '📦';
  }
}

export default UpgradePanel;
