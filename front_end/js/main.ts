import { gameInit } from "./shared/game/game-init.js";
import { fetchPlayerCards, fetchOpponents } from "./utilities/network.js";

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
      console.warn("[main] Could not fetch player cards:", fetchError);
    }

    // Fetch opponents grouped by location
    let opponentLocations;
    try {
      const opponentsResponse = await fetchOpponents();
      if (opponentsResponse.success) {
        opponentLocations = opponentsResponse.opponents;
        const totalPlayers = opponentLocations.reduce(
          (sum, loc) => sum + loc.players.length,
          0,
        );
        console.log(
          `[main] Loaded ${opponentLocations.length} locations with ${totalPlayers} opponents`,
        );
      } else {
        console.warn(
          "[main] Opponents API returned success=false:",
          opponentsResponse.message,
        );
      }
    } catch (fetchError) {
      console.warn("[main] Could not fetch opponents:", fetchError);
    }

    // Initialise the game, passing API cards and opponent locations
    await gameInit.all(playerApiCards, opponentLocations);
  } finally {
    document.body.classList.remove("loading");
  }
});
