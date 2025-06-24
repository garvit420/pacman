import React from 'react';

interface GameOverProps {
  score: number;
  won: boolean;
  killedByGhost: boolean;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, won, killedByGhost, onRestart }) => {
  let message = "Game Over";
  
  if (won) {
    message = "You Win!";
  } else if (killedByGhost) {
    message = "You are Dead!";
  }
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-10">
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">
          {message}
        </h2>
        
        {/* Only show score if not killed by ghost */}
        {!killedByGhost && (
          <p className="text-xl mb-6">Final Score: {score}</p>
        )}
        
        <button
          onClick={onRestart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default GameOver;
