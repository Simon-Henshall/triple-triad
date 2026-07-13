import { AITurnView } from "./ai-turn-view.js";
import { BoardModel } from "../../shared/board/board-model.js";
import { Game } from "../../shared/game/game.js";
import { directionMap } from "../../constants/directions.js";
import { offsets } from "../../constants/offsets.js";

/**
 * Scoring weights for AI placement evaluation.
 * Offensive factors (flipping opponent cards) are weighted higher than
 * defensive factors (avoiding getting flipped back).
 */
const OFFENSIVE_FLIP_SCORE = 10;
const DEFENSIVE_EDGE_SAFE = 3;
const DEFENSIVE_OPPONENT_SAFE = 3;
const DEFENSIVE_RISK_PENALTY = -5;

/**
 * AI Turn Controller
 * Handles the AI's decision-making, interacts with BoardModel, and updates the view.
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
   * Each thought step lasts ~2 seconds, with 2-5 steps total (4-10 seconds).
   * @param {Array} hand - The AI hand
   * @param {number} finalIndex - The index of the card the AI ultimately selects
   */
  async _animateThinking(hand, finalIndex) {
    const numberSteps = this._randomInt(2, 5);
    const handSize = hand.length;

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

      // Wait ~2 seconds before moving to the next thought
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Hide the previous selection
      this.view.hideSelection(hand);

      previousIndex = randomIndex;
    }
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
      const adjacentIndex =
        BoardModel[
          `square${direction.charAt(0).toUpperCase() + direction.slice(1)}`
        ];
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
      const adjacentIndex =
        BoardModel[
          `square${direction.charAt(0).toUpperCase() + direction.slice(1)}`
        ];

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
   * Score a potential placement for evaluation.
   *
   * @param {Object} card - The AI card
   * @param {number} cellIndex - 1-based board cell index
   * @returns {{ offensiveScore: number, defensiveScore: number, totalScore: number }}
   */
  _scorePlacement(card, cellIndex) {
    const offensiveScore = this._calculateOffensiveScore(card, cellIndex);
    const defensiveScore = this._calculateDefensiveScore(card, cellIndex);

    return {
      offensiveScore,
      defensiveScore,
      totalScore: offensiveScore + defensiveScore,
    };
  }

  /**
   * Evaluate all possible placements (card + free cell combinations) and return
   * the best one. Primary preference is offensive (flipping opponent cards).
   * Secondary preference is defensive (avoiding being flipped).
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

    // Sort: primary by offensive score (descending), secondary by defensive score (descending)
    scoredPlacements.sort((a, b) => {
      if (a.offensiveScore !== b.offensiveScore) {
        return b.offensiveScore - a.offensiveScore;
      }
      return b.defensiveScore - a.defensiveScore;
    });

    const best = scoredPlacements[0];

    console.log(
      "[AI Turn] Best placement: cardIndex=%d, cellIndex=%d, offensive=%d, defensive=%d",
      best.cardIndex,
      best.cellIndex,
      best.offensiveScore,
      best.defensiveScore,
    );

    return best;
  }

  /**
   * Executes a single AI turn, evaluating all possible placements to choose
   * the best card and square. Primary preference is offensive (flipping player
   * cards). Secondary preference is defensive (avoiding being flipped).
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

    // Pause briefly so the user sees the final selection
    await new Promise((resolve) => setTimeout(resolve, 2000));

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
