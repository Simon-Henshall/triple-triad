import { getGameStateInstance } from "./game.state.js";
import { ai } from "./ai.js";
import { Game } from "./game.js";
import { flippingController } from "../render/flippingController.js";
import { utils } from "./utils.js";
import { offsets } from "../render/offsets.js";
import { config } from "../config.js";
import { player } from "../render/player.js";

export const aiHand = {
  /**
   * Populate the AI hand visually from GameState data.
   */
  populate() {
    const GameStateInstance = getGameStateInstance();

    // Lazily populate AI logical hand if empty
    if (!GameStateInstance.hands.AI.length) {
      // TODO: Update this to reference a stack of AI cards
      //GameStateInstance.hands.AI = utils.shuffle([...allAiCards]).slice(0, 5);
      // Temporary placeholder: use player cards until AI deck logic added
      GameStateInstance.hands.AI = utils.shuffle([...player.ownedCards]).slice(0, 5);
    }

    // Clear any existing containers from the stage (safety reset)
    if (ai.cardsInAIHand?.length) {
      ai.cardsInAIHand.forEach(c => Game.stage.removeChild(c));
    }
    ai.cardsInAIHand = [];

    // Create new containers for each AI card
    GameStateInstance.hands.AI.forEach((card, i) => {
      const cardContainer = utils.createCardContainer(
        card,
        "red",
        ai.handOffsetX || offsets.gameOffsetX / 2 || 100,
        (offsets.handOffsetY || 50) + i * (offsets.handCardOffset || 95),
        {
          showBack: true,
          frontImageSrc: config.cardPath + card.image + ".png",
          backImageSrc: config.cardPath + "back.png",
          onReady: () => Game.stage.update(),
        }
      );

      ai.cardsInAIHand.push(cardContainer);
      Game.stage.addChild(cardContainer);
    });

    // Flip AI hand if "open" rule applies
    if (Game.rules?.includes("open") && flippingController.flipAIHand) {
      flippingController.flipAIHand();
    }

    Game.stage.update();
  },
};
