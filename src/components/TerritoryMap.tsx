import React from 'react';
import { Village, getVillageAt } from '../utils/worldGen';

interface TerritoryMapProps {
  cameraX: number;
  cameraY: number;
  capitalX: number;
  capitalY: number;
  capitalBorderRadius: number;
  size?: number;
}

const TerritoryMap: React.FC<TerritoryMapProps> = ({ 
  cameraX, cameraY, capitalX, capitalY, capitalBorderRadius, size = 180 
}) => {
  const range = 30; // Larger range to see more villages
  
  // Find all villages in range
  const villages: Village[] = [];
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      const vx = cameraX + dx;
      const vy = cameraY + dy;
      const village = getVillageAt(vx, vy);
      if (village && !villages.find(v => v.x === village.x && v.y === village.y)) {
        villages.push(village);
      }
    }
  }

  const mapSize = size;
  const scale = mapSize / (range * 2);

  return (
    <div className="relative bg-gray-900 rounded-lg border border-gray-600 p-2 overflow-hidden">
      <div className="absolute top-1 left-2 text-[9px] text-gray-400 font-bold z-10">
        🗺️ Mapa Territorial
      </div>
      
      <svg width={mapSize} height={mapSize} className="mt-3">
        {/* Background */}
        <rect width={mapSize} height={mapSize} fill="#1a1a1a" />
        
        {/* Grid lines */}
        {Array.from({ length: 7 }, (_, i) => (
          <React.Fragment key={`grid-${i}`}>
            <line
              x1={(i + 1) * mapSize / 7}
              y1={0}
              x2={(i + 1) * mapSize / 7}
              y2={mapSize}
              stroke="#333"
              strokeWidth="0.5"
            />
            <line
              x1={0}
              y1={(i + 1) * mapSize / 7}
              x2={mapSize}
              y2={(i + 1) * mapSize / 7}
              stroke="#333"
              strokeWidth="0.5"
            />
          </React.Fragment>
        ))}

        {/* Capital territory border */}
        <circle
          cx={mapSize / 2 + (capitalX - cameraX) * scale}
          cy={mapSize / 2 + (capitalY - cameraY) * scale}
          r={capitalBorderRadius * scale}
          fill="rgba(245, 158, 11, 0.15)"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="3,2"
        />

        {/* Villages */}
        {villages.map((village) => {
          const x = mapSize / 2 + (village.x - cameraX) * scale;
          const y = mapSize / 2 + (village.y - cameraY) * scale;
          
          // Skip if outside map bounds
          if (x < 0 || x > mapSize || y < 0 || y > mapSize) return null;

          const isCapital = village.isPlayer;
          const radius = isCapital ? 6 : 4;

          return (
            <g key={`${village.x}-${village.y}`}>
              {/* Village territory circle */}
              {!isCapital && (
                <circle
                  cx={x}
                  cy={y}
                  r={village.borderRadius * scale}
                  fill={village.color + '30'}
                  stroke={village.color}
                  strokeWidth="0.5"
                  opacity="0.6"
                />
              )}
              
              {/* Village dot */}
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={village.color}
                stroke={isCapital ? '#fff' : 'rgba(0,0,0,0.5)'}
                strokeWidth={isCapital ? 2 : 1}
              />
              
              {/* Capital star */}
              {isCapital && (
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#fff"
                  fontWeight="bold"
                >
                  ★
                </text>
              )}
              
              {/* Village name label */}
              <text
                x={x}
                y={y + radius + 8}
                textAnchor="middle"
                fontSize="7"
                fill="#ccc"
                fontWeight="500"
              >
                {village.name}
              </text>
              
              {/* Population */}
              <text
                x={x}
                y={y + radius + 15}
                textAnchor="middle"
                fontSize="6"
                fill="#999"
              >
                👥{village.population}
              </text>
            </g>
          );
        })}

        {/* Camera center indicator */}
        <rect
          x={mapSize / 2 - 3}
          y={mapSize / 2 - 3}
          width={6}
          height={6}
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
      
      {/* Legend */}
      <div className="mt-2 flex items-center justify-between text-[8px] text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span>Tu Capital</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Pueblos</span>
        </div>
      </div>
    </div>
  );
};

export default TerritoryMap;
