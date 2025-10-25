import { offsets } from "./offsets.js";
import { ui } from "./ui.js";
import { utils } from "./utils.js";
import { Game } from "./game.js";
import { player } from "./player.js";

export const playerHand = {
  /**
   * Populate the player's hand with cards.
   * @param {Array<Object>} playerCards - Array of player-owned cards.
   */
  populate(playerCards) {
    utils.togglePlayerTurn();
    const hand = utils.shuffle([...playerCards]).slice(0, 5);
    player.cardsInPlayerHand = [];

    hand.forEach((chosenCard, i) => {
      const cardContainer = utils.createCardContainer(
        chosenCard,
        utils.getPlayerTurn(),
        player.handOffsetX,
        offsets.handOffsetY + i * (offsets.handCardOffset || 95),
        { onReady: () => Game.stage.update() }
      );

      player.cardsInPlayerHand.push(cardContainer);
      Game.stage.addChild(cardContainer);
    });

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
