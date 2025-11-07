import { cards } from "../constants/cards.js";
import { UIManager } from "../managers/ui-manager.js";
import { ai } from "./ai.js";
import { SelectionBoardUI } from "../renderers/selection-board-ui.js";
import { Game } from "./game.js";
import { config } from "../config.js";
import { offsets } from "../constants/offsets.js";
import { fallBackCardsForTesting } from "../constants/fallback-cards.js";

export const utilities = {
  /**
   * Create a scaled bitmap and call a callback once ready.
   * Handles image loading asynchronously, with fallback if already cached.
   * @param {string} source - Path to image file
   * @param {number} targetWidth - Desired bitmap width
   * @param {number} targetHeight - Desired bitmap height
   * @param {(bmp: createjs.Bitmap) => void} [onReady] - Callback when bitmap is ready
   * @returns {createjs.Bitmap} - The created bitmap
   */
  _createScaledBitmap(source, targetWidth, targetHeight, onReady) {
    const bmp = new createjs.Bitmap(source);
    const applyScale = () => {
      // Only scale once image dimensions are available
      if (bmp.image.width && bmp.image.height) {
        bmp.scaleX = targetWidth / bmp.image.width;
        bmp.scaleY = targetHeight / bmp.image.height;
      } else {
        // fallback if somehow width/height still 0
        bmp.scaleX = 1;
        bmp.scaleY = 1;
      }

      if (onReady) {
        onReady(bmp);
      }
    };

    // Ensure applyScale runs after image is fully loaded
    bmp.image.addEventListener("load", applyScale);

    // For cached images, onload may never fire in some browsers, so call immediately if complete
    if (bmp.image.complete) {
      // Schedule on next tick to let onload fire first if possible
      setTimeout(applyScale, 0);
    }

    // Optional: handle error
    bmp.image.addEventListener("error", () => {
      console.warn("Failed to load image:", source);
      applyScale();
    });

    return bmp;
  },

  /**
   * Create a container for a card, including owner image, stats, and optional back face.
   * @param {Object} cardData - Card metadata (strengths, element, displayName)
   * @param {string} ownerColour - "blue" or "red"
   * @param {number} x - X position of the card
   * @param {number} y - Y position of the card
   * @param {Object} options - Optional parameters
   * @param {boolean} [options.showBack=false] - Display back image
   * @param {string} [options.frontImageSrc] - Path for front image
   * @param {string} [options.backImageSrc] - Path for back image
   * @param {(bmp: createjs.Bitmap) => void} [options.onReady] - Callback when bitmap is ready
   * @returns {createjs.Container} - Container holding card graphics and metadata
   */
  createCardContainer(
    cardData,
    ownerColour,
    x,
    y,
    { showBack = false, frontImageSrc, backImageSrc, onReady } = {},
  ) {
    const targetW =
      offsets.cardWidth || offsets.cellWidth - (offsets.cardOffsetX || 3) * 2;
    const targetH =
      offsets.cardHeight || offsets.cellHeight - (offsets.cardOffsetY || 3) * 2;

    const cardImage = this._createScaledBitmap(
      showBack
        ? backImageSrc
        : frontImageSrc || `${config.cardPath}${cardData.image}.png`,
      targetW,
      targetH,
      onReady,
    );
    const cardColour = this._createScaledBitmap(
      `${config.cardPath}${ownerColour}.png`,
      targetW,
      targetH,
      onReady,
    );

    const container = new createjs.Container();
    container.addChild(cardColour, cardImage);

    container.name = cardData.displayName;
    container.strengthUp = cardData.strengthUp;
    container.strengthRight = cardData.strengthRight;
    container.strengthDown = cardData.strengthDown;
    container.strengthLeft = cardData.strengthLeft;
    container.element = cardData.element;
    container.owner = ownerColour;
    container.background = ownerColour;

    if (showBack) {
      container.frontImage =
        frontImageSrc || `${config.cardPath}${cardData.image}.png`;
      container.backImage = backImageSrc || `${config.cardPath}back.png`;
    }

    container.x = x;
    container.y = y;

    return container;
  },

  /**
   * Process player's owned cards and initialise either random mode or selection board.
   * @param {string} ownedCardsJSON - JSON string of player's cards
   */
  pickPlayerCards(ownedCardsJSON) {
    const playerManager = Game.managers.playerManager;

    this._resetSelectionBoardState();
    const parsedCards = this._parseOwnedCards(ownedCardsJSON);
    this._populateOwnedCards(playerManager, parsedCards);

    if (Game.rules.includes("random")) {
      this._initialiseRandomMode(playerManager);
    } else {
      this._setupSelectionBoard(playerManager);
    }
  },

  /** Reset selection board state before picking cards */
  _resetSelectionBoardState() {
    UIManager.selectionBoard.page = 1;
    UIManager.selectionBoard.selectedHandCardNumber = 0;
    UIManager.selectionBoard.displayedCards = [];
    UIManager.selectionBoard.displayedCard = undefined;
  },

  /**
   * Parse owned cards JSON with fallback to hardcoded deck.
   * @param {string} ownedCardsJSON
   * @returns {Array} parsed card objects
   */
  _parseOwnedCards(ownedCardsJSON) {
    try {
      return JSON.parse(ownedCardsJSON);
    } catch {
      console.warn(
        "Failed to parse ownedCardsJSON, falling back to hardcoded deck",
      );
      return fallBackCardsForTesting;
    }
  },

  /**
   * Populate player's owned cards array from parsed data.
   * @param {Object} playerManager
   * @param {Array} parsedCards
   */
  _populateOwnedCards(playerManager, parsedCards) {
    const cardsCopy = $.extend({}, cards || []);
    playerManager.ownedCards = [];

    for (const [index, parsedCard] of parsedCards.entries()) {
      if (parsedCard.count > 0 && cardsCopy[index]) {
        UIManager.cardCount = parsedCard.count;
        cardsCopy[index].count = parsedCard.count;
        cardsCopy[index].colour = "#ffffff";
        playerManager.ownedCards.push(cardsCopy[index]);
      }
    }
  },

  /**
   * Shuffle player's cards, populate AI hand, and start the game in random mode.
   * @param {Object} playerManager
   */
  _initialiseRandomMode(playerManager) {
    playerManager.playerCards = this.shuffle(
      $.extend(true, [], playerManager.ownedCards),
    );

    if (!ai.cardsInAIHand || ai.cardsInAIHand.length === 0) {
      ai.aiHand.populate();
    }

    Game.startGame();
  },

  /**
   * Setup selection board visuals, AI hand, and allow player to pick cards.
   * @param {Object} playerManager
   */
  _setupSelectionBoard(playerManager) {
    this._drawSelectionBoardBackground();
    this._drawSelectionBoardText();
    UIManager.selectionBoard.page = 1;

    // Populate AI hand and selection board
    ai.aiHand.populate();
    SelectionBoardUI.initialise(playerManager.ownedCards);

    // Place cursor and enable selection
    Game.controllers.cursorController.selection.place();
    UIManager.playerSelectingHand = true;
  },

  /** Draw the background shape for the selection board */
  _drawSelectionBoardBackground() {
    const bg = new createjs.Shape();
    bg.graphics.beginFill("#666666").drawRect(0, 0, 420, 450);
    bg.x = 170;
    bg.y = 100;
    UIManager.selectionBoard.background = bg;
    UIManager.selectionBoard.container.addChild(bg);
  },

  /** Draw labels and text for the selection board */
  _drawSelectionBoardText() {
    const sb = UIManager.selectionBoard;
    const baseX = sb.background.x;
    const baseY = sb.background.y;

    const texts = [
      { label: "CARDS", x: 10 },
      { label: "P.", x: 110 },
      { label: "1", x: 150, assignTo: "pageDisplay" },
      { label: "NUM.", x: 350 },
    ];

    for (const t of texts) {
      const txt = new createjs.Text(t.label, "20px Arial", "#ffffff");
      txt.x = baseX + t.x;
      txt.y = baseY + 20;
      txt.textBaseline = "alphabetic";
      if (t.assignTo) {
        sb[t.assignTo] = txt;
      }
      sb.container.addChild(txt);
    }
  },

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * @template T
   * @param {T[]} array - Array to shuffle
   * @returns {T[]} - Shuffled array
   */
  shuffle(array) {
    let counter = array.length,
      temporary,
      index;
    while (counter--) {
      index = Math.floor(Math.random() * counter);
      temporary = array[counter];
      array[counter] = array[index];
      array[index] = temporary;
    }
    return array;
  },

  /**
   * Get the current player's turn color
   * @returns {"red" | "blue"}
   */
  getPlayerTurn() {
    return UIManager.playerTurn;
  },

  /**
   * Swap the current player's turn between "blue" and "red"
   */
  swapPlayerTurn() {
    UIManager.playerTurn = this.getPlayerTurn() === "blue" ? "red" : "blue";
  },
};
