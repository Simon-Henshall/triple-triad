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
    const adjacentCards = []; // All adjacent partners for Same/Plus checks

    // Collect data from all four directions
    for (const [direction, map] of Object.entries(directionMap)) {
      const target = card[map.prop];

      if (target) {
        const placedStrength = card.data.strength[direction];
        const targetStrength = target.data.strength[map.opponentStrength];

        // Standard flip: strength > opponent strength
        if (card.owner !== target.owner && placedStrength > targetStrength) {
          standardFlips.push({ target, direction });
        }
      }

      // Collect adjacency info for Same/Plus (including board edges for Same Wall)
      // Same checks use original (printed) strengths — element effects are ignored.
      // Plus checks use current strengths (element effects apply).
      adjacentCards.push({
        target, // Card object or null (board edge)
        direction,
        // Fallback to strength if originalStrength not available (back-compat)
        placedOriginal:
          card.data.originalStrength?.[direction] ??
          card.data.strength[direction],
        placedCurrent: card.data.strength[direction],
        isOpponent: target ? card.owner !== target.owner : false,
        exists: !!target, // false = board edge
      });
    }

    // Apply standard flips first
    for (const { target, direction } of standardFlips) {
      const flipDirection = directionMap[direction].opponentStrength;
      this.flipCardOver(target, flipDirection);
    }

    // Check Same rule
    if (Game.rules.includes("same")) {
      this._checkSameRule(card, adjacentCards);
    }

    // Check Plus rule
    if (Game.rules.includes("plus")) {
      this._checkPlusRule(card, adjacentCards);
    }

    // Apply Combo chain after any Same/Plus flips
    if (this._comboCapturedCards.length > 0) {
      this._applyComboChain(card);
    }
  }

  /**
   * Check Same rule: when a placed card touches at least two adjacent cards
   * (or board edges with Same Wall) and the touching values match for both
   * partners, opponent cards in the matching set are flipped.
   *
   * How matching works:
   * - For each adjacent card, the placed card's printed value on that side is
   *   compared to the adjacent card's printed value on the facing side.
   * - If both comparisons equal (placed.sideA == adjacentA.facing AND
   *   placed.sideB == adjacentB.facing), the Same rule triggers.
   * - At least one of the matching partners must be opponent-owned to cause flips.
   * - Element modifications are ignored — uses original/printed strengths only.
   *
   * Same Wall: board edges count as rank A (value 10) for Same checks.
   *
   * @param {Card} card - The placed card
   * @param {Array} adjacentCards - Array of {target, direction, placedOriginal, isOpponent, exists}
   */
  _checkSameRule(card, adjacentCards) {
    const isSameWall =
      Game.rules.includes("same_wall") && Game.rules.includes("same");

    // Partners are directions with:
    // - an actual adjacent card, OR
    // - a board edge (when Same Wall is active)
    const partners = adjacentCards.filter((a) => a.exists || isSameWall);
    if (partners.length < 2) {
      return;
    }

    const flipsToApply = new Set();

    // Check all pairs of partners
    for (let index = 0; index < partners.length; index++) {
      for (let index_ = index + 1; index_ < partners.length; index_++) {
        const a = partners[index];
        const b = partners[index_];

        // Get the adjacent card's facing value (printed, element-ignorant)
        // For a real card: look up its opposing side's printed strength
        // For a board edge (Same Wall): value is 10 (A rank)
        // Fallback to strength if originalStrength not available (back-compat)
        let adjacentValueA;
        if (a.exists) {
          const mapA = directionMap[a.direction];
          adjacentValueA =
            a.target.data.originalStrength?.[mapA.opponentStrength] ??
            a.target.data.strength[mapA.opponentStrength];
        } else {
          adjacentValueA = 10; // board edge = A
        }

        let adjacentValueB;
        if (b.exists) {
          const mapB = directionMap[b.direction];
          adjacentValueB =
            b.target.data.originalStrength?.[mapB.opponentStrength] ??
            b.target.data.strength[mapB.opponentStrength];
        } else {
          adjacentValueB = 10; // board edge = A
        }

        // Same check: placed card's printed value on this side MUST equal
        // the adjacent card's printed value on the opposing side, for BOTH partners.
        // This is the literal "same" rule — each pair of touching sides shares
        // the exact same number value, using printed (element-ignorant) strengths.
        const matchA = a.placedOriginal === adjacentValueA;
        const matchB = b.placedOriginal === adjacentValueB;

        if (matchA && matchB) {
          // At least one partner must be an opponent card for a flip to occur.
          // (Your own cards can help complete the matching set but don't flip.)
          if (a.isOpponent) {
            flipsToApply.add({ target: a.target, direction: a.direction });
          }
          if (b.isOpponent) {
            flipsToApply.add({ target: b.target, direction: b.direction });
          }
        }
      }
    }

    for (const { target, direction } of flipsToApply) {
      const flipDirection = directionMap[direction].opponentStrength;
      this.flipCardOver(target, flipDirection);
    }
  }

  /**
   * Check Plus rule: when a card touches 2+ opponent cards and the sum of
   * placed strength + opponent opposing strength is equal for both pairs,
   * both opponent cards are flipped.
   * @param {Card} card - The placed card
   * @param {Array} adjacentCards - Array of {target, direction, placedCurrent, isOpponent, exists}
   */
  _checkPlusRule(card, adjacentCards) {
    // Plus only considers actual opponent cards (not board edges or own cards)
    const opponentAdjacents = adjacentCards.filter((a) => a.isOpponent);
    if (opponentAdjacents.length < 2) {
      return;
    }

    const flipsToApply = new Set();

    // Check all pairs of adjacent opponent cards
    for (let index = 0; index < opponentAdjacents.length; index++) {
      for (
        let index_ = index + 1;
        index_ < opponentAdjacents.length;
        index_++
      ) {
        const a = opponentAdjacents[index];
        const b = opponentAdjacents[index_];

        // Get the opponent's opposing strength (current value, elements apply)
        const mapA = directionMap[a.direction];
        const targetStrengthA = a.target.data.strength[mapA.opponentStrength];

        const mapB = directionMap[b.direction];
        const targetStrengthB = b.target.data.strength[mapB.opponentStrength];

        // For direction: placedCard.currentStrength[direction] + opponent.strength[opponentStrength]
        const sumA = a.placedCurrent + targetStrengthA;
        const sumB = b.placedCurrent + targetStrengthB;

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
