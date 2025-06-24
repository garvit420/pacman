import React from 'react';
import { Direction } from '../types';

interface ControlsProps {
  onMove: (direction: Direction) => void;
}

const Controls: React.FC<ControlsProps> = ({ onMove }) => {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 max-w-xs mx-auto">
      <div className="col-start-2">
        <button
          onClick={() => onMove('up')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          W
        </button>
      </div>
      <div className="col-start-1">
        <button
          onClick={() => onMove('left')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          A
        </button>
      </div>
      <div className="col-start-2">
        <button
          onClick={() => onMove('down')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          S
        </button>
      </div>
      <div className="col-start-3">
        <button
          onClick={() => onMove('right')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          D
        </button>
      </div>
    </div>
  );
};

export default Controls;
