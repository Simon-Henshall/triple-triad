import { gameInit } from "./shared/game/game-init.js";
import { fetchPlayerCards } from "./utilities/network.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    document.body.classList.add("loading");
    gameInit.all();
    fetchPlayerCards(1)
      .then((cards) => {
        console.log("Player cards:", cards);
      })
      .catch((error) => {
        console.error("Error fetching player cards:", error);
      });
  } finally {
    document.body.classList.remove("loading");
  }
});
