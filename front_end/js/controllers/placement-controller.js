import { BoardManager } from "../managers/board-manager.js";
import { ai } from "../game/ai.js";
import { UIManager } from "../managers/ui-manager.js";
import { utilities } from "../game/utilities.js";
import { debug } from "../debug.js";
import { FlippingRenderer } from "../renderers/flipping-renderer.js";
import { PlacementManager } from "../managers/placement-manager.js";
import { Game } from "../game/game.js";
import { offsets } from "../constants/offsets.js";

/**
 * Coordinates the placement of cards from the player's hand or AI hand
 * onto the board, including updating the game state, handling adjacency,
 * applying element effects, and swapping turns.
 */
export class PlacementController {
  constructor(playerManager) {
    this.playerManager = playerManager;
    /** @type {FlippingRenderer} Handles card flipping animations */
    this.flippingRenderer = new FlippingRenderer(playerManager);

    /** @type {PlacementManager} Handles the placement animations and completion callbacks */
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
    BoardManager.checkSelectedSquare();
    this.manager.placeCard(card, x, y);
  }

  // ------------------------------
  // Helper methods for placement logic
  // ------------------------------

  /**
   * Determine adjacent cards around the selected square.
   *
   * @param {createjs.Container} card - The card being placed.
   */
  setCardAdjacents(card) {
    card.cardLeft = this.getOccupant(UIManager.squareLeft);
    card.cardUp = this.getOccupant(UIManager.squareUp);
    card.cardRight = this.getOccupant(UIManager.squareRight);
    card.cardDown = this.getOccupant(UIManager.squareDown);

    if (debug.active) {
      console.log(card);
    }
  }

  getOccupant = (index) => {
    const cell = BoardManager.boardArray[index - 1];
    return cell ? (cell.occupant ?? undefined) : undefined;
  };

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

    this.flippingRenderer.replaceCard(card);
  }

  /**
   * Apply element effects (bonus or penalty) to the placed card.
   *
   * @param {createjs.Container} card - The card being placed.
   */
  applyElementEffects(card) {
    const squareObject = UIManager.squares[UIManager.selectedSquare - 1];
    if (!squareObject || squareObject.element === undefined) {
      return;
    }
    if (squareObject.element === 0) {
      return;
    }

    let effectImage;
    if (card.element === squareObject.element) {
      card.strengthLeft++;
      card.strengthUp++;
      card.strengthRight++;
      card.strengthDown++;
      effectImage = "front_end/images/plus_one.png";
    } else {
      card.strengthLeft--;
      card.strengthUp--;
      card.strengthRight--;
      card.strengthDown--;
      effectImage = "front_end/images/minus_one.png";
    }

    this.manager.renderer.showElementEffect(card, effectImage);
  }

  /**
   * Switch the turn between player and AI after card placement.
   */
  playerTurnSwitch() {
    this.swapPlayerTurn();

    if (debug.active) {
      debug.logTurn();
    }

    if (utilities.getPlayerTurn() === "blue") {
      // reset selection
      this.playerManager.selectedCardIndex = 0;
      this.playerManager.selectedCard =
        this.playerManager.cardsInHand[0] || undefined;
      UIManager.selectedCardNumber = 0;
      UIManager.selectedCard = this.playerManager.selectedCard;

      // Default back to the centre square for player grid positioning
      UIManager.selectedSquare = 5;

      this.playerManager.playedCardsCount++;

      // place the cursor on the top card now
      Game.controllers.cursorController.playerHand.place();

      Game.stage.addChild(this.playerManager.playerHandCursor);
      UIManager.selectedCard.x -= 30;
      Game.stage.setChildIndex(
        UIManager.infoBox.container,
        Game.stage.getNumChildren() - 1,
      );
      UIManager.infoBox.container.visible = true;
      UIManager.playerChoosingCard = true;
    } else if (utilities.getPlayerTurn() === "red") {
      ai.turn();
    }
  }

  /**
   * Swap the current turn between blue (player) and red (AI).
   */
  swapPlayerTurn() {
    UIManager.playerTurn =
      utilities.getPlayerTurn() === "blue" ? "red" : "blue";
  }

  /**
   * Check if the game is over (all cells occupied).
   *
   * @returns {boolean} True if the board is full, else false.
   */
  isGameOver() {
    return BoardManager.boardArray.every((cell) => cell.occupant);
  }

  /**
   * Animate cards in hand down after one is placed, and adjust
   * the cursor and selection indices.
   */
  shiftHandCardsDown() {
    if (utilities.getPlayerTurn() === "blue") {
      this.playerManager.shiftCardsDown(offsets);
    } else {
      // AI logic
      this.animateDown(ai.cardsInAIHand, ai.aiCardsAboveSelection);
    }
  }

  animateDown = (hand, count) => {
    for (let index = 0; index < count; index++) {
      createjs.Tween.get(hand[index]).to(
        { y: hand[index].y + offsets.handCardOffset },
        200,
      );
    }
  };
}
