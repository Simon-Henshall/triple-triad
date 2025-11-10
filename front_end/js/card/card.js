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

    this.visuals.faceBitmap = new createjs.Bitmap(imagePath);

    const colourFile = this.owner === "player" ? "blue.png" : "red.png";
    this.visuals.colourBitmap = new createjs.Bitmap(
      `${config.imagePath}cards/${colourFile}`,
    );
    this.visuals.backBitmap = new createjs.Bitmap(
      `${config.imagePath}cards/back.png`,
    );

    this.visuals.container = new createjs.Container();
    // Layer order: back -> colour -> face
    this.visuals.container.addChild(
      this.visuals.backBitmap,
      this.visuals.colourBitmap,
      this.visuals.faceBitmap,
    );
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
}
