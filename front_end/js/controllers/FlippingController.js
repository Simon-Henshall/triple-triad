import { FlippingRenderer } from "../ui/FlippingRenderer.js";
import { directionMap } from "../constants/directions.js";
import { utils } from "../game/utils.js";
import { player } from "../render/player.js";
import { ai } from "../game/ai.js";
import { Game } from "../game/game.js";
import { UIManager } from "../managers/UIManager.js";

const flippingRenderer = new FlippingRenderer();

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
    Object.entries(directionMap).forEach(
      ([direction, { prop, playerStrength, opponentStrength }]) => {
        const target = card[prop];

        if (
          target &&
          card.owner !== target.owner &&
          card[playerStrength] > target[opponentStrength]
        ) {
          this.flipCardOver(card, direction);
        }
      }
    );
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
    flippingRenderer.replaceCard(targetCard);

    // Update counts
    this.updateOwnershipCounts(1);

    // Maintain board consistency
    const squareObj = UIManager.squares[targetCard.inCell - 1];
    if (squareObj) {
      squareObj.card = targetCard;
    }
  }

  /**
   * Update player and AI ownership totals
   * @param {number} flippedCount - Number of cards flipped
   */
  updateOwnershipCounts(flippedCount) {
    const playerColour = this.getCurrentPlayerColour();

    const delta = {
      blue: { totalBlueCardsConfined: 1, totalRedCardsConfined: -1 },
      red: { totalBlueCardsConfined: -1, totalRedCardsConfined: 1 },
    };

    player.totalBlueCards +=
      delta[playerColour].totalBlueCardsConfined * flippedCount;
    ai.totalRedCards +=
      delta[playerColour].totalRedCardsConfined * flippedCount;

    ai.aiCardCount.text = ai.totalRedCards;
    player.playerCardCount.text = player.totalBlueCards;
    Game.stage.update();
  }

  /**
   * Get the colour of the current player.
   * @returns {string} Player colour ("red" or "blue")
   */
  getCurrentPlayerColour() {
    return utils.getPlayerTurn();
  }
}
