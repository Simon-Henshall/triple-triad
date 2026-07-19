import { AITurnView } from "./ai-turn-view.js";
import { BoardModel } from "../../shared/board/board-model.js";
import { Game } from "../../shared/game/game.js";
import { directionMap } from "../../constants/directions.js";
import { offsets } from "../../constants/offsets.js";

/**
 * Scoring weights for AI placement evaluation.
 * The AI uses a comprehensive scoring system that considers:
 * - Grid position value (corners > edges > center)
 * - Offensive potential (flipping opponent cards)
 * - Defensive safety (avoiding being flipped back)
 * - Rule-based bonuses (Same, Plus, Combo chain reactions)
 */
const GRID_CORNER_SCORE = 8;
const GRID_EDGE_SCORE = 5;
const GRID_CENTER_SCORE = 2;
const OFFENSIVE_FLIP_SCORE = 10;
const DEFENSIVE_EDGE_SAFE = 3;
const DEFENSIVE_OPPONENT_SAFE = 3;
const DEFENSIVE_RISK_PENALTY = -5;
const SAME_RULE_BONUS = 15;
const PLUS_RULE_BONUS = 12;
const COMBO_CHAIN_MULTIPLIER = 2;

/**
 * AI Turn Controller
 * Handles the AI's decision-making, interacts with BoardModel, and updates the view.
 * The AI uses a sophisticated scoring algorithm that evaluates every possible
 * card + slot combination, considering offensive flips, defensive safety,
 * grid position value, and rule-based chain reactions (Same/Plus/Combo).
 */
export class AITurnController {
  /**
   * Constructor for AI Turn Controller.
   * @param {Object} localDeps - dependencies provided by the state machine
   * @param {Function} transition - function to request phase transitions
   */
  constructor(localDeps, transition) {
    this.model = localDeps.aiModel;
    this.transition = transition;
    this.view = new AITurnView(Game.stage);
    this.handOffsetX = offsets.cardOffsetX; // x-position for AI hand on stage
  }

  /**
   * Activate the AI turn phase.
   */
  async activate() {
    console.log("[AI Turn] Activating AI turn phase");
    console.log(
      "[AI Turn] AI hand:",
      this.model.hand.map((c) => c.data.name),
    );
    // Execute the AI's turn (await so the phase stays active during the 2s delay)
    await this.takeTurn();
  }

  /**
   * Deactivate the AI turn phase.
   */
  async deactivate() {
    // Clean up if needed
  }

  /**
   * Initialise the AI hand visually and logically
   */
  initHand(drawnCards) {
    if (!drawnCards || drawnCards.length === 0) {
      return;
    }

    this.view.displayHand(drawnCards, this.handOffsetX);

    console.log(
      "[AI Turn] Hand initialised:",
      drawnCards.map((c) => c.data.name),
    );
  }

  /**
   * Generate a random integer between min and max (inclusive).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  _randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Simulate the AI "thinking" by cycling its selection cursor across random cards
   * before finally settling on the chosen card.
   * Each thought step lasts `placementDelay` ms, with 2-5 steps total.
   * The delay is determined once per game instance (50-2000ms) and remains constant
   * for the entire game, giving the AI a consistent "thinking speed" personality.
   * @param {Array} hand - The AI hand
   * @param {number} finalIndex - The index of the card the AI ultimately selects
   */
  async _animateThinking(hand, finalIndex) {
    const numberSteps = this._randomInt(2, 5);
    const handSize = hand.length;
    const delay = this.model.placementDelay;

    // Pick random intermediate indices that differ from final and from each other
    let previousIndex = finalIndex;
    for (let step = 0; step < numberSteps; step++) {
      // Choose a random index that differs from the previous one
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * handSize);
      } while (randomIndex === previousIndex && handSize > 1);

      // Show selection (cursor + indent) on the random card
      this.view.showSelection(hand, randomIndex);

      // Wait for the AI's placement delay before moving to the next thought
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Hide the previous selection
      this.view.hideSelection(hand);

      previousIndex = randomIndex;
    }
  }

  /**
   * Get the adjacent cell index (1-based) for a given cell and direction.
   * Uses squareMap to correctly resolve adjacency for the cell being evaluated,
   * rather than relying on BoardModel.square* properties which reflect the
   * currently selected square (not necessarily the cell being scored).
   *
   * @param {number} cellIndex - 1-based board cell index
   * @param {string} direction - "left", "up", "right", or "down"
   * @returns {number|string} Adjacent cell index (1-based) or "none" if board edge
   */
  _getAdjacentCell(cellIndex, direction) {
    const squareInfo = BoardModel.squareMap[cellIndex - 1];
    if (!squareInfo) {
      return "none";
    }
    const capitalised = direction.charAt(0).toUpperCase() + direction.slice(1);
    return squareInfo[capitalised] ?? "none";
  }

  /**
   * Calculate the grid position score for a given cell.
   * Corners (cells 1,3,7,9) have 2 exposed edges → safest.
   * Edges (cells 2,4,6,8) have 3 exposed edges → moderate.
   * Center (cell 5) has 4 exposed edges → most vulnerable.
   *
   * @param {number} cellIndex - 1-based board cell index
   * @returns {number} Grid position score (higher = better position)
   */
  _calculateGridScore(cellIndex) {
    // Corners: 1, 3, 7, 9
    const corners = [1, 3, 7, 9];
    // Edges (non-corner): 2, 4, 6, 8
    const edges = [2, 4, 6, 8];

    if (corners.includes(cellIndex)) {
      return GRID_CORNER_SCORE;
    }
    if (edges.includes(cellIndex)) {
      return GRID_EDGE_SCORE;
    }
    // Center: 5
    return GRID_CENTER_SCORE;
  }

  /**
   * Evaluate the offensive score for placing a card in a given cell.
   * Counts how many opponent cards would be flipped and scores each flip.
   * Simulates element effects on the card's strengths before evaluating.
   *
   * @param {Object} card - The AI card being considered
   * @param {number} cellIndex - 1-based board cell index
   * @returns {number} Offensive score (higher = better, more flips)
   */
  _calculateOffensiveScore(card, cellIndex) {
    const boardElement = BoardModel.boardArray[cellIndex - 1]?.element || 0;

    let score = 0;

    for (const [direction, map] of Object.entries(directionMap)) {
      const adjacentIndex = this._getAdjacentCell(cellIndex, direction);
      if (adjacentIndex === "none") {
        continue;
      }

      const occupant = BoardModel.getOccupant(adjacentIndex - 1);
      if (!occupant || occupant.owner !== "player") {
        continue;
      }

      // Calculate effective strength with element effects
      let placedStrength = card.data.strength[direction];
      if (boardElement !== 0) {
        const modifier = card.data.element === boardElement ? 1 : -1;
        placedStrength += modifier;
      }

      const targetStrength = occupant.data.strength[map.opponentStrength];

      if (placedStrength > targetStrength) {
        score += OFFENSIVE_FLIP_SCORE;
      }
    }

    return score;
  }

  /**
   * Evaluate the defensive score for placing a card in a given cell.
   * Assesses how vulnerable the AI card would be to being flipped back.
   * The AI only considers opponent cards already visible on the board
   * (no knowledge of the player's hand).
   *
   * @param {Object} card - The AI card being considered
   * @param {number} cellIndex - 1-based board cell index
   * @returns {number} Defensive score (higher = safer)
   */
  _calculateDefensiveScore(card, cellIndex) {
    const boardElement = BoardModel.boardArray[cellIndex - 1]?.element || 0;

    let score = 0;

    for (const [direction, map] of Object.entries(directionMap)) {
      const adjacentIndex = this._getAdjacentCell(cellIndex, direction);

      if (adjacentIndex === "none") {
        // Board edge - completely safe in this direction
        score += DEFENSIVE_EDGE_SAFE;
        continue;
      }

      // Calculate effective strength with element effects
      let placedStrength = card.data.strength[direction];
      if (boardElement !== 0) {
        const modifier = card.data.element === boardElement ? 1 : -1;
        placedStrength += modifier;
      }

      const occupant = BoardModel.getOccupant(adjacentIndex - 1);

      if (!occupant) {
        // Empty cell - neutral (player could place here, but we don't know their hand)
        continue;
      }

      if (occupant.owner === "ai") {
        // Own card - safe, protects our card
        score += DEFENSIVE_EDGE_SAFE;
        continue;
      }

      // Opponent card - check if it can flip us back
      const opponentStrength = occupant.data.strength[map.playerStrength];

      score +=
        opponentStrength >= placedStrength
          ? DEFENSIVE_RISK_PENALTY
          : DEFENSIVE_OPPONENT_SAFE;
    }

    return score;
  }

  /**
   * Simulate the Same rule check for a potential placement.
   * The Same rule triggers when a placed card touches at least two adjacent cards
   * (or board edges with Same Wall) and the touching values match for both partners.
   *
   * @param {Object} card - The AI card being considered
   * @param {number} cellIndex - 1-based board cell index
   * @returns {{ triggered: boolean, flipCount: number }} Whether Same would trigger and how many flips
   */
  _simulateSameRule(card, cellIndex) {
    if (!Game.rules.includes("same")) {
      return { triggered: false, flipCount: 0 };
    }

    const isSameWall =
      Game.rules.includes("same_wall") && Game.rules.includes("same");

    // Collect adjacent partners (cards or board edges for Same Wall)
    const partners = [];

    for (const [direction, map] of Object.entries(directionMap)) {
      const adjacentIndex = this._getAdjacentCell(cellIndex, direction);
      const exists = adjacentIndex !== "none";

      if (!exists && !isSameWall) {
        continue;
      }

      const occupant = exists
        ? BoardModel.getOccupant(adjacentIndex - 1)
        : undefined;

      // Get the placed card's original (printed) strength on this side
      const placedOriginal =
        card.data.originalStrength?.[direction] ??
        card.data.strength[direction];

      // Get the adjacent card's facing value (printed, element-ignorant)
      // For board edge (Same Wall): value is 10 (A rank)
      let adjacentValue;
      if (exists && occupant) {
        const mapA = directionMap[direction];
        adjacentValue =
          occupant.data.originalStrength?.[mapA.opponentStrength] ??
          occupant.data.strength[mapA.opponentStrength];
      } else {
        adjacentValue = 10; // board edge = A
      }

      partners.push({
        exists,
        isOpponent: exists && occupant ? card.owner !== occupant.owner : false,
        target: occupant,
        direction,
        placedOriginal,
        adjacentValue,
      });
    }

    if (partners.length < 2) {
      return { triggered: false, flipCount: 0 };
    }

    const flipsToApply = new Set();

    // Check all pairs of partners
    for (let index = 0; index < partners.length; index++) {
      for (let index_ = index + 1; index_ < partners.length; index_++) {
        const a = partners[index];
        const b = partners[index_];

        // Same check: placed card's printed value on this side MUST equal
        // the adjacent card's printed value on the opposing side, for BOTH partners
        const matchA = a.placedOriginal === a.adjacentValue;
        const matchB = b.placedOriginal === b.adjacentValue;

        if (matchA && matchB) {
          // At least one partner must be an opponent card for a flip to occur
          if (a.isOpponent) {
            flipsToApply.add(a.target);
          }
          if (b.isOpponent) {
            flipsToApply.add(b.target);
          }
        }
      }
    }

    return {
      triggered: flipsToApply.size > 0,
      flipCount: flipsToApply.size,
    };
  }

  /**
   * Simulate the Plus rule check for a potential placement.
   * The Plus rule triggers when a card touches 2+ opponent cards and the sum of
   * placed strength + opponent opposing strength is equal for both pairs.
   *
   * @param {Object} card - The AI card being considered
   * @param {number} cellIndex - 1-based board cell index
   * @returns {{ triggered: boolean, flipCount: number }} Whether Plus would trigger and how many flips
   */
  _simulatePlusRule(card, cellIndex) {
    if (!Game.rules.includes("plus")) {
      return { triggered: false, flipCount: 0 };
    }

    const boardElement = BoardModel.boardArray[cellIndex - 1]?.element || 0;

    // Collect adjacent opponent cards with their current strengths
    const opponentAdjacents = [];

    for (const [direction, map] of Object.entries(directionMap)) {
      const adjacentIndex = this._getAdjacentCell(cellIndex, direction);
      if (adjacentIndex === "none") {
        continue;
      }

      const occupant = BoardModel.getOccupant(adjacentIndex - 1);
      if (!occupant || occupant.owner !== "player") {
        continue;
      }

      // Calculate placed card's effective strength with element effects
      let placedStrength = card.data.strength[direction];
      if (boardElement !== 0) {
        const modifier = card.data.element === boardElement ? 1 : -1;
        placedStrength += modifier;
      }

      // Get the opponent's opposing strength (current value, elements apply)
      const targetStrength = occupant.data.strength[map.opponentStrength];

      opponentAdjacents.push({
        target: occupant,
        direction,
        placedCurrent: placedStrength,
        targetStrength,
      });
    }

    if (opponentAdjacents.length < 2) {
      return { triggered: false, flipCount: 0 };
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

        const sumA = a.placedCurrent + a.targetStrength;
        const sumB = b.placedCurrent + b.targetStrength;

        if (sumA === sumB) {
          flipsToApply.add(a.target);
          flipsToApply.add(b.target);
        }
      }
    }

    return {
      triggered: flipsToApply.size > 0,
      flipCount: flipsToApply.size,
    };
  }

  /**
   * Simulate the Combo chain reaction after Same/Plus flips.
   * Cards captured by Same/Plus can then flip adjacent opponent cards
   * with lower edge values, creating chain reactions.
   *
   * @param {Object} card - The AI card being considered
   * @param {number} cellIndex - 1-based board cell index
   * @param {Array} capturedCards - Cards that would be captured by Same/Plus
   * @returns {number} Number of additional flips from the combo chain
   */
  _simulateComboChain(card, cellIndex, capturedCards) {
    if (capturedCards.length === 0) {
      return 0;
    }

    // Simulate the combo chain by working through captured cards in a queue
    const toProcess = [...capturedCards];
    const processed = new Set();
    const comboFlips = new Set();

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
        // - Is the originally placed card
        if (
          !adjacent ||
          capturedCard.owner === adjacent.owner ||
          adjacent === card
        ) {
          continue;
        }

        // A captured card has flipped to the current turn's owner
        // Check if its edge is stronger than the opponent's opposing edge
        const capturedStrength =
          capturedCard.data.strength[map.opponentStrength];
        const adjacentStrength = adjacent.data.strength[map.playerStrength];

        if (capturedStrength > adjacentStrength) {
          comboFlips.add(adjacent);

          // This newly flipped card can also trigger further combos
          toProcess.push(adjacent);
        }
      }
    }

    return comboFlips.size;
  }

  /**
   * Score a potential placement for evaluation.
   * Considers grid position, offensive potential, defensive safety,
   * and rule-based bonuses (Same, Plus, Combo).
   *
   * @param {Object} card - The AI card
   * @param {number} cellIndex - 1-based board cell index
   * @returns {{ offensiveScore: number, defensiveScore: number, gridScore: number, ruleBonus: number, totalScore: number }}
   */
  _scorePlacement(card, cellIndex) {
    const offensiveScore = this._calculateOffensiveScore(card, cellIndex);
    const defensiveScore = this._calculateDefensiveScore(card, cellIndex);
    const gridScore = this._calculateGridScore(cellIndex);

    // Simulate rule-based effects
    const sameResult = this._simulateSameRule(card, cellIndex);
    const plusResult = this._simulatePlusRule(card, cellIndex);

    let ruleBonus = 0;

    // Same rule bonus: base bonus + extra per flip
    if (sameResult.triggered) {
      ruleBonus +=
        SAME_RULE_BONUS + sameResult.flipCount * OFFENSIVE_FLIP_SCORE;
    }

    // Plus rule bonus: base bonus + extra per flip
    if (plusResult.triggered) {
      ruleBonus +=
        PLUS_RULE_BONUS + plusResult.flipCount * OFFENSIVE_FLIP_SCORE;
    }

    // Simulate combo chain from Same/Plus captured cards
    const capturedCards = [];
    if (sameResult.triggered) {
      // We don't know exactly which cards would be captured without full simulation,
      // but we can estimate based on the flip count
      for (const [direction, map] of Object.entries(directionMap)) {
        const adjacentIndex = this._getAdjacentCell(cellIndex, direction);
        if (adjacentIndex === "none") {
          continue;
        }
        const occupant = BoardModel.getOccupant(adjacentIndex - 1);
        if (occupant && occupant.owner === "player") {
          capturedCards.push(occupant);
        }
      }
    }
    if (plusResult.triggered) {
      for (const [direction, map] of Object.entries(directionMap)) {
        const adjacentIndex = this._getAdjacentCell(cellIndex, direction);
        if (adjacentIndex === "none") {
          continue;
        }
        const occupant = BoardModel.getOccupant(adjacentIndex - 1);
        if (occupant && occupant.owner === "player") {
          capturedCards.push(occupant);
        }
      }
    }

    // Deduplicate captured cards
    const uniqueCaptured = [...new Set(capturedCards)];

    // Simulate combo chain if Same/Plus would trigger
    if (uniqueCaptured.length > 0) {
      const comboFlips = this._simulateComboChain(
        card,
        cellIndex,
        uniqueCaptured,
      );
      if (comboFlips > 0) {
        ruleBonus += comboFlips * OFFENSIVE_FLIP_SCORE * COMBO_CHAIN_MULTIPLIER;
      }
    }

    return {
      offensiveScore,
      defensiveScore,
      gridScore,
      ruleBonus,
      totalScore: offensiveScore + defensiveScore + gridScore + ruleBonus,
    };
  }

  /**
   * Evaluate all possible placements (card + free cell combinations) and return
   * the best one. Uses a comprehensive scoring system that considers:
   * - Grid position value (corners > edges > center)
   * - Offensive potential (flipping opponent cards)
   * - Defensive safety (avoiding being flipped back)
   * - Rule-based bonuses (Same, Plus, Combo chain reactions)
   *
   * @returns {{ cardIndex: number, cellIndex: number } | undefined}
   */
  _evaluatePlacements() {
    const freeCells = BoardModel.freeCells;

    if (freeCells.length === 0) {
      return;
    }

    const scoredPlacements = [];

    for (let cardIndex = 0; cardIndex < this.model.hand.length; cardIndex++) {
      const card = this.model.hand[cardIndex];

      for (const cellIndex of freeCells) {
        const score = this._scorePlacement(card, cellIndex);
        scoredPlacements.push({ cardIndex, cellIndex, ...score });
      }
    }

    if (scoredPlacements.length === 0) {
      return;
    }

    // Sort by total score (descending), with offensive as tiebreaker
    scoredPlacements.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (a.offensiveScore !== b.offensiveScore) {
        return b.offensiveScore - a.offensiveScore;
      }
      return b.gridScore - a.gridScore;
    });

    const best = scoredPlacements[0];

    console.log(
      "[AI Turn] Best placement: cardIndex=%d, cellIndex=%d, total=%d, offensive=%d, defensive=%d, grid=%d, ruleBonus=%d",
      best.cardIndex,
      best.cellIndex,
      best.totalScore,
      best.offensiveScore,
      best.defensiveScore,
      best.gridScore,
      best.ruleBonus,
    );

    // Log top 3 placements for debugging
    for (let index = 0; index < Math.min(3, scoredPlacements.length); index++) {
      const p = scoredPlacements[index];
      console.log(
        "[AI Turn]  Option #%d: card=%d, cell=%d, total=%d (off=%d, def=%d, grid=%d, rule=%d)",
        index + 1,
        p.cardIndex,
        p.cellIndex,
        p.totalScore,
        p.offensiveScore,
        p.defensiveScore,
        p.gridScore,
        p.ruleBonus,
      );
    }

    return best;
  }

  /**
   * Executes a single AI turn, evaluating all possible placements to choose
   * the best card and square. Uses a comprehensive scoring system:
   * 1. Grid position value (corners > edges > center)
   * 2. Offensive potential (flipping player cards)
   * 3. Defensive safety (avoiding being flipped back)
   * 4. Rule-based bonuses (Same, Plus, Combo chain reactions)
   */
  async takeTurn() {
    // Evaluate all possible placements and pick the best (card + square combo)
    const bestPlacement = this._evaluatePlacements();

    if (!bestPlacement) {
      console.warn("[AI Turn] No valid placement found");
      return;
    }

    const { cardIndex, cellIndex } = bestPlacement;
    this.model.cardsAboveSelection = cardIndex;

    // Animate the AI "thinking" — cycling through random cards before settling
    await this._animateThinking(this.model.hand, cardIndex);

    // Show the final selection cursor and indent the chosen card
    this.view.showSelection(this.model.hand, cardIndex);

    // Pause so the user sees the final selection (uses the AI's consistent placement delay)
    await new Promise((resolve) =>
      setTimeout(resolve, this.model.placementDelay),
    );

    // Hide the selection cursor and unindent
    this.view.hideSelection(this.model.hand);

    // Now actually remove the selected card from the AI's hand
    const playedCard = this.model.takeCard();
    if (!playedCard) {
      console.warn("[AI Turn] Failed to retrieve selected card from hand");
      return;
    }

    // Set the selected square to the best evaluated position
    BoardModel.selectedSquare = cellIndex;
    BoardModel.updateUISelection(BoardModel.selectedSquare);

    // Animate cards above selection down
    this.view.shiftCardsDown(
      this.model.hand,
      offsets.handCardOffset,
      this.model.cardsAboveSelection,
    );

    // Place the card on the board
    Game.controllers.placementController.model.placeCard(
      playedCard,
      offsets.gameOffsetX +
        offsets.cellWidth * (BoardModel.selectedColumn - 1) +
        offsets.cardOffsetX,
      offsets.gameOffsetY +
        offsets.cellHeight * (BoardModel.selectedRow - 1) +
        offsets.cardOffsetY,
    );

    // Update model
    this.model.decrementMove();

    console.log(
      "[AI Turn] Played card:",
      playedCard.data.name,
      "at cell:",
      cellIndex,
      "Cards remaining:",
      this.model.hand.length,
    );
  }

  /**
   * Reset hand between turns
   */
  resetHand() {
    this.view.clearHand(this.model.hand);
    this.model.resetHand();
  }
}
