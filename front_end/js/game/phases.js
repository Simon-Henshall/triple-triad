import { DeckSelectionController } from "../phases/deck-selection/deck-selection-controller.js";
import HandSelectController from "../phases/hand-select/hand-select-controller.js";

export default {
  /**
   * Phase controller factory.
   * @param {Object} deps - Dependencies for phase controllers.
   * @return {Object} - Phase controllers.
   */
  "deck-selection": (deps) =>
    new DeckSelectionController(deps.deck, deps.playerManager),
  /**
   * Hand selection phase controller.
   * @param {Object} deps - Dependencies for phase controllers.
   * @return {Object} - Phase controllers.
   */
  "hand-select": (deps) => new HandSelectController(deps.playerManager),
};
