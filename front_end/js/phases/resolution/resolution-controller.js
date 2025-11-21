import { ResolutionView } from "./resolution-view.js";
import { directionMap } from "../../constants/directions.js";
import { getPlayerTurn } from "../../utilities/turn.js";
import { Game } from "../../shared/game/game.js";
import { UIManager } from "../../shared/ui/ui-manager.js";

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
   */
  constructor() {
    this.view = new ResolutionView(Game.stage);
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

      console.log(
        `flipCardsCheck(), Card: ${card.data.name} | owner: ${card.owner} | ` +
          `Target: ${target.data.name} | target.owner: ${target.owner} | Direction: ${direction}`,
      );

      if (
        card.owner !== target.owner &&
        card.data.strength[direction] >
          target.data.strength[map.opponentStrength]
      ) {
        console.log("Flipping card over!");
        this.flipCardOver(card, direction);
      }
    }
  }

  /**
   * flipCardOver() updates the ownership of a card and animates the flip.
   * @param {Card} card - The card to be flipped to the active player's ownership.
   * @param {string} direction - The direction of the card flip.
   */
  flipCardOver(card, direction) {
    const targetCard = card[directionMap[direction].prop];
    if (!targetCard) {
      return;
    }

    console.log(
      "flipCardOver() called | targetCard:",
      targetCard.data.name,
      "currentOwner:",
      targetCard.owner,
      "newOwner (getPlayerTurn()):",
      getPlayerTurn(),
    );

    // Update ownership
    targetCard.setOwner(getPlayerTurn());

    // Animate flip visually
    this.view.flipCard(targetCard.visuals.container, direction);

    // Update counts
    this.updateOwnershipCounts(1);
    Game.ui.scoreBoard.update();

    // Maintain UI references
    const squareObject = UIManager.squares[targetCard.inCell - 1];
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
    const playerManager = Game.managers.playerManager;
    const aiTurnModel = Game.models.aiTurnModel;

    const delta = {
      blue: { player: 1, ai: -1 },
      red: { player: -1, ai: 1 },
    };

    playerManager.totalBlueCards += delta[turn].player * flippedCount;
    aiTurnModel.currentlyOwnedCards += delta[turn].ai * flippedCount;
  }
}
