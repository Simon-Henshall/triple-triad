import { Game } from "../../shared/game/game.js";
import { BoardModel } from "../../shared/board/board-model.js";
import { PhaseChecker } from "../../game/phases.js";
import HandSelectModel from "./hand-select-model.js";
import HandSelectView from "./hand-select-view.js";

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

    // model / view helpers for this phase
    this.model = new HandSelectModel(this.playerModel);
    this.view = new HandSelectView(this.playerModel);

    // make controller discoverable via Game.controllers
    Game.controllers = Game.controllers || {};
    Game.controllers.handSelectController = this;
  }

  /**
   * Activates the hand selection phase.
   */
  async activate() {
    PhaseChecker.playerChoosingCard = true;

    // initialise logical cursor position and present selection UI
    this.model.initCursor();
    this.view.show();
  }

  /**
   * Deactivates the hand selection phase.
   */
  async deactivate() {
    PhaseChecker.playerChoosingCard = false;
    this.view.hide();
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

    // Hide hand-select visuals
    this.view.hide();

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
