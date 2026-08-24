import { PhaseChecker } from "../../game/phases.js";
import { Game } from "../../shared/game/game.js";
import { PreviewCard } from "../../shared/ui/preview-card.js";
import { ConfirmationView } from "./confirmation-view.js";
import ConfirmationModel from "./confirmation-model.js";

/**
 * Controller responsible for showing and managing the
 * "Are you sure?" confirmation dialog in the game UI.
 */
export const ConfirmationController = {
  /**
   * Display the confirmation dialog and prepare the UI for player input.
   *
   * Clears previous children from the confirmation container,
   * resets selection state, positions the cursor, renders the box,
   * and hides any preview card from the selection board.
   */
  show() {
    console.log("[Confirmation Controller] Showing confirmation dialog...");
    if (Game.controllers.cursorController.selection) {
      Game.controllers.cursorController.selection.remove();
    }

    // Set the player state to 'confirming'
    PhaseChecker.playerConfirming = true;

    // Ensure model exists and reset selection
    if (!this.model) {
      this.model = new ConfirmationModel(ConfirmationView);
      ConfirmationView.model = this.model;
    }
    this.model.setSelected(0);

    // Render the confirmation box
    ConfirmationView.drawConfirmationBox();

    // Add container to the stage
    Game.stage.addChild(ConfirmationView.container);

    // Create cursor if it doesn't exist
    if (!Game.controllers.cursorController.confirmation) {
      Game.controllers.cursorController.confirmation = new Cursor({
        container: config.container,
        x: 100, // starting x
        y: 100, // starting y
      });
    }

    // Position the cursor properly
    Game.controllers.cursorController.confirmation.place();

    // Hide any preview cards while confirmation is active
    PreviewCard.hidePreviewCard();

    // Update the stage to reflect all changes
    Game.stage.update();
  },

  /**
   * Hide the confirmation dialog.
   */
  hide() {
    console.log("[Confirmation Controller] Hiding confirmation dialog...");
    Game.stage.removeChild(ConfirmationView.container);
    ConfirmationView.hide();
    PhaseChecker.playerConfirming = false;
  },

  /**
   * Accept the confirmation (player chose "Yes").
   */
  accept() {
    this.hide();
    console.log("[Confirmation Controller] Player accepted.");
  },

  /**
   * Cancel the confirmation (player chose "No").
   */
  cancel() {
    this.hide();
    console.log("[Confirmation Controller] Player cancelled.");
  },
};
