import { Game } from './engine/Game.js';

window.onload = () => {
  console.log('loaded');
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);
  game.start();
};
