import React from 'react';
import { TileType } from '../utils/worldGen';

interface PixelTileProps {
  type: TileType;
  size?: number;
}

const PixelTile: React.FC<PixelTileProps> = ({ type, size = 44 }) => {
  const getTileStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: size,
      height: size,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '2px',
    };

    switch (type) {
      case TileType.WATER:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #2874a6 0%, #2e86c1 50%, #3498db 100%)',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)',
        };
      
      case TileType.COAST:
        return {
          ...baseStyle,
          background: 'linear-gradient(180deg, #f9e79f 0%, #f4d03f 50%, #5dade2 100%)',
          boxShadow: 'inset 0 0 6px rgba(0,0,0,0.1)',
        };
      
      case TileType.GRASS:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #58d68d 0%, #52be80 50%, #45b371 100%)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.1)',
        };
      
      case TileType.FOREST:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 50%, #196f3d 100%)',
          boxShadow: 'inset 0 0 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.05)',
        };
      
      case TileType.MOUNTAIN:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 50%, #6c6c6c 100%)',
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.1)',
        };
      
      case TileType.DESERT:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #f9e79f 0%, #f4d03f 50%, #f39c12 100%)',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.15)',
        };
      
      case TileType.SNOW:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #fdfefe 0%, #ecf0f1 50%, #d5dbdb 100%)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05), inset 0 3px 6px rgba(255,255,255,0.3)',
        };
      
      case TileType.WHEAT_FIELD:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #f9e79f 0%, #f7dc6f 50%, #f4d03f 100%)',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.08)',
        };
      
      case TileType.STONE_DEPOSIT:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #808b96 0%, #6c6c6c 50%, #5d6d7e 100%)',
          boxShadow: 'inset 0 0 12px rgba(0,0,0,0.25), inset 0 3px 6px rgba(255,255,255,0.1)',
        };
      
      case TileType.CLAY_PIT:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #e67e22 0%, #ca6f1e 50%, #af601a 100%)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.15)',
        };
      
      case TileType.SILVER_VEIN:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #d5dbdb 0%, #bdc3c7 50%, #aeb6bf 100%)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)',
        };
      
      case TileType.DENSE_FOREST:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #1e8449 0%, #145a32 50%, #0e3d22 100%)',
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.03)',
        };
      
      case TileType.RUINS:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #b7950b 0%, #9a7d0a 50%, #7d6608 100%)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.15)',
        };
      
      case TileType.OASIS:
        return {
          ...baseStyle,
          background: 'radial-gradient(circle at 50% 60%, #5dade2 0%, #5dade2 25%, #45b39d 25%, #45b39d 100%)',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.1)',
        };
      
      default:
        return baseStyle;
    }
  };

  const getDetails = () => {
    switch (type) {
      case TileType.WATER:
        return (
          <div className="absolute inset-0 opacity-20" style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 6px)',
          }} />
        );
      
      case TileType.GRASS:
        return (
          <>
            <div className="absolute" style={{
              bottom: '20%', left: '25%',
              width: '2px', height: '6px',
              background: 'rgba(39, 174, 96, 0.6)',
              borderRadius: '1px',
              boxShadow: '6px 2px 0 rgba(39, 174, 96, 0.5), 12px -1px 0 rgba(39, 174, 96, 0.4)',
            }} />
          </>
        );
      
      case TileType.FOREST:
        return (
          <div className="absolute" style={{
            top: '30%', left: '30%',
            width: '10px', height: '10px',
            background: 'rgba(20, 90, 50, 0.7)',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }} />
        );
      
      case TileType.MOUNTAIN:
        return (
          <div className="absolute" style={{
            top: '25%', left: '25%',
            width: '0', height: '0',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '12px solid rgba(93, 109, 126, 0.8)',
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
          }} />
        );
      
      case TileType.WHEAT_FIELD:
        return (
          <div className="absolute inset-0 opacity-30" style={{
            background: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(241, 196, 15, 0.5) 3px, rgba(241, 196, 15, 0.5) 4px)',
          }} />
        );
      
      case TileType.DENSE_FOREST:
        return (
          <>
            <div className="absolute" style={{
              top: '25%', left: '20%',
              width: '12px', height: '12px',
              background: 'rgba(14, 61, 34, 0.8)',
              borderRadius: '50%',
              boxShadow: '10px 4px 0 rgba(14, 61, 34, 0.7)',
            }} />
          </>
        );
      
      case TileType.SILVER_VEIN:
        return (
          <div className="absolute" style={{
            top: '35%', left: '35%',
            width: '5px', height: '5px',
            background: 'rgba(236, 240, 241, 0.8)',
            borderRadius: '50%',
            boxShadow: '0 0 6px rgba(236, 240, 241, 0.6)',
          }} />
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={getTileStyle()}>
      {getDetails()}
    </div>
  );
};

export default PixelTile;
