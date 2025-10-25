// game.js
import { board } from './board.js';
import { player } from './player.js';
import { cursors } from './cursors.js';
import { ui } from './ui.js';
import { ai } from './ai.js';

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
        queue.on("error", (err) => { console.error("Assets load error", err); resolve(); });
      });
    }
  },

  startGame() {
    board.generateGrid();
    
    // Populate both hands from GameState
    player.playerHand.populate();
    ai.aiHand.populate();

    ui.drawCardCounts();
    ui.drawInfoBox();
    cursors.playerHand.place();
  },

  endGame() {
    if (ai.totalRedCards > player.totalBlueCards) {
      alert("lose");
    } else if (player.totalBlueCards > ai.totalRedCards) {
      alert("win");
    } else {
      alert("draw");
      if (this.rules.includes("sudden_death")) this.startGame();
    }
  },
};
