import { Game } from "../game/game.js";

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
      this.cardName.textAlign = "center";
      this.cardName.textBaseline = "middle";
    }
    this.cardName.text = ui.selectedCard?.name || "";

    // Center horizontally and vertically inside the info box
    this.cardName.x = INFO_BOX_X + INFO_BOX_WIDTH / 2;
    this.cardName.y = INFO_BOX_Y + INFO_BOX_HEIGHT / 2;

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
    // Update selected card name
    if (this.cardName && card) {
      this.cardName.text = card.data?.name || card.name || "";
      this.cardName.x = INFO_BOX_X + INFO_BOX_WIDTH / 2;
      this.cardName.y = INFO_BOX_Y + INFO_BOX_HEIGHT / 2;
    } else if (!this.cardName) {
      this.cardName = new createjs.Text(
        card.name || "",
        "30px Arial",
        "#ffffff",
      );
      this.cardName.textAlign = "center";
      this.cardName.textBaseline = "middle";
      this.cardName.x = INFO_BOX_X + INFO_BOX_WIDTH / 2;
      this.cardName.y = INFO_BOX_Y + INFO_BOX_HEIGHT / 2;
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
    if (this.container) {
      this.container.visible = visible;
      gameInstance.stage.update();
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
