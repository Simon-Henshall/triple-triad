import { Game } from "../game/game.js";
import { UIManager } from "../managers/UIManager.js";
import { UIRenderer } from "../ui/UIRenderer.js";
import { CursorController } from "../controllers/CursorController.js";

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
    const conf = UIManager.confirmation;

    // Clear any previous children to avoid duplicates
    conf.container.removeAllChildren();

    // Set the player state to 'confirming'
    UIManager.playerConfirming = true;

    // Reset the default choice index
    conf.selectedChoice = 0;

    // Position cursor relative to the confirmation box background
    conf.cursor.y = conf.background.y + 60;

    // Render the confirmation box (UI only)
    UIRenderer.drawConfirmationBox(conf);

    // Add container to the stage
    Game.stage.addChild(conf.container);

    // Position the cursor properly
    CursorController.confirmation.place();

    // Hide any preview cards while confirmation is active
    UIManager.selectionBoard.hidePreviewCard();

    // Update the stage to reflect all changes
    Game.stage.update();
  },
};
