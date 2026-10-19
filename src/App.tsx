import React, { useState, useEffect, useCallback, useRef } from 'react';
import WorldMap from './components/WorldMap';
import UpgradePanel from './components/UpgradePanel';
import ResourceBar from './components/ResourceBar';
import MiniMap from './components/MiniMap';
import EventLog, { GameEvent } from './components/EventLog';
import TitlePanel from './components/TitlePanel';
import VillageInfoPanel from './components/VillageInfoPanel';
import OptionsPanel from './components/OptionsPanel';
import {
  GameState,
  Resources,
  INITIAL_UPGRADES,
  CAPITAL_BASE_PRODUCTION,
  canAfford,
  getUpgradeCost,
  getTotalProductionBuildings,
  calculateEfficiency,
  calculateEffectiveProduction,
  calculateWheatConsumption,
  getBorderRadius,
} from './utils/gameState';
import { getTile, getVillageAt, TileType, getTileNaturalProduction, TILE_INFO, Village, calculateMaxBorderRadius, getExpansionCandidates, clearVillageCache } from './utils/worldGen';
import { Title, ALL_TITLES, canAffordTitle } from './utils/titles';
import { generateNewSeed } from './utils/seed';
import {
  getTitleProductionBonus,
  getTitleConsumptionReduction,
  getTitlePopulationBonus,
  getTitleBorderBonus,
  getTitleVisionBonus,
  getTitleEfficiencyBonus,
} from './utils/titleSystem';

const CAPITAL_X = 0;
const CAPITAL_Y = 0;
const TICK_INTERVAL = 1000;

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialTitles = ALL_TITLES.map((t: Title) => ({ ...t, unlocked: false, active: false }));
    return {
      resources: { wheat: 150, stone: 20, clay: 20, silver: 10, wood: 20 },
      baseProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 },
      effectiveProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 },
      capitalProduction: { ...CAPITAL_BASE_PRODUCTION },
      naturalProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 },
      titleProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 },
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
      titles: initialTitles,
      activeTitleIds: [],
    };
  });

  const [viewRadius, setViewRadius] = useState(8);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showTitlePanel, setShowTitlePanel] = useState(false);
  const [showVillageBorders, setShowVillageBorders] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [events, setEvents] = useState<GameEvent[]>([
    { id: 0, message: '¡Bienvenido! Tu capital produce 1 de cada recurso.', type: 'info', tick: 0 },
    { id: 1, message: 'Construye edificios y asigna población para producir más.', type: 'info', tick: 0 },
    { id: 2, message: 'Cada habitante consume 0.1 trigo/seg. ¡No dejes pasar hambre!', type: 'warning', tick: 0 },
    { id: 3, message: 'Cada edificio necesita 2 habitantes para funcionar al 100%.', type: 'info', tick: 0 },
    { id: 4, message: 'Explora el mapa con WASD para encontrar recursos naturales.', type: 'info', tick: 0 },
  ]);
  const eventIdRef = useRef(5);

  const addEvent = useCallback((message: string, type: GameEvent['type'] = 'info') => {
    setEvents(prev => [...prev.slice(-49), { id: eventIdRef.current++, message, type, tick: 0 }]);
  }, []);

  // Calculate natural production from tiles within border
  const calculateNaturalProduction = useCallback((borderRadius: number) => {
    const natural = { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 };
    for (let dy = -borderRadius; dy <= borderRadius; dy++) {
      for (let dx = -borderRadius; dx <= borderRadius; dx++) {
        if (Math.abs(dx) + Math.abs(dy) <= borderRadius) {
          const tile = getTile(CAPITAL_X + dx, CAPITAL_Y + dy);
          const tileProd = getTileNaturalProduction(tile.type);
          natural.wheat += tileProd.wheat;
          natural.stone += tileProd.stone;
          natural.clay += tileProd.clay;
          natural.silver += tileProd.silver;
          natural.wood += tileProd.wood;
        }
      }
    }
    return natural;
  }, []);

  // Village expansion logic
  useEffect(() => {
    const expansionInterval = setInterval(() => {
      // Expand player's capital
      setGameState(prev => {
        const capital = getVillageAt(CAPITAL_X, CAPITAL_Y);
        if (!capital) return prev;

        const maxBorder = calculateMaxBorderRadius(prev.population);
        if (capital.borderRadius >= maxBorder) return prev;

        const candidates = getExpansionCandidates(capital);
        if (candidates.length === 0) return prev;

        // Sort by difficulty (easier first) and pick randomly from top candidates
        candidates.sort((a, b) => b.difficulty - a.difficulty);
        const topCandidates = candidates.filter(c => c.difficulty >= candidates[0].difficulty * 0.6);
        const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];

        // Update capital border radius
        const newBorderRadius = Math.max(capital.borderRadius, Math.abs(selected.x - CAPITAL_X) + Math.abs(selected.y - CAPITAL_Y));

        if (newBorderRadius > prev.borderRadius) {
          addEvent(`🛡️ ¡Frontera expandida! Radio: ${newBorderRadius}`, 'success');
        }

        return {
          ...prev,
          borderRadius: newBorderRadius,
        };
      });
    }, 3000); // Check every 3 seconds for faster expansion

    return () => clearInterval(expansionInterval);
  }, []);

  // Game tick
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const totalBuildings = getTotalProductionBuildings(prev.upgrades);
        const titleEffBonus = getTitleEfficiencyBonus(prev.titles, prev.activeTitleIds);
        const efficiency = Math.min(1, calculateEfficiency(prev.population, totalBuildings) + titleEffBonus);
        const effectiveProduction = calculateEffectiveProduction(prev.upgrades, efficiency);
        
        // Title production bonus
        const titleProd = {
          wheat: getTitleProductionBonus(prev.titles, prev.activeTitleIds, 'wheat'),
          stone: getTitleProductionBonus(prev.titles, prev.activeTitleIds, 'stone'),
          clay: getTitleProductionBonus(prev.titles, prev.activeTitleIds, 'clay'),
          silver: getTitleProductionBonus(prev.titles, prev.activeTitleIds, 'silver'),
          wood: getTitleProductionBonus(prev.titles, prev.activeTitleIds, 'wood'),
        };

        // Natural production from border tiles
        const borderRadius = getBorderRadius(prev.upgrades.find(u => u.id === 'border')?.level || 0) 
          + getTitleBorderBonus(prev.titles, prev.activeTitleIds);
        const naturalProd = calculateNaturalProduction(borderRadius);

        // Consumption with title reduction
        const baseConsumption = calculateWheatConsumption(prev.population);
        const consumptionReduction = getTitleConsumptionReduction(prev.titles, prev.activeTitleIds);
        const wheatConsumption = Math.max(0, baseConsumption + consumptionReduction * prev.population);

        // Total production
        const newResources: Resources = {
          wheat: Math.max(0, 
            prev.resources.wheat 
            + prev.capitalProduction.wheat 
            + effectiveProduction.wheat 
            + naturalProd.wheat 
            + titleProd.wheat 
            - wheatConsumption
          ),
          stone: prev.resources.stone + prev.capitalProduction.stone + effectiveProduction.stone + naturalProd.stone + titleProd.stone,
          clay: prev.resources.clay + prev.capitalProduction.clay + effectiveProduction.clay + naturalProd.clay + titleProd.clay,
          silver: prev.resources.silver + prev.capitalProduction.silver + effectiveProduction.silver + naturalProd.silver + titleProd.silver,
          wood: prev.resources.wood + prev.capitalProduction.wood + effectiveProduction.wood + naturalProd.wood + titleProd.wood,
        };

        const isStarving = newResources.wheat <= 0 && wheatConsumption > 0;

        // Population dynamics
        let newPop = prev.population;
        const houseUpgrade = prev.upgrades.find(u => u.id === 'house');
        const titlePopBonus = getTitlePopulationBonus(prev.titles, prev.activeTitleIds);
        const newMaxPop = 20 + (houseUpgrade?.level || 0) * 5 + titlePopBonus;

        if (isStarving && prev.tick % 8 === 0 && prev.tick > 0) {
          newPop = Math.max(1, prev.population - 1);
        } else if (!isStarving && prev.resources.wheat > 5 && prev.population < newMaxPop) {
          if (prev.tick % 5 === 0 && prev.tick > 0) {
            newPop = Math.min(prev.population + 1, newMaxPop);
          }
        }

        // Total effective production for display
        const totalEffective: typeof effectiveProduction = {
          wheat: prev.capitalProduction.wheat + effectiveProduction.wheat + naturalProd.wheat + titleProd.wheat,
          stone: prev.capitalProduction.stone + effectiveProduction.stone + naturalProd.stone + titleProd.stone,
          clay: prev.capitalProduction.clay + effectiveProduction.clay + naturalProd.clay + titleProd.clay,
          silver: prev.capitalProduction.silver + effectiveProduction.silver + naturalProd.silver + titleProd.silver,
          wood: prev.capitalProduction.wood + effectiveProduction.wood + naturalProd.wood + titleProd.wood,
        };

        return {
          ...prev,
          resources: newResources,
          population: newPop,
          maxPopulation: newMaxPop,
          tick: prev.tick + 1,
          efficiency,
          effectiveProduction: totalEffective,
          wheatConsumption,
          totalBuildings,
          borderRadius,
          naturalProduction: naturalProd,
          titleProduction: titleProd,
          starving: isStarving,
        };
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [calculateNaturalProduction]);

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

      const newUpgrades = prev.upgrades.map(u =>
        u.id === upgradeId ? { ...u, level: u.level + 1 } : u
      );

      const totalBuildings = getTotalProductionBuildings(newUpgrades);
      const titleEffBonus = getTitleEfficiencyBonus(prev.titles, prev.activeTitleIds);
      const efficiency = Math.min(1, calculateEfficiency(prev.population, totalBuildings) + titleEffBonus);
      const effectiveProduction = calculateEffectiveProduction(newUpgrades, efficiency);
      const borderRadius = getBorderRadius(newUpgrades.find(u => u.id === 'border')?.level || 0)
        + getTitleBorderBonus(prev.titles, prev.activeTitleIds);

      const expeditionUpgrade = newUpgrades.find(u => u.id === 'expedition');
      const titleVisionBonus = getTitleVisionBonus(prev.titles, prev.activeTitleIds);
      setViewRadius(8 + (expeditionUpgrade?.level || 0) + titleVisionBonus);

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

  // Handle title purchase
  const handleTitlePurchase = useCallback((titleId: string) => {
    setGameState(prev => {
      const title = prev.titles.find(t => t.id === titleId);
      if (!title || title.unlocked) return prev;
      if (!canAffordTitle(prev.resources, title.cost)) return prev;

      const newResources = { ...prev.resources };
      for (const [key, value] of Object.entries(title.cost)) {
        newResources[key as keyof Resources] -= value || 0;
      }

      const newTitles = prev.titles.map(t =>
        t.id === titleId ? { ...t, unlocked: true, active: true } : t
      );
      const newActiveIds = [...prev.activeTitleIds, titleId];

      return {
        ...prev,
        resources: newResources,
        titles: newTitles,
        activeTitleIds: newActiveIds,
      };
    });

    const title = gameState.titles.find(t => t.id === titleId);
    if (title) {
      setNotification(`🏆 ¡Título desbloqueado: ${title.name}!`);
      addEvent(`¡Has obtenido el título "${title.name}"!`, 'discovery');
      setTimeout(() => setNotification(null), 3000);
    }
  }, [gameState.titles, addEvent]);

  // Handle game reset
  const handleResetGame = useCallback(() => {
    // Generate new world seed and clear village cache
    const newSeed = generateNewSeed();
    clearVillageCache();
    
    const initialTitles = ALL_TITLES.map((t) => ({ ...t, unlocked: false, active: false }));
    setGameState({
      resources: { wheat: 150, stone: 20, clay: 20, silver: 10, wood: 20 },
      baseProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 },
      effectiveProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 },
      capitalProduction: { ...CAPITAL_BASE_PRODUCTION },
      naturalProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 },
      titleProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0 },
      population: 10,
      maxPopulation: 20,
      upgrades: INITIAL_UPGRADES.map(u => ({ ...u })),
      cameraX: CAPITAL_X,
      cameraY: CAPITAL_Y,
      tick: 0,
      villagesExplored: 1,
      efficiency: 1,
      wheatConsumption: 0.5,
      totalBuildings: 0,
      borderRadius: 3,
      starving: false,
      titles: initialTitles,
      activeTitleIds: [],
    });
    setViewRadius(8);
    setSelectedTile(null);
    setSelectedVillage(null);
    setEvents([
      { id: eventIdRef.current++, message: `¡Nuevo mundo generado! Seed: ${newSeed}`, type: 'discovery', tick: 0 },
      { id: eventIdRef.current++, message: '¡Partida reiniciada! Buena suerte.', type: 'info', tick: 0 },
    ]);
    setNotification(`🔄 ¡Nuevo mundo! Seed: ${newSeed}`);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Camera movement with keyboard ONLY
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newCamX = gameState.cameraX;
      let newCamY = gameState.cameraY;
      const speed = e.shiftKey ? 3 : 1;

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': newCamY -= speed; break;
        case 'ArrowDown': case 's': case 'S': newCamY += speed; break;
        case 'ArrowLeft': case 'a': case 'A': newCamX -= speed; break;
        case 'ArrowRight': case 'd': case 'D': newCamX += speed; break;
        case 'Home': case 'h': case 'H': newCamX = CAPITAL_X; newCamY = CAPITAL_Y; break;
        default: return;
      }

      e.preventDefault();
      setGameState(prev => ({ ...prev, cameraX: newCamX, cameraY: newCamY }));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.cameraX, gameState.cameraY]);

  // Tile click - only selects, doesn't move camera
  const handleTileClick = useCallback((x: number, y: number) => {
    const tile = getTile(x, y);
    const village = getVillageAt(x, y);
    setSelectedTile({ x, y });

    if (village) {
      setSelectedVillage(village);
      addEvent(`Inspeccionando: ${village.name}`, 'info');
    }
  }, [addEvent]);

  // Selected tile info
  const selectedTileInfo = selectedTile ? (() => {
    const tile = getTile(selectedTile.x, selectedTile.y);
    const village = getVillageAt(selectedTile.x, selectedTile.y);
    const distToCapital = Math.abs(selectedTile.x - CAPITAL_X) + Math.abs(selectedTile.y - CAPITAL_Y);
    const insideBorder = distToCapital <= gameState.borderRadius;
    const tileInfo = TILE_INFO[tile.type];
    const naturalProd = getTileNaturalProduction(tile.type);
    return { tile, village, x: selectedTile.x, y: selectedTile.y, insideBorder, tileInfo, naturalProd };
  })() : null;

  const getTerrainName = (type: TileType): string => {
    return TILE_INFO[type]?.name || type;
  };

  const activeTitles = gameState.titles.filter(t => t.active);

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
        {/* Left Panel */}
        <div className="w-64 bg-gray-800/80 border-r border-gray-700 flex flex-col p-3 gap-2 overflow-y-auto scrollbar-thin">
          {/* Active Titles */}
          {activeTitles.length > 0 && (
            <div className="bg-gradient-to-br from-purple-900/30 to-gray-800/50 rounded-lg p-3 border border-purple-500/30">
              <h3 className="text-sm font-bold text-purple-300 mb-1.5 flex items-center gap-1">
                🏆 Títulos Activos
              </h3>
              <div className="flex flex-wrap gap-1">
                {activeTitles.map(t => (
                  <span key={t.id} className="text-xs bg-purple-900/50 px-1.5 py-0.5 rounded border border-purple-500/30" title={t.name}>
                    {t.emoji} {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Capital info */}
          <div className="bg-gradient-to-br from-amber-900/30 to-gray-800/50 rounded-lg p-3 border border-amber-600/30">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1">🏰 Capital</h3>
            <div className="space-y-1 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Posición:</span>
                <span className="text-white font-mono">({CAPITAL_X}, {CAPITAL_Y})</span>
              </div>
              <div className="flex justify-between">
                <span>Frontera:</span>
                <span className="text-amber-400 font-bold">Radio {gameState.borderRadius}</span>
              </div>
              <div className="flex justify-between">
                <span>Prod. base:</span>
                <span className="text-green-400 font-bold">1 de cada</span>
              </div>
              {gameState.naturalProduction.wheat > 0 || gameState.naturalProduction.stone > 0 || gameState.naturalProduction.clay > 0 || gameState.naturalProduction.silver > 0 || gameState.naturalProduction.wood > 0 && (
                <div className="border-t border-gray-600 pt-1 mt-1">
                  <p className="text-[10px] text-blue-300">🌍 Prod. natural del territorio:</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {gameState.naturalProduction.wheat > 0 && <span className="text-[9px] bg-blue-900/50 px-1 rounded">🌾+{gameState.naturalProduction.wheat.toFixed(1)}</span>}
                    {gameState.naturalProduction.stone > 0 && <span className="text-[9px] bg-blue-900/50 px-1 rounded">🪨+{gameState.naturalProduction.stone.toFixed(1)}</span>}
                    {gameState.naturalProduction.clay > 0 && <span className="text-[9px] bg-blue-900/50 px-1 rounded">🧱+{gameState.naturalProduction.clay.toFixed(1)}</span>}
                    {gameState.naturalProduction.silver > 0 && <span className="text-[9px] bg-blue-900/50 px-1 rounded">💎+{gameState.naturalProduction.silver.toFixed(1)}</span>}
                    {gameState.naturalProduction.wood > 0 && <span className="text-[9px] bg-blue-900/50 px-1 rounded">🪵+{gameState.naturalProduction.wood.toFixed(1)}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Efficiency */}
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-3 border border-gray-600/30">
            <h3 className="text-sm font-bold text-amber-400 mb-2">⚡ Eficiencia</h3>
            <div className="space-y-1 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Edificios:</span>
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
                }`}>{(gameState.efficiency * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    gameState.efficiency >= 1 ? 'bg-green-500' : 
                    gameState.efficiency >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, gameState.efficiency * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Consumption */}
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-3 border border-gray-600/30">
            <h3 className="text-sm font-bold text-amber-400 mb-2">🍞 Balance Trigo</h3>
            <div className="space-y-1 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Consumo/seg:</span>
                <span className="text-red-400 font-bold">-{gameState.wheatConsumption.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Producción/seg:</span>
                <span className="text-green-400 font-bold">+{gameState.effectiveProduction.wheat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-1 mt-1">
                <span>Balance:</span>
                <span className={`font-bold ${
                  gameState.effectiveProduction.wheat - gameState.wheatConsumption >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(gameState.effectiveProduction.wheat - gameState.wheatConsumption) >= 0 ? '+' : ''}
                  {(gameState.effectiveProduction.wheat - gameState.wheatConsumption).toFixed(2)}
                </span>
              </div>
              {gameState.starving && (
                <p className="text-[10px] text-red-400 font-bold mt-1 animate-pulse">⚠️ ¡HAMBRUNA!</p>
              )}
            </div>
          </div>

          {/* Selected Tile */}
          {selectedTileInfo && (
            <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-3 border border-gray-600/30">
              <h3 className="text-sm font-bold text-amber-400 mb-2">🔍 Casilla</h3>
              <div className="space-y-1 text-xs text-gray-300">
                <p className="font-mono">({selectedTileInfo.x}, {selectedTileInfo.y})</p>
                <p>
                  <span className="mr-1">{selectedTileInfo.tileInfo.emoji}</span>
                  <span className="text-white font-medium">{selectedTileInfo.tileInfo.name}</span>
                </p>
                <p className="text-[10px] text-gray-400">{selectedTileInfo.tileInfo.description}</p>
                <p>
                  Territorio: {selectedTileInfo.insideBorder 
                    ? <span className="text-green-400">🟢 Tu frontera</span> 
                    : <span className="text-gray-500">⚫ Tierra libre</span>}
                </p>
                {selectedTileInfo.insideBorder && (selectedTileInfo.naturalProd.wheat > 0 || selectedTileInfo.naturalProd.stone > 0 || selectedTileInfo.naturalProd.clay > 0 || selectedTileInfo.naturalProd.silver > 0 || selectedTileInfo.naturalProd.wood > 0) && (
                  <div className="bg-blue-900/20 rounded p-1.5 border border-blue-500/20 mt-1">
                    <p className="text-[10px] text-blue-300 font-bold">🌍 Producción natural:</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {selectedTileInfo.naturalProd.wheat > 0 && <span className="text-[9px]">🌾+{selectedTileInfo.naturalProd.wheat}</span>}
                      {selectedTileInfo.naturalProd.stone > 0 && <span className="text-[9px]">🪨+{selectedTileInfo.naturalProd.stone}</span>}
                      {selectedTileInfo.naturalProd.clay > 0 && <span className="text-[9px]">🧱+{selectedTileInfo.naturalProd.clay}</span>}
                      {selectedTileInfo.naturalProd.silver > 0 && <span className="text-[9px]">💎+{selectedTileInfo.naturalProd.silver}</span>}
                      {selectedTileInfo.naturalProd.wood > 0 && <span className="text-[9px]">🪵+{selectedTileInfo.naturalProd.wood}</span>}
                    </div>
                  </div>
                )}
                {selectedTileInfo.village && (
                  <div className="mt-2 p-2 bg-amber-900/20 rounded border border-amber-500/30">
                    <p className="text-amber-300 font-bold text-sm">
                      {selectedTileInfo.village.isPlayer ? '🏰' : '🏘️'} {selectedTileInfo.village.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Población: {selectedTileInfo.village.population}</p>
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
            selectedTile={selectedTile}
            onTileClick={handleTileClick}
            showVillageBorders={showVillageBorders}
          />
          
          {/* Notification */}
          {notification && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800/95 border border-amber-500/50 text-white px-5 py-2.5 rounded-lg shadow-2xl z-50 backdrop-blur-sm">
              <p className="text-sm font-medium">{notification}</p>
            </div>
          )}

          {/* Title Panel Toggle */}
          <button
            onClick={() => setShowTitlePanel(!showTitlePanel)}
            className="absolute top-3 left-3 bg-purple-900/80 hover:bg-purple-800/90 rounded-lg px-3 py-1.5 border border-purple-500/30 backdrop-blur-sm transition-all text-sm font-bold text-purple-200 flex items-center gap-1.5"
          >
            🏆 Títulos {activeTitles.length > 0 && <span className="bg-purple-500 text-white text-[10px] px-1.5 rounded-full">{activeTitles.length}</span>}
          </button>

          {/* Village Borders Toggle */}
          <button
            onClick={() => setShowVillageBorders(!showVillageBorders)}
            className={`absolute top-3 left-36 rounded-lg px-3 py-1.5 border backdrop-blur-sm transition-all text-sm font-bold flex items-center gap-1.5 ${
              showVillageBorders 
                ? 'bg-blue-600/80 hover:bg-blue-500/90 border-blue-400/50 text-blue-100' 
                : 'bg-gray-700/80 hover:bg-gray-600/90 border-gray-500/30 text-gray-300'
            }`}
          >
            🗺️ Fronteras
          </button>

          {/* Options Button */}
          <button
            onClick={() => setShowOptionsPanel(true)}
            className="absolute top-3 right-3 bg-gray-700/80 hover:bg-gray-600/90 rounded-lg px-3 py-1.5 border border-gray-500/30 backdrop-blur-sm transition-all text-sm font-bold text-gray-300 flex items-center gap-1.5"
          >
            ⚙️ Opciones
          </button>

          {/* Controls hint */}
          <div className="absolute bottom-3 left-3 bg-gray-900/80 rounded-lg px-3 py-2 text-xs text-gray-400 border border-gray-700/50 backdrop-blur-sm">
            <p>🎮 WASD/Flechas = Mover cámara</p>
            <p>⇧ + WASD = Mover rápido (x3)</p>
            <p>🖱️ Clic = Inspeccionar casilla</p>
            <p>🏠 H = Volver a la capital</p>
          </div>

          {/* Starvation warning */}
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

      {/* Title Panel Modal */}
      {showTitlePanel && (
        <TitlePanel
          titles={gameState.titles}
          resources={gameState.resources}
          activeTitleIds={gameState.activeTitleIds}
          onPurchase={handleTitlePurchase}
          onClose={() => setShowTitlePanel(false)}
        />
      )}

      {/* Village Info Panel */}
      {selectedVillage && (
        <VillageInfoPanel
          village={selectedVillage}
          onClose={() => setSelectedVillage(null)}
        />
      )}

      {/* Options Panel */}
      {showOptionsPanel && (
        <OptionsPanel
          onClose={() => setShowOptionsPanel(false)}
          onReset={handleResetGame}
        />
      )}
    </div>
  );
}

export default App;
