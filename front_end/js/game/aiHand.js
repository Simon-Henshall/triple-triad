import { getGameStateInstance } from "./game.state.js";
import { ai } from "./ai.js";
import { player } from "../render/player.js";
import { Game } from "./game.js";
import { flippingController } from "../render/flippingController.js";
import { utils } from "./utils.js";

export const aiHand = {
  populate() {
    const GameStateInstance = getGameStateInstance();

    // Lazily populate AI cards if empty
    if (!GameStateInstance.hands.AI.length) {
      // TODO: Update this to reference a stack of AI cards
      //GameStateInstance.hands.AI = utils.shuffle([...allAiCards]).slice(0, 5);
      GameStateInstance.hands.AI = utils
        .shuffle([...player.ownedCards])
        .slice(0, 5);
    }

    ai.cardsInAIHand = GameStateInstance.getAiHandContainers();

    ai.cardsInAIHand.forEach((container) => Game.stage.addChild(container));

    // Flip AI hand if "open" rule applies
    if (Game.rules?.includes("open") && flippingController.flipAIHand) {
      flippingController.flipAIHand();
    }

    Game.stage.update();
  },
};
