import React from 'react';

interface OptionsPanelProps {
  onClose: () => void;
  onReset: () => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({ onClose, onReset }) => {
  const [showConfirmReset, setShowConfirmReset] = React.useState(false);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border-2 border-gray-600 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-gray-700 to-gray-800 border-b border-gray-600 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            ⚙️ Opciones
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none px-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!showConfirmReset ? (
            <>
              {/* Reset Game */}
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h3 className="text-sm font-bold text-white mb-2">🔄 Reiniciar Partida</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Borra todo el progreso y comienza una nueva partida desde cero.
                </p>
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-all active:scale-95"
                >
                  Reiniciar Partida
                </button>
              </div>

              {/* Game Info */}
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h3 className="text-sm font-bold text-white mb-2">ℹ️ Información</h3>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Usa WASD o flechas para mover la cámara</p>
                  <p>• Shift + movimiento = velocidad x3</p>
                  <p>• H = volver a la capital</p>
                  <p>• Clic en casillas para inspeccionar</p>
                  <p>• Cada edificio necesita 2 habitantes</p>
                  <p>• Cada habitante consume 0.05 trigo/seg</p>
                </div>
              </div>

              {/* Version */}
              <div className="text-center text-xs text-gray-500 pt-2">
                Mundo Infinito v1.0
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Dialog */}
              <div className="bg-red-900/20 rounded-lg p-4 border-2 border-red-500/50">
                <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                  ⚠️ ¿Estás seguro?
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Esta acción borrará TODO tu progreso:
                </p>
                <ul className="text-xs text-gray-400 space-y-1 mb-4 list-disc list-inside">
                  <li>Recursos y edificios</li>
                  <li>Población y mejoras</li>
                  <li>Títulos desbloqueados</li>
                  <li>Fronteras expandidas</li>
                  <li>Todo el progreso</li>
                </ul>
                <p className="text-sm text-red-400 font-bold mb-4">
                  ¡Esta acción NO se puede deshacer!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold text-sm transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      onReset();
                      onClose();
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-all active:scale-95"
                  >
                    Sí, Reiniciar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionsPanel;
