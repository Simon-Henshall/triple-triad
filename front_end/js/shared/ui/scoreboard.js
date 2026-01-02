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
    const color = "#ffffff";
    const height = Game.stageHeight - 15;
    const textBaseline = "alphabetic";

    // --- AI Count ---
    this.aiText = new createjs.Text(
      this.aiTurnModel.currentlyOwnedCards,
      font,
      color,
    );
    this.aiText.x = this.aiTurnModel.handOffsetX + offsets.cardWidth / 2;
    this.aiText.y = height;
    this.aiText.textBaseline = textBaseline;

    // --- Player Count ---
    this.playerText = new createjs.Text(
      this.playerModel.totalBlueCards,
      font,
      color,
    );
    this.playerText.x = this.playerModel.handOffsetX + offsets.cardWidth / 1.5;
    this.playerText.y = height;
    this.playerText.textBaseline = textBaseline;

    this.container.addChild(this.aiText, this.playerText);
    this.stage.update();
  }

  /**
   * Update the score board with the latest values.
   */
  update() {
    this.aiText.text = this.aiTurnModel.currentlyOwnedCards;
    this.playerText.text = this.playerModel.totalBlueCards;
    this.stage.update();
  }
}
