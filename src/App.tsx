import React, { useState, useEffect, useCallback, useRef } from 'react';
import WorldMap from './components/WorldMap';
import UpgradePanel from './components/UpgradePanel';
import ResourceBar from './components/ResourceBar';
import MiniMap from './components/MiniMap';
import EventLog, { GameEvent } from './components/EventLog';
import {
  GameState,
  Resources,
  ResourceProduction,
  INITIAL_UPGRADES,
  canAfford,
  getUpgradeCost,
} from './utils/gameState';
import { getTile, getVillageAt, TileType } from './utils/worldGen';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    resources: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 },
    production: { wheat: 1, stone: 1, clay: 1, silver: 1, wood: 1 },
    population: 10,
    maxPopulation: 20,
    upgrades: INITIAL_UPGRADES.map(u => ({ ...u })),
    playerX: 0,
    playerY: 0,
    tick: 0,
    villagesExplored: 1,
  });

  const [viewRadius, setViewRadius] = useState(8);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([
    { id: 0, message: '¡Bienvenido a tu pueblo! Explora el mundo infinito.', type: 'info', tick: 0 },
    { id: 1, message: 'Tu pueblo produce recursos cada 2 segundos.', type: 'info', tick: 0 },
    { id: 2, message: 'Usa WASD o haz clic para moverte.', type: 'info', tick: 0 },
  ]);
  const eventIdRef = useRef(3);

  const addEvent = useCallback((message: string, type: GameEvent['type'] = 'info') => {
    setEvents(prev => [...prev, { id: eventIdRef.current++, message, type, tick: 0 }].slice(-50));
  }, []);

  // Game tick - resource generation
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const newResources: Resources = {
          wheat: prev.resources.wheat + prev.production.wheat,
          stone: prev.resources.stone + prev.production.stone,
          clay: prev.resources.clay + prev.production.clay,
          silver: prev.resources.silver + prev.production.silver,
          wood: prev.resources.wood + prev.production.wood,
        };

        // Population growth
        let newPop = prev.population;
        if (prev.resources.wheat > 5 && prev.population < prev.maxPopulation) {
          if (prev.tick % 10 === 0 && prev.tick > 0) {
            newPop = Math.min(prev.population + 1, prev.maxPopulation);
          }
        }

        return {
          ...prev,
          resources: newResources,
          population: newPop,
          tick: prev.tick + 1,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Calculate production from upgrades
  const calculateProduction = useCallback((upgrades: typeof gameState.upgrades): ResourceProduction => {
    let production: ResourceProduction = { wheat: 1, stone: 1, clay: 1, silver: 1, wood: 1 };
    
    upgrades.forEach(upgrade => {
      switch (upgrade.id) {
        case 'farm':
          production.wheat += upgrade.level;
          break;
        case 'quarry':
          production.stone += upgrade.level;
          break;
        case 'brickworks':
          production.clay += upgrade.level;
          break;
        case 'mine':
          production.silver += upgrade.level;
          break;
        case 'lumbermill':
          production.wood += upgrade.level;
          break;
        case 'market':
          production.wheat += upgrade.level * 0.5;
          production.stone += upgrade.level * 0.5;
          production.clay += upgrade.level * 0.5;
          production.silver += upgrade.level * 0.5;
          production.wood += upgrade.level * 0.5;
          break;
      }
    });

    return production;
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

      // Calculate new max population
      const houseUpgrade = newUpgrades.find(u => u.id === 'house');
      const newMaxPop = 20 + (houseUpgrade?.level || 0) * 5;

      // Calculate new view radius from expedition
      const expeditionUpgrade = newUpgrades.find(u => u.id === 'expedition');
      const newViewRadius = 8 + (expeditionUpgrade?.level || 0);
      setViewRadius(newViewRadius);

      const newProduction = calculateProduction(newUpgrades);

      return {
        ...prev,
        resources: newResources,
        upgrades: newUpgrades,
        maxPopulation: newMaxPop,
        production: newProduction,
      };
    });

    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    setNotification(`⬆️ ${upgrade?.name} mejorada a Nv.${(upgrade?.level || 0) + 1}`);
    addEvent(`${upgrade?.name} mejorada a nivel ${(upgrade?.level || 0) + 1}`, 'success');
    setTimeout(() => setNotification(null), 2000);
  }, [gameState.upgrades, calculateProduction, addEvent]);

  // Handle tile click (movement)
  const handleTileClick = useCallback((x: number, y: number) => {
    const dx = Math.abs(x - gameState.playerX);
    const dy = Math.abs(y - gameState.playerY);
    
    // Can only move to adjacent tiles
    if (dx <= 1 && dy <= 1 && (dx + dy > 0)) {
      const tile = getTile(x, y);
      
      // Can't move to water
      if (tile.type === TileType.WATER) {
        setNotification('🌊 ¡No puedes navegar sin un barco!');
        addEvent('Intentaste moverte al agua pero necesitas un barco.', 'warning');
        setTimeout(() => setNotification(null), 2000);
        return;
      }

      // Can't move to snow easily
      if (tile.type === TileType.SNOW) {
        setNotification('❄️ ¡Hace demasiado frío! Necesitas mejor equipamiento.');
        addEvent('El terreno nevado es demasiado hostil por ahora.', 'warning');
        setTimeout(() => setNotification(null), 2000);
        return;
      }

      // Check for village
      const village = getVillageAt(x, y);
      if (village && !village.isPlayer) {
        setGameState(prev => ({
          ...prev,
          villagesExplored: prev.villagesExplored + 1,
        }));
        setNotification(`🏘️ ¡Descubriste ${village.name}! (Pob: ${village.population})`);
        addEvent(`¡Descubriste el pueblo de ${village.name}! Población: ${village.population}`, 'discovery');
        setTimeout(() => setNotification(null), 3000);
      } else if (village?.isPlayer) {
        setNotification('🏰 Has vuelto a tu pueblo');
        addEvent('Regresaste a tu pueblo.', 'info');
        setTimeout(() => setNotification(null), 2000);
      } else {
        const terrainNames: Record<string, string> = {
          grass: 'pradera',
          forest: 'bosque',
          mountain: 'montaña',
          desert: 'desierto',
          coast: 'costa',
        };
        addEvent(`Te moviste a ${terrainNames[tile.type] || tile.type} (${x}, ${y})`, 'info');
      }

      setGameState(prev => ({
        ...prev,
        playerX: x,
        playerY: y,
      }));
      setSelectedTile({ x, y });
    }
  }, [gameState.playerX, gameState.playerY, addEvent]);

  // Keyboard movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newX = gameState.playerX;
      let newY = gameState.playerY;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newY -= 1;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newY += 1;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newX -= 1;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newX += 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      handleTileClick(newX, newY);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.playerX, gameState.playerY, handleTileClick]);

  // Get selected tile info
  const selectedTileInfo = selectedTile ? (() => {
    const tile = getTile(selectedTile.x, selectedTile.y);
    const village = getVillageAt(selectedTile.x, selectedTile.y);
    return { tile, village, x: selectedTile.x, y: selectedTile.y };
  })() : null;

  // Terrain name in Spanish
  const getTerrainName = (type: TileType): string => {
    const names: Record<string, string> = {
      water: '🌊 Agua',
      coast: '🏖️ Costa',
      grass: '🌿 Pradera',
      forest: '🌲 Bosque',
      mountain: '⛰️ Montaña',
      desert: '🏜️ Desierto',
      snow: '❄️ Nieve',
    };
    return names[type] || type;
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Resource Bar */}
      <ResourceBar
        resources={gameState.resources}
        production={gameState.production}
        population={gameState.population}
        maxPopulation={gameState.maxPopulation}
        tick={gameState.tick}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Info */}
        <div className="w-60 bg-gray-800/80 border-r border-gray-700 flex flex-col p-3 gap-2 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-3 border border-gray-600/30">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1">📍 Posición</h3>
            <p className="text-xs text-gray-300 font-mono">
              X: {gameState.playerX}, Y: {gameState.playerY}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              WASD / Flechas / Clic
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-3 border border-gray-600/30">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1">📊 Estadísticas</h3>
            <div className="space-y-1.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Pueblos descubiertos:</span>
                <span className="text-white font-bold">{gameState.villagesExplored}</span>
              </div>
              <div className="flex justify-between">
                <span>Ticks:</span>
                <span className="text-amber-400 font-bold">{gameState.tick}</span>
              </div>
              <div className="flex justify-between">
                <span>Radio visión:</span>
                <span className="text-white font-bold">{viewRadius}</span>
              </div>
              <div className="flex justify-between">
                <span>Producción/tick:</span>
                <span className="text-green-400 font-bold">
                  {(gameState.production.wheat + gameState.production.stone + gameState.production.clay + gameState.production.silver + gameState.production.wood).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {selectedTileInfo && (
            <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-3 border border-gray-600/30">
              <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1">🔍 Casilla</h3>
              <div className="space-y-1 text-xs text-gray-300">
                <p className="font-mono">({selectedTileInfo.x}, {selectedTileInfo.y})</p>
                <p>Terreno: <span className="text-white font-medium">{getTerrainName(selectedTileInfo.tile.type)}</span></p>
                {selectedTileInfo.village && (
                  <div className="mt-2 p-2 bg-amber-900/20 rounded border border-amber-500/30">
                    <p className="text-amber-300 font-bold text-sm">
                      {selectedTileInfo.village.isPlayer ? '🏰' : '🏘️'} {selectedTileInfo.village.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Población: {selectedTileInfo.village.population}
                    </p>
                    {selectedTileInfo.village.isPlayer && (
                      <p className="text-xs text-green-400 mt-0.5">⭐ Tu pueblo</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event Log */}
          <EventLog events={events} />

          {/* MiniMap */}
          <div className="mt-auto">
            <MiniMap playerX={gameState.playerX} playerY={gameState.playerY} />
          </div>
        </div>

        {/* Center - World Map */}
        <div className="flex-1 relative">
          <WorldMap
            playerX={gameState.playerX}
            playerY={gameState.playerY}
            viewRadius={viewRadius}
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
            <p>🎮 WASD/Flechas = Mover</p>
            <p>🖱️ Clic en casilla adyacente = Mover</p>
          </div>

          {/* Game title */}
          <div className="absolute top-3 left-3 bg-gray-900/80 rounded-lg px-3 py-1.5 border border-amber-500/20 backdrop-blur-sm">
            <h1 className="text-sm font-bold text-amber-400">🌍 Mundo Infinito</h1>
          </div>
        </div>

        {/* Right Panel - Upgrades */}
        <div className="w-72">
          <UpgradePanel
            upgrades={gameState.upgrades}
            resources={gameState.resources}
            onUpgrade={handleUpgrade}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
