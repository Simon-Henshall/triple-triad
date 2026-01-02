import { InputView } from "./input-view.js";
import { debug } from "../../utilities/debug.js";
import { PhaseChecker } from "../../game/phases.js";

/**
 * Top-level controller for keyboard input.
 * Delegates logic to InputModel and visual updates to InputView.
 */
export class InputController {
  /**
   * Main entry point for the InputController, handling all keyboard input logic.
   */
  constructor(inputModel) {
    this.model = inputModel;
    this.view = new InputView();
  }

  /**
   * Handle keydown event and route based on current game mode.
   * @param {KeyboardEvent} event
   */
  handleKey(event) {
    if (debug.active) {
      //console.log("Key pressed:", event.key);
    }

    if (PhaseChecker.playerSelectingHand) {
      this.model.handleSelectionBookInput(event);
    } else if (PhaseChecker.playerConfirming) {
      this.model.handleConfirmation(event);
    } else if (PhaseChecker.playerChoosingCard) {
      this.model.handlePlayerCardChoice(event);
    } else if (PhaseChecker.playerSelectingPlacement) {
      this.model.handlePlacement(event);
    }
  }
}
