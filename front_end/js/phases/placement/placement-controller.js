import { BoardModel } from "../../shared/board/board-model.js";
import { UIModel } from "../../shared/ui/ui-model.js";
import { getPlayerTurn, swapPlayerTurn } from "../../utilities/turn.js";
import { debug } from "../../utilities/debug.js";
import { ResolutionView } from "../resolution/resolution-view.js";
import { PlacementModel } from "./placement-model.js";
import { Game } from "../../shared/game/game.js";

/**
 * Coordinates the logical flow of card placement, bridging player input,
 * logical state, and rendering.
 */
export class PlacementController {
  /**
   * Initializes the PlacementController with the BoardModel and UIModel.
   */
  constructor(playerModel) {
    this.playerModel = playerModel;
    this.resolutionView = new ResolutionView(playerModel);
    this.model = undefined; // set in init()
  }

  /**
   * Handles the application of element effects on the board when a card is played.
   * @param {Card} card The card being played.
   */
  init() {
    this.model = new PlacementModel(this);
  }

  /**
   * Triggers the application of element effects when a card is played.
   * @param {Card} card The card being played.
   */
  applyElementEffects(card) {
    const { selectedSquare, squares } = UIModel;
    const squareElement = squares[selectedSquare - 1]?.element;
    const effect = this.model.applyElementEffects(card, squareElement);
    if (effect.modified) {
      this.model.view.showElementEffect(card, effect.image);
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
      Game.controllers.aiTurnController.takeTurn();
    }
  }

  /**
   * Prepares the player for their next turn.
   * Restores selection and cursor.
   */
  _preparePlayerTurn() {
    const { playerModel } = this;
    const { model: placementModel } = this;

    console.log(
      "[_preparePlayerTurn] hand:",
      playerModel.hand.map((c, index) => ({
        i: index,
        name: c.data.name,
        y: c.visuals.container.y,
      })),
    );
    console.log(
      "selectedCardIndex:",
      playerModel.selectedCardIndex,
      "UIModel.selectedCardNumber:",
      UIModel.selectedCardNumber,
      "selectedCard:",
      playerModel.selectedCard?.data.name,
    );

    // Reset selection to the first available card
    playerModel.selectedCardIndex = 0;
    playerModel.selectedCard = playerModel.hand[0] ?? undefined;
    UIModel.selectedCardNumber = 0;
    UIModel.selectedCard = playerModel.hand;
    UIModel.selectedSquare = 5; // Center

    // Reset grid cursor to last selected square (don't force center)
    BoardModel.updateUISelection(UIModel.selectedSquare);

    // Restore the player's hand cursor
    const { cursorController } = Game.controllers;
    cursorController.playerHand.place();

    Game.stage.addChild(playerModel.playerHandCursor);

    // Ensure info box is visible and topmost
    UIModel.bringToFront();

    // Swap back to the card choice phase
    UIModel.playerChoosingCard = true;

    // Reset card indentation for the player
    placementModel.view.indentAfterPlacement();
  }
}
