import { BoardRenderer } from "../renderers/board-renderer.js";
import { UIManager } from "../managers/ui-manager.js";
import { UIRenderer } from "../renderers/ui-renderer.js";
import { ai } from "./ai.js";
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
    BoardRenderer.generateGrid();

    // Remove the preview card
    const sb = UIManager.selectionBoard;
    if (sb.displayedCard && Game.stage.contains(sb.displayedCard)) {
      Game.stage.removeChild(sb.displayedCard);
      sb.displayedCard = undefined;
    }

    // --- STEP 1: get the references ---
    const playerManager = Game.managers.playerManager;
    const playerRenderer = Game.renderers.playerRenderer;

    // --- STEP 2: populate logical hand ---
    playerManager.playerCards = [...playerManager.cardsInHand];

    // --- STEP 3: populate visual hands ---
    ai.aiHand.populate();

    // --- STEP 4: set first card for info box ---
    const firstCard = playerManager.playerCards[0];
    if (firstCard) {
      UIManager.selectedCard = firstCard;
      playerRenderer.indentSelectedCard(firstCard);
      UIController.updateInfoBox();
      console.log("[startGame] InfoBox set to first card:", firstCard);
    } else {
      console.warn("[startGame] no cards in player hand!");
    }

    // Set the game state
    UIManager.playerConfirming = false;
    UIManager.playerChoosingCard = true;

    // Draw card counts if desired
    UIRenderer.drawCardCounts();
    UIRenderer.drawInfoBox();

    // Place player hand cursor
    Game.controllers.cursorController.playerHand.place();
  },

  endGame() {
    const playerManager = Game.managers.playerManager;
    if (ai.totalRedCards > playerManager.totalBlueCards) {
      alert("lose");
    } else if (playerManager.totalBlueCards > ai.totalRedCards) {
      alert("win");
    } else {
      alert("draw");
      if (this.rules.includes("sudden_death")) {
        this.startGame();
      }
    }
  },
};
