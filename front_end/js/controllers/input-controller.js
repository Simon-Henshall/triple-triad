import { UIManager } from "../managers/ui-manager.js";
import { InputRenderer } from "../renderers/input-renderer.js";
import { debug } from "../debug.js";

/**
 * Top-level controller for keyboard input.
 * Delegates logic to InputManager and visual updates to InputRenderer.
 */
export class InputController {
  constructor(inputManager) {
    this.manager = inputManager; // already has playerManager etc.
    this.renderer = new InputRenderer();
  }

  /**
   * Handle keydown event and route based on current game mode.
   * @param {KeyboardEvent} event
   */
  handleKey(event) {
    if (debug.active) {
      console.log("Key pressed:", event.key);
    }

    if (UIManager.playerSelectingHand) {
      this.manager.handlePlayerHandSelection(event, this.renderer);
    } else if (UIManager.playerConfirming) {
      this.manager.handleConfirmation(event, this.renderer);
    } else if (UIManager.playerChoosingCard) {
      this.manager.handlePlayerCardChoice(event, this.renderer);
    } else if (UIManager.playerSelectingPlacement) {
      this.manager.handlePlacement(event, this.renderer);
    }
  }
}
