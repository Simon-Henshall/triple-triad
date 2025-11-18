import { DeckSelectionUI } from "../../phases/deck-selection/deck-selection-ui.js";
import { UIManager } from "../ui/ui-manager.js";
import { ConfirmationController } from "../../phases/confirmation/confirmation-controller.js";
import { Game } from "../game/game.js";
import { CursorManager } from "../cursor/cursor-manager.js";

/**
 * InputManager class, responsible for handling player input and
 * coordinating logical state updates, visual rendering, and animation.
 */
export class InputManager {
  /**
   * Manages player input and coordinates logical state updates,
   * visual rendering, and animation for the player's hand.
   */
  constructor(playerManager, playerRenderer, placementController) {
    this.playerManager = playerManager;
    this.playerRenderer = playerRenderer;
    this.placementController = placementController;
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
    UIManager.selectionBook.showPreviewCard(card);
    console.log(card);
    if (!card) {
      UIManager.selectionBook.hidePreviewCard();
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
    container.x = this.playerManager.handOffsetX;
    container.y = Game.stage.canvas.height + 200;
    handCard.visuals.container = container;

    // Add to hand logically
    this.playerManager.addCardToHand(handCard);
    this.playerRenderer.cardsInPlayerHand.push(container);

    // Animate into hand
    this.playerRenderer.animateCardToHand(
      container,
      this.playerManager.hand.length - 1,
    );
    this.playerRenderer._updateHandAndPreviewZOrder();

    // Refresh book visuals
    DeckSelectionUI.populate();
    Game.stage.update();

    // Trigger confirmation if hand full
    if (this.playerManager.hand.length === 5) {
      console.log(
        "[Input Manager] Player's hand has reached 5 cards. Passing off to [Confirmation Controller]...",
      );
      UIManager.playerSelectingHand = false;
      ConfirmationController.show();
    }
  }

  /**
   * Undo last selection and refresh UI.
   */
  cancelLastSelection() {
    const removedCard = this.playerManager.removeLastCardFromHand();
    if (!removedCard) {
      return;
    }

    const container = removedCard.visuals?.container;
    if (container && Game.stage.contains(container)) {
      Game.stage.removeChild(container);
    }

    const index = this.playerRenderer.cardsInPlayerHand.indexOf(container);
    if (index !== -1) {
      this.playerRenderer.cardsInPlayerHand.splice(index, 1);
    }

    // Refresh book and stage
    DeckSelectionUI.populate();
    Game.stage.update();

    // Reset flags if hand < 5
    if (this.playerManager.hand.length < 5) {
      UIManager.playerSelectingHand = true;
      UIManager.playerConfirming = false;
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
    Game.stage.removeChild(UIManager.confirmation.container);
    Game.controllers.cursorController.confirmation.remove();

    const choice =
      forcedChoice ||
      (UIManager.confirmation.selectedChoice === 0 ? "yes" : "no");

    if (choice === "yes") {
      console.log("[Input Manager] Player confirmed their hand.");
      Game.stage.removeChild(UIManager.selectionBook.container);
      Game.startGame();
      CursorManager.playerHand.init();
      return;
    }

    if (choice === "no") {
      console.log("[Input Manager] Player cancelled their hand.");
      this.playerManager.resetHand();
      this.playerManager.renderer.resetHand();

      DeckSelectionUI.populate();
      UIManager.playerConfirming = false;
      UIManager.playerSelectingHand = true;
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
   * @param {InputRenderer} renderer
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
        Game.controllers.placementController.manager.placeCardOnBoard();
        break;
      }
      case "Backspace":
      case "Escape": {
        UIManager.toggleInfoBox(true);
        UIManager.restorePlayerHandCursor();
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
    // Remove hand cursor
    Game.controllers.cursorController.playerHand.remove();

    // Set default selected cell BEFORE placing the cursor
    UIManager.selectedRow = 2;
    UIManager.selectedColumn = 2;

    // Place grid cursor using current selectedRow/Column
    Game.controllers.cursorController.grid.place();

    // Immediately hide info box now that placement is active
    UIManager.toggleInfoBox(false);

    // Remove hand cursor from stage
    Game.stage.removeChild(this.playerManager.playerHandCursor);

    // Enter placement mode
    UIManager.playerSelectingPlacement = true;

    // Actually play the card
    const selectedIndex = UIManager.selectedCardNumber;
    const selectedCard = this.playerManager.hand[selectedIndex];
    if (!selectedCard) {
      console.warn("No card selected!");
      return;
    }
  }
}
