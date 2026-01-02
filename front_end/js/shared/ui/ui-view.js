import { config } from "../../constants/config.js";
import { Game } from "../game/game.js";

export const UIView = {
  // -------------------------
  // Add background to the stage
  // -------------------------

  addBackground() {
    const background = new createjs.Bitmap(config.imagePath + "board.png");
    background.x = 0;
    background.y = 0;

    Game.stage.addChild(background);
    Game.stage.update();
  },

  // -------------------------
  // Draw confirmation box
  // -------------------------

  /**
   * Draws the "Are you sure?" confirmation box with text and border.
   *
   * @param {object} conf - The confirmation box state from UIModel
   * @property {createjs.Container} conf.container - Container for all confirmation elements
   * @property {createjs.Shape} conf.background - Background rectangle
   */
  drawConfirmationBox(config_) {
    // Set the dimensions and fill color of the confirmation background
    config_.background.width = 300;
    config_.background.height = 120;
    config_.background.graphics
      .beginFill("#666666")
      .drawRect(0, 0, config_.background.width, config_.background.height);
    config_.background.x = 380;
    config_.background.y = 285;

    // Create a border slightly larger than the background
    const border = new createjs.Shape();
    border.width = config_.background.width + 2;
    border.height = config_.background.height + 2;
    border.graphics
      .beginFill("#000000")
      .drawRect(0, 0, border.width, border.height);
    border.x = config_.background.x - 1;
    border.y = config_.background.y - 1;

    // Add text elements with fixed offsets for alignment
    const choiceLabel = new createjs.Text("CHOICE", "18px Arial", "#ffffff");
    choiceLabel.x = config_.background.x + 10;
    choiceLabel.y = config_.background.y + 5;

    const question = new createjs.Text(
      "Are you sure?",
      "28px Arial",
      "#ffffff",
    );
    question.x = config_.background.x + 60;
    question.y = config_.background.y + 20;

    const yesText = new createjs.Text("Yes", "28px Arial", "#ffffff");
    yesText.x = config_.background.x + 120;
    yesText.y = config_.background.y + 50;

    const noText = new createjs.Text("No", "28px Arial", "#ffffff");
    noText.x = config_.background.x + 120;
    noText.y = config_.background.y + 80;

    // Clear container and add all elements
    config_.container.removeAllChildren();
    config_.container.addChild(
      border,
      config_.background,
      choiceLabel,
      question,
      yesText,
      noText,
    );
  },
};
