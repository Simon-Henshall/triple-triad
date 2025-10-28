import { board } from "../render/board.js";
import { player } from "../render/player.js";
import { ai } from "../game/ai.js";
import { ui } from "../render/ui.js";
import { utils } from "../game/utils.js";
import { debug } from "../debug.js";
import { FlippingRenderer } from "../ui/FlippingRenderer.js";
import { PlacementManager } from "../managers/PlacementManager.js";
import { Game } from "../game/game.js";
import { offsets } from "../render/offsets.js";

/**
 * Coordinates the placement of cards from the player's hand or AI hand
 * onto the board, including updating the game state, handling adjacency,
 * applying element effects, and swapping turns.
 */
export class PlacementController {
  constructor() {
    /** @type {FlippingRenderer} Handles card flipping animations */
    this.flippingRenderer = new FlippingRenderer();

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
    board.checkSelectedSquare();
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
      const cell = board.boardArray[index - 1];
      return cell ? cell.occupant ?? null : null;
    };

    card.cardLeft = getOccupant(ui.squareLeft);
    card.cardUp = getOccupant(ui.squareUp);
    card.cardRight = getOccupant(ui.squareRight);
    card.cardDown = getOccupant(ui.squareDown);

    if (debug.active) console.log(card);
  }

  /**
   * Add the card to the board state and update free cells.
   *
   * @param {createjs.Container} card - The card being placed.
   */
  addCardToBoard(card) {
    card.inCell = ui.selectedSquare;
    board.boardArray[ui.selectedSquare - 1].occupant = card;

    const freeCellIndex = board.freeCells.indexOf(ui.selectedSquare);
    if (freeCellIndex > -1) board.freeCells.splice(freeCellIndex, 1);

    this.flippingRenderer.replaceCard(card);
  }

  /**
   * Apply element effects (bonus or penalty) to the placed card.
   *
   * @param {createjs.Container} card - The card being placed.
   */
  applyElementEffects(card) {
    const squareObj = ui.squares[ui.selectedSquare - 1];
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
      player.playedPlayerCardCount++;
      ui.selectedCard = player.cardsInPlayerHand[ui.selectedCardNumber];

      Game.stage.addChild(player.playerHandCursor);
      ui.selectedCard.x -= 30;
      Game.stage.setChildIndex(ui.infoBox.container, Game.stage.getNumChildren() - 1);
      ui.infoBox.container.visible = true;
      ui.playerChoosingCard = true;
    } else if (utils.getPlayerTurn() === "red") {
      ai.turn();
    }
  }

  /**
   * Swap the current turn between blue (player) and red (AI).
   */
  swapPlayerTurn() {
    ui.playerTurn = utils.getPlayerTurn() === "blue" ? "red" : "blue";
  }

  /**
   * Check if the game is over (all cells occupied).
   *
   * @returns {boolean} True if the board is full, else false.
   */
  isGameOver() {
    return board.boardArray.every((cell) => cell.occupant);
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
      animateDown(player.cardsInPlayerHand, player.cardsAboveSelection);

      if (ui.selectedCardNumber === 0) {
        player.playerHandCursor.y += offsets.handCardOffset;
        ui.selectedCard = player.cardsInPlayerHand[ui.selectedCardNumber];
      } else {
        ui.selectedCardNumber--;
        ui.selectedCard = player.cardsInPlayerHand[ui.selectedCardNumber];
        player.cardsAboveSelection--;
      }
    } else if (utils.getPlayerTurn() === "red") {
      animateDown(ai.cardsInAIHand, ai.aiCardsAboveSelection);
    }
  }
}
