// Helper functions for the game

import { GameConfig } from '../types';

// Generate a key for storing best score based on configuration
export const getBestScoreKey = (config: GameConfig): string => {
  return `pacman-best-score-${config.gridSize}-${config.numGhosts}`;
};

// Get best score from localStorage for a specific configuration
export const getBestScore = (config: GameConfig): number => {
  const key = getBestScoreKey(config);
  const bestScore = localStorage.getItem(key);
  return bestScore ? parseInt(bestScore, 10) : 0;
};

// Save best score to localStorage for a specific configuration
export const saveBestScore = (score: number, config: GameConfig): void => {
  const key = getBestScoreKey(config);
  const currentBest = getBestScore(config);
  if (score > currentBest) {
    localStorage.setItem(key, score.toString());
  }
};

export {};
