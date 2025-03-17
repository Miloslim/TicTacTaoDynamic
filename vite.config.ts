import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Définition du chemin de base pour GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/TicTacTaoDynamic/',  
});
