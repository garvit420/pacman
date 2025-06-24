import React, { useState } from 'react';

interface StartScreenProps {
  onStart: (numGhosts: number) => void;
  defaultGhosts?: number;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, defaultGhosts = 2 }) => {
  const [numGhosts, setNumGhosts] = useState(defaultGhosts);
  
  return (
    <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg text-center">
      <h1 className="text-3xl font-bold mb-4">Pac-Man</h1>
      <div className="mb-6">
        <p>Use WASD keys to move Pac-Man.</p>
        <p>Collect all pellets</p>
        <p>and reach the exit to win!</p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="ghost-select" className="block mb-2">
          Number of Ghosts:
        </label>
        <select 
          id="ghost-select"
          value={numGhosts}
          onChange={(e) => setNumGhosts(parseInt(e.target.value, 10))}
          className="bg-gray-700 text-white px-4 py-2 rounded w-full"
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </div>
      
      <button
        onClick={() => onStart(numGhosts)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
      >
        Start Game
      </button>
    </div>
  );
};

export default StartScreen;
