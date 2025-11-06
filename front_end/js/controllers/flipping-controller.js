import { FlippingRenderer } from "../renderers/flipping-renderer.js";
import { directionMap } from "../constants/directions.js";
import { utilities } from "../game/utilities.js";
import { ai } from "../game/ai.js";
import { Game } from "../game/game.js";
import { UIManager } from "../managers/ui-manager.js";

export class FlippingController {
  constructor(gameState, player, ai) {
    this.gameState = gameState;
    this.player = player;
    this.ai = ai;
  }

  /**
   * Check adjacent cards for possible flips based on strengths.
   * @param {Object} card - The card to check around.
   */
  flipCardsCheck(card) {
    for (const [
      direction,
      { prop, playerStrength, opponentStrength },
    ] of Object.entries(directionMap)) {
      const target = card[prop];

      if (
        target &&
        card.owner !== target.owner &&
        card[playerStrength] > target[opponentStrength]
      ) {
        this.flipCardOver(card, direction);
      }
    }
  }

  /**
   * Flip a single adjacent card over to the current player's side.
   * @param {Object} card - The source card triggering the flip
   * @param {string} direction - Direction to flip ("left", "right", "up", "down")
   */
  flipCardOver(card, direction) {
    const targetCard = card[directionMap[direction].prop];

    // Change ownership
    targetCard.owner = this.getCurrentPlayerColour();

    // Update visual representation
    const playerManager = Game.managers.playerManager;
    const flippingRenderer = new FlippingRenderer(playerManager);
    flippingRenderer.replaceCard(targetCard);

    // Update counts
    this.updateOwnershipCounts(1);

    // Maintain board consistency
    const squareObject = UIManager.squares[targetCard.inCell - 1];
    if (squareObject) {
      squareObject.card = targetCard;
    }
  }

  /**
   * Update player and AI ownership totals
   * @param {number} flippedCount - Number of cards flipped
   */
  updateOwnershipCounts(flippedCount) {
    const playerColour = this.getCurrentPlayerColour();
    const playerManager = Game.managers.playerManager;

    const delta = {
      blue: { totalBlueCardsConfined: 1, totalRedCardsConfined: -1 },
      red: { totalBlueCardsConfined: -1, totalRedCardsConfined: 1 },
    };

    playerManager.totalBlueCards +=
      delta[playerColour].totalBlueCardsConfined * flippedCount;
    ai.totalRedCards +=
      delta[playerColour].totalRedCardsConfined * flippedCount;

    ai.aiCardCount.text = ai.totalRedCards;
    playerManager.playerCardCount.text = playerManager.totalBlueCards;
    Game.stage.update();
  }

  /**
   * Get the colour of the current player.
   * @returns {string} Player colour ("red" or "blue")
   */
  getCurrentPlayerColour() {
    return utilities.getPlayerTurn();
  }
}
