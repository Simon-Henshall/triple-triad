import { OpponentSelectionView } from "./opponent-selection-view.js";
import OpponentSelectionModel from "./opponent-selection-model.js";
import { Game } from "../../shared/game/game.js";
import { PhaseChecker } from "../../game/phases.js";

/**
 * Controller for the opponent selection phase.
 * Manages showing/hiding the dialog, handling navigation,
 * and confirming the opponent selection.
 */
export class OpponentSelectionController {
  /**
   * Creates an OpponentSelectionController.
   * @param {Array} locations - Array of { name, players[] } objects
   * @param {Function} transition - State machine transition callback
   * @param {Object} [callbacks] - Optional callbacks
   * @param {Function} [callbacks.onOpponentSelected] - Async callback invoked with selected opponent before transitioning
   */
  constructor(locations, transition, callbacks = {}) {
    this.model = new OpponentSelectionModel(locations);
    this.transition = transition;
    this.callbacks = callbacks;
    this.view = OpponentSelectionView;
    this.view.model = this.model;
  }

  /**
   * Called by the state machine when this phase becomes active.
   */
  activate() {
    console.log("[Opponent Selection] Phase activated.");
    PhaseChecker.playerSelectingOpponent = true;
    this.show();
  }

  /**
   * Called by the state machine when leaving this phase.
   */
  deactivate() {
    PhaseChecker.playerSelectingOpponent = false;
    this.hide();
  }

  /**
   * Display the opponent selection dialog.
   */
  show() {
    this.view.show();
    Game.stage.addChild(this.view.container);
    Game.stage.update();
  }

  /**
   * Hide the opponent selection dialog.
   */
  hide() {
    if (this.view.container && Game.stage) {
      Game.stage.removeChild(this.view.container);
    }
    this.view.hide();
  }

  /**
   * Handle a navigation action.
   * @param {"left"|"right"|"up"|"down"} direction
   */
  navigate(direction) {
    this.model.handleInput(direction);
    this.view.refresh();
    Game.stage.update();
  }

  /**
   * Confirm the current opponent selection.
   * Invokes the onOpponentSelected callback (which fetches cards and sets up AI),
   * then transitions to rules.
   */
  async confirm() {
    const player = this.model.selectedPlayer;
    if (!player) {
      console.warn("[Opponent Selection] No player selected.");
      return;
    }

    console.log(
      `[Opponent Selection] Opponent selected: "${player.name}" (${player.location})`,
    );

    this.hide();

    // Perform async setup (fetch opponent cards, create AI deck, populate hand)
    try {
      if (this.callbacks.onOpponentSelected) {
        await this.callbacks.onOpponentSelected(player);
      }
    } catch (error) {
      console.error("[Opponent Selection] Error during opponent setup:", error);
      return;
    }

    // Transition to rules phase
    this.transition("rules");
  }
}
