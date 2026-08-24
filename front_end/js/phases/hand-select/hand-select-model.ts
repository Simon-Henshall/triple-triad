import { Game } from "../../shared/game/game.js";
import { InfoBox } from "../../shared/ui/info-box.js";
import { CursorModel } from "../../shared/cursor/cursor-model.js";

/**
 * HandSelectModel class, responsible for managing the logical aspects of the player's hand selection phase.
 */
export default class HandSelectModel {
  /**
   * Initializes the HandSelectModel with a reference to the player model and sets up the selected index.
   * @param {Object} playerModel - instance of PlayerModel
   */
  constructor(playerModel) {
    this.playerModel = playerModel;
    this.selectedIndex = playerModel?.selectedCardNumber ?? 0;
  }

  /** Clamp and set the selected card index */
  setSelected(index) {
    if (!this.playerModel) {
      return;
    }
    const max = Math.max(0, this.playerModel.hand.length - 1);
    const clamped = Math.max(0, Math.min(index || 0, max));

    this.selectedIndex = clamped;
    this.playerModel.selectedCardNumber = clamped;
    this.playerModel.selectedCard = this.playerModel.hand[clamped];

    // Update visual selection and info box
    if (Game.views?.playerView) {
      Game.views.playerView.indentSelectedCard(this.playerModel.selectedCard);
    }
    InfoBox.updateInfoBox(Game, this.playerModel.selectedCard);

    // Keep the player-hand cursor visually in sync
    try {
      CursorModel.playerHand?.init?.();
    } catch {
      // swallow - cursor may be managed elsewhere
    }
  }

  /**
   * Select the next card in the hand, if possible
   */
  selectNext() {
    this.setSelected((this.selectedIndex || 0) + 1);
  }

  /**
   * Select the previous card in the hand, if possible
   */
  selectPrevious() {
    this.setSelected((this.selectedIndex || 0) - 1);
  }

  /** Convenience: initialise the logical cursor position */
  initCursor() {
    CursorModel.playerHand?.init?.();
  }
}
