import { gameInit } from "./game-init.js";
import { Game } from "./game/game.js";

document.addEventListener("DOMContentLoaded", () => {
  Game.bootstrap();
  gameInit.all();
});
