import { ResolutionView } from "./resolution-view.js";
import { directionMap } from "../../constants/directions.js";
import { getPlayerTurn } from "../../utilities/turn.js";
import { Game } from "../../shared/game/game.js";
import { BoardModel } from "../../shared/board/board-model.js";

/**
 * ResolutionController is responsible for animating cards as they are flipped
 * between the player's ownerships and the AI's ownership. It uses the ResolutionView
 * to render the animation.
 */
export class ResolutionController {
  /**
   * ResolutionController handles animation of cards as they are flipped
   * between the player's ownerships and the AI's ownership. It uses the ResolutionView
   * to render the animation.
   * @param {Object} localDeps - dependencies provided by the state machine (optional for legacy usage)
   * @param {Function} transition - function to request phase transitions
   */
  constructor(localDeps = {}, transition) {
    // Support both legacy (no args) and new (with deps/transition) usage
    if (typeof localDeps === "function") {
      // If first arg is a function, it's the transition (legacy shift)
      transition = localDeps;
      localDeps = {};
    }

    this.model = localDeps.model || undefined;
    this.transition = transition;
    this.view = new ResolutionView(Game.stage);
  }

  /**
   * Activate the resolution phase.
   */
  async activate() {
    // Resolution animations are triggered during placement.
    // After activation, immediately transition to end-turn
    if (this.transition) {
      await this.transition("end-turn");
    }
  }

  /**
   * Deactivate the resolution phase.
   */
  async deactivate() {
    // Clean up if needed
  }

  /**
   * flipCardsCheck() checks if any adjacent cards can be flipped based on comparing strengths.
   * If so, it calls flipCardOver() to animate the flip.
   * @param {Card} card
   */
  flipCardsCheck(card) {
    for (const [direction, map] of Object.entries(directionMap)) {
      const target = card[map.prop];
      if (!target) {
        continue;
      }

      if (
        card.owner !== target.owner &&
        card.data.strength[direction] >
          target.data.strength[map.opponentStrength]
      ) {
        this.flipCardOver(target, direction);
      }
    }
  }

  /**
   * flipCardOver() updates the ownership of a card and animates the flip.
   * @param {Card} card - The card to be flipped to the active player's ownership.
   * @param {string} direction - The direction of the card flip.
   */
  flipCardOver(targetCard, direction) {
    if (!targetCard) {
      return;
    }

    // Update ownership - map turn colour to owner type
    const turn = getPlayerTurn();
    const updatedOwner = turn === "blue" ? "player" : "ai";
    targetCard.setOwner(updatedOwner);

    // Record the flip in model
    if (this.model) {
      this.model.recordFlip(targetCard);
    }

    // Animate flip visually
    this.view.flipCard(targetCard.visuals.container, direction);

    // Update card face
    this.view.refreshCardFace(targetCard);

    // Update counts
    this.updateOwnershipCounts(1);
    Game.ui.scoreBoard.update();

    // Maintain UI references
    const squareObject = BoardModel.squares[targetCard.inCell - 1];
    if (squareObject) {
      squareObject.card = targetCard;
    }
  }

  /**
   * Updates the counts of cards owned by the current player and AI,
   * after a card has been flipped over.
   * @param {number} flippedCount - The number of cards flipped over.
   */
  updateOwnershipCounts(flippedCount) {
    const turn = getPlayerTurn();
    const playerModel = Game.models.playerModel;
    const aiTurnModel = Game.models.aiTurnModel;

    const delta = {
      blue: { player: 1, ai: -1 },
      red: { player: -1, ai: 1 },
    };

    playerModel.totalBlueCards += delta[turn].player * flippedCount;
    aiTurnModel.currentlyOwnedCards += delta[turn].ai * flippedCount;
  }
}
