import { Game } from "./game/game.js";

document.addEventListener("DOMContentLoaded", async () => {
  await Game.initialize();
  Game.startGame();
});
