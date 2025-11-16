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
};
