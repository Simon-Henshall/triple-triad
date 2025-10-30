import { UIManager } from "../managers/UIManager.js";
import { CursorController } from '../controllers/CursorController.js';
import { Game } from '../game/game.js';

export const confirmationBox = {
  /**
   * Display the "Are you sure?" confirmation dialog
   */
  show() {
    const conf = UIManager.confirmation;
    UIManager.playerConfirming = true;

    // Reset to default selection
    conf.selectedChoice = 0;
    conf.cursor.y = conf.background.y + 60;

    // Background rectangle
    conf.background.width = 300;
    conf.background.height = 120;
    conf.background.graphics
      .beginFill("#666666")
      .drawRect(0, 0, conf.background.width, conf.background.height);
    conf.background.x = 380;
    conf.background.y = 285;

    // Border
    const border = new createjs.Shape();
    border.width = conf.background.width + 2;
    border.height = conf.background.height + 2;
    border.graphics
      .beginFill("#000000")
      .drawRect(0, 0, border.width, border.height);
    border.x = conf.background.x - 1;
    border.y = conf.background.y - 1;

    // Text elements
    const choiceLabel = new createjs.Text("CHOICE", "18px Arial", "#ffffff");
    choiceLabel.x = conf.background.x + 10;
    choiceLabel.y = conf.background.y + 15;
    choiceLabel.textBaseline = "alphabetic";

    const question = new createjs.Text("Are you sure?", "28px Arial", "#ffffff");
    question.x = conf.background.x + 60;
    question.y = conf.background.y + 40;
    question.textBaseline = "alphabetic";

    const yesText = new createjs.Text("Yes", "28px Arial", "#ffffff");
    yesText.x = conf.background.x + 120;
    yesText.y = conf.background.y + 75;
    yesText.textBaseline = "alphabetic";

    const noText = new createjs.Text("No", "28px Arial", "#ffffff");
    noText.x = conf.background.x + 120;
    noText.y = conf.background.y + 105;
    noText.textBaseline = "alphabetic";

    // Clear previous children, just in case it was triggered multiple times
    conf.container.removeAllChildren();

    conf.container.addChild(border, conf.background, choiceLabel, question, yesText, noText);
    Game.stage.addChild(conf.container);
    CursorController.confirmation.place();

    // Hide the preview card while confirmation is up
    UIManager.selectionBoard.hidePreviewCard();

    Game.stage.update();
  },
};
