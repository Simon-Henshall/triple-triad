import { ui } from "../render/ui.js";
import { InputManager } from "../managers/InputManager.js";
import { InputRenderer } from "../ui/InputRenderer.js";
import { debug } from "../debug.js";

/**
 * Top-level controller for keyboard input.
 * Delegates logic to InputManager and visual updates to InputRenderer.
 */
export class InputController {
  constructor() {
    this.manager = new InputManager();
    this.renderer = new InputRenderer();
  }

  /**
   * Handle keydown event and route based on current game mode.
   * @param {KeyboardEvent} e
   */
  handleKey(e) {
    if (debug.active) console.log("Key pressed:", e.key);

    if (ui.playerSelectingHand) {
      this.manager.handlePlayerHandSelection(e, this.renderer);
    } else if (ui.playerConfirming) {
      this.manager.handleConfirmation(e, this.renderer);
    } else if (ui.playerChoosingCard) {
      this.manager.handlePlayerCardChoice(e, this.renderer);
    } else if (ui.playerSelectingPlacement) {
      this.manager.handlePlacement(e, this.renderer);
    }
  }
}
