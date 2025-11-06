import { Game } from "../game/game.js";
import { utilities } from "../game/utilities.js";
import { FlippingController } from "../controllers/flipping-controller.js";
import { PlacementRenderer } from "../renderers/placement-renderer.js";
import { BoardManager } from "./board-manager.js";
import { UIManager } from "./ui-manager.js";
import { debug } from "../debug.js";

const flippingController = new FlippingController();

/**
 * Handles the logical flow of card placement, coordinating animations and
 * board state updates.
 */
export class PlacementManager {
  /**
   * @param {PlacementController} controller - The high-level controller managing placement logic.
   */
  constructor(controller) {
    /** @type {PlacementController} */
    this.controller = controller;

    /** @type {PlacementRenderer} */
    this.renderer = new PlacementRenderer();
  }

  /**
   * Initiates the placement of a card: animates it offscreen, then onto the board.
   *
   * @param {createjs.Container} card - The card object to place.
   * @param {number} placementX - X coordinate on the board.
   * @param {number} placementY - Y coordinate on the board.
   */
  placeCard(card, placementX, placementY) {
    const offscreenX =
      utilities.getPlayerTurn() === "red" ? card.x + 40 : card.x - 40;
    const offscreenY = -200;

    // Animate the card offscreen first
    this.renderer.moveCardOffscreen(card, offscreenX, offscreenY, (c) => {
      this.onCardOffscreenComplete(c, placementX, placementY);
    });

    // Shift remaining hand cards down
    this.controller.shiftHandCardsDown();
  }

  /**
   * Callback after card finishes offscreen animation.
   * Moves the card to the board.
   *
   * @param {createjs.Container} card
   * @param {number} placementX
   * @param {number} placementY
   */
  onCardOffscreenComplete(card, placementX, placementY) {
    // Ensure card is rendered on top
    Game.stage.setChildIndex(card, Game.stage.getNumChildren() - 1);

    // Update card visuals for red player
    if (utilities.getPlayerTurn() === "red") {
      card.children[1].image.src = card.frontImage;
      this.controller.flippingRenderer.replaceCard(card);
    }

    // Animate card onto board
    this.renderer.moveCardToBoard(card, placementX, placementY, (c) => {
      this.onCardPlacementComplete(c);
    });
  }

  /**
   * Callback after the card has been fully placed on the board.
   * Updates board state, applies element effects, and triggers flips or turn changes.
   *
   * @param {createjs.Container} card
   */
  onCardPlacementComplete(card) {
    // Update adjacency references
    this.setCardAdjacents(card);

    // Add card to board data structure
    this.addCardToBoard(card);

    // Apply element effects based on board square
    this.controller.applyElementEffects(card);

    // Check for flips triggered by placement
    flippingController.flipCardsCheck(card);

    // Update the stage to reflect all changes
    Game.stage.update();

    // Check for game over
    if (BoardManager.isGameOver()) {
      Game.endGame();
    } else {
      // Switch to next player turn
      this.controller.playerTurnSwitch();
    }
  }

  /**
   * Determine adjacent cards around the selected square.
   *
   * @param {createjs.Container} card - The card being placed.
   */
  setCardAdjacents(card) {
    card.cardLeft = BoardManager.getOccupant(UIManager.squareLeft);
    card.cardUp = BoardManager.getOccupant(UIManager.squareUp);
    card.cardRight = BoardManager.getOccupant(UIManager.squareRight);
    card.cardDown = BoardManager.getOccupant(UIManager.squareDown);

    if (debug.active) {
      console.log(card);
    }
  }

  /**
   * Add the card to the board state and update free cells.
   *
   * @param {createjs.Container} card - The card being placed.
   */
  addCardToBoard(card) {
    card.inCell = UIManager.selectedSquare;
    BoardManager.boardArray[UIManager.selectedSquare - 1].occupant = card;

    const freeCellIndex = BoardManager.freeCells.indexOf(
      UIManager.selectedSquare,
    );
    if (freeCellIndex !== -1) {
      BoardManager.freeCells.splice(freeCellIndex, 1);
    }

    this.controller.flippingRenderer.replaceCard(card);
  }

  applyElementEffects(card, squareElement) {
    if (!squareElement || squareElement === 0) {
      return { modified: false };
    }

    const modifier = card.element === squareElement ? 1 : -1;
    card.strengthLeft += modifier;
    card.strengthUp += modifier;
    card.strengthRight += modifier;
    card.strengthDown += modifier;

    return {
      modified: true,
      image:
        modifier > 0
          ? "front_end/images/plus_one.png"
          : "front_end/images/minus_one.png",
    };
  }
}
