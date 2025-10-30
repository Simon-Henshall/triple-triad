import { player } from "../render/player.js";
import { SelectionBoardUI } from "../ui/SelectionBoardUI.js";
import { SelectionBoardRenderer } from "../ui/SelectionBoardRenderer.js";
import { UIManager } from "../managers/UIManager.js";
import { utils } from "../game/utils.js";
import { CursorController } from "../controllers/CursorController.js";
import { confirmationBox } from "../render/confirmationBox.js";
import { Game } from "../game/game.js";
import { debug } from "../debug.js";
import { PlacementController } from "../controllers/PlacementController.js";
import { BoardManager } from "../managers/BoardManager.js";
import { offsets } from "../constants/offsets.js";

const placementController = new PlacementController();

/**
 * Handles game logic triggered by player input.
 * Responsible for card selection, confirmation handling,
 * hand updates, and placement logic.
 * Visual updates are delegated to the InputRenderer.
 */
export class InputManager {
  // ------------------------------
  // HIGH-LEVEL PUBLIC METHODS
  // ------------------------------

  /**
   * Handle arrow keys, Enter, and cancel for selection board.
   * @param {KeyboardEvent} e
   * @param {InputRenderer} renderer
   */
  handlePlayerHandSelection(e, renderer) {
    switch (e.key) {
      case "ArrowLeft":
        renderer.moveSelectionCursor("left");
        break;
      case "ArrowRight":
        renderer.moveSelectionCursor("right");
        break;
      case "ArrowUp":
        renderer.moveSelectionCursor("up");
        break;
      case "ArrowDown":
        renderer.moveSelectionCursor("down");
        break;
      case "Enter":
        this.selectCard();
        break;
      case "Backspace":
      case "Escape":
        this.cancelLastSelection();
        break;
    }
  }

  /**
   * Handle confirmation box navigation and choice selection.
   * @param {KeyboardEvent} e
   * @param {InputRenderer} renderer
   */
  handleConfirmation(e, renderer) {
    switch (e.key) {
      case "ArrowUp":
        renderer.moveConfirmationCursor("up");
        break;
      case "ArrowDown":
        renderer.moveConfirmationCursor("down");
        break;
      case "Enter":
        this.handleConfirmationChoice();
        break;
      case "Backspace":
      case "Escape":
        this.handleConfirmationChoice("no");
        break;
    }
  }

  /**
   * Handle player hand cursor movement and card play selection.
   * @param {KeyboardEvent} e
   */
  handlePlayerCardChoice(e, renderer) {
    switch (e.key) {
      case "ArrowUp":
        CursorController.playerHand.move("up");
        break;
      case "ArrowDown":
        CursorController.playerHand.move("down");
        break;
      case "Enter":
        this.playSelectedCard(renderer);
        break;
    }
  }

  /**
   * Handle placement cursor movement and card placement.
   * @param {KeyboardEvent} e
   * @param {InputRenderer} renderer
   */
  handlePlacement(e, renderer) {
    renderer.toggleInfoBox(false);

    switch (e.key) {
      case "ArrowLeft":
        CursorController.grid.move("left");
        break;
      case "ArrowRight":
        CursorController.grid.move("right");
        break;
      case "ArrowUp":
        CursorController.grid.move("up");
        break;
      case "ArrowDown":
        CursorController.grid.move("down");
        break;
      case "Enter":
        this.placeCardOnBoard();
        break;
      case "Backspace":
      case "Escape":
        renderer.restorePlayerHandCursor();
        CursorController.grid.remove();
        break;
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
    if (!card) return;

    if (card.count > 0) {
      card.count--;
      player.playerCards.push(card);

      if (debug.active) {
        console.log(
          `Selected card: ${card.displayName} (remaining: ${card.count})`
        );
      }

      // Create a visual container for the card offscreen
      const newCardContainer = utils.createCardContainer(
        card,
        "blue",
        player.handOffsetX,
        Game.stage.canvas.height + 200
      );

      // Animate card into the hand
      player.playerHand.animateCardToHand(
        newCardContainer,
        player.playerHand.cardsInPlayerHand.length
      );

      // Update hand visuals / selection board counts
      player.cardManagerInstance.updateHandCards();

      if (player.playerCards.length === 5) {
        UIManager.playerSelectingHand = false;
        confirmationBox.show();
      }

      return card;
    } else if (debug.active) {
      console.warn(
        `Attempted to select a card with zero count: ${card.displayName}`
      );
    }
  }

  /**
   * Undo the last selection made by the player.
   */
  cancelLastSelection() {
    if (player.playerCards.length === 0) return;

    player.playerHand.removeCardFromHand();
    const lastCard = player.playerCards.pop();
    if (lastCard) {
      lastCard.count++;
      player.cardManagerInstance.updateHandCards();
      SelectionBoardRenderer.updateDisplay({ skipTween: true });
      Game.stage.update();
    }
  }

  /**
   * Apply the player's choice from the confirmation box.
   * @param {"yes"|"no"} [forcedChoice] Optional override choice
   */
  handleConfirmationChoice(forcedChoice) {
    const choice =
      forcedChoice || (UIManager.confirmation.selectedChoice === 0 ? "yes" : "no");

    if (choice === "yes") {
      Game.stage.removeChild(UIManager.selectionBoard.container);
      Game.stage.removeChild(UIManager.confirmation.container);
      CursorController.confirmation.remove();
      Game.startGame();
    } else {
      for (let i = 0; i < 5; i++) {
        const lastCard = player.playerCards.pop();
        lastCard.count++;
        player.cardManagerInstance.updateHandCards();
      }

      Game.stage.removeChild(UIManager.confirmation.container);
      CursorController.confirmation.remove();

      player.playerHand.resetAnimatedHand();
      UIManager.selectionBoard.showPreviewCard();

      UIManager.playerConfirming = false;
      UIManager.playerSelectingHand = true;
    }
  }

  /**
   * Play the selected card from the player's hand.
   * Moves cursors and prepares for placement.
   */
  playSelectedCard(renderer) {
    // Remove hand cursor
    CursorController.playerHand.remove();

    // Set default selected cell BEFORE placing the cursor
    UIManager.selectedRow = 2;
    UIManager.selectedColumn = 2;

    // Place grid cursor using current selectedRow/Column
    CursorController.grid.place();

    // Immediately hide info box now that placement is active
    renderer.toggleInfoBox(false);

    // Remove hand cursor from stage
    Game.stage.removeChild(player.playerHandCursor);

    // Enter placement mode
    UIManager.playerSelectingPlacement = true;
  }

  /**
   * Place the currently selected card onto the game board.
   */
  placeCardOnBoard() {
    if (!BoardManager.cellOccupied()) {
      player.cardsInPlayerHand.splice(UIManager.selectedCardNumber, 1);
      CursorController.grid.remove();

      placementController.placeCard(
        UIManager.selectedCard,
        offsets.gameOffsetX +
          offsets.cellWidth * (UIManager.selectedColumn - 1) +
          offsets.cardOffsetX,
        offsets.gameOffsetY +
          offsets.cellHeight * (UIManager.selectedRow - 1) +
          offsets.cardOffsetY
      );
    }
  }
}
