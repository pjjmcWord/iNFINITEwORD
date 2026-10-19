import React from 'react';
import { Resources, ResourceProduction } from '../utils/gameState';

interface ResourceBarProps {
  resources: Resources;
  production: ResourceProduction;
  population: number;
  maxPopulation: number;
  tick: number;
}

const ResourceBar: React.FC<ResourceBarProps> = ({ resources, production, population, maxPopulation, tick }) => {
  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-amber-500/30 px-4 py-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Population */}
        <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-1.5">
          <span className="text-lg">👥</span>
          <div>
            <div className="text-xs text-gray-400">Población</div>
            <div className="text-sm font-bold text-white">{population}/{maxPopulation}</div>
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center gap-2 flex-wrap">
          <ResourceItem emoji="🌾" name="Trigo" value={resources.wheat} production={production.wheat} />
          <ResourceItem emoji="🪨" name="Piedra" value={resources.stone} production={production.stone} />
          <ResourceItem emoji="🧱" name="Arcilla" value={resources.clay} production={production.clay} />
          <ResourceItem emoji="💎" name="Plata" value={resources.silver} production={production.silver} />
          <ResourceItem emoji="🪵" name="Madera" value={resources.wood} production={production.wood} />
        </div>

        {/* Tick counter */}
        <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-1.5">
          <span className="text-lg">⏱️</span>
          <div>
            <div className="text-xs text-gray-400">Tiempo</div>
            <div className="text-sm font-bold text-amber-400">{tick}</div>
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
}

const ResourceItem: React.FC<ResourceItemProps> = ({ emoji, name, value, production }) => {
  return (
    <div className="flex items-center gap-1.5 bg-gray-700/50 rounded-lg px-2 py-1.5 min-w-[100px]">
      <span className="text-lg">{emoji}</span>
      <div>
        <div className="text-xs text-gray-400">{name}</div>
        <div className="text-sm font-bold text-white">
          {Math.floor(value)}
          {production > 0 && (
            <span className="text-green-400 text-xs ml-1">+{production.toFixed(1)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceBar;
