import { Game } from './engine/Game.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 450;

const game = new Game(canvas, ctx);
game.start();