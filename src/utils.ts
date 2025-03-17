import { type Board, type Player, type AIDifficulty } from './types';

const WINNING_COMBINATIONS: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],           // Diagonals
];

// Check if there is a winner and return the winner and the winning line
export const checkWinner = (board: Board): { winner: Player | null; line: number[] | null } => {
  for (const line of WINNING_COMBINATIONS) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line };
    }
  }
  return { winner: null, line: null };
};

// Get the AI's next move based on the difficulty level
export const getAIMove = (board: Board, difficulty: AIDifficulty): number => {

  // Helper function to find available positions
  const getAvailablePositions = (): number[] =>
    board.reduce((acc, cell, index) => (cell ? acc : [...acc, index]), [] as number[]);

  // For easy difficulty, randomly pick an available position
  if (difficulty === 'easy' && Math.random() < 0.5) {
    const availablePositions = getAvailablePositions();
    return availablePositions[Math.floor(Math.random() * availablePositions.length)];
  }

  // Try to win (for medium or hard difficulties)
  if (difficulty !== 'easy') {
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        const testBoard = [...board];
        testBoard[i] = 'O';
        const { winner } = checkWinner(testBoard);
        if (winner === 'O') return i; // AI wins
      }
    }
  }

  // Block player's win (for medium or hard difficulties)
  if (difficulty !== 'easy') {
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        const testBoard = [...board];
        testBoard[i] = 'X';
        const { winner } = checkWinner(testBoard);
        if (winner === 'X') return i; // Block player from winning
      }
    }
  }

  // Strategic moves for hard difficulty
  if (difficulty === 'hard') {
    const strategicPositions = [4, 0, 2, 6, 8]; // Center and corners
    for (const pos of strategicPositions) {
      if (!board[pos]) return pos;
    }
  }

  // For medium difficulty, mix between strategic and random moves
  if (difficulty === 'medium' && Math.random() < 0.5) {
    const strategicPositions = [4, 0, 2, 6, 8]; // Center and corners
    for (const pos of strategicPositions) {
      if (!board[pos]) return pos;
    }
  }

  // If no specific strategy is chosen, pick a random available position
  const availablePositions = getAvailablePositions();
  return availablePositions[Math.floor(Math.random() * availablePositions.length)];
};
