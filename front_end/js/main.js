var Game = {};
Game.cards = {};
Game.cursors = {};

(function (Game) {
  // safe guard: if previously initialized, destroy first
  if (Game.initialized && typeof Game.destroy === "function") {
    console.log("Game: previous instance found — destroying before re-init");
    try {
      Game.destroy();
    } catch (e) {
      console.warn("Game.destroy failed", e);
    }
  }

  Game.initialized = false;

  Game.destroy = function () {
    try {
      // stop createjs Ticker (if used)
      if (createjs && createjs.Ticker) {
        createjs.Ticker.removeAllEventListeners();
        try {
          createjs.Ticker.reset && createjs.Ticker.reset();
        } catch (e) {}
      }
      // stage cleanup
      if (Game.stage) {
        try {
          Game.stage.removeAllChildren();
          Game.stage.removeAllEventListeners &&
            Game.stage.removeAllEventListeners();
        } catch (e) {
          console.warn(e);
        }
      }
      // remove any DOM listeners you registered
      if (Game._listeners && Array.isArray(Game._listeners)) {
        Game._listeners.forEach(function (l) {
          try {
            window.removeEventListener(l.event, l.fn);
          } catch (e) {}
          try {
            document.removeEventListener(l.event, l.fn);
          } catch (e) {}
        });
      }
      // clear any intervals/timeouts the game created
      if (Game._intervals) {
        Game._intervals.forEach((id) => clearInterval(id));
      }
      if (Game._timeouts) {
        Game._timeouts.forEach((id) => clearTimeout(id));
      }
      // clear references
      Game.stage = null;
      Game.assets = null;
      Game.cursor = null;
      // ...and anything else you attach to Game during runtime
    } finally {
      Game.initialized = false;
      console.log("Game destroyed");
    }
  };

  Game.bootstrap = function (options) {
    options = options || {};
    // small helper registries for teardown bookkeeping
    Game._listeners = Game._listeners || [];
    Game._intervals = Game._intervals || [];
    Game._timeouts = Game._timeouts || [];

    // hookup a single asset loader if none exists
    if (!Game.assets) {
      var queue = new createjs.LoadQueue(false);
      // example: queue.loadManifest([...]); // leave manifest for main.js
      Game.assets = queue;
      Game.assets.loaded = new Promise(function (resolve) {
        queue.on("complete", function () {
          resolve();
        });
        queue.on("error", function (err) {
          console.error("assets load error", err);
          resolve();
        });
      });
    }
  };

  // mark ready
  Game.initialized = false;
})(window.Game)

Game.rules = ["elemental"];

Game.stage = null;
Game.stageWidth = 0;
Game.stageHeight = 0;

// -------------------------
// START / END GAME
// -------------------------

Game.startGame = function () {
  board.generateGrid();
  Game.cards.playerHand.populate(Game.player.playerCards)
  Game.ui.drawCardCounts();
  Game.ui.drawInfoBox();
  Game.cursors.playerHand.place();
};

Game.endGame = function () {
  // Calculate The Winner
  if (Game.ai.totalRedCards > Game.player.totalBlueCards) {
    alert("lose");
  } else if (Game.player.totalBlueCards > Game.ai.totalRedCards) {
    alert("win");
  } else {
    alert("draw");
    if (Game.rules.includes("sudden_death")) {
      Game.startGame();
    }
  }
};

// -------------------------
// DOCUMENT READY
// -------------------------

document.addEventListener("DOMContentLoaded", () => Game.init.all());
