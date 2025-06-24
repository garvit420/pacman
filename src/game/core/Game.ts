import { CellType, Direction, GameState, Ghost, Position, GameConfig } from '../../types';
import { getNextGhostMove } from '../ai/GhostAI';
import { saveBestScore } from '../../utils/helpers';

// Initial maze layout
export const initialMaze: CellType[][] = [
  ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
  ['#', 'P', '.', '.', '.', '.', '.', '.', '.', '#'],
  ['#', '.', '#', '#', '#', '.', '#', '#', '.', '#'],
  ['#', '.', '.', '.', '.', '.', '.', '.', '.', '#'],
  ['#', '#', '#', '.', '#', '#', '.', '#', '.', '#'],
  ['#', '.', '.', '.', '.', '.', '.', '.', '.', '#'],
  ['#', '.', '#', '#', '#', '.', '#', '#', '.', '#'],
  ['#', '.', '.', '.', '.', '.', '.', '.', '.', '#'],
  ['#', '.', '#', '#', '#', '.', '#', '#', 'E', '#'],
  ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
];

// Count pellets in the maze
export const countPellets = (maze: CellType[][]): number => {
  let count = 0;
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[0].length; col++) {
      if (maze[row][col] === '.') {
        count++;
      }
    }
  }
  return count;
};

// Find Pac-Man's starting position
export const findPacmanPosition = (maze: CellType[][]): Position => {
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[0].length; col++) {
      if (maze[row][col] === 'P') {
        return { row, col };
      }
    }
  }
  return { row: 1, col: 1 }; // Default position if not found
};

// Find all positions with pellets
export const findPelletPositions = (maze: CellType[][]): Position[] => {
  const positions: Position[] = [];
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[0].length; col++) {
      if (maze[row][col] === '.') {
        positions.push({ row, col });
      }
    }
  }
  return positions;
};

// Generate random ghost positions
export const generateGhosts = (maze: CellType[][], count: number): Ghost[] => {
  const pelletPositions = findPelletPositions(maze);
  const ghosts: Ghost[] = [];
  
  // Ensure we don't try to create more ghosts than available positions
  const ghostCount = Math.min(count, pelletPositions.length);
  
  // Randomly select positions for ghosts
  for (let i = 0; i < ghostCount; i++) {
    const randomIndex = Math.floor(Math.random() * pelletPositions.length);
    const position = pelletPositions.splice(randomIndex, 1)[0];
    ghosts.push({ position });
  }
  
  return ghosts;
};

// Initialize game state with configurable number of ghosts
export const initializeGame = (numGhosts: number = 2): GameState => {
  // Create a deep copy of the initial maze
  const maze = JSON.parse(JSON.stringify(initialMaze));
  
  // Find Pac-Man's position and remove 'P' from maze
  const pacman = findPacmanPosition(maze);
  maze[pacman.row][pacman.col] = ' ';
  
  // Count pellets before placing ghosts
  const pelletCount = countPellets(maze);
  
  // Generate ghosts based on the specified count
  const ghosts = generateGhosts(maze, numGhosts);
  
  // Mark ghost positions in the maze
  ghosts.forEach(ghost => {
    maze[ghost.position.row][ghost.position.col] = 'G';
  });
  
  // Create game configuration
  const config: GameConfig = {
    gridSize: "10x10",
    numGhosts
  };
  
  return {
    maze,
    pacman,
    ghosts,
    score: 0,
    gameOver: false,
    gameWon: false,
    killedByGhost: false,
    pelletCount,
    collectedPellets: 0,
    lastGhostMove: Date.now(),
    config
  };
};

// Check if the move is valid
export const isValidMove = (maze: CellType[][], position: Position): boolean => {
  const { row, col } = position;
  
  // Check if position is within bounds
  if (row < 0 || row >= maze.length || col < 0 || col >= maze[0].length) {
    return false;
  }
  
  // Check if position is not a wall
  return maze[row][col] !== '#';
};

// Get new position based on direction
export const getNewPosition = (position: Position, direction: Direction): Position => {
  const { row, col } = position;
  
  switch (direction) {
    case 'up':
      return { row: row - 1, col };
    case 'down':
      return { row: row + 1, col };
    case 'left':
      return { row, col: col - 1 };
    case 'right':
      return { row, col: col + 1 };
    default:
      return { row, col };
  }
};

// Move Pac-Man
export const movePacman = (gameState: GameState, direction: Direction): GameState => {
  const { maze, pacman, ghosts, score, pelletCount, collectedPellets, config } = gameState;
  
  // Get new position based on direction
  const newPosition = getNewPosition(pacman, direction);
  
  // Check if the move is valid
  if (!isValidMove(maze, newPosition)) {
    return gameState;
  }
  
  // Check what's in the new position
  const cell = maze[newPosition.row][newPosition.col];
  let newScore = score;
  let newCollectedPellets = collectedPellets;
  let gameWon = false;
  
  // Handle pellet collection
  if (cell === '.') {
    newScore += 10;
    newCollectedPellets += 1;
    maze[newPosition.row][newPosition.col] = ' ';
  }
  
  // Handle exit - no pellet check required
  if (cell === 'E') {
    newScore += 100;
    gameWon = true;
    // Save best score immediately - only when winning
    saveBestScore(newScore, config);
  }
  
  // Move Pac-Man
  const newGameState: GameState = {
    ...gameState,
    pacman: newPosition,
    score: newScore,
    collectedPellets: newCollectedPellets,
    gameWon
  };
  
  // If game is won, return immediately
  if (gameWon) {
    return {
      ...newGameState,
      gameOver: true
    };
  }
  
  // Check for ghost collision
  const killedByGhost = ghosts.some(
    ghost => ghost.position.row === newPosition.row && ghost.position.col === newPosition.col
  );
  
  if (killedByGhost) {
    // Do NOT save best score when killed by ghost
    return {
      ...newGameState,
      gameOver: true,
      killedByGhost: true
    };
  }
  
  // Move ghosts after Pac-Man's move if it's time
  const currentTime = Date.now();
  if (currentTime - gameState.lastGhostMove >= 1000) {
    return {
      ...moveGhosts(newGameState),
      lastGhostMove: currentTime
    };
  }
  
  return newGameState;
};

// Move ghosts
export const moveGhosts = (gameState: GameState): GameState => {
  const { maze, pacman, ghosts } = gameState;
  
  // Create a temporary maze for pathfinding (without ghosts)
  const tempMaze = JSON.parse(JSON.stringify(maze));
  ghosts.forEach(ghost => {
    if (tempMaze[ghost.position.row][ghost.position.col] === 'G') {
      tempMaze[ghost.position.row][ghost.position.col] = ' ';
    }
  });
  
  // Move each ghost using BFS
  const newGhosts = ghosts.map(ghost => {
    const newPosition = getNextGhostMove(tempMaze, ghost.position, pacman);
    return { position: newPosition };
  });
  
  // Update the maze with new ghost positions
  const newMaze = JSON.parse(JSON.stringify(maze));
  // Clear previous ghost positions
  ghosts.forEach(ghost => {
    if (newMaze[ghost.position.row][ghost.position.col] === 'G') {
      newMaze[ghost.position.row][ghost.position.col] = ' ';
    }
  });
  
  // Set new ghost positions
  newGhosts.forEach(ghost => {
    if (newMaze[ghost.position.row][ghost.position.col] !== 'E') {
      newMaze[ghost.position.row][ghost.position.col] = 'G';
    }
  });
  
  // Check if any ghost caught Pac-Man
  const killedByGhost = newGhosts.some(
    ghost => ghost.position.row === pacman.row && ghost.position.col === pacman.col
  );
  
  // Do NOT save best score when killed by ghost
  
  return {
    ...gameState,
    maze: newMaze,
    ghosts: newGhosts,
    gameOver: killedByGhost,
    killedByGhost
  };
};
