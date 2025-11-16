import { BoardManager } from "../managers/board-manager.js";
import { UIManager } from "../managers/ui-manager.js";
import { getPlayerTurn, swapPlayerTurn } from "../utilities/turn.js";
import { debug } from "../debug.js";
import { FlippingRenderer } from "../renderers/flipping-renderer.js";
import { PlacementManager } from "../managers/placement-manager.js";
import { Game } from "../game/game.js";

/**
 * Coordinates the logical flow of card placement, bridging player input,
 * logical state, and rendering.
 */
export class PlacementController {
  /**
   * Initializes the PlacementController with the BoardManager and UIManager.
   */
  constructor(playerManager) {
    this.playerManager = playerManager;
    this.flippingRenderer = new FlippingRenderer(playerManager);
    this.manager = undefined; // set in init()
  }

  /**
   * Handles the application of element effects on the board when a card is played.
   * @param {Card} card The card being played.
   */
  init() {
    this.manager = new PlacementManager(this);
  }

  /**
   * Returns the PlacementManager instance.
   * @returns {PlacementManager} The PlacementManager instance.
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
   * Switch the turn between player and AI.
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
    const { manager: placementManager } = this;

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
    placementManager.renderer.indentAfterPlacement();
  }
}
