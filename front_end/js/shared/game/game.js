import { BoardView } from "../board/board-view.js";
import { DeckSelectionUI } from "../../phases/deck-selection/deck-selection-ui.js";
import { InfoBox } from "../ui/info-box.js";
import { ConfirmationView } from "../../phases/confirmation/confirmation-view.js";
import { PreviewCard } from "../ui/preview-card.js";
import DeckSelectionModel from "../../phases/deck-selection/deck-selection-model.js";
import { PhaseChecker } from "../../game/phases.js";

/**
 * Core game logic container.
 * All initialisation, rendering, and model setup
 * should happen via game-init.js. Game only handles
 * match rounds, hand selection, and outcomes.
 */
export const Game = {
  /** Rules active for the current match */
  rules: ["elemental", "open"],

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

    const sb = DeckSelectionModel;

    // Clear selection UI containers
    if (sb?.container) {
      this.stage.removeChild(sb.container);
    }
    if (ConfirmationView?.container) {
      this.stage.removeChild(ConfirmationView.container);
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
      playerModel.selectedCard = firstCard;
      playerView.indentSelectedCard(firstCard);
      InfoBox.drawInfoBox(this);
      InfoBox.updateInfoBox(this, firstCard);
    }

    // Update UI state flags
    PhaseChecker.playerConfirming = false;
    PhaseChecker.playerChoosingCard = true;
    PhaseChecker.playerSelectingHand = false;

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
    DeckSelectionUI.initialise(
      playerModel.deck,
      playerModel,
      DeckSelectionUI.controller,
    );

    PhaseChecker.playerSelectingHand = true;

    // Show preview card for the default selected card
    const card = DeckSelectionUI.getSelectedCard();
    if (card) {
      console.log(
        "[Game] Showing preview card for the default card:",
        card.data.name,
      );
      // Ensure the visuals are ready before previewing
      const faceBitmap = card.visuals?.faceBitmap;
      if (faceBitmap && faceBitmap.image && !faceBitmap.image.complete) {
        // Wait for image load
        faceBitmap.image.addEventListener("load", () => {
          PreviewCard.showPreviewCard(card);
        });
      } else {
        PreviewCard.showPreviewCard(card);
      }
    }

    // Place the selection cursor on top
    queueMicrotask(() => {
      Game.controllers.cursorController?.selection?.place?.();
    });
  },
};
