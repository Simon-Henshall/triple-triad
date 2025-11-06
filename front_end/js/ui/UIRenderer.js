import { config } from "../config.js";
import { offsets } from "../constants/offsets.js";
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
  // Add background to the stage
  // -------------------------

  /**
   * Adds the main board background to the game stage.
   * This is a static image and does not require updates.
   */
  addBackground() {
    const background = new createjs.Bitmap(config.imagePath + "board.png");
    background.x = 0;
    background.y = 0;

    Game.stage.addChild(background);
    Game.stage.update();
  },

  // -------------------------
  // Draw player and AI card counts
  // -------------------------

  /**
   * Draws the total card counts for both the AI and player hands.
   * Removes previous counts to avoid duplicates.
   */
  drawCardCounts() {
    const playerManager = Game.managers.playerManager;
    // Remove existing counts if present
    if (ai.aiCardCount) {
      Game.stage.removeChild(ai.aiCardCount);
    }
    if (playerManager.playerCardCount) {
      Game.stage.removeChild(playerManager.playerCardCount);
    }

    // Create and position AI card count
    ai.aiCardCount = new createjs.Text(
      ai.totalRedCards,
      "90px Arial",
      "#ffffff",
    );
    ai.aiCardCount.x = ai.handOffsetX + offsets.cardWidth / 3;
    ai.aiCardCount.y = Game.stageHeight - 15;
    ai.aiCardCount.textBaseline = "alphabetic";
    Game.stage.addChild(ai.aiCardCount);

    // Create and position player card count
    playerManager.playerCardCount = new createjs.Text(
      playerManager.totalBlueCards,
      "90px Arial",
      "#ffffff",
    );
    playerManager.playerCardCount.x = Game.stageWidth - offsets.cardWidth;
    playerManager.playerCardCount.y = Game.stageHeight - 15;
    playerManager.playerCardCount.textBaseline = "alphabetic";
    Game.stage.addChild(playerManager.playerCardCount);

    Game.stage.update();
  },

  // -------------------------
  // Draw info box
  // -------------------------

  /**
   * Draws the info box container showing selected card info.
   * Initializes the container and text elements if they don't exist yet.
   */
  drawInfoBox() {
    const ui = UIManager;

    // Initialize container if missing, otherwise clear previous children
    if (!ui.infoBox.container) {
      ui.infoBox.container = new createjs.Container();
    } else {
      ui.infoBox.container.removeAllChildren();
    }

    // Draw the background rectangle
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
      INFO_BOX_HEIGHT,
    );
    ui.infoBox.container.addChild(infoBoxBackground);

    // Draw the label text
    const infoBoxText = new createjs.Text("INFO.", "18px Arial", "#ffffff");
    infoBoxText.x = infoBoxBackground.x + 10;
    infoBoxText.y = infoBoxBackground.y + 15;
    infoBoxText.textBaseline = "alphabetic";
    ui.infoBox.container.addChild(infoBoxText);

    // Draw card name text (centered)
    if (!ui.infoBox.cardName) {
      ui.infoBox.cardName = new createjs.Text(
        ui.selectedCard?.name || "",
        "30px Arial",
        "#ffffff",
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
  // Update info box (card name & counts)
  // -------------------------

  /**
   * Updates info box contents dynamically based on current selection.
   * Updates player/AI card counts as well.
   */
  updateInfoBox() {
    const ui = UIManager;

    // Update selected card name
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

    Game.stage.update();
  },

  // -------------------------
  // Draw confirmation box
  // -------------------------

  /**
   * Draws the "Are you sure?" confirmation box with text and border.
   *
   * @param {object} conf - The confirmation box state from UIManager
   * @property {createjs.Container} conf.container - Container for all confirmation elements
   * @property {createjs.Shape} conf.background - Background rectangle
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
      "#ffffff",
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
      noText,
    );
  },
};
