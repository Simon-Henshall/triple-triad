/**
 *
 */
export class FlippingRenderer {
  /**
   * Handles visual updates triggered by card flipping animations.
   */
  constructor(stage) {
    this.stage = stage;
  }

  /**
   * Flip a single card in a given direction.
   * @param {Object} card - The card to flip
   * @param {string} direction - Direction to flip
   */
  flipCard(container, direction) {
    // container is now `card.visuals.container`
    const sliceContainer = new createjs.Container();
    const faceBitmap =
      container.getChildByName("faceBitmap") || container.getChildAt(2);
    const sliceWidth = faceBitmap.image.width * container.scaleX;
    const sliceHeight = faceBitmap.image.height * container.scaleY;

    sliceContainer.x = container.x + sliceWidth / 2;
    sliceContainer.y = container.y;

    container.sourceRect = new createjs.Rectangle(0, 0, 0, sliceWidth);
    container.cache(0, 0, sliceWidth, sliceHeight);

    sliceContainer.addChild(container);
    this.stage.addChild(sliceContainer);

    this._animateFlip(
      container,
      sliceContainer,
      direction,
      0,
      container.x,
      container.y,
    );
  }

  /**
   * Recursive flip animation.
   * @param {Object} card - Card to animate
   * @param {createjs.Container} container - Container holding card
   * @param {string} direction - Direction of flip
   * @param {number} counter - Current frame
   * @param {number} initialX - Original X position
   * @param {number} initialY - Original Y position
   */
  _animateFlip(card, container, direction, counter, initialX, initialY) {
    const MAX_FRAMES = 180;
    const SWAP_FRAME = 90;

    if (counter > MAX_FRAMES) {
      this.finaliseFlip(card, container, initialX, initialY);
      return;
    }

    setTimeout(() => {
      counter++;
      if (counter === SWAP_FRAME) {
        this.swapCardFace(card);
      }
      this.flipDirection(card, container, direction, counter);
      this._animateFlip(
        card,
        container,
        direction,
        counter,
        initialX,
        initialY,
      );
    }, 2);
  }

  /**
   * Swap the visible face of the card (front ↔ back).
   * @param {Object} card - Card whose face to swap
   */
  swapCardFace(card) {
    const face = card.children[1];
    const isBack = face.image.src.includes(card.backImage);
    face.image.src = isBack ? card.frontImage : card.backImage;

    // Reset position/scale to avoid drift
    face.x = 0;
    face.scaleX = 1;
  }

  /**
   * Flip container slices per direction.
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
      slice.x =
        card.children[1].image.width *
        (index - totalSlices / 2) *
        Math.cos((slice.skewY * Math.PI) / 180);
      slice.updateCache();
    }

    this.stage.update();
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
    this.stage.addChild(card);
    container.removeAllChildren();
    container.remove();
  }

  /**
   * Replace or update the card ownership image while retaining the front art.
   * @param {Object} cardToReplace - The card whose visual representation to update
   */
  refreshCardFace(cardToReplace) {
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

  /** Flip AI hand at game start */
  flipAIHand(hand) {
    const handCopy = hand.toReversed();
    for (const [index, card] of handCopy.entries()) {
      setTimeout(() => this.flipCard(card, "right"), 2000 * (index + 1));
    }
  }
}
