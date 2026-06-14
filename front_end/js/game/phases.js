/**
 * phases.js
 *
 * Phase registry for the game.
 *
 * Each entry:
 *  - deps: (rootDeps, transitionPayload) => { ... }  // derive only what the phase needs
 *  - factory: (localDeps, transition) => phaseInstance
 *
 * The phaseInstance is expected to implement:
 *  - activate()
 *  - deactivate()
 */

import { DeckSelectionController } from "../phases/deck-selection/deck-selection-controller.js";
import { ConfirmationController } from "../phases/confirmation/confirmation-controller.js";
import HandSelectController from "../phases/hand-select/hand-select-controller.js";
import { PlacementController } from "../phases/placement/placement-controller.js";
import { ResolutionController } from "../phases/resolution/resolution-controller.js";
import EndTurnController from "../phases/end-turn/end-turn-controller.js";
import { AITurnController } from "../phases/ai-turn/ai-turn-controller.js";
import GameOverController from "../phases/game-over/game-over-controller.js";
import CardClaimController from "../phases/card-claim/card-claim-controller.js";
import { OpponentSelectionController } from "../phases/opponent-selection/opponent-selection-controller.js";

export const PhaseChecker = {
  playerSelectingHand: false,
  playerConfirming: false,
  playerChoosingCard: false,
  playerSelectingPlacement: false,
  playerSelectingOpponent: false,
};

export default {
  // Opponent selection: choose which AI opponent to play against.
  "opponent-selection": {
    /**
     * Dependencies for the opponent selection phase
     */
    deps: (rootDeps) => ({
      locations: rootDeps.opponentLocations || [],
      callbacks: rootDeps.opponentSelectionCallbacks || {},
    }),
    /**
     * The opponent selection phase factory
     */
    factory: (localDeps, transition) =>
      new OpponentSelectionController(
        localDeps.locations,
        transition,
        localDeps.callbacks,
      ),
  },

  // Deck selection where the player chooses 5 cards.
  "deck-selection": {
    /**
     * Dependencies for the deck selection phase
     */
    deps: (rootDeps) => ({
      deck: rootDeps.playerDeck,
      playerModel: rootDeps.playerModel,
      selectionUI: rootDeps.selectionUI,
      cursorController: rootDeps.cursorController,
    }),
    /**
     * The deck selection phase factory
     */
    factory: (localDeps, transition) =>
      // Constructor signature: new DeckSelectionController(localDeps, transition)
      new DeckSelectionController(localDeps, transition),
  },

  // Confirmation dialog after selecting 5 cards.
  confirmation: {
    /**
     * Dependencies for the confirmation phase
     */
    deps: (rootDeps, payload) => ({
      // optional: payload can be the selected hand, etc.
      selectedHand: payload?.selectedHand || undefined,
      ui: rootDeps.confirmationUI,
      // pass playerModel if needed
      playerModel: rootDeps.playerModel,
    }),
    /**
     * The confirmation phase factory
     */
    factory: (localDeps, transition) =>
      new ConfirmationController(localDeps, transition),
  },

  // Player chooses a card from hand to play
  "hand-select": {
    /**
     * Dependencies for the hand select phase
     */
    deps: (rootDeps) => ({
      playerModel: rootDeps.playerModel,
      cursorController: rootDeps.cursorController,
      handUI: rootDeps.handUI,
      boardModel: rootDeps.boardModel,
    }),
    /**
     * The hand select phase factory
     */
    factory: (localDeps, transition) =>
      new HandSelectController(localDeps, transition),
  },

  // Placement: move card onto board, play placement animations, apply elements
  placement: {
    /**
     * Dependencies for the placement phase
     */
    deps: (rootDeps, payload) => ({
      boardModel: rootDeps.boardModel,
      boardView: rootDeps.boardView,
      cardFactory: rootDeps.cardFactory,
      placementView: rootDeps.placementView,
      selectedCard: payload?.selectedCard ?? undefined,
      selectedSquare: payload?.selectedSquare ?? undefined,
      playerModel: rootDeps.playerModel,
      aiModel: rootDeps.aiModel,
      cursorController: rootDeps.cursorController,
    }),
    /**
     * The placement phase factory
     */
    factory: (localDeps, transition) =>
      new PlacementController(localDeps, transition),
  },

  // Resolution: perform adjacency comparisons and flip cards visually
  resolution: {
    /**
     * Dependencies for the resolution phase
     */
    deps: (rootDeps, payload) => ({
      // payload can include a list of resolved flips or information about last placement
      boardModel: rootDeps.boardModel,
      resolutionView: rootDeps.resolutionView,
      scoreboard: rootDeps.scoreboard,
      lastPlacement: payload?.lastPlacement || undefined,
    }),
    /**
     * The resolution phase factory
     */
    factory: (localDeps, transition) =>
      new ResolutionController(localDeps, transition),
  },

  // End-turn logic: counting, swap turn, check for game over
  "end-turn": {
    /**
     * Dependencies for the end turn phase
     */
    deps: (rootDeps) => ({
      gameState: rootDeps.gameState,
      turnUtils: rootDeps.turnUtils,
      scoreboard: rootDeps.scoreboard,
    }),
    /**
     * The end turn phase factory
     */
    factory: (localDeps, transition) =>
      new EndTurnController(localDeps, transition),
  },

  // AI turn: choose a card & location, then request placement
  "ai-turn": {
    /**
     * Dependencies for the AI turn phase
     */
    deps: (rootDeps) => ({
      aiModel: rootDeps.aiModel,
      boardModel: rootDeps.boardModel,
      aiView: rootDeps.aiView,
    }),
    /**
     * The AI turn phase factory
     */
    factory: (localDeps, transition) =>
      new AITurnController(localDeps, transition),
  },

  // Card claim: player selects one of the AI's initial cards to claim (after a win)
  "card-claim": {
    /**
     * Dependencies for the card claim phase
     */
    deps: (rootDeps) => ({
      aiInitialCards: rootDeps.aiInitialCards || [],
    }),
    /**
     * The card claim phase factory
     */
    factory: (localDeps, transition) =>
      new CardClaimController(localDeps, transition),
  },

  // Game over: show results and possibly restart
  "game-over": {
    /**
     * Dependencies for the game over phase
     */
    deps: (rootDeps, payload) => ({
      playerModel: rootDeps.playerModel,
      aiTurnModel: rootDeps.aiTurnModel,
      result: payload?.result || undefined,
      ui: rootDeps.gameOverUI,
      scoreboard: rootDeps.scoreboard,
      boardModel: rootDeps.boardModel,
    }),
    /**
     * The game over phase factory
     */
    factory: (localDeps, transition) =>
      new GameOverController(localDeps, transition),
  },
};
