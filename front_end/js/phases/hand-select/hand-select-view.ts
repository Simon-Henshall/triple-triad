import { Game } from "../../shared/game/game.js";
import { InfoBox } from "../../shared/ui/info-box.js";

/**
 * HandSelectView class, responsible for managing the visual aspects of the player's hand selection phase,
 * including displaying the selection cursor and updating the info box with the currently selected card.
 */
export default class HandSelectView {
  /**
   * Initializes the HandSelectView with a reference to the player model.
   * @param {Object} playerModel - instance of PlayerModel
   */
  constructor(playerModel) {
    this.playerModel = playerModel;
  }

  /** Show visuals for hand selection (cursor + info box) */
  show() {
    if (Game.controllers?.cursorController?.playerHand?.place) {
      Game.controllers.cursorController.playerHand.place();
    }
    InfoBox.drawInfoBox(Game);
    InfoBox.updateInfoBox(
      Game,
      this.playerModel?.hand?.[this.playerModel.selectedCardNumber],
    );
  }

  /** Hide any hand-selection visuals */
  hide() {
    if (Game.controllers?.cursorController?.playerHand?.remove) {
      Game.controllers.cursorController.playerHand.remove();
    }
    InfoBox.toggleInfoBox(Game, false);
  }

  /** Update selection visuals when the chosen card changes */
  updateSelection(selectedCard) {
    if (Game.views?.playerView) {
      Game.views.playerView.indentSelectedCard(selectedCard);
    }
    InfoBox.updateInfoBox(Game, selectedCard);
  }
}
