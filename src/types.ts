export type CellType = '#' | '.' | 'P' | 'G' | 'E' | ' ';

export interface Position {
  row: number;
  col: number;
}

export interface Ghost {
  position: Position;
  imageId: number; // 1, 2, or 3 for the different ghost images
}

export interface GameConfig {
  gridSize: string; // e.g. "10x10"
  numGhosts: number;
}

export interface GameState {
  maze: CellType[][];
  pacman: Position;
  ghosts: Ghost[];
  score: number;
  gameOver: boolean;
  gameWon: boolean;
  killedByGhost: boolean;
  pelletCount: number;
  collectedPellets: number;
  lastGhostMove: number;
  config: GameConfig;
}

export type Direction = 'up' | 'down' | 'left' | 'right'; 