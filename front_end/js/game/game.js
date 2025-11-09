import { BoardRenderer } from "../renderers/board-renderer.js";
import { UIManager } from "../managers/ui-manager.js";
import { UIRenderer } from "../renderers/ui-renderer.js";
import { UIController } from "../controllers/ui-controller.js";

export const Game = {
  initialized: false,
  rules: ["elemental"],
  stage: undefined,
  stageWidth: 0,
  stageHeight: 0,
  cards: {},

  destroy() {
    // stop createjs Ticker
    if (createjs?.Ticker) {
      createjs.Ticker.removeAllEventListeners();
      createjs.Ticker.reset?.();
    }

    // stage cleanup
    if (this.stage) {
      this.stage.removeAllChildren?.();
      this.stage.removeAllEventListeners?.();
    }

    // clear references
    this.stage = undefined;
    this.assets = undefined;
    this.cursor = undefined;

    this.initialized = false;
    console.log("Game destroyed");
  },

  bootstrap() {
    // initialize asset loader if not already present
    if (!this.assets) {
      const queue = new createjs.LoadQueue(false);
      this.assets = queue;
      this.assets.loaded = new Promise((resolve) => {
        queue.on("complete", resolve);
        queue.on("error", (error) => {
          console.error("Assets load error", error);
          resolve();
        });
      });
    }
  },

  startGame() {
    console.log("[Game] Starting new match...");

    // --- STEP 1: Clear selection UI ---
    const sb = UIManager.selectionBoard;
    if (sb?.container) {
      Game.stage.removeChild(sb.container);
    }
    if (UIManager.confirmation?.container) {
      Game.stage.removeChild(UIManager.confirmation.container);
    }

    // --- STEP 2: Generate the board grid ---
    BoardRenderer.generateGrid();

    // --- STEP 3: Retrieve player + renderer references ---
    const playerManager = Game.managers.playerManager;
    const playerRenderer = Game.renderers.playerRenderer;
    const aiManager = Game.managers.aiManager;

    // --- STEP 4: Sync logical hand ---
    if (playerManager.hand.length === 0) {
      console.warn("[startGame] No cards in hand; skipping hand setup.");
    }

    // --- STEP 5: Render the hand visually ---
    playerRenderer.renderHand?.(playerManager.hand);

    // --- STEP 6: AI setup ---
    if (aiManager?.hand?.populate) {
      aiManager.hand.populate();
    }

    // --- STEP 7: Info box initialization ---
    const firstCard = playerManager.hand[0];
    if (firstCard) {
      UIManager.selectedCard = firstCard;
      console.log("[startGame] indentSelectedCard to first card:", firstCard);
      playerRenderer.indentSelectedCard(firstCard);
      UIRenderer.drawInfoBox();
      UIController.updateInfoBox(firstCard);
      console.log("[startGame] InfoBox set to first card:", firstCard);
    } else {
      console.warn("[startGame] Player has no cards to display in InfoBox.");
    }

    // --- STEP 8: Update UI flags ---
    UIManager.playerConfirming = false;
    UIManager.playerChoosingCard = true;
    UIManager.playerSelectingHand = false;

    // --- STEP 9: Draw overlays ---
    UIRenderer.drawCardCounts();

    // --- STEP 10: Place cursor and update stage ---
    if (Game.controllers?.cursorController?.playerHand?.place) {
      Game.controllers.cursorController.playerHand.place();
    }

    Game.stage.update();
    console.log("[Game] Match started successfully.");
  },
  endGame() {
    const playerManager = Game.managers.playerManager;
    const aiManager = Game.managers.aiManager;
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
