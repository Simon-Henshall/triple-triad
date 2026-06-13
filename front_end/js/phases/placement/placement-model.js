import { Game } from "../../shared/game/game.js";
import { ResolutionController } from "../resolution/resolution-controller.js";
import { PlacementView } from "./placement-view.js";
import { BoardModel } from "../../shared/board/board-model.js";
import { ResolutionView } from "../resolution/resolution-view.js";
import { offsets } from "../../constants/offsets.js";
import GameOverController from "../game-over/game-over-controller.js";

/**
 * Handles the logical flow of card placement, coordinating animations and
 * board state updates.
 */
export class PlacementModel {
  /**
   * Creates an instance of PlacementModel.
   * @param {PlacementController} controller - The high-level controller managing placement logic.
   * @param {Function} transition - Function to request phase transitions.
   */
  constructor(controller, transition) {
    /** @type {PlacementController} */
    this.controller = controller;

    /** @type {Function} */
    this.transition = transition;

    /** @type {PlacementView} */
    this.view = new PlacementView();

    /** @type {ResolutionController} */
    this.resolutionController = new ResolutionController();

    /** @type {PlayerModel} */
    this.playerModel = controller.playerModel;

    /** @type {ResolutionView} */
    this.resolutionView = new ResolutionView(this.playerModel);
  }

  /**
   * Place the currently selected card onto the game board.
   */
  placeCardOnBoard() {
    const selectedCard =
      this.playerModel.hand[this.playerModel.selectedCardNumber];
    if (!selectedCard) {
      return console.warn("[Placement Model] No card selected!");
    }

    const cellIndex = BoardModel.selectedSquare - 1;
    if (BoardModel.cellOccupied(cellIndex)) {
      console.warn(
        "[Placement Model] Player tried to place on occupied square",
      );
      return false;
    }

    // Remove card from hand *before* passing it to PlacementModel
    this.playerModel.hand.splice(this.playerModel.selectedCardNumber, 1);

    // Compute board pixel coordinates
    const x =
      offsets.gameOffsetX +
      offsets.cellWidth * (BoardModel.selectedColumn - 1) +
      offsets.cardOffsetX;
    const y =
      offsets.gameOffsetY +
      offsets.cellHeight * (BoardModel.selectedRow - 1) +
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
      "[Placement Model] Placing card:",
      card,
      "selectedSquare:",
      BoardModel.selectedSquare,
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
      this.playerModel.playedCardsCount++;
    }

    BoardModel.updateUISelection(BoardModel.selectedSquare);

    const cellIndex = BoardModel.selectedSquare - 1;
    if (BoardModel.boardArray[cellIndex].occupant) {
      return;
    }

    // Animate card offscreen first
    this.view.moveCardOffscreen(card, () => {
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
    this.view.shiftHandCardsDown();
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
    this.view.moveCardToBoard(card, x, y, (c) => {
      this.onCardPlacementComplete(c);
    });
  }

  /**
   * Callback after the card has been fully placed on the board.
   * Updates board state, applies element effects, and triggers flips.
   *
   * @param {createjs.Container} card
   */
  async onCardPlacementComplete(card) {
    // Correctly calculate adjacency for this card
    this.setCardAdjacents(card, BoardModel.selectedSquare);

    // Add card to board data
    this.addCardToBoard(card, BoardModel.selectedSquare);

    // Apply element effects
    this.controller.applyElementEffects(card);

    // Trigger flips
    this.resolutionController.flipCardsCheck(card);

    Game.stage.update();

    // Check for game-over BEFORE transitioning to resolution.
    // If the board is full, skip resolution and go directly to game-over.
    // Note: we use direct instantiation here because this callback fires
    // within a CreateJS tween chain that is outside the state machine's
    // lifecycle (the placement model is created in game-init.js with
    // transition=undefined). The GameOverController will use the state
    // machine from Game.models for any follow-up transitions (e.g. card-claim).
    if (BoardModel.isGameOver()) {
      const gameOver = new GameOverController(
        {
          playerModel: Game.models.playerModel,
          aiTurnModel: Game.models.aiTurnModel,
        },
        undefined,
      );
      gameOver.activate();
      return;
    }

    // Transition to resolution and provide lastPlacement info so the
    // `resolution` phase can inspect what was just placed.
    if (this.transition) {
      await this.transition("resolution", {
        lastPlacement: {
          card,
          square: BoardModel.selectedSquare,
        },
      });
    }

    this.controller.playerTurnSwitch();
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
      const squareIndex = BoardModel[`square${direction}`];

      // skip "none" squares
      if (squareIndex === "none") {
        card[`card${direction}`] = undefined;
        continue;
      }

      const occupant = BoardModel.getOccupant(squareIndex - 1); // convert 1-based to 0-based
      card[`card${direction}`] = occupant ?? undefined;
    }
  }

  /**
   * Add the card to the board state and update free cells.
   *
   * @param {createjs.Container} card - The card being placed.
   */
  addCardToBoard(card, square = BoardModel.selectedSquare) {
    card.inCell = square;
    BoardModel.boardArray[square - 1].occupant = card;

    // Remove from free cells
    const freeIndex = BoardModel.freeCells.indexOf(square);
    if (freeIndex !== -1) {
      BoardModel.freeCells.splice(freeIndex, 1);
    }

    BoardModel.lastPlacedSquare = square;

    const cardContainer = card.visuals.container;

    const bounds = cardContainer.getBounds();
    cardContainer.scaleX = offsets.scaledCardWidth / bounds.width;
    cardContainer.scaleY = offsets.scaledCardHeight / bounds.height;

    // Convert GLOBAL → LOCAL
    const pt = BoardModel.boardContainer.globalToLocal(
      cardContainer.x,
      cardContainer.y,
    );
    cardContainer.x = pt.x;
    cardContainer.y = pt.y;

    if (!BoardModel.boardContainer.contains(cardContainer)) {
      BoardModel.boardContainer.addChild(cardContainer);
    }
  }

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
