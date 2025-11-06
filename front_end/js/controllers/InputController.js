import { UIManager } from "../managers/UIManager.js";
import { InputManager } from "../managers/InputManager.js";
import { InputRenderer } from "../ui/InputRenderer.js";
import { debug } from "../debug.js";

/**
 * Top-level controller for keyboard input.
 * Delegates logic to InputManager and visual updates to InputRenderer.
 */
export class InputController {
  constructor(inputManager) {
    this.manager = inputManager;   // already has playerManager etc.
    this.renderer = new InputRenderer();
  }

  /**
   * Handle keydown event and route based on current game mode.
   * @param {KeyboardEvent} e
   */
  handleKey(e) {
    if (debug.active) console.log("Key pressed:", e.key);

    if (UIManager.playerSelectingHand) {
      this.manager.handlePlayerHandSelection(e, this.renderer);
    } else if (UIManager.playerConfirming) {
      this.manager.handleConfirmation(e, this.renderer);
    } else if (UIManager.playerChoosingCard) {
      this.manager.handlePlayerCardChoice(e, this.renderer);
    } else if (UIManager.playerSelectingPlacement) {
      this.manager.handlePlacement(e, this.renderer);
    }
  }
}
