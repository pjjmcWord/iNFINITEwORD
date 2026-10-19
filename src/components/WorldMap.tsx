import React, { useMemo } from 'react';
import { getTile, getTileColor, getVillageAt, TileType, TILE_INFO, isTileInVillageBorder, Village } from '../utils/worldGen';
import PixelTile from './PixelTile';

interface WorldMapProps {
  cameraX: number;
  cameraY: number;
  viewRadius: number;
  capitalX: number;
  capitalY: number;
  borderRadius: number;
  selectedTile: { x: number; y: number } | null;
  onTileClick: (x: number, y: number) => void;
  showVillageBorders: boolean;
}

const TILE_SIZE = 44;

const WorldMap: React.FC<WorldMapProps> = ({ 
  cameraX, cameraY, viewRadius, capitalX, capitalY, borderRadius, 
  selectedTile, onTileClick, showVillageBorders 
}) => {
  const tiles = useMemo(() => {
    const result: { 
      x: number; y: number; type: TileType; 
      village: Village | null; 
      elevation: number;
      inCapitalBorder: boolean;
      isBorderEdge: boolean;
      villageOwner: Village | null;
    }[] = [];
    
    for (let dy = -viewRadius; dy <= viewRadius; dy++) {
      for (let dx = -viewRadius; dx <= viewRadius; dx++) {
        const tx = cameraX + dx;
        const ty = cameraY + dy;
        const tile = getTile(tx, ty);
        const village = getVillageAt(tx, ty);
        
        const distToCapital = Math.abs(tx - capitalX) + Math.abs(ty - capitalY);
        const inCapitalBorder = distToCapital <= borderRadius;
        const isBorderEdge = distToCapital === borderRadius;
        
        // Find which village owns this tile
        let villageOwner: Village | null = null;
        if (village) {
          villageOwner = village;
        } else {
          // Check nearby villages
          const searchRadius = 15;
          for (let sy = -searchRadius; sy <= searchRadius && !villageOwner; sy++) {
            for (let sx = -searchRadius; sx <= searchRadius && !villageOwner; sx++) {
              const nearbyVillage = getVillageAt(tx + sx, ty + sy);
              if (nearbyVillage && isTileInVillageBorder(tx, ty, nearbyVillage)) {
                villageOwner = nearbyVillage;
              }
            }
          }
        }
        
        result.push({ 
          x: tx, y: ty, type: tile.type, village, elevation: tile.elevation, 
          inCapitalBorder, isBorderEdge, villageOwner 
        });
      }
    }
    return result;
  }, [cameraX, cameraY, viewRadius, capitalX, capitalY, borderRadius]);

  const mapSize = (viewRadius * 2 + 1) * TILE_SIZE;

  return (
    <div className="relative overflow-hidden w-full h-full flex items-center justify-center bg-gray-950">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />
      
      <div
        className="relative rounded-lg overflow-hidden shadow-2xl shadow-black/50"
        style={{ 
          width: mapSize, 
          height: mapSize,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {tiles.map(({ x, y, type, village, elevation, inCapitalBorder, isBorderEdge, villageOwner }) => {
          const screenX = (x - cameraX + viewRadius) * TILE_SIZE;
          const screenY = (y - cameraY + viewRadius) * TILE_SIZE;
          const isCapital = x === capitalX && y === capitalY;
          const isSelected = selectedTile && x === selectedTile.x && y === selectedTile.y;
          const isAdjacent = Math.abs(x - cameraX) <= 2 && Math.abs(y - cameraY) <= 2 && !isCapital;
          
          const brightness = 0.85 + elevation * 0.3;
          
          // Determine background color
          let bgColor = getTileColor(type);
          if (showVillageBorders && villageOwner && !villageOwner.isPlayer) {
            // Blend village color with terrain
            bgColor = villageOwner.color;
          }

          return (
            <div
              key={`${x}-${y}`}
              className={`absolute cursor-pointer transition-all duration-150 ${
                isAdjacent && type !== TileType.WATER ? 'hover:brightness-125 hover:z-20' : ''
              }`}
              style={{
                left: screenX,
                top: screenY,
                width: TILE_SIZE,
                height: TILE_SIZE,
                boxShadow: isCapital 
                  ? '0 0 0 3px #f59e0b, 0 0 20px rgba(245, 158, 11, 0.6), inset 0 0 10px rgba(245, 158, 11, 0.3)' 
                  : isSelected
                  ? '0 0 0 2px #a855f7, 0 0 12px rgba(168, 85, 247, 0.5), inset 0 0 8px rgba(168, 85, 247, 0.3)'
                  : village && !village.isPlayer
                  ? `0 0 0 2px ${village.color}, 0 0 15px ${village.color}80`
                  : isBorderEdge && inCapitalBorder
                  ? '0 0 0 3px rgba(245, 158, 11, 0.8), inset 0 0 10px rgba(245, 158, 11, 0.3)'
                  : inCapitalBorder && !isCapital
                  ? 'inset 0 0 8px rgba(245, 158, 11, 0.2)'
                  : villageOwner && showVillageBorders && !villageOwner.isPlayer
                  ? `inset 0 0 0 1px ${villageOwner.color}60`
                  : undefined,
                zIndex: isCapital ? 30 : village ? 20 : isBorderEdge ? 15 : 1,
                borderRadius: isCapital ? '4px' : '0',
                border: isBorderEdge && inCapitalBorder
                  ? '2px solid rgba(245, 158, 11, 0.7)' 
                  : inCapitalBorder && !isCapital && !village 
                  ? '1px solid rgba(245, 158, 11, 0.3)' 
                  : '1px solid rgba(0,0,0,0.15)',
                opacity: showVillageBorders && villageOwner && !villageOwner.isPlayer ? 0.75 : 1,
              }}
              onClick={() => onTileClick(x, y)}
              title={`(${x}, ${y}) - ${TILE_INFO[type].name}${village ? ` - ${village.name}` : ''}${villageOwner && !village ? ` [${villageOwner.name}]` : ''}`}
            >
              {/* Pixel Art Tile */}
              <div style={{ filter: `brightness(${brightness})`, width: '100%', height: '100%' }}>
                <PixelTile type={type} size={TILE_SIZE} variant={(x * 7 + y * 13) % 4} />
              </div>
              
              {/* Capital border overlay */}
              {inCapitalBorder && !isCapital && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isBorderEdge 
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%)'
                      : 'rgba(245, 158, 11, 0.1)',
                    zIndex: 5,
                  }}
                />
              )}
              
              {/* Village overlay */}
              {village && !isCapital && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
                  <div 
                    className="w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
                    style={{ 
                      backgroundColor: village.color,
                      border: '2px solid rgba(255,255,255,0.5)',
                      boxShadow: `0 0 8px ${village.color}80`,
                    }}
                  >
                    {village.population}
                  </div>
                </div>
              )}
              
              {/* Capital marker */}
              {isCapital && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 40 }}>
                  <div className="relative">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center shadow-xl"
                      style={{ 
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        border: '2px solid #fbbf24',
                        boxShadow: '0 0 15px rgba(245, 158, 11, 0.6)',
                      }}
                    >
                      <span className="text-white font-bold text-xs">★</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorldMap;
