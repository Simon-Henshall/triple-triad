import { BoardManager } from "../managers/BoardManager.js";
import { ai } from "../game/ai.js";
import { UIManager } from "../managers/UIManager.js";
import { utils } from "../game/utils.js";
import { debug } from "../debug.js";
import { FlippingRenderer } from "../ui/FlippingRenderer.js";
import { PlacementManager } from "../managers/PlacementManager.js";
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
    const getOccupant = (index) => {
      const cell = BoardManager.boardArray[index - 1];
      return cell ? cell.occupant ?? null : null;
    };

    card.cardLeft = getOccupant(UIManager.squareLeft);
    card.cardUp = getOccupant(UIManager.squareUp);
    card.cardRight = getOccupant(UIManager.squareRight);
    card.cardDown = getOccupant(UIManager.squareDown);

    if (debug.active) console.log(card);
  }

  /**
   * Add the card to the board state and update free cells.
   *
   * @param {createjs.Container} card - The card being placed.
   */
  addCardToBoard(card) {
    card.inCell = UIManager.selectedSquare;
    BoardManager.boardArray[UIManager.selectedSquare - 1].occupant = card;

    const freeCellIndex = BoardManager.freeCells.indexOf(UIManager.selectedSquare);
    if (freeCellIndex > -1) BoardManager.freeCells.splice(freeCellIndex, 1);

    this.flippingRenderer.replaceCard(card);
  }

  /**
   * Apply element effects (bonus or penalty) to the placed card.
   *
   * @param {createjs.Container} card - The card being placed.
   */
  applyElementEffects(card) {
    const squareObj = UIManager.squares[UIManager.selectedSquare - 1];
    if (!squareObj || typeof squareObj.element === "undefined") return;
    if (squareObj.element === 0) return;

    let effectImage;
    if (card.element === squareObj.element) {
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

    if (debug.active) debug.logTurn();

    if (utils.getPlayerTurn() === "blue") {
      // reset selection
      this.playerManager.selectedCardIndex = 0;
      this.playerManager.selectedCard = this.playerManager.cardsInHand[0] || null;
      UIManager.selectedCardNumber = 0;
      UIManager.selectedCard = this.playerManager.selectedCard;

      this.playerManager.playedCardsCount++;
      
      // place the cursor on the top card now
      Game.controllers.cursorController.playerHand.place();

      Game.stage.addChild(this.playerManager.playerHandCursor);
      UIManager.selectedCard.x -= 30;
      Game.stage.setChildIndex(UIManager.infoBox.container, Game.stage.getNumChildren() - 1);
      UIManager.infoBox.container.visible = true;
      UIManager.playerChoosingCard = true;
    } else if (utils.getPlayerTurn() === "red") {
      ai.turn();
    }
  }

  /**
   * Swap the current turn between blue (player) and red (AI).
   */
  swapPlayerTurn() {
    UIManager.playerTurn = utils.getPlayerTurn() === "blue" ? "red" : "blue";
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
    const animateDown = (hand, count) => {
      for (let i = 0; i < count; i++) {
        createjs.Tween.get(hand[i]).to({ y: hand[i].y + offsets.handCardOffset }, 200);
      }
    };

    if (utils.getPlayerTurn() === "blue") {
      this.playerManager.shiftCardsDown(offsets);
    } else {
      // AI logic
      animateDown(ai.cardsInAIHand, ai.aiCardsAboveSelection);
    }
  }
}
