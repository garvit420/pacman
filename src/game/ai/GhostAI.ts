import { CellType, Position } from '../../types';

interface QueueNode {
  position: Position;
  path: Position[];
}

// BFS algorithm to find shortest path from ghost to pacman
export const findShortestPath = (
  maze: CellType[][],
  start: Position,
  target: Position
): Position[] => {
  const rows = maze.length;
  const cols = maze[0].length;
  
  // Queue for BFS
  const queue: QueueNode[] = [];
  
  // Visited cells to avoid cycles
  const visited: boolean[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  
  // Add starting position to queue
  queue.push({ position: start, path: [start] });
  visited[start.row][start.col] = true;
  
  // Possible movement directions: up, right, down, left
  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];
  
  // BFS loop
  while (queue.length > 0) {
    const { position, path } = queue.shift()!;
    
    // Check if we reached the target
    if (position.row === target.row && position.col === target.col) {
      return path;
    }
    
    // Try all four directions
    for (const dir of directions) {
      const newRow = position.row + dir.row;
      const newCol = position.col + dir.col;
      
      // Check if the new position is valid
      if (
        newRow >= 0 && 
        newRow < rows && 
        newCol >= 0 && 
        newCol < cols && 
        maze[newRow][newCol] !== '#' && 
        !visited[newRow][newCol]
      ) {
        const newPosition = { row: newRow, col: newCol };
        const newPath = [...path, newPosition];
        
        queue.push({ position: newPosition, path: newPath });
        visited[newRow][newCol] = true;
      }
    }
  }
  
  // No path found
  return [];
};

// Get next move for a ghost based on BFS path
export const getNextGhostMove = (
  maze: CellType[][],
  ghostPosition: Position,
  pacmanPosition: Position
): Position => {
  const path = findShortestPath(maze, ghostPosition, pacmanPosition);
  
  // If path exists and has at least 2 positions (current + next)
  if (path.length >= 2) {
    return path[1]; // Return the next position in the path
  }
  
  // If no path found, stay in place
  return ghostPosition;
};
