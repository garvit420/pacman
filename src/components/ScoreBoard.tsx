import React, { useEffect, useState } from 'react';
import { getBestScore } from '../utils/helpers';
import { GameConfig } from '../types';

interface ScoreBoardProps {
  score: number;
  collectedPellets: number;
  totalPellets: number;
  gameRestarted: number;
  config: GameConfig;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ 
  score, 
  collectedPellets, 
  totalPellets, 
  gameRestarted,
  config
}) => {
  const [bestScore, setBestScore] = useState(0);

  // Refresh best score when component mounts, game restarts, or config changes
  useEffect(() => {
    setBestScore(getBestScore(config));
  }, [gameRestarted, config]);

  return (
    <div className="flex justify-between items-center w-full bg-gray-800 text-white p-4 mb-4 rounded-md">
      <div className="text-xl font-bold">Score: {score}</div>
      <div className="text-xl font-bold text-yellow-400">Best: {bestScore}</div>
      <div>
        Pellets: {collectedPellets}/{totalPellets}
      </div>
    </div>
  );
};

export default ScoreBoard;
