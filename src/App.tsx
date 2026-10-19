import React, { useState, useEffect, useCallback, useRef } from 'react';
import WorldMap from './components/WorldMap';
import UpgradePanel from './components/UpgradePanel';
import ResourceBar from './components/ResourceBar';
import TerritoryMap from './components/TerritoryMap';
import EventLog, { GameEvent } from './components/EventLog';
import TitlePanel from './components/TitlePanel';
import VillageInfoPanel from './components/VillageInfoPanel';
import OptionsPanel from './components/OptionsPanel';
import {
  GameState,
  Resources,
  ResourceProduction,
  INITIAL_BUILDINGS,
  INITIAL_TECHNOLOGIES,
  CAPITAL_BASE_PRODUCTION,
  ALL_TITLES,
  canAfford,
  getUpgradeCost,
  getTechnologyCost,
  getBuildingLimit,
  getTotalProductionBuildings,
  calculateEfficiency,
  calculateEffectiveProduction,
  calculateWheatConsumption,
  getBorderExpansionCost,
} from './utils/gameState';
import { getTile, getVillageAt, TileType, getTileNaturalProduction, TILE_INFO, Village, calculateMaxBorderRadius, clearVillageCache } from './utils/worldGen';
import { generateNewSeed } from './utils/seed';

const CAPITAL_X = 0;
const CAPITAL_Y = 0;
const TICK_INTERVAL = 1000;

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    return {
      resources: { wheat: 150, stone: 20, clay: 20, silver: 10, wood: 20, science: 0, culture: 0, faith: 0 },
      effectiveProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0, science: 0, culture: 0, faith: 0 },
      capitalProduction: { ...CAPITAL_BASE_PRODUCTION },
      naturalProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0, science: 0, culture: 0, faith: 0 },
      population: 10,
      maxPopulation: 20,
      upgrades: INITIAL_BUILDINGS.map(u => ({ ...u })),
      technologies: INITIAL_TECHNOLOGIES.map(t => ({ ...t })),
      activeTechnologyId: null,
      cameraX: CAPITAL_X,
      cameraY: CAPITAL_Y,
      tick: 0,
      villagesExplored: 1,
      efficiency: 1,
      wheatConsumption: 0.5,
      totalBuildings: 0,
      borderRadius: 3,
      starving: false,
      titles: ALL_TITLES.map(t => ({ ...t })),
      activeTitleId: null,
      tradeRoutes: [],
      villageRelations: new Map(),
    };
  });

  const [viewRadius] = useState(8);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showTitlePanel, setShowTitlePanel] = useState(false);
  const [showVillageBorders, setShowVillageBorders] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [events, setEvents] = useState<GameEvent[]>([
    { id: 0, message: '¡Bienvenido! Tu capital produce recursos básicos.', type: 'info', tick: 0 },
    { id: 1, message: 'Construye edificios y asigna población para producir más.', type: 'info', tick: 0 },
    { id: 2, message: 'Haz clic en tu capital para ver los títulos.', type: 'info', tick: 0 },
  ]);
  const eventIdRef = useRef(3);

  const addEvent = useCallback((message: string, type: GameEvent['type'] = 'info') => {
    setEvents(prev => [...prev.slice(-49), { id: eventIdRef.current++, message, type, tick: 0 }]);
  }, []);

  // Calculate natural production from tiles within border
  const calculateNaturalProduction = useCallback((borderRadius: number) => {
    const natural: ResourceProduction = { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0, science: 0, culture: 0, faith: 0 };
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

  // Game tick
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const totalBuildings = getTotalProductionBuildings(prev.upgrades);
        const efficiency = calculateEfficiency(prev.population, totalBuildings);
        const effectiveProduction = calculateEffectiveProduction(prev.upgrades, efficiency);
        
        // Natural production from border tiles
        const naturalProd = calculateNaturalProduction(prev.borderRadius);

        // Consumption
        const wheatConsumption = calculateWheatConsumption(prev.population);

        // Technology research with progress bar
        let newResources = { ...prev.resources };
        let newTechnologies = [...prev.technologies];
        
        if (prev.activeTechnologyId && newResources.science > 0) {
          const activeTechIndex = newTechnologies.findIndex(t => t.id === prev.activeTechnologyId);
          if (activeTechIndex !== -1) {
            const activeTech = newTechnologies[activeTechIndex];
            if (activeTech.level < activeTech.maxLevel) {
              const techCost = getTechnologyCost(activeTech);
              const progressPerTick = (newResources.science / techCost) * 10; // 10% per tick if enough science
              const newProgress = Math.min(100, activeTech.progress + progressPerTick);
              
              // Consume science based on progress
              const scienceConsumed = Math.min(newResources.science, (progressPerTick / 100) * techCost);
              newResources.science -= scienceConsumed;
              
              if (newProgress >= 100) {
                // Technology completed
                newTechnologies[activeTechIndex] = {
                  ...activeTech,
                  level: activeTech.level + 1,
                  progress: 0,
                };
                addEvent(`🔬 ¡Tecnología completada: ${activeTech.name} Nv.${activeTech.level + 1}!`, 'success');
              } else {
                newTechnologies[activeTechIndex] = {
                  ...activeTech,
                  progress: newProgress,
                };
              }
            }
          }
        }

        // Total production
        newResources = {
          wheat: Math.max(0, 
            newResources.wheat 
            + prev.capitalProduction.wheat 
            + effectiveProduction.wheat 
            + naturalProd.wheat 
            - wheatConsumption
          ),
          stone: newResources.stone + prev.capitalProduction.stone + effectiveProduction.stone + naturalProd.stone,
          clay: newResources.clay + prev.capitalProduction.clay + effectiveProduction.clay + naturalProd.clay,
          silver: newResources.silver + prev.capitalProduction.silver + effectiveProduction.silver + naturalProd.silver,
          wood: newResources.wood + prev.capitalProduction.wood + effectiveProduction.wood + naturalProd.wood,
          science: newResources.science + prev.capitalProduction.science + effectiveProduction.science,
          culture: newResources.culture + prev.capitalProduction.culture + effectiveProduction.culture,
          faith: newResources.faith + prev.capitalProduction.faith + effectiveProduction.faith,
        };

        const isStarving = newResources.wheat <= 0 && wheatConsumption > 0;

        // Population dynamics
        let newPop = prev.population;
        const houseUpgrade = prev.upgrades.find(u => u.id === 'house');
        const newMaxPop = 20 + (houseUpgrade?.level || 0) * 5;

        if (isStarving && prev.tick % 8 === 0 && prev.tick > 0) {
          newPop = Math.max(1, prev.population - 1);
        } else if (!isStarving && prev.resources.wheat > 5 && prev.population < newMaxPop) {
          if (prev.tick % 5 === 0 && prev.tick > 0) {
            newPop = Math.min(prev.population + 1, newMaxPop);
          }
        }

        // Total effective production for display
        const totalEffective: ResourceProduction = {
          wheat: prev.capitalProduction.wheat + effectiveProduction.wheat + naturalProd.wheat,
          stone: prev.capitalProduction.stone + effectiveProduction.stone + naturalProd.stone,
          clay: prev.capitalProduction.clay + effectiveProduction.clay + naturalProd.clay,
          silver: prev.capitalProduction.silver + effectiveProduction.silver + naturalProd.silver,
          wood: prev.capitalProduction.wood + effectiveProduction.wood + naturalProd.wood,
          science: prev.capitalProduction.science + effectiveProduction.science,
          culture: prev.capitalProduction.culture + effectiveProduction.culture,
          faith: prev.capitalProduction.faith + effectiveProduction.faith,
        };

        return {
          ...prev,
          resources: newResources,
          technologies: newTechnologies,
          population: newPop,
          maxPopulation: newMaxPop,
          tick: prev.tick + 1,
          efficiency,
          effectiveProduction: totalEffective,
          wheatConsumption,
          totalBuildings,
          naturalProduction: naturalProd,
          starving: isStarving,
        };
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [calculateNaturalProduction, addEvent]);

  // Handle building purchase
  const handleUpgrade = useCallback((upgradeId: string) => {
    setGameState(prev => {
      const upgrade = prev.upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return prev;

      const limit = getBuildingLimit(upgradeId, prev.technologies);
      if (upgrade.level >= limit) return prev;

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
      const efficiency = calculateEfficiency(prev.population, totalBuildings);

      return {
        ...prev,
        resources: newResources,
        upgrades: newUpgrades,
        totalBuildings,
        efficiency,
      };
    });

    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    if (upgrade) {
      setNotification(`🏗️ ${upgrade.name} construida (Nv.${upgrade.level + 1})`);
      addEvent(`${upgrade.name} mejorada a nivel ${upgrade.level + 1}`, 'success');
      setTimeout(() => setNotification(null), 2000);
    }
  }, [gameState.upgrades, addEvent]);

  // Handle technology selection
  const handleSelectTechnology = useCallback((techId: string) => {
    setGameState(prev => {
      const newTechnologies = prev.technologies.map(t => ({
        ...t,
        active: t.id === techId,
      }));
      return {
        ...prev,
        technologies: newTechnologies,
        activeTechnologyId: prev.activeTechnologyId === techId ? null : techId,
      };
    });
  }, []);

  // Handle title purchase/activation
  const handleTitleAction = useCallback((titleId: string) => {
    setGameState(prev => {
      const title = prev.titles.find(t => t.id === titleId);
      if (!title) return prev;

      if (!title.unlocked) {
        // Purchase title
        if (!canAfford(prev.resources, title.cost)) return prev;

        const newResources = { ...prev.resources };
        for (const [key, value] of Object.entries(title.cost)) {
          newResources[key as keyof Resources] -= value || 0;
        }

        const newTitles = prev.titles.map(t =>
          t.id === titleId ? { ...t, unlocked: true, active: true } : { ...t, active: false }
        );

        return {
          ...prev,
          resources: newResources,
          titles: newTitles,
          activeTitleId: titleId,
        };
      } else {
        // Toggle active title
        const newTitles = prev.titles.map(t =>
          t.id === titleId ? { ...t, active: !t.active } : { ...t, active: false }
        );

        return {
          ...prev,
          titles: newTitles,
          activeTitleId: title.active ? null : titleId,
        };
      }
    });

    const title = gameState.titles.find(t => t.id === titleId);
    if (title) {
      if (!title.unlocked) {
        setNotification(`🏆 ¡Título desbloqueado: ${title.name}!`);
        addEvent(`¡Has obtenido el título "${title.name}"!`, 'discovery');
      } else {
        setNotification(`🏆 ${title.active ? 'Desactivado' : 'Activado'}: ${title.name}`);
      }
      setTimeout(() => setNotification(null), 2000);
    }
  }, [gameState.titles, addEvent]);

  // Handle border expansion (casilla a casilla)
  const handleBorderExpansion = useCallback(() => {
    setGameState(prev => {
      const cost = getBorderExpansionCost(prev.borderRadius);
      if (!canAfford(prev.resources, cost)) return prev;

      const newResources = { ...prev.resources };
      for (const [key, value] of Object.entries(cost)) {
        newResources[key as keyof Resources] -= value || 0;
      }

      // Expandir una casilla a la vez
      const newBorderRadius = prev.borderRadius + 1;

      return {
        ...prev,
        resources: newResources,
        borderRadius: newBorderRadius,
      };
    });

    setNotification(`🛡️ ¡Frontera expandida una casilla!`);
    addEvent(`Frontera expandida a radio ${gameState.borderRadius + 1}`, 'success');
    setTimeout(() => setNotification(null), 2000);
  }, [gameState.borderRadius, addEvent]);

  // Handle game reset
  const handleResetGame = useCallback(() => {
    const newSeed = generateNewSeed();
    clearVillageCache();
    
    setGameState({
      resources: { wheat: 150, stone: 20, clay: 20, silver: 10, wood: 20, science: 0, culture: 0, faith: 0 },
      effectiveProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0, science: 0, culture: 0, faith: 0 },
      capitalProduction: { ...CAPITAL_BASE_PRODUCTION },
      naturalProduction: { wheat: 0, stone: 0, clay: 0, silver: 0, wood: 0, science: 0, culture: 0, faith: 0 },
      population: 10,
      maxPopulation: 20,
      upgrades: INITIAL_BUILDINGS.map(u => ({ ...u })),
      technologies: INITIAL_TECHNOLOGIES.map(t => ({ ...t })),
      activeTechnologyId: null,
      cameraX: CAPITAL_X,
      cameraY: CAPITAL_Y,
      tick: 0,
      villagesExplored: 1,
      efficiency: 1,
      wheatConsumption: 0.5,
      totalBuildings: 0,
      borderRadius: 3,
      starving: false,
      titles: ALL_TITLES.map(t => ({ ...t })),
      activeTitleId: null,
      tradeRoutes: [],
      villageRelations: new Map(),
    });
    setSelectedTile(null);
    setSelectedVillage(null);
    setEvents([
      { id: eventIdRef.current++, message: `¡Nuevo mundo generado! Seed: ${newSeed}`, type: 'discovery', tick: 0 },
      { id: eventIdRef.current++, message: '¡Partida reiniciada! Buena suerte.', type: 'info', tick: 0 },
    ]);
    setNotification(`🔄 ¡Nuevo mundo! Seed: ${newSeed}`);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Camera movement
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

  // Tile click
  const handleTileClick = useCallback((x: number, y: number) => {
    const village = getVillageAt(x, y);
    setSelectedTile({ x, y });

    if (village) {
      if (village.isPlayer) {
        // Open title panel when clicking capital
        setShowTitlePanel(true);
      } else {
        setSelectedVillage(village);
      }
      addEvent(`Inspeccionando: ${village.name}`, 'info');
    }
  }, [addEvent]);

  const selectedTileInfo = selectedTile ? (() => {
    const tile = getTile(selectedTile.x, selectedTile.y);
    const village = getVillageAt(selectedTile.x, selectedTile.y);
    const distToCapital = Math.abs(selectedTile.x - CAPITAL_X) + Math.abs(selectedTile.y - CAPITAL_Y);
    const insideBorder = distToCapital <= gameState.borderRadius;
    const tileInfo = TILE_INFO[tile.type];
    return { tile, village, x: selectedTile.x, y: selectedTile.y, insideBorder, tileInfo };
  })() : null;

  const activeTitle = gameState.titles.find(t => t.active);
  const borderExpansionCost = getBorderExpansionCost(gameState.borderRadius);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden select-none">
      {/* Resource Bar */}
      <div className="z-30 relative">
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
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col p-3 gap-2 overflow-y-auto scrollbar-thin z-20 relative">
          {/* Active Title */}
          {activeTitle && (
            <div className="bg-gradient-to-br from-purple-900/30 to-gray-800/50 rounded-lg p-3 border border-purple-500/30">
              <h3 className="text-sm font-bold text-purple-300 mb-1.5 flex items-center gap-1">
                🏆 Título Activo
              </h3>
              <div className="text-xs text-white">
                {activeTitle.emoji} {activeTitle.name}
              </div>
            </div>
          )}

          {/* Capital info */}
          <div className="bg-gradient-to-br from-amber-900/30 to-gray-800/50 rounded-lg p-3 border border-amber-600/30">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1">🏰 Capital</h3>
            <div className="space-y-1 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Frontera:</span>
                <span className="text-amber-400 font-bold">Radio {gameState.borderRadius}</span>
              </div>
              <button
                onClick={handleBorderExpansion}
                disabled={!canAfford(gameState.resources, borderExpansionCost)}
                className={`w-full mt-2 px-2 py-1.5 rounded text-xs font-bold transition-all ${
                  canAfford(gameState.resources, borderExpansionCost)
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                🛡️ Expandir Frontera
              </button>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(borderExpansionCost).map(([key, value]) => (
                  <span
                    key={key}
                    className={`text-[9px] px-1 py-0.5 rounded ${
                      gameState.resources[key as keyof Resources] >= (value || 0)
                        ? 'bg-green-900/50 text-green-300'
                        : 'bg-red-900/50 text-red-300'
                    }`}
                  >
                    {key === 'stone' ? '🪨' : key === 'wood' ? '🪵' : '💎'} {value}
                  </span>
                ))}
              </div>
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
                <p>
                  Territorio: {selectedTileInfo.insideBorder 
                    ? <span className="text-green-400">🟢 Tu frontera</span> 
                    : <span className="text-gray-500">⚫ Tierra libre</span>}
                </p>
              </div>
            </div>
          )}

          {/* Event Log */}
          <EventLog events={events} />

          {/* Territory Map */}
          <div className="mt-auto">
            <TerritoryMap 
              cameraX={gameState.cameraX} 
              cameraY={gameState.cameraY} 
              capitalX={CAPITAL_X}
              capitalY={CAPITAL_Y}
              capitalBorderRadius={gameState.borderRadius}
            />
          </div>
        </div>

        {/* Center - World Map */}
        <div className="flex-1 relative z-0 overflow-hidden">
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

          {/* Options Button */}
          <button
            onClick={() => setShowOptionsPanel(true)}
            className="absolute top-3 right-3 bg-gray-700/80 hover:bg-gray-600/90 rounded-lg px-3 py-1.5 border border-gray-500/30 backdrop-blur-sm transition-all text-sm font-bold text-gray-300 flex items-center gap-1.5 z-10"
          >
            ⚙️ Opciones
          </button>

          {/* Village Borders Toggle */}
          <button
            onClick={() => setShowVillageBorders(!showVillageBorders)}
            className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 rounded-lg px-4 py-2 border backdrop-blur-sm transition-all text-sm font-bold flex items-center gap-2 z-10 ${
              showVillageBorders 
                ? 'bg-blue-600/90 hover:bg-blue-500 border-blue-400/50 text-blue-100 shadow-lg shadow-blue-500/30' 
                : 'bg-gray-700/90 hover:bg-gray-600 border-gray-500/30 text-gray-300'
            }`}
          >
            🗺️ {showVillageBorders ? 'Ocultar' : 'Mostrar'} Fronteras
          </button>

          {/* Starvation warning */}
          {gameState.starving && (
            <div className="absolute top-14 right-3 bg-red-900/80 rounded-lg px-3 py-1.5 border border-red-500/50 backdrop-blur-sm animate-pulse">
              <p className="text-xs font-bold text-red-300">⚠️ ¡HAMBRUNA!</p>
            </div>
          )}
        </div>

        {/* Right Panel - Upgrades */}
        <div className="w-72 z-20 relative">
          <UpgradePanel
            upgrades={gameState.upgrades}
            technologies={gameState.technologies}
            resources={gameState.resources}
            activeTechnologyId={gameState.activeTechnologyId}
            onUpgrade={handleUpgrade}
            onSelectTechnology={handleSelectTechnology}
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
          activeTitleId={gameState.activeTitleId}
          onAction={handleTitleAction}
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
