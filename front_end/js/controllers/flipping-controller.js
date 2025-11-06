import { FlippingRenderer } from "../renderers/flipping-renderer.js";
import { directionMap } from "../constants/directions.js";
import { utilities } from "../game/utilities.js";
import { ai } from "../game/ai.js";
import { Game } from "../game/game.js";
import { UIManager } from "../managers/ui-manager.js";

/**
 * Handles the core logic for flipping cards after placement,
 * including ownership updates, count tracking, and visual refreshes.
 */
export class FlippingController {
  /**
   * TODO: Look into consideration of these paramaters.
   * @param {Object} [gameState] - Optional reference to the current game state.
   * @param {Object} [player] - Optional reference to player data.
   * @param {Object} [aiInstance] - Optional reference to AI data.
   */
  constructor(gameState, player, aiInstance) {
    this.gameState = gameState;
    this.player = player;
    this.ai = aiInstance;
  }

  /**
   * Checks adjacent cards for flip conditions based on attack/defence strengths.
   *
   * @param {createjs.Container} card - The card just placed or triggering the flip check.
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
   * Flips a single adjacent card to the current player's side, updates visuals and counts.
   *
   * @param {createjs.Container} card - The source card triggering the flip.
   * @param {string} direction - Direction to flip ("left", "right", "up", "down").
   */
  flipCardOver(card, direction) {
    const targetCard = card[directionMap[direction].prop];
    if (!targetCard) {
      return;
    }

    // Change ownership
    targetCard.owner = this.getCurrentPlayerColour();

    // Refresh visuals
    const playerManager = Game.managers.playerManager;
    const flippingRenderer = new FlippingRenderer(playerManager);
    flippingRenderer.refreshCardFace(targetCard);

    // Update ownership counts
    this.updateOwnershipCounts(1);

    // Maintain UI consistency
    const squareObject = UIManager.squares[targetCard.inCell - 1];
    if (squareObject) {
      squareObject.card = targetCard;
    }
  }

  /**
   * Updates the displayed counts for red and blue card ownership after flips.
   *
   * @param {number} flippedCount - Number of cards flipped this turn.
   */
  updateOwnershipCounts(flippedCount) {
    const playerColour = this.getCurrentPlayerColour();
    const playerManager = Game.managers.playerManager;

    const delta = {
      blue: { player: 1, ai: -1 },
      red: { player: -1, ai: 1 },
    };

    playerManager.totalBlueCards += delta[playerColour].player * flippedCount;
    ai.totalRedCards += delta[playerColour].ai * flippedCount;

    // Update on-screen text
    ai.aiCardCount.text = ai.totalRedCards;
    playerManager.playerCardCount.text = playerManager.totalBlueCards;

    Game.stage.update();
  }

  /**
   * Returns the colour of the current active player.
   *
   * @returns {"red"|"blue"} The current player's colour.
   */
  getCurrentPlayerColour() {
    return utilities.getPlayerTurn();
  }
}
