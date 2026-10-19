import React, { useMemo } from 'react';
import { getTile, getTileColor, getVillageAt } from '../utils/worldGen';

interface MiniMapProps {
  playerX: number;
  playerY: number;
  capitalX: number;
  capitalY: number;
  borderRadius: number;
  size?: number;
}

const MiniMap: React.FC<MiniMapProps> = ({ playerX, playerY, capitalX, capitalY, borderRadius, size = 130 }) => {
  const range = 20;
  
  const pixels = useMemo(() => {
    const result: { x: number; y: number; color: string; isVillage: boolean; isBorder: boolean }[] = [];
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const tx = playerX + dx;
        const ty = playerY + dy;
        const tile = getTile(tx, ty);
        const village = getVillageAt(tx, ty);
        
        // Check if inside capital border
        const distToCapital = Math.abs(tx - capitalX) + Math.abs(ty - capitalY);
        const isBorder = distToCapital <= borderRadius;
        
        result.push({
          x: dx + range,
          y: dy + range,
          color: isBorder && !village ? '#2563eb30' : getTileColor(tile.type),
          isVillage: !!village,
          isBorder,
        });
      }
    }
    return result;
  }, [playerX, playerY, capitalX, capitalY, borderRadius]);

  const cellSize = size / (range * 2 + 1);
  
  // Capital position on minimap
  const capitalScreenX = (capitalX - playerX + range) * cellSize;
  const capitalScreenY = (capitalY - playerY + range) * cellSize;

  return (
    <div className="relative bg-gray-900 rounded-lg border border-gray-600 p-1 overflow-hidden">
      <svg width={size} height={size}>
        {pixels.map(({ x, y, color, isVillage, isBorder }) => (
          <rect
            key={`${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize + 0.5}
            height={cellSize + 0.5}
            fill={isVillage ? '#f59e0b' : color}
            opacity={isVillage ? 1 : isBorder ? 0.6 : 0.8}
          />
        ))}
        {/* Capital indicator */}
        {capitalScreenX >= 0 && capitalScreenX <= size && capitalScreenY >= 0 && capitalScreenY <= size && (
          <>
            <circle
              cx={capitalScreenX + cellSize / 2}
              cy={capitalScreenY + cellSize / 2}
              r={cellSize * 2}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={1.5}
            />
            <circle
              cx={capitalScreenX + cellSize / 2}
              cy={capitalScreenY + cellSize / 2}
              r={cellSize * 0.8}
              fill="#f59e0b"
            />
          </>
        )}
        {/* Camera center indicator */}
        <rect
          x={range * cellSize - 1}
          y={range * cellSize - 1}
          width={cellSize + 2}
          height={cellSize + 2}
          fill="none"
          stroke="white"
          strokeWidth={1}
          opacity={0.5}
        />
      </svg>
      <div className="absolute top-1 left-1 text-[8px] text-gray-400 bg-black/50 px-1 rounded">
        MAPA
      </div>
      <div className="absolute bottom-1 right-1 text-[8px] text-blue-400 bg-black/50 px-1 rounded">
        🛡️ Frontera
      </div>
    </div>
  );
};

export default MiniMap;
