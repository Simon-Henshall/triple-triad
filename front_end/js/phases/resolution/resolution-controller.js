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

    /** Tracks cards captured by Same/Plus/Wall for Combo chaining */
    this._comboCapturedCards = [];
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
   * flipCardsCheck() checks if any adjacent cards can be flipped based on comparing strengths,
   * and also handles Same, Same Wall, Plus, and Combo rules.
   * @param {Card} card
   */
  flipCardsCheck(card) {
    const standardFlips = [];
    const adjacentOpponents = [];
    const adjacentPairs = [];

    // Collect data from all four directions
    for (const [direction, map] of Object.entries(directionMap)) {
      const target = card[map.prop];
      if (!target) {
        continue;
      }

      const placedStrength = card.data.strength[direction];
      const targetStrength = target.data.strength[map.opponentStrength];

      // Standard flip: strength > opponent strength
      if (card.owner !== target.owner && placedStrength > targetStrength) {
        standardFlips.push({ target, direction });
      }

      // Collect adjacent opponent cards for Same/Plus checks
      if (card.owner !== target.owner) {
        adjacentOpponents.push({
          target,
          direction,
          placedStrength,
          targetStrength,
        });
      }

      // Also collect same-owner pairs as candidates for Same/Plus
      adjacentPairs.push({
        target,
        direction: map.opponentStrength,
        placedStrength,
        targetStrength,
      });
    }

    // Apply standard flips first
    for (const { target, direction } of standardFlips) {
      const flipDirection = directionMap[direction].opponentStrength;
      this.flipCardOver(target, flipDirection);
    }

    // Check Same rule
    if (Game.rules.includes("same")) {
      this._checkSameRule(card, adjacentOpponents);
    }

    // Check Plus rule
    if (Game.rules.includes("plus")) {
      this._checkPlusRule(card, adjacentOpponents);
    }

    // Apply Combo chain after any Same/Plus flips
    if (this._comboCapturedCards.length > 0) {
      this._applyComboChain(card);
    }
  }

  /**
   * Check Same rule: if a card is placed touching 2+ opponent cards and the
   * touching values are equal, those opponent cards are flipped.
   * Same Wall: board edges count as rank A (10) for Same checks.
   * @param {Card} card - The placed card
   * @param {Array} adjacentOpponents - Array of { target, direction, placedStrength, targetStrength }
   */
  _checkSameRule(card, adjacentOpponents) {
    if (adjacentOpponents.length < 2) {
      return;
    }

    const isSameWall =
      Game.rules.includes("same_wall") && Game.rules.includes("same");

    // Check all pairs of adjacent opponent cards
    const flipsToApply = new Set();

    for (let index = 0; index < adjacentOpponents.length; index++) {
      for (
        let index_ = index + 1;
        index_ < adjacentOpponents.length;
        index_++
      ) {
        const a = adjacentOpponents[index];
        const b = adjacentOpponents[index_];

        let matchA = a.placedStrength;
        let matchB = b.placedStrength;

        // Same Wall: board edges count as A (10)
        if (isSameWall) {
          // The placed card's strength is compared to the opponent's strength
          // For Same, we check placedStrength vs targetStrength
          // Same Wall means if the edge of the board is adjacent, it counts as A
          const aEdgeIsBoard = this._isBoardEdge(card, a.direction);
          const bEdgeIsBoard = this._isBoardEdge(card, b.direction);

          if (aEdgeIsBoard) {
            matchA = 10; // A rank
          }
          if (bEdgeIsBoard) {
            matchB = 10; // A rank
          }
        }

        if (matchA === matchB) {
          flipsToApply.add({ target: a.target, direction: a.direction });
          flipsToApply.add({ target: b.target, direction: b.direction });
        }
      }
    }

    for (const { target, direction } of flipsToApply) {
      const flipDirection = directionMap[direction].opponentStrength;
      this.flipCardOver(target, flipDirection);
    }
  }

  /**
   * Check Plus rule: when a card touches 2+ opponents and the sum of
   * placed strength + opponent opposing strength is equal for both pairs,
   * both opponent cards are flipped.
   * @param {Card} card - The placed card
   * @param {Array} adjacentOpponents - Array of { target, direction, placedStrength, targetStrength }
   */
  _checkPlusRule(card, adjacentOpponents) {
    if (adjacentOpponents.length < 2) {
      return;
    }

    const flipsToApply = new Set();

    // Check all pairs of adjacent opponent cards
    for (let index = 0; index < adjacentOpponents.length; index++) {
      for (
        let index_ = index + 1;
        index_ < adjacentOpponents.length;
        index_++
      ) {
        const a = adjacentOpponents[index];
        const b = adjacentOpponents[index_];

        // For direction: placedCard.strength[direction] + opponent.strength[opponentStrength]
        const sumA = a.placedStrength + a.targetStrength;
        const sumB = b.placedStrength + b.targetStrength;

        if (sumA === sumB) {
          flipsToApply.add({ target: a.target, direction: a.direction });
          flipsToApply.add({ target: b.target, direction: b.direction });
        }
      }
    }

    for (const { target, direction } of flipsToApply) {
      const flipDirection = directionMap[direction].opponentStrength;
      this.flipCardOver(target, flipDirection);
    }
  }

  /**
   * Apply Combo chain: cards captured by Same/Plus/Wall now flip adjacent
   * opponent cards with lower edge values.
   * Combo is not a standalone rule - it activates automatically when Same/Plus
   * caused flips.
   * @param {Card} placedCard - The originally placed card
   */
  _applyComboChain(placedCard) {
    // Work through captured cards in a queue to handle chains
    const toProcess = [...this._comboCapturedCards];
    const processed = new Set();
    const comboFlips = [];

    while (toProcess.length > 0) {
      const capturedCard = toProcess.shift();

      if (processed.has(capturedCard)) {
        continue;
      }
      processed.add(capturedCard);

      // Check all four sides of this captured card
      for (const [direction, map] of Object.entries(directionMap)) {
        const adjacent = capturedCard[map.prop];

        // Skip if:
        // - No adjacent card
        // - Same owner (already on our side)
        // - Already processed in this chain
        // - Is the originally placed card
        if (
          !adjacent ||
          capturedCard.owner === adjacent.owner ||
          adjacent === placedCard
        ) {
          continue;
        }

        // A captured card has flipped to the current turn's owner
        // Check if its edge is stronger than the opponent's opposing edge
        const capturedStrength =
          capturedCard.data.strength[map.opponentStrength];
        const adjacentStrength = adjacent.data.strength[map.playerStrength];

        if (capturedStrength > adjacentStrength) {
          comboFlips.push({ target: adjacent, direction });

          // This newly flipped card can also trigger further combos
          toProcess.push(adjacent);
        }
      }
    }

    // Apply all combo flips
    for (const { target, direction } of comboFlips) {
      const flipDirection = directionMap[direction].opponentStrength;
      this.flipCardOver(target, flipDirection);
    }

    this._comboCapturedCards = [];
  }

  /**
   * Check if a direction from the placed card faces the board edge.
   * Used by Same Wall to treat edges as rank A.
   * @param {Card} card
   * @param {string} direction - "up", "down", "left", or "right"
   * @returns {boolean}
   */
  _isBoardEdge(card, direction) {
    // Check if there is no card in this direction (board edge)
    const directionInfo = directionMap[direction];
    if (!directionInfo) {
      return false;
    }
    return !card[directionInfo.prop];
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

    // Track for Combo chaining (cards flipped by Same/Plus)
    this._comboCapturedCards.push(targetCard);

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
