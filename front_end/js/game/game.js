import { BoardRenderer } from "../ui/BoardRenderer.js";
import { UIManager } from "../managers/UIManager.js";
import { UIRenderer } from "../ui/UIRenderer.js";
import { ai } from "./ai.js";
import { UIController } from "../controllers/UIController.js";

export const Game = {
  initialized: false,
  rules: ["elemental"],
  stage: null,
  stageWidth: 0,
  stageHeight: 0,
  cards: {},
  _listeners: [],
  _intervals: [],
  _timeouts: [],

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

    // clear intervals/timeouts
    this._intervals.forEach(clearInterval);
    this._timeouts.forEach(clearTimeout);

    // clear references
    this.stage = null;
    this.assets = null;
    this.cursor = null;

    this.initialized = false;
    console.log("Game destroyed");
  },

  bootstrap(options = {}) {
    // initialize asset loader if not already present
    if (!this.assets) {
      const queue = new createjs.LoadQueue(false);
      this.assets = queue;
      this.assets.loaded = new Promise((resolve) => {
        queue.on("complete", resolve);
        queue.on("error", (err) => {
          console.error("Assets load error", err);
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
      sb.displayedCard = null;
    }

    // --- STEP 1: get the references ---
    const playerManager = Game.managers.playerManager;
    const playerRenderer = Game.renderers.playerRenderer;

    // --- STEP 2: populate logical hand ---
    playerManager.playerCards = playerManager.cardsInHand.slice();

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
      if (this.rules.includes("sudden_death")) this.startGame();
    }
  },
};
