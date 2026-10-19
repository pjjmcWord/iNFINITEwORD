import React from 'react';
import { TileType } from '../utils/worldGen';

interface PixelTileProps {
  type: TileType;
  size?: number;
  variant?: number; // For visual variety
}

const PixelTile: React.FC<PixelTileProps> = ({ type, size = 44, variant = 0 }) => {
  const getTileStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: size,
      height: size,
      position: 'relative',
      overflow: 'hidden',
      imageRendering: 'pixelated',
    };

    switch (type) {
      case TileType.WATER:
        return {
          ...baseStyle,
          background: `
            linear-gradient(180deg, #21618c 0%, #2874a6 40%, #2e86c1 60%, #21618c 100%)
          `,
        };
      
      case TileType.COAST:
        return {
          ...baseStyle,
          background: `
            linear-gradient(180deg, #f4d03f 0%, #f4d03f 60%, #5dade2 60%, #5dade2 100%)
          `,
        };
      
      case TileType.GRASS:
        return {
          ...baseStyle,
          background: `
            linear-gradient(180deg, #52be80 0%, #45b371 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.1),
            inset 2px 2px 0 rgba(255,255,255,0.1),
            inset -2px -2px 0 rgba(0,0,0,0.1)
          `,
        };
      
      case TileType.FOREST:
        return {
          ...baseStyle,
          background: `
            linear-gradient(180deg, #1e8449 0%, #196f3d 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.2),
            inset 3px 3px 0 rgba(255,255,255,0.15),
            inset -3px -3px 0 rgba(0,0,0,0.2)
          `,
        };
      
      case TileType.MOUNTAIN:
        return {
          ...baseStyle,
          background: `
            linear-gradient(180deg, #808b96 0%, #6c6c6c 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.3),
            inset 4px 4px 0 rgba(255,255,255,0.2),
            inset -4px -4px 0 rgba(0,0,0,0.3)
          `,
        };
      
      case TileType.DESERT:
        return {
          ...baseStyle,
          background: `
            linear-gradient(180deg, #f9e79f 0%, #f4d03f 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.1),
            inset 2px 2px 0 rgba(255,255,255,0.2),
            inset -2px -2px 0 rgba(0,0,0,0.1)
          `,
        };
      
      case TileType.SNOW:
        return {
          ...baseStyle,
          background: `
            linear-gradient(180deg, #ecf0f1 0%, #d5dbdb 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.1),
            inset 3px 3px 0 rgba(255,255,255,0.5),
            inset -3px -3px 0 rgba(0,0,0,0.1)
          `,
        };
      
      case TileType.WHEAT_FIELD:
        return {
          ...baseStyle,
          background: `
            repeating-linear-gradient(
              90deg,
              #f9e79f 0px,
              #f9e79f 4px,
              #f4d03f 4px,
              #f4d03f 8px
            )
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.1),
            inset 2px 2px 0 rgba(255,255,255,0.2)
          `,
        };
      
      case TileType.STONE_DEPOSIT:
        return {
          ...baseStyle,
          background: `
            linear-gradient(135deg, #808b96 0%, #6c6c6c 50%, #5d6d7e 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.3),
            inset 4px 4px 0 rgba(255,255,255,0.25),
            inset -4px -4px 0 rgba(0,0,0,0.3),
            4px 4px 0 rgba(0,0,0,0.2)
          `,
        };
      
      case TileType.CLAY_PIT:
        return {
          ...baseStyle,
          background: `
            linear-gradient(180deg, #e67e22 0%, #ca6f1e 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.2),
            inset 3px 3px 0 rgba(255,255,255,0.2),
            inset -3px -3px 0 rgba(0,0,0,0.2)
          `,
        };
      
      case TileType.SILVER_VEIN:
        return {
          ...baseStyle,
          background: `
            linear-gradient(135deg, #bdc3c7 0%, #aeb6bf 50%, #95a5a6 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.2),
            inset 4px 4px 0 rgba(255,255,255,0.4),
            inset -4px -4px 0 rgba(0,0,0,0.2),
            0 0 8px rgba(189, 195, 199, 0.5)
          `,
        };
      
      case TileType.DENSE_FOREST:
        return {
          ...baseStyle,
          background: `
            linear-gradient(180deg, #145a32 0%, #0e3d22 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.3),
            inset 4px 4px 0 rgba(255,255,255,0.1),
            inset -4px -4px 0 rgba(0,0,0,0.3)
          `,
        };
      
      case TileType.RUINS:
        return {
          ...baseStyle,
          background: `
            linear-gradient(180deg, #9a7d0a 0%, #7d6608 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.2),
            inset 3px 3px 0 rgba(255,255,255,0.15),
            inset -3px -3px 0 rgba(0,0,0,0.2)
          `,
        };
      
      case TileType.OASIS:
        return {
          ...baseStyle,
          background: `
            radial-gradient(circle at 50% 60%, #5dade2 0%, #5dade2 30%, #45b39d 30%, #45b39d 100%)
          `,
          boxShadow: `
            inset 0 0 0 1px rgba(0,0,0,0.1),
            inset 2px 2px 0 rgba(255,255,255,0.2)
          `,
        };
      
      default:
        return baseStyle;
    }
  };

  const getPixelDetails = () => {
    const details: React.ReactNode[] = [];
    
    switch (type) {
      case TileType.WATER:
        // Add wave highlights
        details.push(
          <div key="wave1" className="absolute" style={{
            top: '30%',
            left: '10%',
            width: '12px',
            height: '2px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '2px',
            boxShadow: '0 8px 0 rgba(255,255,255,0.2), 16px 4px 0 rgba(255,255,255,0.25)',
            animation: 'waterFlow 4s ease-in-out infinite',
          }} />
        );
        break;
      
      case TileType.GRASS:
        // Add grass blades
        details.push(
          <div key="grass1" className="absolute" style={{
            bottom: '15%',
            left: '15%',
            width: '2px',
            height: '8px',
            background: '#27ae60',
            boxShadow: '6px 2px 0 #2ecc71, 12px -1px 0 #27ae60, 18px 1px 0 #2ecc71',
          }} />
        );
        details.push(
          <div key="grass2" className="absolute" style={{
            bottom: '25%',
            right: '20%',
            width: '2px',
            height: '6px',
            background: '#229954',
            boxShadow: '4px 1px 0 #27ae60',
          }} />
        );
        break;
      
      case TileType.FOREST:
        // Add tree tops
        details.push(
          <div key="tree1" className="absolute" style={{
            top: '25%',
            left: '25%',
            width: '10px',
            height: '10px',
            background: '#196f3d',
            borderRadius: '50%',
            boxShadow: '14px 2px 0 #145a32, 4px 12px 0 #196f3d',
          }} />
        );
        // Tree trunks
        details.push(
          <div key="trunk1" className="absolute" style={{
            top: '55%',
            left: '28%',
            width: '3px',
            height: '6px',
            background: '#6e4b1e',
            boxShadow: '14px 0 0 #6e4b1e',
          }} />
        );
        break;
      
      case TileType.MOUNTAIN:
        // Add mountain peaks
        details.push(
          <div key="peak1" className="absolute" style={{
            top: '15%',
            left: '20%',
            width: '0',
            height: '0',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '14px solid #5d6d7e',
          }} />
        );
        details.push(
          <div key="peak2" className="absolute" style={{
            top: '25%',
            right: '20%',
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '10px solid #6c6c6c',
          }} />
        );
        // Snow caps
        details.push(
          <div key="snow1" className="absolute" style={{
            top: '15%',
            left: '26%',
            width: '4px',
            height: '3px',
            background: '#ecf0f1',
          }} />
        );
        break;
      
      case TileType.WHEAT_FIELD:
        // Add wheat stalks
        details.push(
          <div key="wheat1" className="absolute" style={{
            bottom: '10%',
            left: '12%',
            width: '2px',
            height: '12px',
            background: '#d4ac0d',
            boxShadow: '8px 2px 0 #f39c12, 16px -1px 0 #d4ac0d, 24px 1px 0 #f39c12',
          }} />
        );
        // Wheat heads
        details.push(
          <div key="wheat2" className="absolute" style={{
            bottom: '75%',
            left: '11%',
            width: '4px',
            height: '4px',
            background: '#f1c40f',
            borderRadius: '50%',
            boxShadow: '8px 2px 0 #f1c40f, 16px -1px 0 #f1c40f, 24px 1px 0 #f1c40f',
          }} />
        );
        break;
      
      case TileType.DENSE_FOREST:
        // Dense trees
        details.push(
          <div key="dense1" className="absolute" style={{
            top: '20%',
            left: '15%',
            width: '12px',
            height: '12px',
            background: '#0e3d22',
            borderRadius: '50%',
            boxShadow: '16px 2px 0 #145a32, 8px 14px 0 #0e3d22',
          }} />
        );
        // Tree trunks
        details.push(
          <div key="trunk2" className="absolute" style={{
            top: '60%',
            left: '20%',
            width: '3px',
            height: '8px',
            background: '#4a2f1a',
            boxShadow: '16px 0 0 #4a2f1a',
          }} />
        );
        break;
      
      case TileType.STONE_DEPOSIT:
        // Stone chunks
        details.push(
          <div key="stone1" className="absolute" style={{
            top: '30%',
            left: '30%',
            width: '8px',
            height: '8px',
            background: '#5d6d7e',
            boxShadow: '10px 0 0 #5d6d7e, 5px 8px 0 #5d6d7e',
          }} />
        );
        break;
      
      case TileType.SILVER_VEIN:
        // Silver sparkles
        details.push(
          <div key="silver1" className="absolute" style={{
            top: '30%',
            left: '30%',
            width: '5px',
            height: '5px',
            background: '#ecf0f1',
            borderRadius: '50%',
            boxShadow: '10px 2px 0 #bdc3c7, 5px 8px 0 #ecf0f1, 15px 10px 0 #bdc3c7',
            animation: 'sparkle 2s ease-in-out infinite',
          }} />
        );
        // Rock formation
        details.push(
          <div key="rock1" className="absolute" style={{
            top: '50%',
            left: '25%',
            width: '8px',
            height: '6px',
            background: '#7f8c8d',
            boxShadow: '12px 0 0 #95a5a6',
          }} />
        );
        break;
      
      case TileType.OASIS:
        // Palm tree
        details.push(
          <div key="palm1" className="absolute" style={{
            top: '20%',
            left: '40%',
            width: '2px',
            height: '12px',
            background: '#6e4b1e',
          }} />
        );
        details.push(
          <div key="palm2" className="absolute" style={{
            top: '18%',
            left: '35%',
            width: '12px',
            height: '6px',
            background: '#27ae60',
            borderRadius: '50%',
          }} />
        );
        break;
    }
    
    return details;
  };

  return (
    <div style={getTileStyle()}>
      {getPixelDetails()}
    </div>
  );
};

export default PixelTile;
