import { gameInit } from "./game/game-init.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    document.body.classList.add("loading");
    gameInit.all();
  } finally {
    document.body.classList.remove("loading");
  }
});
