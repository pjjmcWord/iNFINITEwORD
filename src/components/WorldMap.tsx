import React, { useMemo } from 'react';
import { getTile, getTileColor, getVillageAt, TileType } from '../utils/worldGen';

interface WorldMapProps {
  cameraX: number;
  cameraY: number;
  viewRadius: number;
  capitalX: number;
  capitalY: number;
  borderRadius: number;
  selectedTile: { x: number; y: number } | null;
  onTileClick: (x: number, y: number) => void;
}

const TILE_SIZE = 44;

const WorldMap: React.FC<WorldMapProps> = ({ 
  cameraX, cameraY, viewRadius, capitalX, capitalY, borderRadius, selectedTile, onTileClick 
}) => {
  const tiles = useMemo(() => {
    const result: { 
      x: number; y: number; type: TileType; 
      village: ReturnType<typeof getVillageAt>; 
      elevation: number;
      inCapitalBorder: boolean;
    }[] = [];
    for (let dy = -viewRadius; dy <= viewRadius; dy++) {
      for (let dx = -viewRadius; dx <= viewRadius; dx++) {
        const tx = cameraX + dx;
        const ty = cameraY + dy;
        const tile = getTile(tx, ty);
        const village = getVillageAt(tx, ty);
        
        // Check if inside capital border (Manhattan distance)
        const distToCapital = Math.abs(tx - capitalX) + Math.abs(ty - capitalY);
        const inCapitalBorder = distToCapital <= borderRadius;
        
        result.push({ x: tx, y: ty, type: tile.type, village, elevation: tile.elevation, inCapitalBorder });
      }
    }
    return result;
  }, [cameraX, cameraY, viewRadius, capitalX, capitalY, borderRadius]);

  const mapSize = (viewRadius * 2 + 1) * TILE_SIZE;

  return (
    <div className="relative overflow-hidden w-full h-full flex items-center justify-center bg-gray-950">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />
      
      <div
        className="relative rounded-lg overflow-hidden shadow-2xl shadow-black/50"
        style={{ width: mapSize, height: mapSize }}
      >
        {tiles.map(({ x, y, type, village, elevation, inCapitalBorder }) => {
          const screenX = (x - cameraX + viewRadius) * TILE_SIZE;
          const screenY = (y - cameraY + viewRadius) * TILE_SIZE;
          const isCapital = x === capitalX && y === capitalY;
          const isSelected = selectedTile && x === selectedTile.x && y === selectedTile.y;
          const isAdjacent = Math.abs(x - cameraX) <= 2 && Math.abs(y - cameraY) <= 2 && !isCapital;
          
          const brightness = 0.85 + elevation * 0.3;

          return (
            <div
              key={`${x}-${y}`}
              className={`absolute flex items-center justify-center cursor-pointer transition-all duration-150 ${
                isAdjacent && type !== TileType.WATER ? 'hover:brightness-125 hover:z-20' : ''
              } ${type === TileType.WATER ? '' : ''}`}
              style={{
                left: screenX,
                top: screenY,
                width: TILE_SIZE,
                height: TILE_SIZE,
                backgroundColor: getTileColor(type),
                filter: `brightness(${brightness})`,
                boxShadow: isCapital 
                  ? '0 0 0 3px #f59e0b, 0 0 20px rgba(245, 158, 11, 0.6), inset 0 0 10px rgba(245, 158, 11, 0.3)' 
                  : isSelected
                  ? '0 0 0 2px #a855f7, 0 0 12px rgba(168, 85, 247, 0.5), inset 0 0 8px rgba(168, 85, 247, 0.3)'
                  : village && !village.isPlayer
                  ? 'inset 0 0 8px rgba(245, 158, 11, 0.4)'
                  : inCapitalBorder && !isCapital
                  ? 'inset 0 0 0 2px rgba(59, 130, 246, 0.4)'
                  : isAdjacent && type !== TileType.WATER
                  ? 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                  : undefined,
                zIndex: isCapital ? 30 : village ? 20 : 1,
                borderRadius: isCapital ? '4px' : '0',
                border: inCapitalBorder && !isCapital && !village 
                  ? '1px dashed rgba(59, 130, 246, 0.3)' 
                  : '1px solid rgba(0,0,0,0.1)',
              }}
              onClick={() => onTileClick(x, y)}
              title={`(${x}, ${y}) - ${type}${village ? ` - ${village.name}` : ''}${inCapitalBorder ? ' [Tu frontera]' : ''}`}
            >
              {isCapital && (
                <span className="text-xl drop-shadow-lg" style={{ zIndex: 40, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>🏰</span>
              )}
              {village && !isCapital && (
                <div className="flex flex-col items-center">
                  <span className="text-base drop-shadow-md">🏘️</span>
                </div>
              )}
              {!isCapital && !village && type === TileType.FOREST && (
                <span className="text-xs opacity-70 drop-shadow-sm">🌲</span>
              )}
              {!isCapital && !village && type === TileType.MOUNTAIN && (
                <span className="text-xs opacity-70 drop-shadow-sm">🪨</span>
              )}
              {!isCapital && !village && type === TileType.WATER && (
                <span className="text-xs opacity-40">〰️</span>
              )}
              {!isCapital && !village && type === TileType.DESERT && (
                <span className="text-xs opacity-50">🌵</span>
              )}
              {!isCapital && !village && type === TileType.SNOW && (
                <span className="text-xs opacity-50">🏔️</span>
              )}
              {!isCapital && !village && type === TileType.COAST && (
                <span className="text-xs opacity-40">🐚</span>
              )}
              {!isCapital && !village && type === TileType.WHEAT_FIELD && (
                <span className="text-xs opacity-80 drop-shadow-sm">🌾</span>
              )}
              {!isCapital && !village && type === TileType.STONE_DEPOSIT && (
                <span className="text-xs opacity-80 drop-shadow-sm">⛏️</span>
              )}
              {!isCapital && !village && type === TileType.CLAY_PIT && (
                <span className="text-xs opacity-80 drop-shadow-sm">🧱</span>
              )}
              {!isCapital && !village && type === TileType.SILVER_VEIN && (
                <span className="text-xs opacity-80 drop-shadow-sm">💎</span>
              )}
              {!isCapital && !village && type === TileType.DENSE_FOREST && (
                <span className="text-sm opacity-80 drop-shadow-sm">🌳</span>
              )}
              {!isCapital && !village && type === TileType.RUINS && (
                <span className="text-xs opacity-80 drop-shadow-sm">🏛️</span>
              )}
              {!isCapital && !village && type === TileType.OASIS && (
                <span className="text-xs opacity-80 drop-shadow-sm">🌴</span>
              )}
              {!isCapital && !village && type === TileType.GRASS && (
                <span className="text-xs opacity-40">·</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorldMap;
