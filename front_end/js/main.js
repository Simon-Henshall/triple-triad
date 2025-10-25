import { gameInit } from './gameInit.js';
import { Game } from './game.js';

document.addEventListener("DOMContentLoaded", () => {
  Game.bootstrap();
  gameInit.all();
});