// -----------------------------------------------------------------------------
// File: front_end/js/ui/UIRenderer.js
// Purpose: perform all CreateJS rendering for UI
// -----------------------------------------------------------------------------

import { config } from "../config.js";
import { offsets } from "../constants/offsets.js";
import { player } from "../render/player.js";
import { ai } from "../game/ai.js";
import { Game } from "../game/game.js";
import { UIManager } from "../managers/UIManager.js";

// Info box layout constants
const INFO_BOX_WIDTH = 420;
const INFO_BOX_HEIGHT = 65;
const INFO_BOX_X = 260;
const INFO_BOX_Y = 540;

export const UIRenderer = {
  // -------------------------
  // Add background
  // -------------------------
  addBackground() {
    const background = new createjs.Bitmap(config.imagePath + "board.png");
    background.x = 0;
    background.y = 0;
    Game.stage.addChild(background);
    Game.stage.update();
  },

  // -------------------------
  // Draw player card counts
  // -------------------------
  drawCardCounts() {
    if (ai.aiCardCount) Game.stage.removeChild(ai.aiCardCount);
    if (player.playerCardCount) Game.stage.removeChild(player.playerCardCount);

    ai.aiCardCount = new createjs.Text(
      ai.totalRedCards,
      "90px Arial",
      "#ffffff"
    );
    ai.aiCardCount.x = ai.handOffsetX + offsets.cardWidth / 3;
    ai.aiCardCount.y = Game.stageHeight - 15;
    ai.aiCardCount.textBaseline = "alphabetic";
    Game.stage.addChild(ai.aiCardCount);

    player.playerCardCount = new createjs.Text(
      player.totalBlueCards,
      "90px Arial",
      "#ffffff"
    );
    player.playerCardCount.x = player.handOffsetX + offsets.cardWidth / 3;
    player.playerCardCount.y = Game.stageHeight - 15;
    player.playerCardCount.textBaseline = "alphabetic";
    Game.stage.addChild(player.playerCardCount);

    Game.stage.update();
  },

  // -------------------------
  // Draw the info box
  // -------------------------
  drawInfoBox() {
    const ui = UIManager;

    if (!ui.infoBox.container) {
      ui.infoBox.container = new createjs.Container();
    } else {
      ui.infoBox.container.removeAllChildren();
    }

    const infoBoxBackground = new createjs.Shape();
    infoBoxBackground.graphics
      .beginFill("#666666")
      .drawRect(0, 0, INFO_BOX_WIDTH, INFO_BOX_HEIGHT);
    infoBoxBackground.x = INFO_BOX_X;
    infoBoxBackground.y = INFO_BOX_Y;
    infoBoxBackground.setBounds(
      infoBoxBackground.x,
      infoBoxBackground.y,
      INFO_BOX_WIDTH,
      INFO_BOX_HEIGHT
    );
    ui.infoBox.container.addChild(infoBoxBackground);

    const infoBoxText = new createjs.Text("INFO.", "18px Arial", "#ffffff");
    infoBoxText.x = infoBoxBackground.x + 10;
    infoBoxText.y = infoBoxBackground.y + 15;
    infoBoxText.textBaseline = "alphabetic";
    ui.infoBox.container.addChild(infoBoxText);

    if (!ui.infoBox.cardName) {
      ui.infoBox.cardName = new createjs.Text(
        ui.selectedCard?.name || "",
        "30px Arial",
        "#ffffff"
      );
      ui.infoBox.cardName.textBaseline = "alphabetic";
    }
    ui.infoBox.cardName.text = ui.selectedCard?.name || "";

    const verticalOffset = 30 / 2 + 10;
    ui.infoBox.cardName.x =
      INFO_BOX_X +
      INFO_BOX_WIDTH / 2 -
      ui.infoBox.cardName.getMeasuredWidth() / 2;
    ui.infoBox.cardName.y =
      INFO_BOX_Y +
      INFO_BOX_HEIGHT / 2 -
      ui.infoBox.cardName.getMeasuredHeight() / 2 +
      verticalOffset;

    ui.infoBox.container.addChild(ui.infoBox.cardName);
    Game.stage.addChild(ui.infoBox.container);
    Game.stage.update();
  },

  // -------------------------
  // Update the info box
  // -------------------------
  updateInfoBox() {
    const ui = UIManager;

    if (ui.infoBox.cardName && ui.selectedCard) {
      ui.infoBox.cardName.text = ui.selectedCard.name;

      const verticalOffset = 30 / 2 + 10;
      ui.infoBox.cardName.x =
        INFO_BOX_X +
        INFO_BOX_WIDTH / 2 -
        ui.infoBox.cardName.getMeasuredWidth() / 2;
      ui.infoBox.cardName.y =
        INFO_BOX_Y +
        INFO_BOX_HEIGHT / 2 -
        ui.infoBox.cardName.getMeasuredHeight() / 2 +
        verticalOffset;
    }

    if (ai.aiCardCount) ai.aiCardCount.text = ai.totalRedCards;
    if (player.playerCardCount)
      player.playerCardCount.text = player.totalBlueCards;

    Game.stage.update();
  },

  /**
   * Draws the "Are you sure?" confirmation box with all text and borders.
   * Positions elements relative to the background and container.
   *
   * @param {object} conf - The confirmation state from UIManager
   * @property {createjs.Container} conf.container - Container for all confirmation elements
   * @property {createjs.Shape} conf.background - The background rectangle
   */
  drawConfirmationBox(conf) {
    // Set the dimensions and fill color of the confirmation background
    conf.background.width = 300;
    conf.background.height = 120;
    conf.background.graphics
      .beginFill("#666666")
      .drawRect(0, 0, conf.background.width, conf.background.height);
    conf.background.x = 380;
    conf.background.y = 285;

    // Create a border slightly larger than the background
    const border = new createjs.Shape();
    border.width = conf.background.width + 2;
    border.height = conf.background.height + 2;
    border.graphics
      .beginFill("#000000")
      .drawRect(0, 0, border.width, border.height);
    border.x = conf.background.x - 1;
    border.y = conf.background.y - 1;

    // Add text elements with fixed offsets for alignment
    const choiceLabel = new createjs.Text("CHOICE", "18px Arial", "#ffffff");
    choiceLabel.x = conf.background.x + 10;
    choiceLabel.y = conf.background.y + 5;

    const question = new createjs.Text(
      "Are you sure?",
      "28px Arial",
      "#ffffff"
    );
    question.x = conf.background.x + 60;
    question.y = conf.background.y + 20;

    const yesText = new createjs.Text("Yes", "28px Arial", "#ffffff");
    yesText.x = conf.background.x + 120;
    yesText.y = conf.background.y + 50;

    const noText = new createjs.Text("No", "28px Arial", "#ffffff");
    noText.x = conf.background.x + 120;
    noText.y = conf.background.y + 80;

    // Clear container and add all elements
    conf.container.removeAllChildren();
    conf.container.addChild(
      border,
      conf.background,
      choiceLabel,
      question,
      yesText,
      noText
    );
  },
};
