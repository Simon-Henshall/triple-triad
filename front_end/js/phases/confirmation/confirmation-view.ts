/**
 * @fileoverview View component for the confirmation phase.
 * Responsible for rendering the "Are you sure?" confirmation box.
 */
export const ConfirmationView = {
  /** @type {object|undefined} Set at runtime by ConfirmationController */
  model: undefined,
  /** @type {createjs.Container|undefined} Initialised lazily */
  container: undefined,
  /** @type {createjs.Shape|undefined} Initialised lazily */
  background: undefined,

  /**
   * Ensure the container and background are initialised.
   * Called lazily to avoid depending on createjs at module load time.
   */
  _ensureInitialised() {
    if (!this.container) {
      this.container = new createjs.Container();
    }
    if (!this.background) {
      this.background = new createjs.Shape();
    }
  },

  /**
   * Show the confirmation dialog.
   */
  show() {
    this.drawConfirmationBox();
  },

  /**
   * Hide the confirmation dialog.
   */
  hide() {
    if (this.container) {
      this.container.removeAllChildren();
    }
  },

  drawConfirmationBox() {
    this._ensureInitialised();

    // Set the dimensions and fill color of the confirmation background
    this.background.x = 380;
    this.background.y = 285;
    this.background.width = 300;
    this.background.height = 120;
    this.background.graphics
      .beginFill("#666666")
      .drawRect(0, 0, this.background.width, this.background.height);

    // Create a border slightly larger than the background
    const border = new createjs.Shape();
    border.width = this.background.width + 2;
    border.height = this.background.height + 2;
    border.graphics
      .beginFill("#000000")
      .drawRect(0, 0, border.width, border.height);
    border.x = this.background.x - 1;
    border.y = this.background.y - 1;

    // Add text elements with fixed offsets for alignment
    const choiceLabel = new createjs.Text("CHOICE", "18px Arial", "#ffffff");
    choiceLabel.x = this.background.x + 10;
    choiceLabel.y = this.background.y + 5;

    const question = new createjs.Text(
      "Are you sure?",
      "28px Arial",
      "#ffffff",
    );
    question.x = this.background.x + 60;
    question.y = this.background.y + 20;

    const yesText = new createjs.Text("Yes", "28px Arial", "#ffffff");
    yesText.x = this.background.x + 120;
    yesText.y = this.background.y + 50;

    const noText = new createjs.Text("No", "28px Arial", "#ffffff");
    noText.x = this.background.x + 120;
    noText.y = this.background.y + 80;

    // Clear container and add all elements
    this.container.removeAllChildren();
    this.container.addChild(
      border,
      this.background,
      choiceLabel,
      question,
      yesText,
      noText,
    );
  },
};
