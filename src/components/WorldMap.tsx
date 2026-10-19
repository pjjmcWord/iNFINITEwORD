import React, { useMemo } from 'react';
import { getTile, getTileColor, getVillageAt, TileType } from '../utils/worldGen';

interface WorldMapProps {
  playerX: number;
  playerY: number;
  viewRadius: number;
  onTileClick: (x: number, y: number) => void;
}

const TILE_SIZE = 44;

const WorldMap: React.FC<WorldMapProps> = ({ playerX, playerY, viewRadius, onTileClick }) => {
  const tiles = useMemo(() => {
    const result: { x: number; y: number; type: TileType; village: ReturnType<typeof getVillageAt>; elevation: number }[] = [];
    for (let dy = -viewRadius; dy <= viewRadius; dy++) {
      for (let dx = -viewRadius; dx <= viewRadius; dx++) {
        const tx = playerX + dx;
        const ty = playerY + dy;
        const tile = getTile(tx, ty);
        const village = getVillageAt(tx, ty);
        result.push({ x: tx, y: ty, type: tile.type, village, elevation: tile.elevation });
      }
    }
    return result;
  }, [playerX, playerY, viewRadius]);

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
        style={{
          width: mapSize,
          height: mapSize,
        }}
      >
        {tiles.map(({ x, y, type, village, elevation }) => {
          const screenX = (x - playerX + viewRadius) * TILE_SIZE;
          const screenY = (y - playerY + viewRadius) * TILE_SIZE;
          const isPlayer = x === playerX && y === playerY;
          const isAdjacent = Math.abs(x - playerX) <= 1 && Math.abs(y - playerY) <= 1 && !isPlayer;
          
          // Add slight color variation based on elevation
          const brightness = 0.85 + elevation * 0.3;

          return (
            <div
              key={`${x}-${y}`}
              className={`absolute flex items-center justify-center cursor-pointer transition-all duration-150 border border-black/5 ${
                isAdjacent && type !== TileType.WATER ? 'hover:brightness-125 hover:z-20' : ''
              } ${type === TileType.WATER ? 'animate-pulse' : ''}`}
              style={{
                left: screenX,
                top: screenY,
                width: TILE_SIZE,
                height: TILE_SIZE,
                backgroundColor: getTileColor(type),
                filter: `brightness(${brightness})`,
                boxShadow: isPlayer 
                  ? '0 0 0 3px #f59e0b, 0 0 20px rgba(245, 158, 11, 0.6), inset 0 0 10px rgba(245, 158, 11, 0.3)' 
                  : village 
                  ? 'inset 0 0 8px rgba(245, 158, 11, 0.4)'
                  : isAdjacent && type !== TileType.WATER
                  ? 'inset 0 0 0 1px rgba(255,255,255,0.15)'
                  : undefined,
                zIndex: isPlayer ? 30 : village ? 20 : 1,
                borderRadius: isPlayer ? '4px' : '0',
              }}
              onClick={() => onTileClick(x, y)}
              title={`(${x}, ${y}) - ${type}${village ? ` - ${village.name}` : ''}`}
            >
              {isPlayer && (
                <span className="text-xl drop-shadow-lg" style={{ zIndex: 40, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>🏰</span>
              )}
              {village && !isPlayer && (
                <div className="flex flex-col items-center">
                  <span className="text-base drop-shadow-md">🏘️</span>
                </div>
              )}
              {!isPlayer && !village && type === TileType.FOREST && (
                <span className="text-xs opacity-70 drop-shadow-sm">🌲</span>
              )}
              {!isPlayer && !village && type === TileType.MOUNTAIN && (
                <span className="text-xs opacity-70 drop-shadow-sm">🪨</span>
              )}
              {!isPlayer && !village && type === TileType.WATER && (
                <span className="text-xs opacity-40">〰️</span>
              )}
              {!isPlayer && !village && type === TileType.DESERT && (
                <span className="text-xs opacity-50">🌵</span>
              )}
              {!isPlayer && !village && type === TileType.SNOW && (
                <span className="text-xs opacity-50">🏔️</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorldMap;
