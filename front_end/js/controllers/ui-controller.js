// -----------------------------------------------------------------------------
// File: front_end/js/ui/UIController.js
// Purpose: coordinate UIManager state and UIRenderer drawing
// -----------------------------------------------------------------------------

import { UIManager } from "../managers/ui-manager.js";
import { UIRenderer } from "../ui/ui-renderer.js";

export const UIController = {
  /**
   * Initialize board visuals.
   */
  init() {
    UIRenderer.addBackground();
    UIRenderer.drawCardCounts();
    UIRenderer.drawInfoBox();
  },

  /**
   * Refresh info box + card counts.
   */
  updateInfoBox() {
    UIRenderer.updateInfoBox();
  },

  /**
   * TODO: This method isn't called at all!
   * Update selected card in state and refresh display.
   * @param {object} card
   */
  selectCard(card) {
    UIManager.selectedCard = card;
    UIRenderer.updateInfoBox();
  },

  /**
   * Set player flags for interaction.
   */
  setPlayerState(state) {
    Object.assign(UIManager, state);
  },
};
