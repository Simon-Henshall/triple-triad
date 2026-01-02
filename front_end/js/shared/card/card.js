import { config } from "../../constants/config.js";
import { offsets } from "../../constants/offsets.js";

/**
 *  Card class representing a game card with properties and visuals.
 *  @module Card
 */
export class Card {
  /**
   *  Create a new Card instance.
   *  @param {Object} param0
   *  @param {number|string} param0.id - unique card ID
   *  @param {string} param0.displayName - card name
   *  @param {string|undefined} [param0.element] - element type
   *  @param {Object} param0.strength - directional strengths
   *  @param {number} param0.strength.up
   *  @param {number} param0.strength.down
   *  @param {number} param0.strength.left
   *  @param {number} param0.strength.right
   *  @param {string} param0.imagePath - face image path
   *  @param {string} [owner] - initial owner
   *  @param {number} [count] - amount owned
   */
  constructor({ id, name, element, strength, imagePath }, owner, count) {
    // Immutable data
    this.data = {
      id,
      name,
      element,
      strength: { ...strength },
      imagePath,
    };

    // Visuals (CreateJS bitmaps & container)
    this.visuals = {
      faceBitmap: undefined,
      colourBitmap: undefined,
      backBitmap: undefined,
      container: undefined,
    };

    // Mutable ownership
    this.owner = owner;

    // Mutable count
    this.count = count;
  }

  /**
   *  Initialise CreateJS bitmaps and container for the card visuals.
   *  @param {createjs.Stage
   */
  initVisuals() {
    const imagePath = this.data.imagePath;
    const colour = this.owner === "player" ? "blue" : "red";

    // Face & back
    this.visuals.faceBitmap = new createjs.Bitmap(imagePath);
    this.visuals.faceBitmap.name = "faceBitmap";

    this.visuals.backBitmap = new createjs.Bitmap(
      `${config.imagePath}cards/back.png`,
    );
    this.visuals.backBitmap.name = "backBitmap";

    this.visuals.colourBitmap = new createjs.Bitmap(
      `${config.imagePath}cards/${colour}.png`,
    );
    this.visuals.colourBitmap.name = "colourBitmap";

    // Container
    const container = new createjs.Container();
    container.name = "cardContainer";

    container.addChild(
      this.visuals.backBitmap,
      this.visuals.colourBitmap,
      this.visuals.faceBitmap,
    );

    this.visuals.container = container;

    // Scale after face image loads
    this._waitForFaceAndScale();
  }

  /**
   * Wait for the face bitmap to load and scale the container to the target dimensions.
   *
   */
  _waitForFaceAndScale() {
    const targetWidth = offsets.scaledCardWidth;
    const targetHeight = offsets.scaledCardHeight;

    /**
     * Wait for the face bitmap to load and scale the container to the target dimensions.
     * Listens for the load event of the face bitmap image and applies the scale when it fires.
     */
    const applyScale = () => this._scaleContainer(targetWidth, targetHeight);

    const img = this.visuals.faceBitmap.image;
    if (img.complete && img.naturalWidth !== 0) {
      applyScale();
    } else {
      /**
       * Private helper: waits for the face bitmap to load and scales the container to the target dimensions.
       */
      const onLoad = () => {
        img.removeEventListener("load", onLoad);
        applyScale();
      };
      img.addEventListener("load", onLoad);
    }
  }

  /**
   * Internal helper: scales container and all child bitmaps to target size
   */
  _scaleContainer(targetWidth, targetHeight) {
    const face = this.visuals.faceBitmap;

    if (!face?.image?.width || !face?.image?.height) {
      console.warn("[Card] Face bitmap missing dimensions, cannot scale.");
      return;
    }

    // Calculate scale factors
    const scaleX = targetWidth / face.image.width;
    const scaleY = targetHeight / face.image.height;

    // Apply scale to container
    this.visuals.container.scaleX = scaleX;
    this.visuals.container.scaleY = scaleY;

    // Optional: reset positions (0,0) in case image offsets exist
    this.visuals.backBitmap.x = 0;
    this.visuals.backBitmap.y = 0;
    this.visuals.colourBitmap.x = 0;
    this.visuals.colourBitmap.y = 0;
    this.visuals.faceBitmap.x = 0;
    this.visuals.faceBitmap.y = 0;
  }

  /**
   *  Set the owner of the card and update visuals accordingly.
   *  @param {"player"|"ai"} owner
   */
  setOwner(owner) {
    this.owner = owner;

    // Update colours for flipped card
    const colourChild =
      this.visuals.container.getChildByName("colourBitmap") ||
      this.visuals.container.children.find(
        (child) => child.name === "colourBitmap",
      );

    if (colourChild) {
      const replacementImage = new Image();
      /**
       *
       */
      replacementImage.addEventListener("load", () => {
        colourChild.image = replacementImage;
        this.visuals.container.stage?.update();
      });
      replacementImage.src = `${config.imagePath}cards/${owner}.png`;
    }

    console.log(
      `[Card] Setting owner to ${owner} for card ${this.data.name}` +
        ` (${this.data.id})`,
    );

    return owner;
  }

  /**
   *  Set the owner of the card and update visuals accordingly.
   *  @param {number} count
   */
  setCount(count) {
    this.count = count;
  }

  /**
   * Create a new Card instance with identical data
   * but optional new owner / count
   */
  clone({ owner = this.owner, count = this.count } = {}) {
    const copy = new Card(this.data, owner, count);

    if (this.visuals.container) {
      const containerClone = this.visuals.container.clone(true);

      copy.visuals.container = containerClone;

      // Fix: fetch children by name
      copy.visuals.backBitmap = containerClone.getChildByName("backBitmap");
      copy.visuals.colourBitmap = containerClone.getChildByName("colourBitmap");
      copy.visuals.faceBitmap = containerClone.getChildByName("faceBitmap");
    }

    return copy;
  }
}
