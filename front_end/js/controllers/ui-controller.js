// -----------------------------------------------------------------------------
// File: front_end/js/renderers/UIController.js
// Purpose: coordinate UIManager state and UIRenderer drawing
// -----------------------------------------------------------------------------

import { UIManager } from "../managers/ui-manager.js";
import { UIRenderer } from "../renderers/ui-renderer.js";

export const UIController = {
  /**
   * Refresh info box + card counts.
   */
  updateInfoBox(card) {
    UIRenderer.updateInfoBox(card);
  },

  /**
   * TODO: UNCALLED
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
