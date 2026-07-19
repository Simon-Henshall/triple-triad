import { DeckSelectionUI } from "../../phases/deck-selection/deck-selection-ui.js";
import { ConfirmationController } from "../../phases/confirmation/confirmation-controller.js";
import { Game } from "../game/game.js";
import { CursorModel } from "../cursor/cursor-model.js";
import { InfoBox } from "../ui/info-box.js";
import { ConfirmationView } from "../../phases/confirmation/confirmation-view.js";
import { PreviewCard } from "../ui/preview-card.js";
import DeckSelectionModel from "../../phases/deck-selection/deck-selection-model.js";
import { PhaseChecker } from "../../game/phases.js";

/**
 * InputModel class, responsible for handling player input and
 * coordinating logical state updates, visual rendering, and animation.
 */
export class InputModel {
  /**
   * Manages player input and coordinates logical state updates,
   * visual rendering, and animation for the player's hand.
   */
  constructor(playerModel, playerView, placementController) {
    this.playerModel = playerModel;
    this.playerView = playerView;
    this.placementController = placementController;
  }

  // ------------------------------
  // OPPONENT SELECTION
  // ------------------------------

  /**
   * Handles player input during the opponent selection phase.
   * @param {KeyboardEvent} event
   */
  handleOpponentSelection(event) {
    // Get the current state machine phase
    const stateMachine = Game.models?.stateMachine;
    const currentPhase = stateMachine?.getCurrentPhase?.();
    if (!currentPhase) {
      return;
    }

    switch (event.key) {
      case "ArrowLeft": {
        currentPhase.navigate("left");
        break;
      }
      case "ArrowRight": {
        currentPhase.navigate("right");
        break;
      }
      case "ArrowUp": {
        currentPhase.navigate("up");
        break;
      }
      case "ArrowDown": {
        currentPhase.navigate("down");
        break;
      }
      case "Enter": {
        currentPhase.confirm();
        break;
      }
      case "Backspace":
      case "Escape": {
        // Do nothing - opponent selection has no cancel
        break;
      }
    }
  }

  // ------------------------------
  // SELECTION BOOK HANDLING
  // ------------------------------

  /**
   * Handles player input on the selection book.
   */
  handleSelectionBookInput(event) {
    switch (event.key) {
      case "ArrowDown": {
        DeckSelectionUI.moveSelection(true);
        this.updatePreview();
        break;
      }
      case "ArrowUp": {
        DeckSelectionUI.moveSelection(false);
        this.updatePreview();
        break;
      }
      case "ArrowLeft": {
        DeckSelectionUI.paginate("left");
        this.updatePreview();
        break;
      }
      case "ArrowRight": {
        DeckSelectionUI.paginate("right");
        this.updatePreview();
        break;
      }
      case "Enter": {
        this.selectCardFromBook();
        break;
      }
      case "Backspace":
      case "Escape": {
        this.cancelLastSelection();
        break;
      }
    }
  }

  /**
   * Called when the player presses Enter on the selection book.
   * Adds the selected card to their hand and animates it in.
   */
  updatePreview() {
    // Get the currently selected card from the DeckSelectionUI
    const card = DeckSelectionUI.getSelectedCard();
    PreviewCard.showPreviewCard(card);
    if (!card) {
      PreviewCard.hidePreviewCard();
      return;
    }
  }

  /**
   * Called when player presses Enter on the selection book.
   * Adds the selected card to hand and animates it in.
   */
  selectCardFromBook() {
    const selectedCard = DeckSelectionUI.getSelectedCard();
    if (!selectedCard) {
      return;
    }

    // Clone the deck card for the hand (creates new visuals)
    const handCard = selectedCard.clone({ owner: "player", count: 1 });

    // Start the card offscreen for animation
    const container = selectedCard.visuals.container.clone(true); // true = deep clone children
    container.x = this.playerModel.handOffsetX;
    container.y = Game.stage.canvas.height + 200;
    handCard.visuals.container = container;

    // Delegate adding + animation + UI sync to the PlayerController
    const added = Game.controllers.playerController.addCardToHand(handCard);
    if (!added) {
      return;
    }
    Game.stage.update();

    // Trigger confirmation if hand full
    if (this.playerModel.hand.length === 5) {
      console.log(
        "[Input Model] Player's hand has reached 5 cards. Passing off to [Confirmation Controller]...",
      );
      PhaseChecker.playerSelectingHand = false;
      ConfirmationController.show();
    }
  }

  /**
   * Undo last selection and refresh UI.
   */
  cancelLastSelection() {
    const removedCard =
      Game.controllers.playerController.removeLastCardFromHand();
    if (!removedCard) {
      return;
    }

    Game.stage.update();

    // Reset flags if hand < 5
    if (this.playerModel.hand.length < 5) {
      PhaseChecker.playerSelectingHand = true;
      PhaseChecker.playerConfirming = false;
    }
  }

  // ------------------------------
  // CONFIRMATION + GAME TRANSITIONS
  // ------------------------------

  /**
   * Handle confirmation events from keyboard.
   * @param {KeyboardEvent} event
   */
  handleConfirmation(event) {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown": {
        Game.controllers.cursorController.confirmation.move(
          event.key === "ArrowDown" ? "down" : "up",
        );
        break;
      }
      case "Enter": {
        this.handleConfirmationChoice();
        break;
      }
      case "Backspace":
      case "Escape": {
        this.handleConfirmationChoice("no");
        break;
      }
    }
  }

  /**
   * Handles the confirmation box choice (Yes/No).
   * @param {string} [forcedChoice] Optional forced choice (yes/no).
   */
  handleConfirmationChoice(forcedChoice) {
    // Clear the confirmation box and cursor either way
    Game.stage.removeChild(ConfirmationView.container);
    Game.controllers.cursorController.confirmation.remove();

    const currentChoiceIndex =
      ConfirmationController?.model?.selectedIndex ?? 0;
    const choice = forcedChoice || (currentChoiceIndex === 0 ? "yes" : "no");

    if (choice === "yes") {
      console.log("[Input Model] Player confirmed their hand.");
      Game.stage.removeChild(DeckSelectionModel.container);
      Game.startGame();
      CursorModel.playerHand.init();
      return;
    }

    if (choice === "no") {
      console.log("[Input Model] Player cancelled their hand.");
      // Delegate reset to player controller (also refreshes selection UI)
      Game.controllers.playerController.resetHand();
      PhaseChecker.playerConfirming = false;
      PhaseChecker.playerSelectingHand = true;
      this.updatePreview();
      Game.stage.update();
    }
  }

  // ------------------------------
  // PLAY PHASE
  // ------------------------------

  /**
   * Handle player hand cursor movement and card play selection.
   * @param {KeyboardEvent} event
   */
  handlePlayerCardChoice(event) {
    switch (event.key) {
      case "ArrowUp": {
        Game.controllers.cursorController.playerHand.move("up");
        break;
      }
      case "ArrowDown": {
        Game.controllers.cursorController.playerHand.move("down");
        break;
      }
      case "Enter": {
        this.playSelectedCard();
        break;
      }
    }
  }

  /**
   * Handle placement cursor movement and card placement.
   * @param {KeyboardEvent} event
   * @param {InputView} view
   */
  handlePlacement(event) {
    switch (event.key) {
      case "ArrowLeft": {
        Game.controllers.cursorController.grid.move("left");
        break;
      }
      case "ArrowRight": {
        Game.controllers.cursorController.grid.move("right");
        break;
      }
      case "ArrowUp": {
        Game.controllers.cursorController.grid.move("up");
        break;
      }
      case "ArrowDown": {
        Game.controllers.cursorController.grid.move("down");
        break;
      }
      case "Enter": {
        Game.controllers.placementController.model.placeCardOnBoard();
        break;
      }
      case "Backspace":
      case "Escape": {
        InfoBox.toggleInfoBox(Game, true);
        Game.controllers.cursorController.playerHand.restorePlayerHandCursor();
        Game.controllers.cursorController.grid.remove();
        break;
      }
    }
  }

  /**
   * Play the selected card from the player's hand.
   * Moves cursors and prepares for placement.
   */
  playSelectedCard() {
    // Prefer controller-driven flow when available
    return Game.controllers.handSelectController.playSelectedCard();
  }

  // -------------------------------------------------
  // RULES PHASE
  // -------------------------------------------------

  /**
   * Handle rules phase input.
   * @param {KeyboardEvent} event
   */
  handleRulesInput(event) {
    const stateMachine = Game.models?.stateMachine;
    const currentPhase = stateMachine?.getCurrentPhase?.();
    if (!currentPhase) {
      return;
    }

    switch (event.key) {
      case "ArrowUp": {
        currentPhase.navigate("up");
        break;
      }
      case "ArrowDown": {
        currentPhase.navigate("down");
        break;
      }
      case "Enter": {
        currentPhase.confirm();
        break;
      }
      case "Backspace":
      case "Escape": {
        // Do nothing on cancel for rules
        break;
      }
    }
  }
}
