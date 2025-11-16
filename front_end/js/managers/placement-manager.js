import { Game } from "../game/game.js";
import { getPlayerTurn } from "../utilities/turn.js";
import { FlippingController } from "../controllers/flipping-controller.js";
import { PlacementRenderer } from "../renderers/placement-renderer.js";
import { BoardManager } from "./board-manager.js";
import { UIManager } from "./ui-manager.js";
import { debug } from "../debug.js";
import { FlippingRenderer } from "../renderers/flipping-renderer.js";
import { offsets } from "../constants/offsets.js";
import { config } from "../config.js";

/**
 * Handles the logical flow of card placement, coordinating animations and
 * board state updates.
 */
export class PlacementManager {
  /**
   * Creates an instance of PlacementManager.
   * @param {PlacementController} controller - The high-level controller managing placement logic.
   */
  constructor(controller) {
    /** @type {PlacementController} */
    this.controller = controller;

    /** @type {PlacementRenderer} */
    this.renderer = new PlacementRenderer();

    /** @type {FlippingController} */
    this.flippingController = new FlippingController();

    /** @type {PlayerManager} */
    this.playerManager = controller.playerManager;

    /** @type {FlippingRenderer} */
    this.flippingRenderer = new FlippingRenderer(this.playerManager);
  }

  /**
   * Initiates the placement of a card: animates it offscreen, then onto the board.
   *
   * @param {createjs.Container} card - The card object to place.
   * @param {number} placementX - X coordinate on the board.
   * @param {number} placementY - Y coordinate on the board.
   */
  placeCard(card, x, y) {
    console.log(
      "[PLACEMENT MANAGER] Placing card:",
      card,
      "selectedSquare:",
      UIManager.selectedSquare,
      "x:",
      x,
      "y:",
      y,
    );
    if (!card.visuals?.container) {
      return;
    }

    BoardManager.updateUISelection(UIManager.selectedSquare);

    const cellIndex = UIManager.selectedSquare - 1;
    if (BoardManager.boardArray[cellIndex].occupant) {
      return;
    }

    // Animate card offscreen first
    this.renderer.moveCardOffscreen(card, () => {
      this.onCardOffscreenComplete(card, x, y);
    });

    // Shift remaining hand cards down
    this.renderer.shiftHandCardsDown();
  }

  /**
   * Callback after card finishes offscreen animation.
   * Moves the card to the board.
   *
   * @param {createjs.Container} card
   * @param {number} placementX
   * @param {number} placementY
   */
  onCardOffscreenComplete(card, x, y, isAI = false) {
    this.renderer.moveCardToBoard(card, x, y, (c) => {
      this.onCardPlacementComplete(c, isAI);
    });
  }

  /**
   * Callback after the card has been fully placed on the board.
   * Updates board state, applies element effects, and triggers flips or turn changes.
   *
   * @param {createjs.Container} card
   */
  onCardPlacementComplete(card, isAI = false) {
    const square = isAI ? UIManager.selectedAISquare : UIManager.selectedSquare;

    // Correctly calculate adjacency for this card
    this.setCardAdjacents(card, square);

    // Add card to board data
    this.addCardToBoard(card, square);

    // Apply element effects
    this.controller.applyElementEffects(card);

    // Trigger flips
    this.flippingController.flipCardsCheck(card);

    Game.stage.update();

    if (BoardManager.isGameOver()) {
      Game.endGame();
    } else {
      this.controller.playerTurnSwitch();
    }
  }

  /**
   * Determine adjacent cards around the given square.
   *
   * @param {createjs.Container} card - The card being placed.
   * @param {number} square - The board square (1-based) to check adjacency for.
   */
  setCardAdjacents(card) {
    const directions = ["Left", "Up", "Right", "Down"];
    for (const direction of directions) {
      const squareIndex = UIManager[`square${direction}`];

      // skip "none" squares
      if (squareIndex === "none") {
        card[`card${direction}`] = null;
        continue;
      }

      const occupant = BoardManager.getOccupant(squareIndex - 1); // convert 1-based to 0-based
      card[`card${direction}`] = occupant ?? null;
    }
  }

  /**
   * Add the card to the board state and update free cells.
   *
   * @param {createjs.Container} card - The card being placed.
   */
  addCardToBoard(card, square = UIManager.selectedSquare) {
    card.inCell = square;
    BoardManager.boardArray[square - 1].occupant = card;

    // Remove from free cells
    const freeIndex = BoardManager.freeCells.indexOf(square);
    if (freeIndex !== -1) {
      BoardManager.freeCells.splice(freeIndex, 1);
    }

    BoardManager.lastPlacedSquare = square;

    const cardContainer = card.visuals.container;

    const bounds = cardContainer.getBounds();
    cardContainer.scaleX = config.scaledCardWidth / bounds.width;
    cardContainer.scaleY = config.scaledCardHeight / bounds.height;

    // Convert GLOBAL → LOCAL
    const pt = UIManager.boardCardsContainer.globalToLocal(
      cardContainer.x,
      cardContainer.y,
    );
    cardContainer.x = pt.x;
    cardContainer.y = pt.y;

    if (!UIManager.boardCardsContainer.contains(cardContainer)) {
      UIManager.boardCardsContainer.addChild(cardContainer);
    }
  }

  /**
   *
   */
  applyElementEffects(card, squareElement) {
    if (!squareElement) {
      return { modified: false };
    }

    const modifier = card.element === squareElement ? 1 : -1;
    card.data.strength.left += modifier;
    card.data.strength.up += modifier;
    card.data.strength.right += modifier;
    card.data.strength.down += modifier;

    return {
      modified: true,
      image:
        modifier > 0
          ? "front_end/images/plus_one.png"
          : "front_end/images/minus_one.png",
    };
  }
}
