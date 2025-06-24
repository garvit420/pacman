import React, { useEffect, useState, useCallback, useRef } from 'react';
import './App.css';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import Controls from './components/Controls';
import GameOver from './components/GameOver';
import StartScreen from './components/StartScreen';
import ConfigDisplay from './components/ConfigDisplay';
import { Direction, GameState } from './types';
import { initializeGame, movePacman, moveGhosts } from './game/core/Game';
import { saveBestScore } from './utils/helpers';

function App() {
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [gameStarted, setGameStarted] = useState(false);
  const [restartCounter, setRestartCounter] = useState(0);
  const ghostTimerRef = useRef<number | null>(null);

  // Setup ghost movement timer
  useEffect(() => {
    if (gameStarted && !gameState.gameOver) {
      // Clear any existing timer
      if (ghostTimerRef.current) {
        clearInterval(ghostTimerRef.current);
      }
      
      // Set new timer for ghost movement (every 1 second)
      ghostTimerRef.current = window.setInterval(() => {
        setGameState(prevState => {
          const currentTime = Date.now();
          if (currentTime - prevState.lastGhostMove >= 1000) {
            const newState = moveGhosts(prevState);
            return {
              ...newState,
              lastGhostMove: currentTime
            };
          }
          return prevState;
        });
      }, 1000);
    }
    
    // Clean up timer on unmount or game over
    return () => {
      if (ghostTimerRef.current) {
        clearInterval(ghostTimerRef.current);
        ghostTimerRef.current = null;
      }
    };
  }, [gameStarted, gameState.gameOver]);

  // Save best score when game is won (not when killed by ghost)
  useEffect(() => {
    if (gameState.gameOver) {
      // Only save best score if the player won
      if (gameState.gameWon) {
        saveBestScore(gameState.score, gameState.config);
      }
      
      // Clear ghost timer
      if (ghostTimerRef.current) {
        clearInterval(ghostTimerRef.current);
        ghostTimerRef.current = null;
      }
    }
  }, [gameState.gameOver, gameState.score, gameState.gameWon, gameState.config]);

  const handleMove = useCallback((direction: Direction) => {
    if (!gameStarted || gameState.gameOver) return;
    
    const newGameState = movePacman(gameState, direction);
    setGameState(newGameState);
  }, [gameState, gameStarted]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gameStarted || gameState.gameOver) return;

      switch (event.key.toLowerCase()) {
        case 'w':
          handleMove('up');
          break;
        case 'a':
          handleMove('left');
          break;
        case 's':
          handleMove('down');
          break;
        case 'd':
          handleMove('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, gameStarted, handleMove]);

  const handleRestart = () => {
    // Restart with the same number of ghosts as before
    setGameState(initializeGame(gameState.config.numGhosts));
    setRestartCounter(prev => prev + 1);
    setGameStarted(true);
  };

  const handleStart = (numGhosts: number) => {
    setGameState(initializeGame(numGhosts));
    setGameStarted(true);
  };

  const handleBack = () => {
    // Clear any existing timer
    if (ghostTimerRef.current) {
      clearInterval(ghostTimerRef.current);
      ghostTimerRef.current = null;
    }
    
    // Return to start screen
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4">
      {!gameStarted ? (
        <StartScreen onStart={handleStart} defaultGhosts={2} />
      ) : (
        <>
          <div className="w-full max-w-md flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Pac-Man</h1>
            <button 
              onClick={handleBack}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back
            </button>
          </div>
          
          <ConfigDisplay config={gameState.config} />
          
          <div className="relative">
            <ScoreBoard 
              score={gameState.score} 
              collectedPellets={gameState.collectedPellets} 
              totalPellets={gameState.pelletCount}
              gameRestarted={restartCounter}
              config={gameState.config}
            />
            
            <GameBoard maze={gameState.maze} pacmanPosition={gameState.pacman} />
            
            <Controls onMove={handleMove} />
            
            {gameState.gameOver && (
              <GameOver 
                score={gameState.score} 
                won={gameState.gameWon}
                killedByGhost={gameState.killedByGhost}
                onRestart={handleRestart} 
              />
            )}
          </div>
          
          <div className="mt-8 text-sm text-gray-400">
            <p>Use WASD keys or the buttons to move Pac-Man</p>
            <p>Collect all pellets and reach the exit to win!</p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
