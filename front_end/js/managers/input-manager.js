import { SelectionBoardUI } from "../renderers/selection-board-ui.js";
import { SelectionBoardRenderer } from "../renderers/selection-board-renderer.js";
import { UIManager } from "./ui-manager.js";
import { ConfirmationController } from "../controllers/confirmation-controller.js";
import { Game } from "../game/game.js";
import { debug } from "../debug.js";
import { BoardManager } from "../managers/board-manager.js";
import { offsets } from "../constants/offsets.js";
import { createCardContainer } from "../utilities/cards.js";
/**
 * Handles game logic triggered by player input.
 * Responsible for card selection, confirmation handling,
 * hand updates, and placement logic.
 * Visual updates are delegated to the InputRenderer.
 */
export class InputManager {
  constructor(
    playerManager,
    playerRenderer,
    playerController,
    placementController,
  ) {
    this.playerManager = playerManager;
    this.playerRenderer = playerRenderer;
    this.playerController = playerController;
    this.placementController = placementController;
  }
  // ------------------------------
  // HIGH-LEVEL PUBLIC METHODS
  // ------------------------------

  /**
   * Handle arrow keys, Enter, and cancel for selection board.
   * @param {KeyboardEvent} event
   * @param {InputRenderer} renderer
   */
  handlePlayerHandSelection(event, renderer) {
    switch (event.key) {
      case "ArrowLeft": {
        renderer.moveSelectionCursor("left");
        break;
      }
      case "ArrowRight": {
        renderer.moveSelectionCursor("right");
        break;
      }
      case "ArrowUp": {
        renderer.moveSelectionCursor("up");
        break;
      }
      case "ArrowDown": {
        renderer.moveSelectionCursor("down");
        break;
      }
      case "Enter": {
        this.selectCard();
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
   * Handle confirmation box navigation and choice selection.
   * @param {KeyboardEvent} event
   * @param {InputRenderer} renderer
   */
  handleConfirmation(event, renderer) {
    switch (event.key) {
      case "ArrowUp": {
        renderer.moveConfirmationCursor("up");
        break;
      }
      case "ArrowDown": {
        renderer.moveConfirmationCursor("down");
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
   * Handle player hand cursor movement and card play selection.
   * @param {KeyboardEvent} event
   */
  handlePlayerCardChoice(event, renderer) {
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
        this.playSelectedCard(renderer);
        break;
      }
    }
  }

  /**
   * Handle placement cursor movement and card placement.
   * @param {KeyboardEvent} event
   * @param {InputRenderer} renderer
   */
  handlePlacement(event, renderer) {
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
        this.placeCardOnBoard();
        break;
      }
      case "Backspace":
      case "Escape": {
        renderer.toggleInfoBox(true);
        renderer.restorePlayerHandCursor();
        Game.controllers.cursorController.grid.remove();
        break;
      }
    }
  }

  // ------------------------------
  // LOWER-LEVEL HELPER METHODS
  // ------------------------------

  /**
   * Select the currently highlighted card on the selection board.
   * Decrements card count and updates player's temporary hand.
   * Animates the card moving into the hand as it is selected.
   * @returns {Object|undefined} The selected card
   */
  selectCard() {
    const card = SelectionBoardUI.controller.selectedCard;
    if (!card) {
      return;
    }

    if (card.count > 0) {
      if (debug.active) {
        console.log(
          `Selected card: ${card.displayName} (remaining: ${card.count - 1})`,
        );
      }

      // Create a visual container for the card offscreen
      const _newCardContainer = createCardContainer(
        card,
        "blue",
        this.playerManager.handOffsetX,
        Game.stage.canvas.height + 200,
      );

      // Add the card + container to the manager
      this.playerManager.addCardToHand(card, _newCardContainer);

      // Animate card into the hand
      this.playerRenderer.animateCardToHand(
        _newCardContainer,
        this.playerManager.cardsInHand.length - 1,
      );

      // Update hand visuals / selection board counts
      this.playerRenderer._updateHandAndPreviewZOrder();
      // Force immediate update to selection board counts
      //SelectionBoardRenderer.updateBoardCount(card.id, -1);
      SelectionBoardRenderer.updateDisplay({ skipTween: true });
      Game.stage.update();

      if (this.playerManager.cardsInHand.length === 5) {
        UIManager.playerSelectingHand = false;
        ConfirmationController.show();
      }

      return card;
    } else if (debug.active) {
      console.warn(
        `Attempted to select a card with zero count: ${card.displayName}`,
      );
    }
  }

  /**
   * Undo the last selection made by the player.
   */
  cancelLastSelection() {
    this.playerController.removeLastCard();
  }

  /**
   * Apply the player's choice from the confirmation box.
   * @param {"yes"|"no"} [forcedChoice] Optional override choice
   */
  handleConfirmationChoice(forcedChoice) {
    const choice =
      forcedChoice ||
      (UIManager.confirmation.selectedChoice === 0 ? "yes" : "no");

    if (choice === "yes") {
      Game.stage.removeChild(UIManager.selectionBoard.container);
      Game.stage.removeChild(UIManager.confirmation.container);
      Game.controllers.cursorController.confirmation.remove();
      Game.startGame();
    } else {
      Game.stage.removeChild(UIManager.confirmation.container);
      Game.controllers.cursorController.confirmation.remove();

      // Capture cards currently in the hand before reset
      const handCards = [...this.playerManager.cardsInHand];
      const handData = [...this.playerManager.playerCards];

      // Reset model-level hand data
      this.playerManager.resetHand();

      // Restore counts for each previously selected card
      for (const card of handData) {
        if (card?.id != undefined) {
          SelectionBoardRenderer.updateBoardCount(card.id, +1);
        }
      }

      // Remove all visual hand containers from stage
      for (const container of handCards) {
        if (container?.parent) {
          container.parent.removeChild(container);
        }
      }

      // Refresh z-order and visuals
      this.playerRenderer._updateHandAndPreviewZOrder();

      // Restore cursor to selection board
      Game.controllers.cursorController.selection.place();
      SelectionBoardRenderer.updateCursor(SelectionBoardUI.controller);
      if (Game.renderers?.cursorRenderer?.selection?.updatePosition) {
        Game.renderers.cursorRenderer.selection.updatePosition();
      }

      // Bring back preview card
      UIManager.selectionBoard.showPreviewCard();

      UIManager.playerConfirming = false;
      UIManager.playerSelectingHand = true;

      Game.stage.update(); // Force re-render
    }
  }

  /**
   * Play the selected card from the player's hand.
   * Moves cursors and prepares for placement.
   */
  playSelectedCard(renderer) {
    // Remove hand cursor
    Game.controllers.cursorController.playerHand.remove();

    // Set default selected cell BEFORE placing the cursor
    UIManager.selectedRow = 2;
    UIManager.selectedColumn = 2;

    // Place grid cursor using current selectedRow/Column
    Game.controllers.cursorController.grid.place();

    // Immediately hide info box now that placement is active
    renderer.toggleInfoBox(false);

    // Remove hand cursor from stage

    Game.stage.removeChild(this.playerManager.playerHandCursor);

    // Enter placement mode
    UIManager.playerSelectingPlacement = true;

    // Actually play the card
    const selectedIndex = UIManager.selectedCardNumber;
    const selectedCard = this.playerManager.cardsInHand[selectedIndex];
    if (!selectedCard) {
      console.warn("No card selected!");
      return;
    }
  }

  /**
   * Place the currently selected card onto the game board.
   */
  placeCardOnBoard() {
    if (!BoardManager.cellOccupied()) {
      const card = this.playerManager.cardsInHand[UIManager.selectedCardNumber];
      if (!card) {
        return console.warn("No card selected!");
      }

      // remove from logical hand first
      this.playerManager.cardsInHand.splice(UIManager.selectedCardNumber, 1);

      // remove cursor before placement
      Game.controllers.cursorController.grid.remove();

      // pass card to placement controller
      this.placementController.placeCard(
        card,
        offsets.gameOffsetX +
          offsets.cellWidth * (UIManager.selectedColumn - 1) +
          offsets.cardOffsetX,
        offsets.gameOffsetY +
          offsets.cellHeight * (UIManager.selectedRow - 1) +
          offsets.cardOffsetY,
      );

      // update selectedCardIndex & selectedCard
      this.playerManager.selectedCardIndex = 0;
      this.playerManager.selectedCard =
        this.playerManager.cardsInHand[0] || undefined;

      // update UIManager for cursor logic
      UIManager.selectedCardNumber = 0;
      UIManager.selectedCard = this.playerManager.selectedCard;
    }
  }
}
