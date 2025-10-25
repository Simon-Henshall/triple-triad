import { config } from "./config.js";
import { offsets } from "./offsets.js";
import { ui } from "./ui.js";
import { utils } from "./utils.js";
import { Game } from './game.js';

/**
 * @namespace player
 * @description Contains all player-related data, logic, and card handling.
 */
export const player = {
  /** @type {number} Horizontal offset for player hand rendering */
  handOffsetX: 0,

  /** @type {Array<Object>} All cards in the game owned by player */
  playerCards: [],

  /** @type {Array<Object>} All owned cards */
  ownedCards: [],

  /** @type {Array<createjs.Container>} Cards currently in player's hand (displayed on stage) */
  cardsInPlayerHand: [],

  /** @type {Array<Object>} Current randomised hand */
  playerHand: {
    /**
     * Helper: create a bitmap and scale once loaded.
     */
    _createScaledBitmap(src, targetW, targetH, onReady) {
      const bmp = new createjs.Bitmap(src);
      const applyScale = () => {
        bmp.scaleX = targetW / bmp.image.width;
        bmp.scaleY = targetH / bmp.image.height;
        if (onReady) onReady(bmp);
      };
      if (!bmp.image.complete) {
        bmp.image.onload = applyScale;
      } else {
        applyScale();
      }
      return bmp;
    },

    /**
     * Populate the player's hand with cards.
     * @param {Array<Object>} playerCardsParam - Array of player-owned cards.
     */
    populate(playerCardsParam) {
      // Toggle player turn
      utils.togglePlayerTurn();

      // Random hand of up to 5 cards
      const hand = utils.shuffle([...playerCardsParam]).slice(0, 5);
      player.cardsInPlayerHand = [];

      hand.forEach((chosenCard, i) => {
        const targetW =
          offsets.cardWidth ||
          offsets.cellWidth - (offsets.cardOffsetX || 3) * 2;
        const targetH =
          offsets.cardHeight ||
          offsets.cellHeight - (offsets.cardOffsetY || 3) * 2;

        // Card images
        const cardImage = this._createScaledBitmap(
          `${config.cardPath}${chosenCard.image}.png`,
          targetW,
          targetH,
          () => Game.stage.update()
        );
        const cardColour = this._createScaledBitmap(
          `${config.cardPath}${utils.getPlayerTurn()}.png`,
          targetW,
          targetH,
          () => Game.stage.update()
        );

        // Card container
        const cardContainer = new createjs.Container();
        cardContainer.addChild(cardColour, cardImage);

        // Card stats
        cardContainer.name = chosenCard.displayName;
        cardContainer.strengthUp = chosenCard.strengthUp;
        cardContainer.strengthRight = chosenCard.strengthRight;
        cardContainer.strengthDown = chosenCard.strengthDown;
        cardContainer.strengthLeft = chosenCard.strengthLeft;
        cardContainer.element = chosenCard.element;
        cardContainer.owner = utils.getPlayerTurn();
        cardContainer.background = utils.getPlayerTurn();

        // Position in hand
        cardContainer.x = player.handOffsetX;
        cardContainer.y =
          offsets.handOffsetY + i * (offsets.handCardOffset || 95);

        player.cardsInPlayerHand.push(cardContainer);
        Game.stage.addChild(cardContainer);
      });

      // Default selection
      ui.selectedCard = player.cardsInPlayerHand[0];
      ui.previouslySelectedCard = [];

      // Indent chosen card
      player.indentSelectedCard();

      // Ready for player to choose
      ui.playerConfirming = false;
      ui.playerChoosingCard = true;

      Game.stage.update();
    },
  },

  /** @type {number} Number of cards above current selection */
  cardsAboveSelection: 0,

  /** @type {number} Total cards held by player */
  playerCardCount: 0,

  /** @type {number} Number of cards played by player */
  playedPlayerCardCount: 0,

  /** @type {number} Total blue cards (score) */
  totalBlueCards: 5,

  /** @type {createjs.Bitmap|null} Player hand cursor */
  playerHandCursor: null,

  /** @type {createjs.Bitmap|null} Player hand selection cursor */
  playerHandSelectionCursor: null,

  /**
   * Indent the selected card to visually indicate selection.
   */
  indentSelectedCard() {
    if (utils.getPlayerTurn() === "red") {
      if (ui.selectedCard && typeof ui.selectedCard.x !== "undefined") {
        ui.selectedCard.x += 30;
      }
      if (
        ui.previouslySelectedCard &&
        typeof ui.previouslySelectedCard.x !== "undefined"
      ) {
        ui.previouslySelectedCard.x -= 30;
      }
    } else if (utils.getPlayerTurn() === "blue") {
      if (ui.selectedCard && typeof ui.selectedCard.x !== "undefined") {
        ui.selectedCard.x -= 30;
      }
      if (
        ui.previouslySelectedCard &&
        typeof ui.previouslySelectedCard.x !== "undefined"
      ) {
        ui.previouslySelectedCard.x += 30;
      }
    }
    Game.stage.update();
  },
};

/**
 * Class handling selection board card display and updates
 */
player.CardManager = class {
  /**
   * Update the hand cards shown on the selection board.
   */
  updateHandCards() {
    const sb = ui.selectionBoard;
    const owned = player.ownedCards || [];

    // Ensure paging is set up
    const offset = (sb.page - 1) * 11;
    if (owned.length >= 11) {
      if (sb.page !== sb.totalPages) {
        sb.displayedCards.length = 11;
      } else {
        sb.displayedCards.length = sb.remainingCards;
      }
    } else {
      sb.displayedCards.length = owned.length;
    }

    // compute index of selected card relative to the current page
    const pageIndex = sb.selectedHandCardNumber - offset;
    const validPageIndex =
      typeof pageIndex === "number" &&
      pageIndex >= 0 &&
      pageIndex < (sb.displayedCards ? sb.displayedCards.length : 0)
        ? pageIndex
        : null;

    // If the currently-selected card (relative) exists, update its colour if count === 0
    if (validPageIndex !== null) {
      const selectedDisplayed = sb.displayedCards[validPageIndex];
      if (selectedDisplayed && selectedDisplayed.count === 0) {
        selectedDisplayed.colour = "#909497";
      }
    }

    // If player has unconfirmed selections, restore their colour if needed
    if (player.playerCards.length > 0) {
      const lastCard = player.playerCards[player.playerCards.length - 1];
      if (lastCard && lastCard.count > 0) {
        lastCard.colour = "#ffffff";
      }
    }

    // Now update shownCards visual children.
    // Expectation in the UI: each row has 3 children: [nameText, countText, icon]
    // We'll iterate displayedCards and write into shownCards children accordingly.
    if (!sb.shownCards) {
      // nothing to update
      return;
    }

    let childIdx = 0; // child pointer into shownCards.children
    const shownChildren = sb.shownCards.children || [];

    for (
      let i = 0;
      i < (sb.displayedCards ? sb.displayedCards.length : 0);
      i++
    ) {
      const absoluteIndex = offset + i;
      const cardData = owned[absoluteIndex];

      // name text
      if (shownChildren[childIdx]) {
        shownChildren[childIdx].text = cardData ? cardData.displayName : "";
        shownChildren[childIdx].color = cardData
          ? cardData.colour || "#ffffff"
          : "#ffffff";
        shownChildren[childIdx].visible = !!cardData;
      }
      childIdx++;

      // count text
      if (shownChildren[childIdx]) {
        shownChildren[childIdx].text = cardData ? String(cardData.count) : "";
        shownChildren[childIdx].color = cardData
          ? cardData.colour || "#ffffff"
          : "#ffffff";
        shownChildren[childIdx].visible = !!cardData;
      }
      childIdx++;

      // icon
      if (shownChildren[childIdx]) {
        shownChildren[childIdx].visible = !!cardData;
      }
      childIdx++;
    }

    // Hide any remaining rows (there are up to 11 rows, i.e. 33 children expected)
    for (; childIdx < shownChildren.length; childIdx++) {
      const ch = shownChildren[childIdx];
      if (!ch) continue;
      // if it's a Text object, clear text; if Bitmap, hide it
      if (typeof ch.text !== "undefined") {
        ch.text = "";
      }
      ch.visible = false;
    }

    // Update page display control if present
    if (sb.pageDisplay) {
      sb.pageDisplay.text = sb.page;
    }

    // Keep sb.selectedHandCard in sync (absolute index)
    sb.selectedHandCard = owned[sb.selectedHandCardNumber] || null;

    Game.stage.update();
  }

  /**
   * Update the preview image for the currently selected card.
   */
  updateDisplayedCard() {
    if (!ui.selectionBoard.displayedCard) {
      return;
    }

    ui.selectionBoard.displayedCard.y = 700;

    if (
      ui.selectionBoard.displayedCard.children &&
      ui.selectionBoard.displayedCard.children[1] &&
      ui.selectionBoard.displayedCard.children[1].image &&
      ui.selectionBoard.selectedHandCard
    ) {
      ui.selectionBoard.displayedCard.children[1].image.src =
        config.cardPath + ui.selectionBoard.selectedHandCard.image + ".png";
    }

    createjs.Tween.get(ui.selectionBoard.displayedCard).to(
      {
        x: ui.selectionBoard.displayedCard.x,
        y: ui.selectionBoard.background.y + 200,
      },
      100
    );
  }
};

// Create single instance of card manager
player.cardManagerInstance = new player.CardManager();
