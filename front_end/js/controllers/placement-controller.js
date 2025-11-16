import { BoardManager } from "../managers/board-manager.js";
import { UIManager } from "../managers/ui-manager.js";
import { getPlayerTurn, swapPlayerTurn } from "../utilities/turn.js";
import { debug } from "../debug.js";
import { FlippingRenderer } from "../renderers/flipping-renderer.js";
import { PlacementManager } from "../managers/placement-manager.js";
import { Game } from "../game/game.js";
import { offsets } from "../constants/offsets.js";

/**
 *
 */
export class PlacementController {
  /**
   *
   */
  constructor(playerManager) {
    this.playerManager = playerManager;
    this.flippingRenderer = new FlippingRenderer(playerManager);
    this.manager = undefined; // set in init()
  }

  /**
   *
   */
  init() {
    this.manager = new PlacementManager(this);
  }

  /**
   * Attempt to place a card on the currently selected square.
   * Validates square occupancy and only increments playedCardsCount if successful.
   *
   * @param {Card} card
   */
  placeCard(card, x, y) {
    const { playerManager } = this;

    if (!card) {
      console.warn("No card selected");
      return false;
    }

    const square = UIManager.selectedSquare;

    // Prevent placement on an occupied square
    if (BoardManager.cellOccupied(square)) {
      console.warn(
        `[PlacementController] Cannot place on occupied square ${square}`,
      );
      return false;
    }

    // Animate and place the card
    this.manager.placeCard(card, x, y);
  }

  /**
   *
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
   * Switch the turn between player and AI
   */
  playerTurnSwitch() {
    swapPlayerTurn();

    if (debug.active) {
      debug.logTurn();
    }

    const currentTurn = getPlayerTurn();
    if (currentTurn === "blue") {
      this._preparePlayerTurn();
    } else {
      Game.managers.aiManager.takeTurn();
    }
  }

  /**
   * Prepares the player for their next turn.
   * Restores selection and cursor.
   */
  _preparePlayerTurn() {
    const { playerManager } = this;

    console.log(
      "[_preparePlayerTurn] hand:",
      playerManager.hand.map((c, index) => ({
        i: index,
        name: c.data.name,
        y: c.visuals.container.y,
      })),
    );
    console.log(
      "selectedCardIndex:",
      playerManager.selectedCardIndex,
      "UIManager.selectedCardNumber:",
      UIManager.selectedCardNumber,
      "selectedCard:",
      playerManager.selectedCard?.data.name,
    );

    // Reset selection to the first available card
    playerManager.selectedCardIndex = 0;
    playerManager.selectedCard = playerManager.hand[0] ?? undefined;
    UIManager.selectedCardNumber = 0;
    UIManager.selectedCard = playerManager.hand;
    UIManager.selectedSquare = 5; // Center

    // Reset grid cursor to last selected square (don't force center)
    BoardManager.updateUISelection(UIManager.selectedSquare);

    // Restore the player's hand cursor
    const { cursorController } = Game.controllers;
    cursorController.playerHand.place();

    Game.stage.addChild(playerManager.playerHandCursor);

    // Ensure info box is visible and topmost
    UIManager.bringToFront();

    // Swap back to the card choice phase
    UIManager.playerChoosingCard = true;

    // Reset card indentation for the player
    this.manager.renderer.indentAfterPlacement();
  }
}
