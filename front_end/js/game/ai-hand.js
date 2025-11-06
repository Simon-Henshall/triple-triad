import { getGameStateInstance } from "./game.state.js";
import { ai } from "./ai.js";
import { Game } from "./game.js";
import { FlippingRenderer } from "../ui/flipping-renderer.js";
import { utilities } from "./utilities.js";
import { offsets } from "../constants/offsets.js";
import { config } from "../config.js";

export const aiHand = {
  /**
   * Populate the AI hand visually from GameState data.
   */
  populate() {
    const GameStateInstance = getGameStateInstance();

    // Lazily populate AI logical hand if empty
    if (GameStateInstance.hands.AI.length === 0) {
      // TODO: Update this to reference a stack of AI cards
      //GameStateInstance.hands.AI = utilities.shuffle([...allAiCards]).slice(0, 5);
      // Temporary placeholder: use player cards until AI deck logic added
      const playerManager = Game.managers.playerManager;
      GameStateInstance.hands.AI = utilities
        .shuffle([...playerManager.ownedCards])
        .slice(0, 5);
    }

    // Clear any existing containers from the stage (safety reset)
    if (ai.cardsInAIHand?.length) {
      for (const c of ai.cardsInAIHand) {
        Game.stage.removeChild(c);
      }
    }
    ai.cardsInAIHand = [];

    // Create new containers for each AI card
    for (const [index, card] of GameStateInstance.hands.AI.entries()) {
      const cardContainer = utilities.createCardContainer(
        card,
        "red",
        ai.handOffsetX || offsets.gameOffsetX / 2 || 100,
        (offsets.handOffsetY || 50) + index * (offsets.handCardOffset || 95),
        {
          showBack: true,
          frontImageSrc: config.cardPath + card.image + ".png",
          backImageSrc: config.cardPath + "back.png",
          onReady: () => Game.stage.update(),
        },
      );

      ai.cardsInAIHand.push(cardContainer);
      Game.stage.addChild(cardContainer);
    }

    // Flip AI hand if "open" rule applies
    if (Game.rules?.includes("open")) {
      const playerManager = Game.managers.playerManager;
      const flippingRenderer = new FlippingRenderer(playerManager);
      flippingRenderer.flipAIHand();
    }

    Game.stage.update();
  },
};
