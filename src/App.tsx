import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { type GameState, type AIDifficulty } from './types';
import { checkWinner, getAIMove } from './utils';

const MOVE_LIMIT = 3;

function App() {
  const [playWin] = useSound('https://assets.mixkit.co/active_storage/sfx/2000/2000.wav');
  const [playMove] = useSound('https://assets.mixkit.co/active_storage/sfx/1112/1112.wav');

  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    moves: { X: [], O: [] },
    scores: { X: 0, O: 0 },
    currentPlayer: 'X',
    winner: null,
    winningLine: null,
    gameMode: 'multi',
    aiDifficulty: 'medium',
    targetScore: 5,
  });

  const resetBoard = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      moves: { X: [], O: [] },
      currentPlayer: 'X',
      winner: null,
      winningLine: null,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      moves: { X: [], O: [] },
      scores: { X: 0, O: 0 },
      currentPlayer: 'X',
      winner: null,
      winningLine: null,
    }));
  }, []);

  const handleMove = useCallback((index: number) => {
    setGameState(prev => {
      if (prev.board[index] || prev.winner) return prev;

      const newBoard = [...prev.board];
      const currentMoves = [...prev.moves[prev.currentPlayer]];

      // Add new move
      newBoard[index] = prev.currentPlayer;
      currentMoves.push(index);

      // Remove oldest move if exceeding limit
      if (currentMoves.length > MOVE_LIMIT) {
        const oldestMove = currentMoves.shift();
        if (oldestMove !== undefined) {
          newBoard[oldestMove] = null;
        }
      }

      const { winner, line } = checkWinner(newBoard);
      const newScores = { ...prev.scores };

      if (winner) {
        newScores[winner]++;
        playWin();
      } else {
        playMove();
      }

      return {
        ...prev,
        board: newBoard,
        moves: {
          ...prev.moves,
          [prev.currentPlayer]: currentMoves,
        },
        scores: newScores,
        currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X',
        winner,
        winningLine: line,
      };
    });
  }, [playWin, playMove]);

  useEffect(() => {
    if (gameState.gameMode === 'single' && gameState.currentPlayer === 'O' && !gameState.winner) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(gameState.board, gameState.aiDifficulty);

        handleMove(aiMove);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameMode, gameState.currentPlayer, gameState.board, gameState.moves.O, gameState.winner, gameState.aiDifficulty, handleMove]);

  useEffect(() => {
    if (gameState.winner) {
      const timer = setTimeout(resetBoard, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.winner, resetBoard]);

  const toggleGameMode = () => {
    setGameState(prev => ({
      ...prev,
      gameMode: prev.gameMode === 'single' ? 'multi' : 'single',
    }));
    resetGame();
  };

  const setAIDifficulty = (difficulty: AIDifficulty) => {
    setGameState(prev => ({
      ...prev,
      aiDifficulty: difficulty,
    }));
    resetGame();
  };

  const setTargetScore = (score: number) => {
    setGameState(prev => ({
      ...prev,
      targetScore: score,
    }));
    resetGame();
  };

  const hasWinner = Object.values(gameState.scores).some(score => score >= gameState.targetScore);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Tic Tac Toe</h1>
        <div className="flex justify-center gap-8 text-2xl">
          <div>Player X: {gameState.scores.X}</div>
          <div>Player O: {gameState.scores.O}</div>
        </div>
        <div className="mt-2 text-sm text-gray-400">
          First to {gameState.targetScore} points wins!
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-3 gap-2 mb-8">
          {gameState.board.map((cell, index) => (
            <motion.button
              key={index}
              className={`w-24 h-24 bg-gray-800 rounded-lg text-4xl font-bold flex items-center justify-center
                ${gameState.winningLine?.includes(index) ? 'bg-green-600' : ''} 
                ${!cell && !gameState.winner ? 'hover:bg-gray-700' : ''}`}
              onClick={() => handleMove(index)}
              whileHover={!cell && !gameState.winner ? { scale: 1.05 } : {}}
              whileTap={!cell && !gameState.winner ? { scale: 0.95 } : {}}
              disabled={!!gameState.winner || (gameState.gameMode === 'single' && gameState.currentPlayer === 'O')}
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <motion.span
                    key={cell + index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={cell === 'X' ? 'text-blue-400' : 'text-red-400'}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {hasWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 rounded-lg"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                Player {Object.entries(gameState.scores).find(([_, score]) => score >= gameState.targetScore)?.[0]} Wins the Match!
              </h2>
              <button
                onClick={resetGame}
                className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-bold"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex gap-4 justify-center">
          <button
            onClick={toggleGameMode}
            className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-lg font-bold"
          >
            {gameState.gameMode === 'single' ? 'Switch to 2 Players' : 'Switch to AI Mode'}
          </button>
          <button
            onClick={resetGame}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-bold"
          >
            Reset Game
          </button>
        </div>

        {gameState.gameMode === 'single' && (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setAIDifficulty('easy')}
              className={`px-4 py-2 rounded-lg font-bold ${
                gameState.aiDifficulty === 'easy' ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setAIDifficulty('medium')}
              className={`px-4 py-2 rounded-lg font-bold ${
                gameState.aiDifficulty === 'medium' ? 'bg-yellow-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setAIDifficulty('hard')}
              className={`px-4 py-2 rounded-lg font-bold ${
                gameState.aiDifficulty === 'hard' ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Hard
            </button>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setTargetScore(3)}
            className={`px-4 py-2 rounded-lg font-bold ${
              gameState.targetScore === 3 ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Best of 3
          </button>
          <button
            onClick={() => setTargetScore(5)}
            className={`px-4 py-2 rounded-lg font-bold ${
              gameState.targetScore === 5 ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Best of 5
          </button>
          <button
            onClick={() => setTargetScore(9)}
            className={`px-4 py-2 rounded-lg font-bold ${
              gameState.targetScore === 9 ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Best of 9
          </button>
        </div>
      </div>

      <div className="mt-4 text-gray-400">
        Current Player: {gameState.currentPlayer}
        {gameState.gameMode === 'single' && gameState.currentPlayer === 'O' && ` (AI - ${gameState.aiDifficulty} mode)`}
      </div>
    </div>
  );
}

export default App;
