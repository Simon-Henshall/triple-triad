import { Game } from "../../../shared/game/game.js";
import { FlippingController } from "../flipping/flipping-controller.js";
import { PlacementRenderer } from "./placement-renderer.js";
import { BoardManager } from "../../../shared/board/board-manager.js";
import { UIManager } from "../../../shared/ui/ui-manager.js";
import { FlippingRenderer } from "../flipping/flipping-renderer.js";
import { config } from "../../../constants/config.js";
import { offsets } from "../../../constants/offsets.js";

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
   * Place the currently selected card onto the game board.
   */
  placeCardOnBoard() {
    const selectedCard = this.playerManager.hand[UIManager.selectedCardNumber];
    console.log("SELECTED", selectedCard);
    console.log("HAND", this.playerManager.hand);
    if (!selectedCard) {
      return console.warn("No card selected!");
    }

    const cellIndex = UIManager.selectedSquare - 1;
    if (BoardManager.cellOccupied(cellIndex)) {
      console.warn("Player tried to place on occupied square");
      return false;
    }

    // Remove card from hand *before* passing it to PlacementManager
    this.playerManager.hand.splice(UIManager.selectedCardNumber, 1);

    // Compute board pixel coordinates
    const x =
      offsets.gameOffsetX +
      offsets.cellWidth * (UIManager.selectedColumn - 1) +
      offsets.cardOffsetX;
    const y =
      offsets.gameOffsetY +
      offsets.cellHeight * (UIManager.selectedRow - 1) +
      offsets.cardOffsetY;

    this.placeCard(selectedCard, x, y);

    // Remove grid cursor
    Game.controllers.cursorController.grid.remove();
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

    // Increment played cards count
    if (card.owner === "player") {
      this.playerManager.playedCardsCount++;
    }

    BoardManager.updateUISelection(UIManager.selectedSquare);

    const cellIndex = UIManager.selectedSquare - 1;
    if (BoardManager.boardArray[cellIndex].occupant) {
      return;
    }

    // Animate card offscreen first
    this.renderer.moveCardOffscreen(card, () => {
      // Flip the AI card over
      if (card.owner === "ai" && !Game.rules.includes("open")) {
        card.visuals.container.children.find(
          (child) => child.name === "backBitmap",
        ).visible = false;
        card.visuals.container.children.find(
          (child) => child.name === "colourBitmap",
        ).visible = true;
        card.visuals.container.children.find(
          (child) => child.name === "faceBitmap",
        ).visible = true;
      }
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
  onCardOffscreenComplete(card, x, y) {
    this.renderer.moveCardToBoard(card, x, y, (c) => {
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
    // Correctly calculate adjacency for this card
    this.setCardAdjacents(card, UIManager.selectedSquare);

    // Add card to board data
    this.addCardToBoard(card, UIManager.selectedSquare);

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
        card[`card${direction}`] = undefined;
        continue;
      }

      const occupant = BoardManager.getOccupant(squareIndex - 1); // convert 1-based to 0-based
      card[`card${direction}`] = occupant ?? undefined;
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
    cardContainer.scaleX = offsets.scaledCardWidth / bounds.width;
    cardContainer.scaleY = offsets.scaledCardHeight / bounds.height;

    // Convert GLOBAL → LOCAL
    const pt = UIManager.boardContainer.globalToLocal(
      cardContainer.x,
      cardContainer.y,
    );
    cardContainer.x = pt.x;
    cardContainer.y = pt.y;

    if (!UIManager.boardContainer.contains(cardContainer)) {
      UIManager.boardContainer.addChild(cardContainer);
    }
  }

  // eslint-disable-next-line no-commented-code/no-commented-code
  /**
   * Check if the card placement is valid.
   * Valid placement is a square with no adjacent cards of the same element.
   *
   * @param {createjs.Container} card - The card being placed.
   * @param {number} squareIndex - The board square (1-based) to check validity for.
   * @returns {valid: boolean, adjacentCards: {Left: createjs.Container, Up: createjs.Container, Right: createjs.Container, Down: createjs.Container}}
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
