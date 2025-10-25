import { cards } from "./cards.js";
import { config } from "./config.js";
import { offsets } from "./offsets.js";
import { utils } from "./utils.js";
import { Game } from "./game.js";
import { ai } from "./ai.js";

export const aiHand = {
  /**
   * Populate the AI hand.
   */
  populate() {
    const hand = utils.shuffle([...cards]).slice(0, 5);
    ai.cardsInAIHand = [];

    hand.forEach((chosenCard, i) => {
      const cardContainer = utils.createCardContainer(
        chosenCard,
        "red",
        ai.handOffsetX || offsets.gameOffsetX / 2 || 100,
        (offsets.handOffsetY || 50) + i * (offsets.handCardOffset || 95),
        {
          showBack: true,
          frontImageSrc: config.cardPath + chosenCard.image + ".png",
          backImageSrc: config.cardPath + "back.png",
          onReady: () => Game.stage.update(),
        }
      );

      // Add to AI hand and stage
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
