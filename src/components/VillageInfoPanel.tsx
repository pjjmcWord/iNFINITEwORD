import React from 'react';
import { Village } from '../utils/worldGen';

interface VillageInfoPanelProps {
  village: Village;
  onClose: () => void;
}

const VillageInfoPanel: React.FC<VillageInfoPanelProps> = ({ village, onClose }) => {
  const growthRate = village.isPlayer ? 0.125 : 0.1; // Players grow every 8 ticks, others every 10
  const nextExpansion = village.isPlayer 
    ? (Math.ceil(village.population / 5) * 5) - village.population
    : (Math.ceil(village.population / 5) * 5) - village.population;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border-2 rounded-xl shadow-2xl w-full max-w-md" style={{ borderColor: village.color }}>
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center rounded-t-xl" style={{ backgroundColor: village.color + '20' }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-lg"
              style={{ backgroundColor: village.color }}
            >
              {village.isPlayer ? '🏰' : '🏘️'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{village.name}</h2>
              <p className="text-xs text-gray-400">
                Posición: ({village.x}, {village.y})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none px-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Population */}
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-300">👥 Población</span>
              <span className="text-lg font-bold text-white">{village.population}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min(100, (village.population / village.maxBorderRadius / 5) * 100)}%`,
                  backgroundColor: village.color 
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Crecimiento: +1 cada {village.isPlayer ? '8' : '10'} segundos (si hay trigo)
            </p>
          </div>

          {/* Territory */}
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-300">🗺️ Territorio</span>
              <span className="text-lg font-bold text-white">
                {village.borderRadius}/{village.maxBorderRadius}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all"
                style={{ 
                  width: `${(village.borderRadius / village.maxBorderRadius) * 100}%`,
                  backgroundColor: village.color 
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Radio de frontera: {village.borderRadius} casillas
            </p>
            {nextExpansion > 0 && (
              <p className="text-xs text-amber-400 mt-1">
                📈 Próxima expansión en: {nextExpansion} habitantes
              </p>
            )}
          </div>

          {/* Color */}
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-300">🎨 Color del pueblo</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-600"
                  style={{ backgroundColor: village.color }}
                />
                <span className="text-xs text-gray-400 font-mono">{village.color}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-700/50 rounded-lg p-3">
            <h3 className="text-sm font-bold text-gray-300 mb-2">📊 Estadísticas</h3>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Área total:</span>
                <span className="text-white font-bold">
                  {Math.pow(village.borderRadius * 2 + 1, 2)} casillas
                </span>
              </div>
              <div className="flex justify-between">
                <span>Densidad:</span>
                <span className="text-white font-bold">
                  {(village.population / Math.pow(village.borderRadius * 2 + 1, 2)).toFixed(2)} hab/casilla
                </span>
              </div>
              {village.isPlayer && (
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <span className="text-amber-400 font-bold">⭐ Tu Capital</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillageInfoPanel;
