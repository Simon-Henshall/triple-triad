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

    ai.aiCardCount = new createjs.Text(ai.totalRedCards, "90px Arial", "#ffffff");
    ai.aiCardCount.x = ai.handOffsetX + offsets.cardWidth / 3;
    ai.aiCardCount.y = Game.stageHeight - 15;
    ai.aiCardCount.textBaseline = "alphabetic";
    Game.stage.addChild(ai.aiCardCount);

    player.playerCardCount = new createjs.Text(player.totalBlueCards, "90px Arial", "#ffffff");
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
      ui.infoBox.cardName = new createjs.Text(ui.selectedCard?.name || "", "30px Arial", "#ffffff");
      ui.infoBox.cardName.textBaseline = "alphabetic";
    }
    ui.infoBox.cardName.text = ui.selectedCard?.name || "";

    const verticalOffset = 30 / 2 + 10;
    ui.infoBox.cardName.x = INFO_BOX_X + INFO_BOX_WIDTH / 2 - ui.infoBox.cardName.getMeasuredWidth() / 2;
    ui.infoBox.cardName.y = INFO_BOX_Y + INFO_BOX_HEIGHT / 2 - ui.infoBox.cardName.getMeasuredHeight() / 2 + verticalOffset;

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
      ui.infoBox.cardName.x = INFO_BOX_X + INFO_BOX_WIDTH / 2 - ui.infoBox.cardName.getMeasuredWidth() / 2;
      ui.infoBox.cardName.y = INFO_BOX_Y + INFO_BOX_HEIGHT / 2 - ui.infoBox.cardName.getMeasuredHeight() / 2 + verticalOffset;
    }

    if (ai.aiCardCount) ai.aiCardCount.text = ai.totalRedCards;
    if (player.playerCardCount) player.playerCardCount.text = player.totalBlueCards;

    Game.stage.update();
  },
};
