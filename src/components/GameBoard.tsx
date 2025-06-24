import React from 'react';
import { CellType, Position } from '../types';

interface GameBoardProps {
  maze: CellType[][];
  pacmanPosition: Position;
}

const GameBoard: React.FC<GameBoardProps> = ({ maze, pacmanPosition }) => {
  const renderCell = (cell: CellType, row: number, col: number) => {
    // Determine cell class based on content
    let cellClass = 'w-8 h-8 flex items-center justify-center border border-gray-700 ';
    
    // If this is pacman's position, render pacman
    if (row === pacmanPosition.row && col === pacmanPosition.col) {
      return (
        <div key={`${row}-${col}`} className={`${cellClass} bg-yellow-400 rounded-full`}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center">P</div>
        </div>
      );
    }
    
    // Otherwise render based on cell type
    switch (cell) {
      case '#': // Wall
        return <div key={`${row}-${col}`} className={`${cellClass} bg-gray-800`}></div>;
      case '.': // Pellet
        return (
          <div key={`${row}-${col}`} className={`${cellClass} bg-black`}>
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          </div>
        );
      case 'G': // Ghost
        return (
          <div key={`${row}-${col}`} className={`${cellClass} bg-red-500`}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center">G</div>
          </div>
        );
      case 'E': // Exit
        return <div key={`${row}-${col}`} className={`${cellClass} bg-green-500`}>E</div>;
      default: // Empty space
        return <div key={`${row}-${col}`} className={`${cellClass} bg-black`}></div>;
    }
  };

  return (
    <div className="inline-block bg-black p-1 border-4 border-blue-900">
      {maze.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
