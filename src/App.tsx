import React, { useState, useEffect, useCallback, useRef } from 'react';
import WorldMap from './components/WorldMap';
import UpgradePanel from './components/UpgradePanel';
import ResourceBar from './components/ResourceBar';
import MiniMap from './components/MiniMap';
import EventLog, { GameEvent } from './components/EventLog';
import {
  GameState,
  Resources,
  INITIAL_UPGRADES,
  canAfford,
  getUpgradeCost,
  getTotalProductionBuildings,
  calculateEfficiency,
  calculateEffectiveProduction,
  calculateWheatConsumption,
  getBorderRadius,
} from './utils/gameState';
import { getTile, getVillageAt, TileType } from './utils/worldGen';

const CAPITAL_X = 0;
const CAPITAL_Y = 0;
const TICK_INTERVAL = 1000; // 1 second per tick

function App() {
  const [gameState, setGameState] = useState<GameState>({
    resources: { wheat: 100, stone: 10, clay: 10, silver: 5, wood: 10 },
    baseProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 },
    effectiveProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 },
    population: 10,
    maxPopulation: 20,
    upgrades: INITIAL_UPGRADES.map(u => ({ ...u })),
    cameraX: CAPITAL_X,
    cameraY: CAPITAL_Y,
    tick: 0,
    villagesExplored: 1,
    efficiency: 1,
    wheatConsumption: 1,
    totalBuildings: 0,
    borderRadius: 3,
    starving: false,
  });

  const [viewRadius, setViewRadius] = useState(8);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([
    { id: 0, message: '¡Bienvenido! Tu capital está en el centro del mundo.', type: 'info', tick: 0 },
    { id: 1, message: 'Construye edificios y asigna población para producir.', type: 'info', tick: 0 },
    { id: 2, message: 'Cada habitante consume 0.1 trigo/seg. ¡No dejes pasar hambre!', type: 'warning', tick: 0 },
    { id: 3, message: 'Cada edificio necesita 2 habitantes para funcionar al 100%.', type: 'info', tick: 0 },
  ]);
  const eventIdRef = useRef(4);

  const addEvent = useCallback((message: string, type: GameEvent['type'] = 'info') => {
    setEvents(prev => [...prev.slice(-49), { id: eventIdRef.current++, message, type, tick: 0 }]);
  }, []);

  // Game tick - resource generation, consumption, population
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        // Calculate efficiency
        const totalBuildings = getTotalProductionBuildings(prev.upgrades);
        const efficiency = calculateEfficiency(prev.population, totalBuildings);
        const effectiveProduction = calculateEffectiveProduction(prev.upgrades, efficiency);
        const wheatConsumption = calculateWheatConsumption(prev.population);
        const borderRadius = getBorderRadius(
          prev.upgrades.find(u => u.id === 'border')?.level || 0
        );

        // Apply production and consumption
        const newResources: Resources = {
          wheat: Math.max(0, prev.resources.wheat + effectiveProduction.wheat - wheatConsumption),
          stone: prev.resources.stone + effectiveProduction.stone,
          clay: prev.resources.clay + effectiveProduction.clay,
          silver: prev.resources.silver + effectiveProduction.silver,
          wood: prev.resources.wood + effectiveProduction.wood,
        };

        // Starvation check
        const isStarving = newResources.wheat <= 0 && wheatConsumption > 0;

        // Population dynamics
        let newPop = prev.population;
        let newMaxPop = prev.maxPopulation;

        // Update max population from houses
        const houseUpgrade = prev.upgrades.find(u => u.id === 'house');
        newMaxPop = 20 + (houseUpgrade?.level || 0) * 5;

        if (isStarving && prev.tick % 5 === 0 && prev.tick > 0) {
          // Lose population when starving
          newPop = Math.max(1, prev.population - 1);
        } else if (!isStarving && prev.resources.wheat > 10 && prev.population < newMaxPop) {
          // Grow population when fed
          if (prev.tick % 8 === 0 && prev.tick > 0) {
            newPop = Math.min(prev.population + 1, newMaxPop);
          }
        }

        return {
          ...prev,
          resources: newResources,
          population: newPop,
          maxPopulation: newMaxPop,
          tick: prev.tick + 1,
          efficiency,
          effectiveProduction,
          wheatConsumption,
          totalBuildings,
          borderRadius,
          starving: isStarving,
        };
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Handle upgrade purchase
  const handleUpgrade = useCallback((upgradeId: string) => {
    setGameState(prev => {
      const upgrade = prev.upgrades.find(u => u.id === upgradeId);
      if (!upgrade || upgrade.level >= upgrade.maxLevel) return prev;

      const cost = getUpgradeCost(upgrade);
      if (!canAfford(prev.resources, cost)) return prev;

      const newResources = { ...prev.resources };
      for (const [key, value] of Object.entries(cost)) {
        newResources[key as keyof Resources] -= value || 0;
      }

      const newUpgrades = prev.upgrades.map(u => {
        if (u.id === upgradeId) {
          return { ...u, level: u.level + 1 };
        }
        return u;
      });

      // Recalculate derived values
      const totalBuildings = getTotalProductionBuildings(newUpgrades);
      const efficiency = calculateEfficiency(prev.population, totalBuildings);
      const effectiveProduction = calculateEffectiveProduction(newUpgrades, efficiency);
      const borderRadius = getBorderRadius(
        newUpgrades.find(u => u.id === 'border')?.level || 0
      );

      // Update view radius from expedition
      const expeditionUpgrade = newUpgrades.find(u => u.id === 'expedition');
      const newViewRadius = 8 + (expeditionUpgrade?.level || 0);
      setViewRadius(newViewRadius);

      return {
        ...prev,
        resources: newResources,
        upgrades: newUpgrades,
        totalBuildings,
        efficiency,
        effectiveProduction,
        borderRadius,
      };
    });

    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    if (upgrade) {
      setNotification(`⬆️ ${upgrade.name} mejorada a Nv.${upgrade.level + 1}`);
      addEvent(`${upgrade.name} mejorada a nivel ${upgrade.level + 1}`, 'success');
      setTimeout(() => setNotification(null), 2000);
    }
  }, [gameState.upgrades, addEvent]);

  // Camera movement with keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newCamX = gameState.cameraX;
      let newCamY = gameState.cameraY;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newCamY -= 1;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newCamY += 1;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newCamX -= 1;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newCamX += 1;
          break;
        case 'Home':
        case 'h':
        case 'H':
          newCamX = CAPITAL_X;
          newCamY = CAPITAL_Y;
          break;
        default:
          return;
      }

      e.preventDefault();
      setGameState(prev => ({ ...prev, cameraX: newCamX, cameraY: newCamY }));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.cameraX, gameState.cameraY]);

  // Handle tile click (camera move)
  const handleTileClick = useCallback((x: number, y: number) => {
    const dx = Math.abs(x - gameState.cameraX);
    const dy = Math.abs(y - gameState.cameraY);
    
    // Move camera to clicked tile if adjacent
    if (dx <= 2 && dy <= 2 && (dx + dy > 0)) {
      const tile = getTile(x, y);
      
      // Check for village discovery
      const village = getVillageAt(x, y);
      if (village && !village.isPlayer) {
        setGameState(prev => ({
          ...prev,
          cameraX: x,
          cameraY: y,
          villagesExplored: prev.villagesExplored + 1,
        }));
        setNotification(`🏘️ ¡Descubriste ${village.name}! (Pob: ${village.population})`);
        addEvent(`¡Descubriste el pueblo de ${village.name}! Población: ${village.population}`, 'discovery');
        setTimeout(() => setNotification(null), 3000);
      } else if (village?.isPlayer) {
        setGameState(prev => ({ ...prev, cameraX: x, cameraY: y }));
        setNotification('🏰 Vista de tu capital');
        setTimeout(() => setNotification(null), 2000);
      } else {
        setGameState(prev => ({ ...prev, cameraX: x, cameraY: y }));
        const terrainNames: Record<string, string> = {
          grass: 'pradera', forest: 'bosque', mountain: 'montaña',
          desert: 'desierto', coast: 'costa', water: 'agua', snow: 'nieve',
        };
        addEvent(`Explorando ${terrainNames[tile.type] || tile.type} (${x}, ${y})`, 'info');
      }
      setSelectedTile({ x, y });
    }
  }, [gameState.cameraX, gameState.cameraY, addEvent]);

  // Get selected tile info
  const selectedTileInfo = selectedTile ? (() => {
    const tile = getTile(selectedTile.x, selectedTile.y);
    const village = getVillageAt(selectedTile.x, selectedTile.y);
    
    // Check if inside capital border
    const distToCapital = Math.abs(selectedTile.x - CAPITAL_X) + Math.abs(selectedTile.y - CAPITAL_Y);
    const insideBorder = distToCapital <= gameState.borderRadius;
    
    return { tile, village, x: selectedTile.x, y: selectedTile.y, insideBorder };
  })() : null;

  const getTerrainName = (type: TileType): string => {
    const names: Record<string, string> = {
      water: '🌊 Agua', coast: '🏖️ Costa', grass: '🌿 Pradera',
      forest: '🌲 Bosque', mountain: '⛰️ Montaña', desert: '🏜️ Desierto', snow: '❄️ Nieve',
    };
    return names[type] || type;
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden select-none">
      {/* Resource Bar */}
      <ResourceBar
        resources={gameState.resources}
        production={gameState.effectiveProduction}
        population={gameState.population}
        maxPopulation={gameState.maxPopulation}
        tick={gameState.tick}
        efficiency={gameState.efficiency}
        wheatConsumption={gameState.wheatConsumption}
        starving={gameState.starving}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Info */}
        <div className="w-64 bg-gray-800/80 border-r border-gray-700 flex flex-col p-3 gap-2 overflow-y-auto scrollbar-thin">
          {/* Capital info */}
          <div className="bg-gradient-to-br from-amber-900/30 to-gray-800/50 rounded-lg p-3 border border-amber-600/30">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1">🏰 Capital</h3>
            <div className="space-y-1.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Posición:</span>
                <span className="text-white font-mono">({CAPITAL_X}, {CAPITAL_Y})</span>
              </div>
              <div className="flex justify-between">
                <span>Frontera:</span>
                <span className="text-amber-400 font-bold">Radio {gameState.borderRadius}</span>
              </div>
              <div className="flex justify-between">
                <span>Población:</span>
                <span className={`font-bold ${gameState.starving ? 'text-red-400' : 'text-white'}`}>
                  {gameState.population}/{gameState.maxPopulation}
                </span>
              </div>
            </div>
          </div>

          {/* Efficiency panel */}
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-3 border border-gray-600/30">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1">⚡ Eficiencia</h3>
            <div className="space-y-1.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Edificios activos:</span>
                <span className="text-white font-bold">{gameState.totalBuildings}</span>
              </div>
              <div className="flex justify-between">
                <span>Hab. necesarios:</span>
                <span className="text-white font-bold">{gameState.totalBuildings * 2}</span>
              </div>
              <div className="flex justify-between">
                <span>Eficiencia:</span>
                <span className={`font-bold ${
                  gameState.efficiency >= 1 ? 'text-green-400' : 
                  gameState.efficiency >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {(gameState.efficiency * 100).toFixed(0)}%
                </span>
              </div>
              {/* Efficiency bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    gameState.efficiency >= 1 ? 'bg-green-500' : 
                    gameState.efficiency >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, gameState.efficiency * 100)}%` }}
                />
              </div>
              {gameState.efficiency < 1 && (
                <p className="text-[10px] text-yellow-400/80 mt-1">
                  Necesitas {(gameState.totalBuildings * 2) - gameState.population} hab. más para 100%
                </p>
              )}
            </div>
          </div>

          {/* Consumption panel */}
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-3 border border-gray-600/30">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1">🍞 Consumo</h3>
            <div className="space-y-1 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Trigo consumido/seg:</span>
                <span className="text-red-400 font-bold">-{gameState.wheatConsumption.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Trigo producido/seg:</span>
                <span className="text-green-400 font-bold">+{gameState.effectiveProduction.wheat.toFixed(1)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-1 mt-1">
                <span>Balance neto:</span>
                <span className={`font-bold ${
                  gameState.effectiveProduction.wheat - gameState.wheatConsumption >= 0 
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(gameState.effectiveProduction.wheat - gameState.wheatConsumption) >= 0 ? '+' : ''}
                  {(gameState.effectiveProduction.wheat - gameState.wheatConsumption).toFixed(1)}
                </span>
              </div>
              {gameState.starving && (
                <p className="text-[10px] text-red-400 font-bold mt-1 animate-pulse">
                  ⚠️ ¡HAMBRUNA! Pierdes población
                </p>
              )}
            </div>
          </div>

          {/* Camera position */}
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-3 border border-gray-600/30">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1">📷 Cámara</h3>
            <p className="text-xs text-gray-300 font-mono">
              X: {gameState.cameraX}, Y: {gameState.cameraY}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">WASD/Flechas = Mover | H = Volver</p>
          </div>

          {selectedTileInfo && (
            <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-3 border border-gray-600/30">
              <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1">🔍 Casilla</h3>
              <div className="space-y-1 text-xs text-gray-300">
                <p className="font-mono">({selectedTileInfo.x}, {selectedTileInfo.y})</p>
                <p>Terreno: <span className="text-white font-medium">{getTerrainName(selectedTileInfo.tile.type)}</span></p>
                <p>
                  Territorio: {selectedTileInfo.insideBorder 
                    ? <span className="text-green-400">🟢 Tu frontera</span> 
                    : <span className="text-gray-500">⚫ Tierra libre</span>}
                </p>
                {selectedTileInfo.village && (
                  <div className="mt-2 p-2 bg-amber-900/20 rounded border border-amber-500/30">
                    <p className="text-amber-300 font-bold text-sm">
                      {selectedTileInfo.village.isPlayer ? '🏰' : '🏘️'} {selectedTileInfo.village.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Población: {selectedTileInfo.village.population}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event Log */}
          <EventLog events={events} />

          {/* MiniMap */}
          <div className="mt-auto">
            <MiniMap 
              playerX={gameState.cameraX} 
              playerY={gameState.cameraY} 
              capitalX={CAPITAL_X}
              capitalY={CAPITAL_Y}
              borderRadius={gameState.borderRadius}
            />
          </div>
        </div>

        {/* Center - World Map */}
        <div className="flex-1 relative">
          <WorldMap
            cameraX={gameState.cameraX}
            cameraY={gameState.cameraY}
            viewRadius={viewRadius}
            capitalX={CAPITAL_X}
            capitalY={CAPITAL_Y}
            borderRadius={gameState.borderRadius}
            onTileClick={handleTileClick}
          />
          
          {/* Notification */}
          {notification && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800/95 border border-amber-500/50 text-white px-5 py-2.5 rounded-lg shadow-2xl shadow-amber-500/10 z-50 backdrop-blur-sm">
              <p className="text-sm font-medium">{notification}</p>
            </div>
          )}

          {/* Controls hint */}
          <div className="absolute bottom-3 left-3 bg-gray-900/80 rounded-lg px-3 py-2 text-xs text-gray-400 border border-gray-700/50 backdrop-blur-sm">
            <p>🎮 WASD/Flechas = Mover cámara</p>
            <p>🖱️ Clic = Explorar casilla</p>
            <p>🏠 H = Volver a la capital</p>
          </div>

          {/* Game title */}
          <div className="absolute top-3 left-3 bg-gray-900/80 rounded-lg px-3 py-1.5 border border-amber-500/20 backdrop-blur-sm">
            <h1 className="text-sm font-bold text-amber-400">🌍 Mundo Infinito</h1>
          </div>

          {/* Starvation warning overlay */}
          {gameState.starving && (
            <div className="absolute top-3 right-3 bg-red-900/80 rounded-lg px-3 py-1.5 border border-red-500/50 backdrop-blur-sm animate-pulse">
              <p className="text-xs font-bold text-red-300">⚠️ ¡HAMBRUNA!</p>
            </div>
          )}
        </div>

        {/* Right Panel - Upgrades */}
        <div className="w-72">
          <UpgradePanel
            upgrades={gameState.upgrades}
            resources={gameState.resources}
            onUpgrade={handleUpgrade}
            population={gameState.population}
            totalBuildings={gameState.totalBuildings}
            efficiency={gameState.efficiency}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
