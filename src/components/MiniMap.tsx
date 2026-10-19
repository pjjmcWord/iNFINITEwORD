import React, { useMemo } from 'react';
import { getTile, getTileColor, getVillageAt } from '../utils/worldGen';

interface MiniMapProps {
  playerX: number;
  playerY: number;
  size?: number;
}

const MiniMap: React.FC<MiniMapProps> = ({ playerX, playerY, size = 120 }) => {
  const range = 20;
  
  const pixels = useMemo(() => {
    const result: { x: number; y: number; color: string; isVillage: boolean }[] = [];
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const tx = playerX + dx;
        const ty = playerY + dy;
        const tile = getTile(tx, ty);
        const village = getVillageAt(tx, ty);
        result.push({
          x: dx + range,
          y: dy + range,
          color: village ? '#f59e0b' : getTileColor(tile.type),
          isVillage: !!village,
        });
      }
    }
    return result;
  }, [playerX, playerY]);

  const cellSize = size / (range * 2 + 1);
  const centerX = range * cellSize;
  const centerY = range * cellSize;

  return (
    <div className="relative bg-gray-900 rounded-lg border border-gray-600 p-1 overflow-hidden">
      <svg width={size} height={size}>
        {pixels.map(({ x, y, color, isVillage }) => (
          <rect
            key={`${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize + 0.5}
            height={cellSize + 0.5}
            fill={color}
            opacity={isVillage ? 1 : 0.8}
          />
        ))}
        {/* Player indicator */}
        <circle
          cx={centerX + cellSize / 2}
          cy={centerY + cellSize / 2}
          r={cellSize * 1.5}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={1.5}
        />
      </svg>
      <div className="absolute top-1 left-1 text-[8px] text-gray-400 bg-black/50 px-1 rounded">
        MAPA
      </div>
    </div>
  );
};

export default MiniMap;
