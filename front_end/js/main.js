import { gameInit } from "./shared/game/game-init.js";
import { fetchPlayerCards } from "./utilities/network.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    document.body.classList.add("loading");

    // Fetch player cards from the database before initialising the game
    let playerApiCards;
    try {
      const response = await fetchPlayerCards(1);
      if (response.success) {
        playerApiCards = response.cards;
        console.log(
          `[main] Loaded ${playerApiCards.length} player cards from DB`,
        );
      } else {
        console.warn("[main] API returned success=false:", response.message);
      }
    } catch (fetchError) {
      console.warn(
        "[main] Could not fetch player cards, using fallback:",
        fetchError,
      );
    }

    // Initialise the game, passing API cards if we got them
    await gameInit.all(playerApiCards);
  } finally {
    document.body.classList.remove("loading");
  }
});
