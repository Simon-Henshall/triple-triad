import { ui } from "./ui.js";
import { utils } from "./utils.js";
import { Game } from "./game.js";
import { getGameStateInstance } from "./game.state.js";
import { player } from "./player.js";

export const playerHand = {
  /**
   * Populate the player's hand with cards.
   * @param {Array<Object>} playerCards - Array of player-owned cards.
   */
  populate() {
    const GameStateInstance = getGameStateInstance();
    utils.togglePlayerTurn(); // TODO: Remove
    player.cardsInPlayerHand = GameStateInstance.getPlayerHandContainers(player.playerCards);
    player.cardsInPlayerHand.forEach((container) =>
      Game.stage.addChild(container)
    );

    // Default selection
    ui.selectedCard = player.cardsInPlayerHand[0];
    ui.previouslySelectedCard = [];

    // Indent chosen card
    player.indentSelectedCard();

    // Ready for player to choose
    ui.playerConfirming = false;
    ui.playerChoosingCard = true;

    Game.stage.update();
  },
};
