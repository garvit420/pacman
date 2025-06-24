import { CellType, Direction, GameState, Ghost, Position, GameConfig } from '../../types';
import { getNextGhostMove } from '../ai/GhostAI';
import { saveBestScore } from '../../utils/helpers';

// Ghost movement speed in milliseconds
export const GHOST_MOVE_INTERVAL = 690; // 0.69 seconds

// Check if a position is within the bounds of the maze
const isInBounds = (position: Position, rows: number, cols: number): boolean => {
  return position.row >= 0 && position.row < rows && position.col >= 0 && position.col < cols;
};

// Generate a random maze with exactly 42 pellets
export const generateMaze = (rows: number = 10, cols: number = 10): CellType[][] => {
  // Create a maze with walls on the perimeter
  const maze: CellType[][] = Array(rows)
    .fill(null)
    .map((_, rowIndex) => 
      Array(cols)
        .fill(null)
        .map((_, colIndex) => {
          if (rowIndex === 0 || rowIndex === rows - 1 || colIndex === 0 || colIndex === cols - 1) {
            return '#'; // Wall on the perimeter
          }
          return ' '; // Empty space inside
        })
    );
  
  // Place Pacman at the top-left corner (inside the perimeter)
  maze[1][1] = 'P';
  
  // Place exit at the bottom-right corner (inside the perimeter)
  maze[rows - 2][cols - 2] = 'E';
  
  // Create a grid of walls with guaranteed paths
  for (let row = 2; row < rows - 2; row += 2) {
    for (let col = 2; col < cols - 2; col += 2) {
      // Place a wall
      maze[row][col] = '#';
      
      // Create a random path by removing one adjacent wall
      // This ensures the maze is fully connected
      const directions = [
        { row: -1, col: 0 }, // up
        { row: 0, col: 1 },  // right
        { row: 1, col: 0 },  // down
        { row: 0, col: -1 }, // left
      ];
      
      // Shuffle directions
      for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }
      
      // Try each direction until we find one that doesn't interfere with Pacman or Exit
      for (const dir of directions) {
        const wallRow = row + dir.row;
        const wallCol = col + dir.col;
        
        // Skip if this would affect Pacman or Exit positions
        if ((wallRow === 1 && wallCol === 1) || (wallRow === rows - 2 && wallCol === cols - 2)) {
          continue;
        }
        
        // Place a random wall or leave it open
        if (Math.random() < 0.65) { // 65% chance of placing a wall
          maze[wallRow][wallCol] = '#';
        }
      }
    }
  }
  
  // Add exactly 42 pellets
  const availableSpaces: Position[] = [];
  
  for (let row = 1; row < rows - 1; row++) {
    for (let col = 1; col < cols - 1; col++) {
      if (maze[row][col] === ' ' && !(row === 1 && col === 1) && !(row === rows - 2 && col === cols - 2)) {
        availableSpaces.push({ row, col });
      }
    }
  }
  
  // Shuffle available spaces
  for (let i = availableSpaces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableSpaces[i], availableSpaces[j]] = [availableSpaces[j], availableSpaces[i]];
  }
  
  // Place 42 pellets
  const pelletCount = Math.min(42, availableSpaces.length);
  for (let i = 0; i < pelletCount; i++) {
    const position = availableSpaces[i];
    maze[position.row][position.col] = '.';
  }
  
  // Ensure all pellets are connected and reachable from Pacman
  let attempts = 0;
  while (!arePelletsConnected(maze) && attempts < 15) {
    // If pellets aren't connected, remove some walls to create paths
    const wallPositions: Position[] = [];
    
    // Find all walls that are not on the perimeter
    for (let row = 1; row < rows - 1; row++) {
      for (let col = 1; col < cols - 1; col++) {
        if (maze[row][col] === '#') {
          wallPositions.push({ row, col });
        }
      }
    }
    
    // Remove some random walls
    const wallsToRemove = Math.min(5, wallPositions.length);
    for (let i = 0; i < wallsToRemove; i++) {
      if (wallPositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * wallPositions.length);
        const wallPos = wallPositions.splice(randomIndex, 1)[0];
        maze[wallPos.row][wallPos.col] = ' ';
      }
    }
    
    attempts++;
  }
  
  // If we still don't have connectivity after multiple attempts,
  // create a direct path from Pacman to the exit
  if (!arePelletsConnected(maze)) {
    // Create a simple path from Pacman to exit
    const pacmanPos = { row: 1, col: 1 };
    const exitPos = { row: rows - 2, col: cols - 2 };
    
    // Horizontal path first
    for (let col = pacmanPos.col; col <= exitPos.col; col++) {
      if (maze[pacmanPos.row][col] === '#') {
        maze[pacmanPos.row][col] = ' ';
      }
    }
    
    // Then vertical path
    for (let row = pacmanPos.row; row <= exitPos.row; row++) {
      if (maze[row][exitPos.col] === '#') {
        maze[row][exitPos.col] = ' ';
      }
    }
  }
  
  // Make sure we have exactly 42 pellets
  const currentPelletCount = countPellets(maze);
  
  if (currentPelletCount < 42) {
    // Add more pellets if needed
    const emptySpaces: Position[] = [];
    for (let row = 1; row < rows - 1; row++) {
      for (let col = 1; col < cols - 1; col++) {
        if (maze[row][col] === ' ' && !(row === 1 && col === 1) && !(row === rows - 2 && col === cols - 2)) {
          emptySpaces.push({ row, col });
        }
      }
    }
    
    // Shuffle and add pellets
    for (let i = emptySpaces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emptySpaces[i], emptySpaces[j]] = [emptySpaces[j], emptySpaces[i]];
    }
    
    for (let i = 0; i < 42 - currentPelletCount && i < emptySpaces.length; i++) {
      const pos = emptySpaces[i];
      maze[pos.row][pos.col] = '.';
    }
  } else if (currentPelletCount > 42) {
    // Remove excess pellets if needed
    const pelletPositions = findPelletPositions(maze);
    for (let i = 0; i < currentPelletCount - 42; i++) {
      if (pelletPositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * pelletPositions.length);
        const pelletPos = pelletPositions.splice(randomIndex, 1)[0];
        maze[pelletPos.row][pelletPos.col] = ' ';
      }
    }
  }
  
  return maze;
};

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

// BFS to check if all pellets and the exit are reachable from Pacman
const arePelletsConnected = (maze: CellType[][]): boolean => {
  const rows = maze.length;
  const cols = maze[0].length;
  
  // Find Pacman's position
  const pacmanPos = findPacmanPosition(maze);
  
  // Find all pellet positions
  const pelletPositions = findPelletPositions(maze);
  
  if (pelletPositions.length === 0) return true;
  
  // Start BFS from Pacman's position
  const queue: Position[] = [pacmanPos];
  const visited: boolean[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  
  visited[pacmanPos.row][pacmanPos.col] = true;
  let visitedPellets = 0;
  let exitReached = false;
  
  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    for (const dir of directions) {
      const newRow = current.row + dir.row;
      const newCol = current.col + dir.col;
      
      if (
        isInBounds({ row: newRow, col: newCol }, rows, cols) &&
        maze[newRow][newCol] !== '#' &&
        !visited[newRow][newCol]
      ) {
        visited[newRow][newCol] = true;
        queue.push({ row: newRow, col: newCol });
        
        if (maze[newRow][newCol] === '.') {
          visitedPellets++;
        }
        
        if (maze[newRow][newCol] === 'E') {
          exitReached = true;
        }
      }
    }
  }
  
  // Check if all pellets were visited and the exit was reached
  return visitedPellets === pelletPositions.length && exitReached;
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
    
    // Assign a random ghost image (1, 2, or 3)
    const imageId = Math.floor(Math.random() * 3) + 1;
    
    ghosts.push({ 
      position,
      imageId 
    });
  }
  
  return ghosts;
};

// Initialize game state with configurable number of ghosts
export const initializeGame = (numGhosts: number = 2): GameState => {
  // Generate a new random maze instead of using the hardcoded one
  const maze = generateMaze(10, 10);
  
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
  if (currentTime - gameState.lastGhostMove >= GHOST_MOVE_INTERVAL) {
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
    return { 
      position: newPosition,
      imageId: ghost.imageId // Preserve the ghost's imageId
    };
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
