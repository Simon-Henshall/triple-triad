import { offsets } from "../../constants/offsets.js";
import { Game } from "../game/game.js";

/**
 * Module for drawing the scoreboard.
 */
export class ScoreBoard {
  /**
   * Class representing the scoreboard display.
   * Manages the visual updates of the scoreboard based on game state.
   */
  constructor(stage, playerModel, aiTurnModel) {
    this.stage = stage;
    this.playerModel = playerModel;
    this.aiTurnModel = aiTurnModel;

    this.container = new createjs.Container();
    this.stage.addChild(this.container);
  }

  /**
   * Draw the scoreboard.
   */
  draw() {
    const font = "90px Arial";
    const height = Game.stageHeight - 15;
    const aiScoreOffsetX = 30;
    const playerScoreOffsetX = 40;

    // --- AI Count ---
    this.aiText = this._createStyledTextBitmap(
      this.aiTurnModel.currentlyOwnedCards,
      font,
    );
    this.aiText.x =
      this.aiTurnModel.handOffsetX + offsets.cardWidth / 2 + aiScoreOffsetX;
    this.aiText.y = height;

    // --- Player Count ---
    this.playerText = this._createStyledTextBitmap(
      this.playerModel.totalBlueCards,
      font,
    );
    this.playerText.x =
      this.playerModel.handOffsetX + offsets.cardWidth / 2 + playerScoreOffsetX;
    this.playerText.y = height;

    this.container.addChild(this.aiText, this.playerText);
    this.stage.update();
  }

  /**
   * Creates a text bitmap with a black outline and a white-to-blue gradient fill.
   * @param {string} text - The text content
   * @param {string} font - The font style string (e.g. "90px Arial")
   * @returns {createjs.Bitmap} - The styled text bitmap
   */
  _createStyledTextBitmap(text, font) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    context.font = font;
    const metrics = context.measureText(text);
    const fontSize = Number.parseInt(font, 10);
    const padding = 8;

    canvas.width = Math.ceil(metrics.width) + padding * 2;
    canvas.height = Math.ceil(fontSize * 1.3) + padding * 2;

    context.font = font;
    context.textBaseline = "alphabetic";
    context.textAlign = "center";

    const cx = canvas.width / 2;
    const baselineY = canvas.height - padding;

    // Gradient from white (top) to a hint of blue (bottom)
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.4, "#ffffff");
    gradient.addColorStop(1, "#d0dcf5");

    // Black outline
    context.strokeStyle = "#000000";
    context.lineWidth = 4;
    context.lineJoin = "round";
    context.strokeText(text, cx, baselineY);

    // Gradient fill
    context.fillStyle = gradient;
    context.fillText(text, cx, baselineY);

    const bitmap = new createjs.Bitmap(canvas);
    bitmap.regX = canvas.width / 2;
    bitmap.regY = baselineY;
    bitmap.text = text;

    return bitmap;
  }

  /**
   * Update the score board with the latest values.
   */
  update() {
    const font = "90px Arial";
    const height = Game.stageHeight - 15;
    const aiScoreOffsetX = 30;
    const playerScoreOffsetX = 40;

    // Remove old bitmaps from container
    this.container.removeChild(this.aiText, this.playerText);

    // Recreate with updated values (bitmaps can't change text after creation)
    this.aiText = this._createStyledTextBitmap(
      this.aiTurnModel.currentlyOwnedCards,
      font,
    );
    this.aiText.x =
      this.aiTurnModel.handOffsetX + offsets.cardWidth / 2 + aiScoreOffsetX;
    this.aiText.y = height;

    this.playerText = this._createStyledTextBitmap(
      this.playerModel.totalBlueCards,
      font,
    );
    this.playerText.x =
      this.playerModel.handOffsetX + offsets.cardWidth / 2 + playerScoreOffsetX;
    this.playerText.y = height;

    this.container.addChild(this.aiText, this.playerText);
    this.stage.update();
  }
}
