/**
 * @fileoverview View component for the rules phase.
 * Displays the current game rules and Play/Quit options.
 */
export const RulesView = {
  /** @type {object|undefined} Set at runtime by RulesController */
  model: undefined,
  /** @type {createjs.Container|undefined} Initialised lazyly */
  container: undefined,
  /** @type {createjs.Shape|undefined} Initialised lazily */
  background: undefined,
  /** @type {number} X position of the dialog box */
  boxX: 320,
  /** @type {number} Y position where options text starts */
  optionsStartY: 0,

  _ensureInitialised() {
    if (!this.container) {
      this.container = new createjs.Container();
    }
    if (!this.background) {
      this.background = new createjs.Shape();
    }
  },

  show() {
    this.drawRulesBox();
  },

  hide() {
    if (this.container) {
      this.container.removeAllChildren();
    }
  },

  drawRulesBox() {
    this._ensureInitialised();

    const boxX = this.boxX;
    const boxY = 180;
    const boxWidth = 280;
    const boxHeight = 340;

    this.background.x = boxX;
    this.background.y = boxY;
    this.background.width = boxWidth;
    this.background.height = boxHeight;
    this.background.graphics
      .beginFill("#666666")
      .drawRect(0, 0, boxWidth, boxHeight);

    const border = new createjs.Shape();
    border.width = boxWidth + 2;
    border.height = boxHeight + 2;
    border.graphics
      .beginFill("#000000")
      .drawRect(0, 0, border.width, border.height);
    border.x = boxX - 1;
    border.y = boxY - 1;

    const infoLabel = new createjs.Text("info", "14px Arial", "#aaaaaa");
    infoLabel.x = boxX + 10;
    infoLabel.y = boxY + 5;

    const header = new createjs.Text("Rules:", "24px Arial", "#ffffff");
    header.x = boxX + 15;
    header.y = boxY + 25;

    const rulesList = [
      "Open",
      "Elemental",
      "Same",
      "Same Wall",
      "Plus",
      "Trade Rule: One",
    ];

    const bulletTexts = [];
    let bulletY = boxY + 60;
    for (const rule of rulesList) {
      const bullet = new createjs.Text(
        "\u2022 " + rule,
        "18px Arial",
        "#ffffff",
      );
      bullet.x = boxX + 30;
      bullet.y = bulletY;
      bulletTexts.push(bullet);
      bulletY += 26;
    }

    this.optionsStartY = bulletY + 20;

    const playText = new createjs.Text("Play", "28px Arial", "#ffffff");
    playText.x = boxX + 110;
    playText.y = this.optionsStartY;

    const quitText = new createjs.Text("Quit", "28px Arial", "#ffffff");
    quitText.x = boxX + 110;
    quitText.y = this.optionsStartY + 40;

    this.container.removeAllChildren();
    this.container.addChild(
      border,
      this.background,
      infoLabel,
      header,
      ...bulletTexts,
      playText,
      quitText,
    );
  },
};
