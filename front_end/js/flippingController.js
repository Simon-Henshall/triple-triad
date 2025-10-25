import { player } from './player.js';
import { utils } from './utils.js';
import { ui } from './ui.js';
import { ai } from './ai.js';
import { Game } from './game.js';

/**
 * @namespace Game.cards.flipping.js
 * @description Handles card flipping, animation, and ownership logic.
 */

/** Conversion factor for degrees to radians */
const DEG_TO_RAD = Math.PI / 180;

/**
 * Maps card direction keywords to internal properties and strengths
 * @type {Object<string, Object>}
 */
const directionMap = {
  left: {
    prop: "cardLeft",
    playerStrength: "strengthLeft",
    opponentStrength: "strengthRight",
  },
  right: {
    prop: "cardRight",
    playerStrength: "strengthRight",
    opponentStrength: "strengthLeft",
  },
  up: {
    prop: "cardUp",
    playerStrength: "strengthUp",
    opponentStrength: "strengthDown",
  },
  down: {
    prop: "cardDown",
    playerStrength: "strengthDown",
    opponentStrength: "strengthUp",
  },
};

export const flippingController = {
  /**
   * Flip the entire AI hand at the start of the game.
   */
  flipAIHand() {
    // Reverse copy ensures visual flip starts from last to first
    ai.cardsInAIHand
      .slice()
      .reverse()
      .forEach((card, index) => {
        setTimeout(() => {
          this.flipCard(card, "right");
        }, 2000 * (index + 1));
      });
  },
  /**
   * Check adjacent cards for possible flips based on strengths.
   * @param {Object} card - The card to check around.
   */
  flipCardsCheck(card) {
    Object.entries(directionMap).forEach(
      ([direction, { prop, playerStrength, opponentStrength }]) => {
        const target = card[prop];

        if (
          target &&
          card.owner !== target.owner &&
          card[playerStrength] > target[opponentStrength]
        ) {
          this.flipCardOver(card, direction);
        }
      }
    );
  },
  /**
   * Get the colour of the current player.
   * @returns {string} Player colour ("red" or "blue")
   */
  getCurrentPlayerColour() {
    return utils.getPlayerTurn();
  },
  /**
   * Flip a single adjacent card over to the current player's side.
   * @param {Object} card - The source card triggering the flip
   * @param {string} direction - Direction to flip ("left", "right", "up", "down")
   */
  flipCardOver(card, direction) {
    const targetCard = card[directionMap[direction].prop];

    // Change ownership
    targetCard.owner = this.getCurrentPlayerColour();

    // Update visual representation
    this.replaceCard(targetCard);

    // Update counts
    this.updateOwnershipCounts(1);

    // Maintain board consistency
    const squareObj = ui.squares[targetCard.inCell - 1];
    if (squareObj) {
      squareObj.card = targetCard;
    }
  },
  /**
   * Update player and AI ownership totals
   * @param {number} flippedCount - Number of cards flipped
   */
  updateOwnershipCounts(flippedCount) {
    const playerColour = this.getCurrentPlayerColour();

    const delta = {
      blue: { totalBlueCardsConfined: 1, totalRedCardsConfined: -1 },
      red: { totalBlueCardsConfined: -1, totalRedCardsConfined: 1 },
    };

    player.totalBlueCards +=
      delta[playerColour].totalBlueCardsConfined * flippedCount;
    ai.totalRedCards +=
      delta[playerColour].totalRedCardsConfined * flippedCount;

    this.updateCardCounts();
  },
  /**
   * Update the displayed card counts on UI.
   */
  updateCardCounts() {
    ai.aiCardCount.text = ai.totalRedCards;
    player.playerCardCount.text = player.totalBlueCards;
    Game.stage.update();
  },
  /**
   * Replace or update the card ownership image while retaining the front art.
   * @param {Object} cardToReplace - The card whose visual representation to update
   */
  replaceCard(cardToReplace) {
    if (!cardToReplace.children[0]) {
      const ownerBmp = new createjs.Bitmap(
        `front_end/images/cards/${cardToReplace.owner}.png`
      );
      cardToReplace.addChildAt(ownerBmp, 0);
    } else {
      cardToReplace.children[0].image.src = `front_end/images/cards/${cardToReplace.owner}.png`;
    }

    // Ensure front face stays above ownership background
    if (cardToReplace.children[1]) {
      cardToReplace.setChildIndex(
        cardToReplace.children[1],
        cardToReplace.getNumChildren() - 1
      );
    }
  },
  /**
   * Initiate a card flip animation in a container.
   * @param {Object} card - The card to flip
   * @param {string} direction - Direction to flip
   */
  flipCard(card, direction) {
    const sliceContainer = new createjs.Container();

    const sliceWidth = card.children[1].image.width * card.scaleX;
    const sliceHeight = card.children[1].image.height * card.scaleY;

    const initialX = card.x;
    const initialY = card.y;

    sliceContainer.x = initialX + sliceWidth / 2;
    sliceContainer.y = initialY;

    // Cache the card for smoother animation
    card.sourceRect = new createjs.Rectangle(0, 0, 0, sliceWidth);
    card.cache(0, 0, sliceWidth, sliceHeight);

    sliceContainer.addChild(card);
    Game.stage.addChild(sliceContainer);

    this.animateFlip(card, sliceContainer, direction, 0, initialX, initialY);
  },
  /**
   * Recursive flip animation loop.
   * @param {Object} card - Card to animate
   * @param {createjs.Container} container - Container holding card
   * @param {string} direction - Direction of flip
   * @param {number} counter - Current frame
   * @param {number} initialX - Original X position
   * @param {number} initialY - Original Y position
   */
  animateFlip(card, container, direction, counter, initialX, initialY) {
    if (counter > 180) {
      this.finaliseFlip(card, container, initialX, initialY);
      return;
    }

    setTimeout(() => {
      counter++;

      if (counter === 90) {
        this.swapCardFace(card);
      }

      this.flipDirection(card, container, direction, counter);

      this.animateFlip(card, container, direction, counter, initialX, initialY);
    }, 2);
  },
  /**
   * Swap the visible face of the card (front ↔ back).
   * @param {Object} card - Card whose face to swap
   */
  swapCardFace(card) {
    const isBack = card.children[1].image.src.includes(card.backImage);

    card.children[1].image.src = isBack ? card.frontImage : card.backImage;
    card.children[1].x += card.children[1].image.width;
    card.children[1].scaleX = -1;
  },

  /**
   * Perform flip direction calculations and cache updates.
   * @param {Object} card - Card to manipulate
   * @param {createjs.Container} container - Container for slices
   * @param {string} direction - Flip direction
   * @param {number} value - Current animation counter
   */
  flipDirection(card, container, direction, value) {
    const factor = direction === "left" ? -1 : 1;
    const totalSlices = container.getNumChildren();

    for (let i = 0; i < totalSlices; i++) {
      const slice = container.getChildAt(i);

      slice.y =
        (Math.sin(value * DEG_TO_RAD) * factor * card.children[1].image.width) /
        2;
      slice.skewY = (i % 2 === 0 ? -1 : 1) * value * factor;

      if (i % 2 === 0) {
        slice.y -=
          card.children[1].image.width * Math.sin(slice.skewY * DEG_TO_RAD);
      }

      slice.x =
        card.children[1].image.width *
        (i - totalSlices / 2) *
        Math.cos(slice.skewY * DEG_TO_RAD);
      slice.updateCache();
    }

    Game.stage.update();
  },
  /**
   * Finalise the card flip animation and clean up container.
   * @param {Object} card - Card to finalize
   * @param {createjs.Container} container - Container used for animation
   * @param {number} initialX - Original X position
   * @param {number} initialY - Original Y position
   */
  finaliseFlip(card, container, initialX, initialY) {
    card.x = initialX;
    card.y = initialY;

    Game.stage.addChild(card);
    container.removeAllChildren();
    Game.stage.removeChild(container);
  },
};
