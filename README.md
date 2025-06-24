# Pac-Man Graph Project

A modern implementation of the classic Pac-Man game built with React, TypeScript, and Tailwind CSS. This version features dynamic maze generation and ghost AI powered by graph algorithms.

## Game Overview

In this turn-based version of Pac-Man, you navigate through randomly generated mazes, collect pellets, and try to reach the exit while avoiding ghosts. Each game features a unique maze layout, providing a fresh challenge every time you play.

## How to Play

1. **Start the Game**: Choose the number of ghosts (1-5) from the start screen
2. **Controls**: Use WASD keys or the on-screen buttons to move Pac-Man
3. **Goal**: Collect pellets and reach the exit (marked with 'E')
4. **Avoid Ghosts**: If a ghost catches you, it's game over!

## Features

- **Dynamic Maze Generation**: Every game generates a new, unique 10x10 maze
- **Configurable Difficulty**: Choose between 1-5 ghosts
- **Intelligent Ghost AI**: Ghosts use BFS pathfinding to hunt you down
- **Score Tracking**: Earn points for collecting pellets and reaching the exit
- **Best Score**: The game tracks your best score for each ghost configuration
- **Turn-Based Gameplay**: Ghosts move after you do, with a 0.69-second delay
- **Responsive Design**: Built with Tailwind CSS for a clean, modern interface

## Game Mechanics

- **Pellets**: Each maze contains exactly 42 pellets worth 10 points each
- **Exit**: Reach the exit to win and earn 100 bonus points
- **Ghosts**: Ghosts will destroy pellets as they move through the maze
- **Connectivity**: All pellets and the exit are guaranteed to be reachable

## Technical Implementation

### Graph Algorithm: Breadth-First Search (BFS)

The ghost AI uses Breadth-First Search (BFS) to find the shortest path to Pac-Man. BFS was chosen for several key reasons:

1. **Guaranteed Shortest Path**: BFS always finds the shortest path in an unweighted graph, making the ghosts as efficient as possible in hunting down Pac-Man.

2. **Complete Solution**: BFS will always find a path if one exists, ensuring ghosts can navigate any valid maze configuration.

3. **Time Complexity**: With a time complexity of O(V + E) where V is the number of vertices (cells) and E is the number of edges (connections between cells), BFS is efficient for our grid-based maze.

4. **Space Efficiency**: While BFS requires more memory than depth-first search (DFS), our 10x10 maze is small enough that this isn't a concern.

5. **Predictable Behavior**: Unlike randomized algorithms, BFS creates predictable ghost movement patterns that players can learn and strategize against.

### Implementation Details

The BFS algorithm is implemented in `src/game/ai/GhostAI.ts`:

```typescript
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
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pacman-graph-project.git
cd pacman-graph-project
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) to play the game

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- HTML5 / CSS3

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the classic Pac-Man arcade game
- Built as a demonstration of graph algorithms in game development
