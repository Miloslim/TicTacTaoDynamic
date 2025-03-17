export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];
export type GameMode = 'single' | 'multi';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type GameState = {
  board: Board;
  moves: {
    X: number[];
    O: number[];
  };
  scores: {
    X: number;
    O: number;
  };
  currentPlayer: Player;
  winner: Player | null;
  winningLine: number[] | null;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  targetScore: number;
};