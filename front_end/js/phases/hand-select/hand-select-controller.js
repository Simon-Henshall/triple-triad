import { Game } from "../../shared/game/game.js";
import { BoardModel } from "../../shared/board/board-model.js";
import { InfoBox } from "../../shared/ui/info-box.js";
import { PhaseChecker } from "../../game/phases.js";

/**
 * HandSelectController class, responsible for managing the player's hand selection phase,
 * including handling input, updating the UI, and coordinating transitions to the placement phase.
 */
export default class HandSelectController {
  /**
   * Initializes the HandSelectController with necessary dependencies and sets up references.
   * @param {Object} localDeps - Local dependencies for the controller
   * @param {PlayerModel} localDeps.playerModel - The player model
   * @param {CursorController} localDeps.cursorController - The cursor controller
   * @param {HandUI} localDeps.handUI - The hand UI
   * @param {BoardModel} localDeps.boardModel - The board model
   */
  constructor(localDeps = {}, transition) {
    this.playerModel = localDeps.playerModel;
    this.cursorController = localDeps.cursorController;
    this.handUI = localDeps.handUI;
    this.boardModel = localDeps.boardModel;
    this.transition = transition;

    // make controller discoverable via Game.controllers
    Game.controllers = Game.controllers || {};
    Game.controllers.handSelectController = this;
  }

  /**
   * Activates the hand selection phase.
   */
  async activate() {
    PhaseChecker.playerChoosingCard = true;

    // Ensure player cursor and preview/indent are in the expected state
    if (Game.controllers?.cursorController?.playerHand?.place) {
      Game.controllers.cursorController.playerHand.place();
    }

    const selected =
      this.playerModel?.hand?.[this.playerModel.selectedCardNumber];
    if (selected) {
      Game.views.playerView.indentSelectedCard(selected);
      InfoBox.drawInfoBox(Game);
      InfoBox.updateInfoBox(Game, selected);
    }
  }

  /**
   * Deactivates the hand selection phase.
   */
  async deactivate() {
    PhaseChecker.playerChoosingCard = false;
  }

  /**
   * Triggered when the player confirms the selected hand card (Enter).
   * Prepares cursor/grid and requests transition to `placement` phase.
   */
  playSelectedCard() {
    const selectedIndex = this.playerModel?.selectedCardNumber ?? 0;
    const selectedCard = this.playerModel?.hand?.[selectedIndex];
    if (!selectedCard) {
      return console.warn("[HandSelectController] No card selected");
    }

    // Default to center cell
    BoardModel.selectedRow = 2;
    BoardModel.selectedColumn = 2;
    BoardModel.selectedSquare = 5;

    // Place grid cursor
    Game.controllers.cursorController.grid.place();

    // Hide info box and remove the visual player hand cursor
    InfoBox.toggleInfoBox(Game, false);
    Game.controllers.cursorController.playerHand.remove();
    Game.stage.removeChild(this.playerModel.playerHandCursor);

    PhaseChecker.playerSelectingPlacement = true;

    // Request phase transition to placement
    if (this.transition) {
      this.transition("placement", {
        selectedCard,
        selectedSquare: BoardModel.selectedSquare,
      });
    }
  }
}
