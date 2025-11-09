import { UIManager } from "../managers/ui-manager.js";
import { UIRenderer } from "../renderers/ui-renderer.js";
import { UIController } from "../controllers/ui-controller.js";
import { BoardRenderer } from "../renderers/board-renderer.js";
import { pickPlayerCards } from "../utilities/selection.js";

/**
 * Core game logic container.
 * All initialization, rendering, and manager setup
 * should happen via game-init.js. Game only handles
 * match rounds, hand selection, and outcomes.
 */
export const Game = {
  /** Flag indicating if the game has been initialized */
  initialized: false,

  /** Rules active for the current match */
  rules: ["elemental"],

  /** Reference to the CreateJS stage */
  stage: undefined,

  /** Container for all instantiated managers */
  managers: {},

  /** Container for all controllers */
  controllers: {},

  /** Container for all renderers */
  renderers: {},

  /** Stage dimensions */
  stageWidth: 0,
  stageHeight: 0,

  /** Miscellaneous card-related data */
  cards: {},

  /**
   * Start a new match round after hand selection
   * Handles board rendering, AI hand population,
   * player hand rendering, cursors, and info box.
   */
  startGame() {
    console.log("[Game] Starting new match...");

    const sb = UIManager.selectionBoard;

    // Clear selection UI containers
    if (sb?.container) {
      this.stage.removeChild(sb.container);
    }
    if (UIManager.confirmation?.container) {
      this.stage.removeChild(UIManager.confirmation.container);
    }

    // Generate the game board
    BoardRenderer.generateGrid();

    const { playerManager, aiManager } = this.managers;
    const { playerRenderer } = this.renderers;

    // Render player's hand
    if (playerManager.hand.length === 0) {
      console.warn("[startGame] Player hand empty.");
    } else {
      playerRenderer.renderHand?.(playerManager.hand);
    }

    // Populate AI hand
    aiManager.populateHand?.();

    // Setup info box for first card
    const firstCard = playerManager.hand[0];
    if (firstCard) {
      UIManager.selectedCard = firstCard;
      playerRenderer.indentSelectedCard(firstCard);
      UIRenderer.drawInfoBox();
      UIController.updateInfoBox(firstCard);
    }

    // Update UI state flags
    UIManager.playerConfirming = false;
    UIManager.playerChoosingCard = true;
    UIManager.playerSelectingHand = false;

    // Draw overlays
    UIRenderer.drawCardCounts();

    // Place the player's hand cursor
    this.controllers.cursorController?.playerHand?.place?.();

    this.stage.update();
    console.log("[Game] Match started successfully.");
  },

  /**
   * Begin the hand selection phase for the player.
   * Renders the selection board, picks cards, and
   * prepares the preview card.
   */
  startSelection() {
    console.log("[Game] Starting hand selection...");

    // Get the cards for hand selection
    const cards = pickPlayerCards(); // should return array of card objects

    // Initialise selection board
    SelectionBoardUI.initialise(cards);

    // Set UI flags
    UIManager.playerSelectingHand = true;
    UIManager.playerChoosingCard = false;
    UIManager.playerConfirming = false;

    // Show first card preview
    UIManager.selectedCard = cards[0] ?? null;
    UIRenderer.drawInfoBox();

    this.stage.update();
  },

  /**
   * Determine the outcome of the current match.
   * Alerts the player with win/lose/draw and handles
   * sudden-death rules if applicable.
   */
  endGame() {
    const { playerManager, aiManager } = this.managers;

    if (aiManager.totalRedCards > playerManager.totalBlueCards) {
      alert("lose");
    } else if (playerManager.totalBlueCards > aiManager.totalRedCards) {
      alert("win");
    } else {
      alert("draw");
      if (this.rules.includes("sudden_death")) {
        this.startGame();
      }
    }
  },
};
