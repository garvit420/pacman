import React from 'react';
import { CellType, Position, Ghost } from '../types';
import pacmanImage from '../assets/pacman.jpg';
import ghost1Image from '../assets/ghost_b1.jpg';
import ghost2Image from '../assets/ghost_b2.jpg';
import ghost3Image from '../assets/ghost_b3.jpg';

// Custom CSS to remove transparency grid
const imageStyle: React.CSSProperties = {
  backgroundColor: 'black',
  width: '100%',
  height: '100%',
  objectFit: 'contain' as 'contain'
};

interface GameBoardProps {
  maze: CellType[][];
  pacmanPosition: Position;
  ghosts: Ghost[];
}

const GameBoard: React.FC<GameBoardProps> = ({ maze, pacmanPosition, ghosts }) => {
  // Helper function to check if a position has a ghost
  const getGhostAtPosition = (row: number, col: number): Ghost | undefined => {
    return ghosts.find(ghost => ghost.position.row === row && ghost.position.col === col);
  };

  // Get ghost image based on imageId
  const getGhostImage = (imageId: number) => {
    switch (imageId) {
      case 1:
        return ghost1Image;
      case 2:
        return ghost2Image;
      case 3:
        return ghost3Image;
      default:
        return ghost1Image;
    }
  };

  const renderCell = (cell: CellType, row: number, col: number) => {
    // Base cell style
    const cellStyle: React.CSSProperties = {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #374151',
      backgroundColor: 'black'
    };
    
    // If this is pacman's position, render pacman
    if (row === pacmanPosition.row && col === pacmanPosition.col) {
      return (
        <div key={`${row}-${col}`} style={cellStyle}>
          <div style={{ width: '24px', height: '24px', position: 'relative' }}>
            <img 
              src={pacmanImage} 
              alt="Pacman" 
              style={imageStyle}
            />
          </div>
        </div>
      );
    }
    
    // Check if there's a ghost at this position
    const ghost = getGhostAtPosition(row, col);
    if (ghost) {
      return (
        <div key={`${row}-${col}`} style={cellStyle}>
          <div style={{ width: '24px', height: '24px', position: 'relative' }}>
            <img 
              src={getGhostImage(ghost.imageId)} 
              alt={`Ghost ${ghost.imageId}`} 
              style={imageStyle}
            />
          </div>
        </div>
      );
    }
    
    // Otherwise render based on cell type
    switch (cell) {
      case '#': // Wall
        return <div key={`${row}-${col}`} style={{ ...cellStyle, backgroundColor: '#1F2937' }}></div>;
      case '.': // Pellet
        return (
          <div key={`${row}-${col}`} style={cellStyle}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#60A5FA', borderRadius: '50%' }}></div>
          </div>
        );
      case 'E': // Exit
        return (
          <div key={`${row}-${col}`} style={{ ...cellStyle, backgroundColor: '#10B981' }}>
            E
          </div>
        );
      default: // Empty space
        return <div key={`${row}-${col}`} style={cellStyle}></div>;
    }
  };

  return (
    <div style={{ 
      display: 'inline-block', 
      backgroundColor: 'black', 
      padding: '4px', 
      border: '4px solid #1E3A8A'
    }}>
      {maze.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
