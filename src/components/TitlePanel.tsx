import React from 'react';
import { Title, Resources, canAfford } from '../utils/gameState';

interface TitlePanelProps {
  titles: Title[];
  resources: Resources;
  activeTitleId: string | null;
  onAction: (titleId: string) => void;
  onClose: () => void;
}

const TitlePanel: React.FC<TitlePanelProps> = ({ titles, resources, activeTitleId, onAction, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border-2 border-purple-500/50 rounded-xl shadow-2xl shadow-purple-500/20 w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="p-4 bg-gradient-to-r from-purple-900/50 to-gray-800 border-b border-purple-500/30 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-purple-300 flex items-center gap-2">
              🏆 Títulos
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Solo puedes tener un título activo a la vez
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none px-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {titles.map((title) => {
              const affordable = canAfford(resources, title.cost);
              const isActive = activeTitleId === title.id;

              return (
                <div
                  key={title.id}
                  className={`rounded-lg p-3 border transition-all ${
                    isActive
                      ? 'bg-purple-900/30 border-purple-500/60 shadow-lg shadow-purple-500/10'
                      : title.unlocked
                      ? 'bg-gray-700/80 border-purple-500/30 hover:border-purple-400'
                      : affordable
                      ? 'bg-gray-700/80 border-purple-500/30 hover:border-purple-400'
                      : 'bg-gray-700/40 border-gray-600/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{title.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm text-white">{title.name}</h3>
                        {isActive && (
                          <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded font-bold">
                            ✅ ACTIVO
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 italic">{title.description}</p>
                      
                      <div className="mt-2 space-y-0.5">
                        <p className="text-[10px] text-purple-300 font-bold">Buffs:</p>
                        {title.buffs.map((buff, idx) => (
                          <p key={idx} className="text-[10px] text-green-400 flex items-center gap-1">
                            <span>•</span> {buff.label}
                          </p>
                        ))}
                      </div>

                      {!title.unlocked && (
                        <div className="mt-2">
                          <p className="text-[10px] text-gray-400 mb-1">Coste:</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(title.cost).map(([key, value]) => (
                              <span
                                key={key}
                                className={`text-[9px] px-1.5 py-0.5 rounded ${
                                  resources[key as keyof Resources] >= (value || 0)
                                    ? 'bg-green-900/50 text-green-300'
                                    : 'bg-red-900/50 text-red-300'
                                }`}
                              >
                                {getResourceEmoji(key)} {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => onAction(title.id)}
                        disabled={!title.unlocked && !affordable}
                        className={`mt-2 w-full px-2 py-1.5 rounded text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : title.unlocked
                            ? 'bg-purple-600 hover:bg-purple-500 text-white'
                            : affordable
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 active:scale-95'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isActive ? '🔴 Desactivar' : title.unlocked ? '✅ Activar' : '🏆 Desbloquear'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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

export default TitlePanel;
