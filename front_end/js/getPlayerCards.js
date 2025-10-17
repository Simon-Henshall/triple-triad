// -----------------------------
// getPlayerCards.js
// -----------------------------
(function (global) {
  // -------------------------
  // Helper: generate random integer [min, max]
  // -------------------------
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // -------------------------
  // PlayerCardManager
  // -------------------------
  const PlayerCardManager = function (cards = []) {
    this.ownedCards = Array.isArray(cards) ? cards : [];
    this.selectedCardIndex = 0;
    this.page = 1;
    this.cardsPerPage = 11;

    // References for UI (selection board)
    this.selectionBoard = global.selectionBoard || null;
    this.displayedCardContainer = null;
  };

  // -------------------------
// Shim for old populatePlayerCards() behavior
// -------------------------
function populatePlayerCardsShim(playerCardsParam) {
  // fallback to global cards array if not passed
  const cardsSource = Array.isArray(playerCardsParam) && playerCardsParam.length
    ? playerCardsParam
    : (Array.isArray(window.cards) && window.cards.length ? window.cards : []);

  if (!cardsSource.length) {
    console.warn("⚠️ No cards available to populate player deck!");
    return;
  }

  window.ownedCards = [];

  // randomize a count for each card (1–5 copies for now)
  for (const card of cardsSource) {
    const count = Math.floor(Math.random() * 5) + 1;
    window.ownedCards.push({
      ...card,
      count,
      image: `${Game.config.cardPath}${card.image}.png`,
    });
  }

  // once filled, render the selection board
  if (window.populateSelectionBoardCards) {
    window.populateSelectionBoardCards(window.ownedCards);
  }

  console.log(`✅ Player deck populated with ${window.ownedCards.length} cards`);
}



  // -------------------------
  // Async "load" for player cards
  // -------------------------
  PlayerCardManager.prototype.pickPlayerCards = async function () {
    // Expose global for legacy / selectionBoardCards.js
    window.ownedCards = this.ownedCards;

    // Ensure globals expected by selectionBoardCards.js
    if (typeof window.page === "undefined") window.page = 1;
    if (typeof window.selectedHandCardNumber === "undefined")
      window.selectedHandCardNumber = 0;

    // Call the existing populate function
    if (typeof window.populateSelectionBoardCardsShim === "function") {
      window.populateSelectionBoardCardsShim(this.ownedCards);
    }

    populatePlayerCardsShim(window.playerCards);

    return this.ownedCards;
  };

  // -------------------------
  // Optional: update preview card
  // -------------------------
  PlayerCardManager.prototype.updateDisplayedCard = function (cardObj) {
    if (!cardObj || !global.selectionBoard) return;

    if (this.displayedCardContainer && this.displayedCardContainer.parent) {
      this.displayedCardContainer.parent.removeChild(this.displayedCardContainer);
      this.displayedCardContainer = null;
    }

    const container = new createjs.Container();
    const backing = new createjs.Bitmap(Game.config.cardPath + "blue.png");
    const front = new createjs.Bitmap(cardObj.image);

    container.addChild(backing, front);
    const bg = global.selectionBoardBackground;
    container.x = (bg?.x || 480) + (bg?.getBounds()?.width || 480) - 140;
    container.y = (bg?.y || 0) + 700;

    global.selectionBoard.addChild(container);
    this.displayedCardContainer = container;

    const finalize = () => {
      const targetW = Game.offsets.cellWidth || 120;
      const targetH = Game.offsets.cellHeight || 160;
      const bw = backing.image?.width || targetW;
      const bh = backing.image?.height || targetH;
      const scale = Math.min(targetW / bw, targetH / bh);
      backing.scaleX = backing.scaleY = scale;

      if (front.image?.width) front.scaleX = front.scaleY = scale;
      front.x = (bw * scale - (front.image?.width || bw) * scale) / 2;
      front.y = (bh * scale - (front.image?.height || bh) * scale) / 2;

      createjs.Tween.get(container).to({ y: (bg?.y || 0) + 120 }, 180, createjs.Ease.quadOut);
      global.stage && global.stage.update();
    };

    let pending = 0;
    if (!backing.image || !backing.image.complete) {
      pending++;
      backing.image.onload = () => {
        if (--pending <= 0) finalize();
      };
    }
    if (!front.image || !front.image.complete) {
      pending++;
      front.image.onload = () => {
        if (--pending <= 0) finalize();
      };
    }
    if (pending === 0) finalize();
  };

  // -------------------------
  // Generate player deck + AI hand
  // -------------------------
  if (global.cards && global.cards.length > 0) {
    const playerDeck = [];

    // Give each card a random count of ownership (1–3)
    global.cards.forEach((card) => {
      const count = randomInt(1, 3);
      for (let i = 0; i < count; i++) {
        playerDeck.push({ ...card }); // allow duplicates
      }
    });

    // Save AI hand (5 random cards)
    const shuffled = global.cards.slice().sort(() => 0.5 - Math.random());
    if (!Game.ai) Game.ai = {};
    Game.ai.cardsInAIHand = shuffled.slice(0, 5).map((c) => ({ ...c }));

    // Create singleton manager
    global.__playerCardManager =
      global.__playerCardManager || new PlayerCardManager(playerDeck);

    window.ownedCards = playerDeck;
  } else {
    console.warn("⚠️ cards.js not loaded or empty!");
    global.__playerCardManager =
      global.__playerCardManager || new PlayerCardManager([]);
    window.ownedCards = [];
  }

  // -------------------------
  // Shim for legacy calls
  // -------------------------
  PlayerCardManager.prototype.updateHandCards = function () {
    // Calls the real selection board population
    if (typeof window.populateSelectionBoardCardsShim === "function") {
      window.populateSelectionBoardCardsShim(this.ownedCards);
    }
  };
})(window);
