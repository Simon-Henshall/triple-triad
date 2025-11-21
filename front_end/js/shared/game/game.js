import { UIModel } from "../ui/ui-model.js";
import { UIView } from "../ui/ui-view.js";
import { BoardView } from "../board/board-view.js";
import { DeckSelectionUI } from "../../phases/deck-selection/deck-selection-ui.js";

/**
 * Core game logic container.
 * All initialisation, rendering, and model setup
 * should happen via game-init.js. Game only handles
 * match rounds, hand selection, and outcomes.
 */
export const Game = {
  /** Rules active for the current match */
  rules: ["elemental"],

  /** Reference to the CreateJS stage */
  stage: undefined,

  /** Container for all instantiated models */
  models: {},

  /** Container for all controllers */
  controllers: {},

  /** Container for all views */
  views: {},

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

    const sb = UIModel.selectionBook;

    // Clear selection UI containers
    if (sb?.container) {
      this.stage.removeChild(sb.container);
    }
    if (UIModel.confirmation?.container) {
      this.stage.removeChild(UIModel.confirmation.container);
    }

    // Generate the game board
    BoardView.generateGrid();

    const { playerModel } = this.models;
    const { playerView } = this.views;

    // Render player's hand
    if (playerModel.hand.length === 0) {
      console.warn("[startGame] Player hand empty.");
    } else {
      playerView.renderHand?.(playerModel.hand);
    }

    // Setup info box for first card
    const firstCard = playerModel.hand[0];
    if (firstCard) {
      UIModel.selectedCard = firstCard;
      playerView.indentSelectedCard(firstCard);
      UIView.drawInfoBox();
      UIView.updateInfoBox(firstCard);
    }

    // Update UI state flags
    UIModel.playerConfirming = false;
    UIModel.playerChoosingCard = true;
    UIModel.playerSelectingHand = false;

    // Draw scoreboard overlays
    Game.ui.scoreBoard.draw();
    Game.stage.setChildIndex(
      Game.ui.scoreBoard.container,
      Game.stage.numChildren - 1,
    );

    // Place the player's hand cursor
    this.controllers.cursorController?.playerHand?.place?.();

    this.stage.update();
    console.log("[Game] Match started successfully.");
  },

  /**
   * Handles setup and operation of the selection board (hand selection screen)
   * where the player chooses 5 cards from their deck.
   */
  setupSelectionBook(playerModel) {
    console.log("[Game] Initialising selection book...");

    // Initialise selection book
    DeckSelectionUI.initialise(playerModel.deck, playerModel);

    UIModel.playerSelectingHand = true;

    // Show preview card for the default selected card
    const card = DeckSelectionUI.getSelectedCard();
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
          UIModel.selectionBook.showPreviewCard(card);
        });
      } else {
        UIModel.selectionBook.showPreviewCard(card);
      }
    }

    // Place the selection cursor on top
    queueMicrotask(() => {
      Game.controllers.cursorController?.selection?.place?.();
    });
  },

  /**
   * Determine the outcome of the current match.
   * Alerts the player with win/lose/draw and handles
   * sudden-death rules if applicable.
   */
  endGame() {
    const { playerModel } = this.models;
    const { aiTurnModel } = this.models;

    if (aiTurnModel.currentlyOwnedCards > playerModel.totalBlueCards) {
      alert("lose");
    } else if (playerModel.totalBlueCards > aiTurnModel.currentlyOwnedCards) {
      alert("win");
    } else {
      alert("draw");
      if (this.rules.includes("sudden_death")) {
        this.startGame();
      }
    }
  },
};
