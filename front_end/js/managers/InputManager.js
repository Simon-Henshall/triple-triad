import { player } from "../render/player.js";
import { selectionBoard } from "../render/selectionBoard.js";
import { ui } from "../render/ui.js";
import { utils } from "../game/utils.js";
import { cursors } from "../render/cursors.js";
import { confirmationBox } from "../render/confirmationBox.js";
import { Game } from "../game/game.js";
import { debug } from "../debug.js";
import { PlacementController } from "../controllers/PlacementController.js";
import { board } from "../render/board.js";
import { offsets } from "../render/offsets.js";

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
        cursors.playerHand.move("up");
        break;
      case "ArrowDown":
        cursors.playerHand.move("down");
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
        cursors.grid.move("left");
        break;
      case "ArrowRight":
        cursors.grid.move("right");
        break;
      case "ArrowUp":
        cursors.grid.move("up");
        break;
      case "ArrowDown":
        cursors.grid.move("down");
        break;
      case "Enter":
        this.placeCardOnBoard();
        break;
      case "Backspace":
      case "Escape":
        renderer.restorePlayerHandCursor();
        cursors.grid.remove();
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
    const card = selectionBoard.controller.selectedCard;
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
        ui.playerSelectingHand = false;
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
      selectionBoard.updateDisplay({ skipTween: true });
      Game.stage.update();
    }
  }

  /**
   * Apply the player's choice from the confirmation box.
   * @param {"yes"|"no"} [forcedChoice] Optional override choice
   */
  handleConfirmationChoice(forcedChoice) {
    const choice =
      forcedChoice || (ui.confirmation.selectedChoice === 0 ? "yes" : "no");

    if (choice === "yes") {
      Game.stage.removeChild(ui.selectionBoard.container);
      Game.stage.removeChild(ui.confirmation.container);
      cursors.confirmation.remove();
      Game.startGame();
    } else {
      for (let i = 0; i < 5; i++) {
        const lastCard = player.playerCards.pop();
        lastCard.count++;
        player.cardManagerInstance.updateHandCards();
      }

      Game.stage.removeChild(ui.confirmation.container);
      cursors.confirmation.remove();

      player.playerHand.resetAnimatedHand();
      ui.selectionBoard.showPreviewCard();

      ui.playerConfirming = false;
      ui.playerSelectingHand = true;
    }
  }

  /**
   * Play the selected card from the player's hand.
   * Moves cursors and prepares for placement.
   */
  playSelectedCard(renderer) {
    // Remove hand cursor
    cursors.playerHand.remove();

    // Set default selected cell BEFORE placing the cursor
    ui.selectedRow = 2;
    ui.selectedColumn = 2;

    // Place grid cursor using current selectedRow/Column
    cursors.grid.place();

    // Immediately hide info box now that placement is active
    renderer.toggleInfoBox(false);

    // Remove hand cursor from stage
    Game.stage.removeChild(player.playerHandCursor);

    // Enter placement mode
    ui.playerSelectingPlacement = true;
  }

  /**
   * Place the currently selected card onto the game board.
   */
  placeCardOnBoard() {
    if (!board.cellOccupied()) {
      player.cardsInPlayerHand.splice(ui.selectedCardNumber, 1);
      cursors.grid.remove();

      placementController.placeCard(
        ui.selectedCard,
        offsets.gameOffsetX +
          offsets.cellWidth * (ui.selectedColumn - 1) +
          offsets.cardOffsetX,
        offsets.gameOffsetY +
          offsets.cellHeight * (ui.selectedRow - 1) +
          offsets.cardOffsetY
      );
    }
  }
}
