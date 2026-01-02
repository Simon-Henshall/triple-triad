import { debug } from "../../utilities/debug.js";
import { Game } from "../game/game.js";
import { PlayerModel } from "../player/player-model.js";

// Info box layout constants
const INFO_BOX_WIDTH = 420;
const INFO_BOX_HEIGHT = 65;
const INFO_BOX_X = 260;
const INFO_BOX_Y = 540;

/**
 * InfoBox module for managing the display of selected card information.
 */
export const InfoBox = {
  // -------------------------
  // Draw info box
  // -------------------------

  /**
   * Draws the info box container showing selected card info.
   * Initializes the container and text elements if they don't exist yet.
   */
  drawInfoBox(gameInstance) {
    console.log(gameInstance);
    const playerModel = Game.models.playerModel;
    const ui = playerModel;

    // Initialize container if missing, otherwise clear previous children
    if (this.container) {
      this.container.removeAllChildren();
    } else {
      this.container = new createjs.Container();
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
    this.container.addChild(infoBoxBackground);

    // Draw the label text
    const infoBoxText = new createjs.Text("INFO.", "18px Arial", "#ffffff");
    infoBoxText.x = infoBoxBackground.x + 10;
    infoBoxText.y = infoBoxBackground.y + 15;
    infoBoxText.textBaseline = "alphabetic";
    this.container.addChild(infoBoxText);

    // Draw card name text (centered)
    if (!this.cardName) {
      this.cardName = new createjs.Text(
        ui.selectedCard?.name || "",
        "30px Arial",
        "#ffffff",
      );
      this.cardName.textBaseline = "alphabetic";
    }
    this.cardName.text = ui.selectedCard?.name || "";

    const verticalOffset = 30 / 2 + 10;
    this.cardName.x =
      INFO_BOX_X + INFO_BOX_WIDTH / 2 - this.cardName.getMeasuredWidth() / 2;
    this.cardName.y =
      INFO_BOX_Y +
      INFO_BOX_HEIGHT / 2 -
      this.cardName.getMeasuredHeight() / 2 +
      verticalOffset;

    this.container.addChild(this.cardName);
    gameInstance.stage.addChild(this.container);
    gameInstance.stage.update();
  },

  // -------------------------
  // Update info box (card name & counts)
  // -------------------------

  /**
   * Updates info box contents dynamically based on current selection.
   * Updates player/AI card counts as well.
   */
  updateInfoBox(gameInstance, card) {
    console.log(gameInstance);
    const playerModel = Game.models.playerModel;
    const ui = playerModel;
    console.log("InfoBox.updateInfoBox() called", ui, card);

    // Update selected card name
    if (this.cardName && card) {
      this.cardName.text = card.data.name;

      const verticalOffset = 30 / 2 + 10;
      this.cardName.x =
        INFO_BOX_X + INFO_BOX_WIDTH / 2 - this.cardName.getMeasuredWidth() / 2;
      this.cardName.y =
        INFO_BOX_Y +
        INFO_BOX_HEIGHT / 2 -
        this.cardName.getMeasuredHeight() / 2 +
        verticalOffset;
    } else if (!this.cardName) {
      console.log("Creating new cardName text element");
      this.cardName = new createjs.Text(
        card.name || "",
        "30px Arial",
        "#ffffff",
      );
      this.cardName.textBaseline = "alphabetic";
    }

    gameInstance.stage.update();
  },

  // -------------------------
  // Info box state
  // -------------------------

  container: undefined,
  cardName: undefined,

  /**
   * Show or hide the info box.
   * @param {boolean} visible
   */
  toggleInfoBox(gameInstance, visible) {
    console.log(gameInstance);
    if (this.container) {
      this.container.visible = visible;
      gameInstance.stage.update();
      if (debug.active) {
        //console.log(`Info box visibility set to: ${visible}`);
      }
    }
  },

  /**
   * Brings the info box to the front of the stage.
   */
  bringToFront() {
    if (InfoBox.container) {
      Game.stage.setChildIndex(
        InfoBox.container,
        Game.stage.getNumChildren() - 1,
      );
      InfoBox.container.visible = true;
    }
  },
};
