import { UIModel } from "../ui/ui-model.js";
import { InputView } from "./input-view.js";
import { debug } from "../../utilities/debug.js";

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

    if (UIModel.playerSelectingHand) {
      this.model.handleSelectionBookInput(event);
    } else if (UIModel.playerConfirming) {
      this.model.handleConfirmation(event);
    } else if (UIModel.playerChoosingCard) {
      this.model.handlePlayerCardChoice(event);
    } else if (UIModel.playerSelectingPlacement) {
      this.model.handlePlacement(event);
    }
  }
}
