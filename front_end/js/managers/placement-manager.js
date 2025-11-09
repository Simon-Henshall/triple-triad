import { Game } from "../game/game.js";
import { getPlayerTurn } from "../utilities/turn.js";
import { FlippingController } from "../controllers/flipping-controller.js";
import { PlacementRenderer } from "../renderers/placement-renderer.js";
import { BoardManager } from "./board-manager.js";
import { UIManager } from "./ui-manager.js";
import { debug } from "../debug.js";
import { FlippingRenderer } from "../renderers/flipping-renderer.js";
import { offsets } from "../constants/offsets.js";

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
  placeCard(card, placementX, placementY) {
    if (!card) {
      console.warn("Attempted to place a null or undefined card.");
      return;
    }

    // Animate the card offscreen first
    const offscreenX =
      getPlayerTurn() === "red"
        ? card.x + offsets.offscreenX
        : card.x - offsets.offscreenX;
    const offscreenY = offsets.offscreenY;
    this.renderer.moveCardOffscreen(card, offscreenX, offscreenY, (c) => {
      this.onCardOffscreenComplete(c, placementX, placementY);
    });

    // TODO: Gets called twice
    //debugger;

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
  onCardOffscreenComplete(card, placementX, placementY) {
    // Ensure card is rendered on top
    Game.stage.setChildIndex(card, Game.stage.getNumChildren() - 1);

    // Update card visuals for red player
    if (getPlayerTurn() === "red") {
      const face = card.children?.[1];
      if (face?.image) {
        face.image.src = card.frontImage;
      }
    }
    this.flippingRenderer.refreshCardFace(card);

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
    this.flippingController.flipCardsCheck(card);

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
    const directions = ["Left", "Up", "Right", "Down"];
    for (const direction of directions) {
      card[`card${direction}`] = BoardManager.getOccupant(
        UIManager[`square${direction}`],
      );
    }

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

    this.flippingRenderer.refreshCardFace(card);
    BoardManager.lastPlacedSquare = UIManager.selectedSquare;
  }

  applyElementEffects(card, squareElement) {
    if (!squareElement) {
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
