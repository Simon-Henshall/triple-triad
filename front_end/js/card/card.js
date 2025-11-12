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
  initVisuals(config) {
    const imagePath = this.data.imagePath;

    // Create bitmaps
    this.visuals.faceBitmap = new createjs.Bitmap(imagePath);

    const colourFile = this.owner === "player" ? "blue.png" : "red.png";
    this.visuals.colourBitmap = new createjs.Bitmap(
      `${config.imagePath}cards/${colourFile}`,
    );

    this.visuals.backBitmap = new createjs.Bitmap(
      `${config.imagePath}cards/back.png`,
    );

    // Create container and add children (layer order: back -> colour -> face)
    this.visuals.container = new createjs.Container();
    this.visuals.container.addChild(
      this.visuals.backBitmap,
      this.visuals.colourBitmap,
      this.visuals.faceBitmap,
    );

    // Target dimensions
    const targetWidth = config.scaledCardWidth;
    const targetHeight = config.scaledCardHeight;

    // Ensure face image is loaded before scaling
    if (this.visuals.faceBitmap.image.complete) {
      this._scaleContainer(targetWidth, targetHeight);
    } else {
      /**
       *
       */
      this.visuals.faceBitmap.image.addEventListener("load", () => {
        this._scaleContainer(targetWidth, targetHeight);
      });
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

    // Update colour bitmap if visuals exist
    if (this.visuals.colourBitmap) {
      const colourFile = owner === "player" ? "blue.png" : "red.png";
      this.visuals.colourBitmap.image = new Image();
      this.visuals.colourBitmap.image.src = `/cards/${colourFile}`;
    }
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

    // If a visual container exists, clone it for the new hand instance
    if (this.visuals.container) {
      const containerClone = this.visuals.container.clone(true); // deep clone bitmaps
      copy.visuals.container = containerClone;
      copy.visuals.faceBitmap = containerClone.getChildByName("faceBitmap");
      copy.visuals.colourBitmap = containerClone.getChildByName("colourBitmap");
      copy.visuals.backBitmap = containerClone.getChildByName("backBitmap");
    }

    return copy;
  }
}
