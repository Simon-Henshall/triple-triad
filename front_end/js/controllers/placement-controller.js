import { BoardManager } from "../managers/board-manager.js";
import { ai } from "../game/ai.js";
import { UIManager } from "../managers/ui-manager.js";
import { getPlayerTurn } from "../utilities/turn.js";
import { debug } from "../debug.js";
import { FlippingRenderer } from "../renderers/flipping-renderer.js";
import { PlacementManager } from "../managers/placement-manager.js";
import { Game } from "../game/game.js";
import { swapPlayerTurn } from "../utilities/turn.js";

/**
 * Coordinates the placement of cards from the player's hand or AI hand
 * onto the board, including updating the game state, handling adjacency,
 * applying element effects, and swapping turns.
 * Acts as the main entry point for placement-related actions.
 */
export class PlacementController {
  constructor(playerManager) {
    this.playerManager = playerManager;
    /** @type {FlippingRenderer} Handles card flipping animations */
    this.flippingRenderer = new FlippingRenderer(playerManager);

    /** @type {PlacementManager} Handles the placement animations and completion callbacks */
    this.manager = undefined; // Instantiated in Game.managers
  }

  init() {
    this.manager = new PlacementManager(this);
  }

  /**
   * Begin placement of a card.
   *
   * @param {createjs.Container} card - The card to place.
   * @param {number} x - X coordinate for placement on the board.
   * @param {number} y - Y coordinate for placement on the board.
   */
  placeCard(card, x, y) {
    if (!card) {
      console.warn("Attempted to place a null or undefined card.");
      return;
    }
    BoardManager.checkSelectedSquare();
    this.manager.placeCard(card, x, y);
  }

  // ------------------------------
  // Helper methods for placement logic
  // ------------------------------

  /**
   * Apply element effects (bonus or penalty) to the placed card.
   *
   * @param {createjs.Container} card - The card being placed.
   */
  applyElementEffects(card) {
    const { selectedSquare, squares } = UIManager;
    const squareElement = squares[selectedSquare - 1]?.element;
    const effect = this.manager.applyElementEffects(card, squareElement);
    if (effect.modified) {
      this.manager.renderer.showElementEffect(card, effect.image);
    }
  }

  /**
   * Switch the turn between player and AI after card placement.
   */
  playerTurnSwitch() {
    // Swap active player
    swapPlayerTurn();

    if (debug.active) {
      debug.logTurn();
    }

    const currentTurn = getPlayerTurn();

    if (currentTurn === "blue") {
      this._preparePlayerTurn();
    } else if (currentTurn === "red") {
      ai.turn();
    }
  }

  /**
   * Prepare for the next player turn.
   * Resets card selection, UI state, and player cursor.
   * Called internally by playerTurnSwitch().
   */
  _preparePlayerTurn() {
    const { playerManager } = this;

    // Reset selection to the first available card
    playerManager.selectedCardIndex = 0;
    playerManager.selectedCard = playerManager.cardsInHand[0] ?? undefined;
    UIManager.selectedCardNumber = 0;
    UIManager.selectedCard = playerManager.selectedCard;

    // Default back to centre square
    BoardManager.resetSelectionToCenter();

    // Increment played cards count
    // TODO: This badly needs moving
    playerManager.playedCardsCount++;

    // Restore the player's cursor
    const { cursorController } = Game.controllers;
    cursorController.playerHand.place();

    Game.stage.addChild(playerManager.playerHandCursor);

    // Ensure info box is visible and topmost
    UIManager.bringToFront();

    // Swap back to the card choice phase
    UIManager.playerChoosingCard = true;

    // Reset the card indentation for the player
    this.manager.renderer.indentAfterPlacement();
  }
}
