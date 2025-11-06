export class FlippingRenderer {
  constructor(stage) {
    this.stage = stage;
  }

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
  }

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
  }

  /**
   * Swap the visible face of the card (front ↔ back).
   * @param {Object} card - Card whose face to swap
   */
  swapCardFace(card) {
    const isBack = card.children[1].image.src.includes(card.backImage);

    card.children[1].image.src = isBack ? card.frontImage : card.backImage;
    card.children[1].x += card.children[1].image.width;
    card.children[1].scaleX = -1;
  }

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

    for (let index = 0; index < totalSlices; index++) {
      const slice = container.getChildAt(index);

      slice.y =
        (Math.sin((value * Math.PI) / 180) *
          factor *
          card.children[1].image.width) /
        2;
      slice.skewY = (index % 2 === 0 ? -1 : 1) * value * factor;

      if (index % 2 === 0) {
        slice.y -=
          card.children[1].image.width *
          Math.sin((slice.skewY * Math.PI) / 180);
      }

      slice.x =
        card.children[1].image.width *
        (index - totalSlices / 2) *
        Math.cos((slice.skewY * Math.PI) / 180);
      slice.updateCache();
    }

    Game.stage.update();
  }

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
    container.remove();
  }

  /**
   * Replace or update the card ownership image while retaining the front art.
   * @param {Object} cardToReplace - The card whose visual representation to update
   */
  replaceCard(cardToReplace) {
    if (cardToReplace.children[0]) {
      cardToReplace.children[0].image.src = `front_end/images/cards/${cardToReplace.owner}.png`;
    } else {
      const ownerBmp = new createjs.Bitmap(
        `front_end/images/cards/${cardToReplace.owner}.png`,
      );
      cardToReplace.addChildAt(ownerBmp, 0);
    }

    // Ensure front face stays above ownership background
    if (cardToReplace.children[1]) {
      cardToReplace.setChildIndex(
        cardToReplace.children[1],
        cardToReplace.getNumChildren() - 1,
      );
    }
  }

  /**
   * TODO: Fix and improve this
   * Flip the entire AI hand at the start of the game.
   */
  flipAIHand() {
    // Reverse copy ensures visual flip starts from last to first
    for (const [index, card] of ai.cardsInAIHand.toReversed().entries()) {
      setTimeout(
        () => {
          this.flipCard(card, "right");
        },
        2000 * (index + 1),
      );
    }
  }
}
