import { SelectionBoardUI } from "../ui/SelectionBoardUI.js";
import { SelectionBoardRenderer } from "../ui/SelectionBoardRenderer.js";
import { UIManager } from "../managers/UIManager.js";
import { utils } from "../game/utils.js";
import { ConfirmationController } from "../controllers/ConfirmationController.js";
import { Game } from "../game/game.js";
import { debug } from "../debug.js";
import { BoardManager } from "../managers/BoardManager.js";
import { offsets } from "../constants/offsets.js";
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
    placementController
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
        Game.controllers.cursorController.playerHand.move("up");
        break;
      case "ArrowDown":
        Game.controllers.cursorController.playerHand.move("down");
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
        Game.controllers.cursorController.grid.move("left");
        break;
      case "ArrowRight":
        Game.controllers.cursorController.grid.move("right");
        break;
      case "ArrowUp":
        Game.controllers.cursorController.grid.move("up");
        break;
      case "ArrowDown":
        Game.controllers.cursorController.grid.move("down");
        break;
      case "Enter":
        this.placeCardOnBoard();
        break;
      case "Backspace":
      case "Escape":
        renderer.restorePlayerHandCursor();
        Game.controllers.cursorController.grid.remove();
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
      if (debug.active) {
        console.log(
          `Selected card: ${card.displayName} (remaining: ${card.count - 1})`
        );
      }

      // Create a visual container for the card offscreen
      const newCardContainer = utils.createCardContainer(
        card,
        "blue",
        this.playerManager.handOffsetX,
        Game.stage.canvas.height + 200
      );

      // Add the card + container to the manager
      this.playerManager.addCardToHand(card, newCardContainer);

      // Animate card into the hand
      this.playerRenderer.animateCardToHand(
        newCardContainer,
        this.playerManager.cardsInHand.length - 1
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
        `Attempted to select a card with zero count: ${card.displayName}`
      );
    }
  }

  /**
   * Undo the last selection made by the player.
   */
  cancelLastSelection() {
    console.log("YES")
  // Remove the last card
  const lastCard = this.playerController.removeLastCard();
  if (!lastCard) return;

  const sb = UIManager.selectionBoard;

  console.group("=== cancelLastSelection LOG ===");
  console.log("lastCard removed:", lastCard.name);

  // Stage info
  console.log("Game.stage contains sb.container?", Game.stage.contains(sb.container));
  console.log("sb.container child count:", sb.container.numChildren);

  // Displayed cards info
  if (sb.displayedCards && sb.displayedCards.length > 0) {
    sb.displayedCards.forEach((c, i) => {
      console.log(
        `displayedCard[${i}] id=${c.id} name=${c.displayName} count=${c.count} colour=${c.colour} visible=${c.countText?.visible}`
      );
      if (!sb.shownCards.children.includes(c.countText)) {
        console.warn(`--> countText for card ${c.id} not in sb.shownCards!`);
      }
    });
  } else {
    console.warn("No displayedCards found on selection board!");
  }

  // Cursor info
  console.log("playerHandSelectionCursor attached?", Game.stage.contains(player.playerHandSelectionCursor));
  console.groupEnd();

  // Continue with existing visual updates
  this.playerRenderer._updateHandAndPreviewZOrder();
  SelectionBoardRenderer.populate(SelectionBoardUI.controller);
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

      // reset logical hand
      this.playerController.resetHand();
      
      // update board counts
      for (let i = 0; i < 5; i++) {
        const lastCard = this.playerManager.playerCards.pop();
        if (lastCard) {
          SelectionBoardRenderer.updateBoardCount(lastCard.id, +1);
        }
        this.playerRenderer._updateHandAndPreviewZOrder();
      }

      // restore selection cursor
      Game.controllers.cursorController.selection.place();
      SelectionBoardRenderer.updateCursor(SelectionBoardUI.controller);
      if (Game.renderers?.cursorRenderer?.selection?.updatePosition) {
        Game.renderers.cursorRenderer.selection.updatePosition();
      }

      // show preview card
      UIManager.selectionBoard.showPreviewCard();

      UIManager.playerConfirming = false;
      UIManager.playerSelectingHand = true;

      Game.stage.update(); // force update
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
      if (!card) return console.warn("No card selected!");

      // remove from logical hand first
      this.playerManager.cardsInHand.splice(UIManager.selectedCardNumber, 1);

      // remove cursor before placement
      Game.controllers.cursorController.grid.remove();

      // pass card to placement controller
      this.placementController.placeCard(
        card,
        offsets.gameOffsetX + offsets.cellWidth * (UIManager.selectedColumn - 1) + offsets.cardOffsetX,
        offsets.gameOffsetY + offsets.cellHeight * (UIManager.selectedRow - 1) + offsets.cardOffsetY
      );

      // update selectedCardIndex & selectedCard
      this.playerManager.selectedCardIndex = 0;
      this.playerManager.selectedCard = this.playerManager.cardsInHand[0] || null;

      // update UIManager for cursor logic
      UIManager.selectedCardNumber = 0;
      UIManager.selectedCard = this.playerManager.selectedCard;
    }
  }
}
