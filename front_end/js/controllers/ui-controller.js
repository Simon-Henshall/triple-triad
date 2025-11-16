import { UIRenderer } from "../renderers/ui-renderer.js";

export const UIController = {
  /**
   * Refresh info box + card counts.
   */
  updateInfoBox(card) {
    UIRenderer.updateInfoBox(card);
  },
};
