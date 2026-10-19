import React from 'react';
import { Resources, ResourceProduction } from '../utils/gameState';

interface ResourceBarProps {
  resources: Resources;
  production: ResourceProduction;
  population: number;
  maxPopulation: number;
  tick: number;
  efficiency: number;
  wheatConsumption: number;
  starving: boolean;
}

const ResourceBar: React.FC<ResourceBarProps> = ({ 
  resources, production, population, maxPopulation, tick, 
  efficiency, wheatConsumption, starving 
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-amber-500/30 px-4 py-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Population */}
        <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
          starving ? 'bg-red-900/50 border border-red-500/50' : 'bg-gray-700/50'
        }`}>
          <span className="text-lg">{starving ? '💀' : '👥'}</span>
          <div>
            <div className="text-xs text-gray-400">Población</div>
            <div className={`text-sm font-bold ${starving ? 'text-red-400' : 'text-white'}`}>
              {population}/{maxPopulation}
            </div>
          </div>
        </div>

        {/* Efficiency */}
        <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-1.5">
          <span className="text-lg">⚡</span>
          <div>
            <div className="text-xs text-gray-400">Eficiencia</div>
            <div className={`text-sm font-bold ${
              efficiency >= 1 ? 'text-green-400' : 
              efficiency >= 0.5 ? 'text-yellow-400' : 'text-red-400'
            }`}>{(efficiency * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <ResourceItem 
            emoji="🌾" name="Trigo" value={resources.wheat} 
            production={production.wheat} 
            consumption={wheatConsumption}
            isStarving={starving}
          />
          <ResourceItem emoji="🪨" name="Piedra" value={resources.stone} production={production.stone} />
          <ResourceItem emoji="🧱" name="Arcilla" value={resources.clay} production={production.clay} />
          <ResourceItem emoji="💎" name="Plata" value={resources.silver} production={production.silver} />
          <ResourceItem emoji="🪵" name="Madera" value={resources.wood} production={production.wood} />
          <ResourceItem emoji="🔬" name="Ciencia" value={resources.science} production={production.science} />
          <ResourceItem emoji="🎭" name="Cultura" value={resources.culture} production={production.culture} />
          <ResourceItem emoji="🙏" name="Fe" value={resources.faith} production={production.faith} />
        </div>

        {/* Tick counter */}
        <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-1.5">
          <span className="text-lg">⏱️</span>
          <div>
            <div className="text-xs text-gray-400">Tiempo</div>
            <div className="text-sm font-bold text-amber-400">{tick}s</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ResourceItemProps {
  emoji: string;
  name: string;
  value: number;
  production: number;
  consumption?: number;
  isStarving?: boolean;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ emoji, name, value, production, consumption, isStarving }) => {
  const netProduction = consumption ? production - consumption : production;
  
  return (
    <div className={`flex items-center gap-1 rounded-lg px-2 py-1.5 min-w-[90px] ${
      isStarving && name === 'Trigo' ? 'bg-red-900/50 border border-red-500/30' : 'bg-gray-700/50'
    }`}>
      <span className="text-base">{emoji}</span>
      <div>
        <div className="text-[10px] text-gray-400">{name}</div>
        <div className="text-xs font-bold text-white">
          {Math.floor(value)}
          {production > 0 && (
            <span className={`text-[10px] ml-0.5 ${netProduction >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netProduction >= 0 ? '+' : ''}{netProduction.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceBar;
