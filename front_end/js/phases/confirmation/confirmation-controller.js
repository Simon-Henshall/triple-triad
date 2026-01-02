import { Game } from "../../shared/game/game.js";
import { PreviewCard } from "../../shared/ui/preview-card.js";
import { UIModel } from "../../shared/ui/ui-model.js";
import { ConfirmationView } from "./confirmation-view.js";

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
    UIModel.playerConfirming = true;

    // Reset the default choice index
    ConfirmationView.selectedChoice = 0;

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
};
