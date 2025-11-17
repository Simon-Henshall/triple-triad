import { UIManager } from "../managers/ui-manager.js";
import { UIRenderer } from "../renderers/ui-renderer.js";
import { BoardRenderer } from "../renderers/board-renderer.js";
import { SelectionBookUI } from "../selection-book/selection-book-ui.js";

/**
 * Core game logic container.
 * All initialization, rendering, and manager setup
 * should happen via game-init.js. Game only handles
 * match rounds, hand selection, and outcomes.
 */
export const Game = {
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

    const sb = UIManager.selectionBook;

    // Clear selection UI containers
    if (sb?.container) {
      this.stage.removeChild(sb.container);
    }
    if (UIManager.confirmation?.container) {
      this.stage.removeChild(UIManager.confirmation.container);
    }

    // Generate the game board
    BoardRenderer.generateGrid();

    const { playerManager } = this.managers;
    const { playerRenderer } = this.renderers;

    // Render player's hand
    if (playerManager.hand.length === 0) {
      console.warn("[startGame] Player hand empty.");
    } else {
      playerRenderer.renderHand?.(playerManager.hand);
    }

    // Setup info box for first card
    const firstCard = playerManager.hand[0];
    if (firstCard) {
      UIManager.selectedCard = firstCard;
      playerRenderer.indentSelectedCard(firstCard);
      UIRenderer.drawInfoBox();
      UIRenderer.updateInfoBox(firstCard);
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
   * Handles setup and operation of the selection board (hand selection screen)
   * where the player chooses 5 cards from their deck.
   */
  setupSelectionBook() {
    console.log("[Game] Initialising selection book...");
    const playerManager = Game.managers.playerManager;

    // Initialise selection book
    SelectionBookUI.initialise(playerManager.deck, playerManager);

    UIManager.playerSelectingHand = true;

    // Show preview card for the default selected card
    const card = SelectionBookUI.getSelectedCard();
    if (card) {
      console.log(
        "[Game] Showing preview card for the default card:",
        card.data.name,
      );
      // Ensure the visuals are ready before previewing
      const faceBitmap = card.visuals?.faceBitmap;
      console.log(faceBitmap);
      if (faceBitmap && faceBitmap.image && !faceBitmap.image.complete) {
        // Wait for image load
        faceBitmap.image.addEventListener("load", () => {
          UIManager.selectionBook.showPreviewCard(card);
        });
      } else {
        UIManager.selectionBook.showPreviewCard(card);
      }
    }

    // Place the selection cursor on top
    Game.controllers.cursorController.selection.place();
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
