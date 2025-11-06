import { offsets } from "../constants/offsets.js";
import { Game } from "../game/game.js";
import { UIManager } from "../managers/UIManager.js";
import { BoardManager } from "../managers/BoardManager.js";
import { debug } from "../debug.js";
import { config } from "../config.js";

/**
 * Handles all visual rendering of the board,
 * including the 3x3 grid, elements, and hit areas.
 */
export const BoardRenderer = {
  /**
   * Generate the 3x3 board visually.
   * Pulls element IDs from BoardManager.generateElements()
   * and creates createjs.Containers for each square.
   */
  generateGrid() {
    const elements = BoardManager.generateElements();
    UIManager.squares = []; // Reset any previous squares

    let squareID = 0;

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        squareID++;
        const elemId = elements[squareID - 1];

        // Update BoardManager state
        BoardManager.boardArray[squareID - 1].element = elemId;

        // Create square container
        const square = {
          id: squareID,
          x: x * offsets.cellWidth,
          y: y * offsets.cellHeight,
          element: elemId,
          container: new createjs.Container(),
        };

        square.container.x = square.x;
        square.container.y = square.y;
        square.container.name = String(squareID);

        // If the cell has an element, display it
        if (elemId !== 0) {
          const elementGraphic = new createjs.Bitmap(
            ` ${config.imagePath}/elements/${config.elements[elemId].imagePath}`,
          );
          elementGraphic.x = offsets.gameOffsetX + 60;
          elementGraphic.y = offsets.gameOffsetY + 70;
          square.container.addChild(elementGraphic);
        }

        // Add transparent hit area
        const hit = new createjs.Shape();
        hit.graphics
          .beginFill("#000")
          .drawRect(0, 0, offsets.cellWidth, offsets.cellHeight);
        square.container.hitArea = hit;

        // Click handler delegates to debug for now
        square.container.addEventListener("click", (event) => {
          debug.clickHandler(event);
        });

        // Store and add to stage
        UIManager.squares.push(square);
        Game.stage.addChild(square.container);
      }
    }

    Game.stage.update();
  },

  /**
   * Redraws a specific square when its element changes.
   * @param {number} squareID
   */
  redrawSquare(squareID) {
    const square = UIManager.squares[squareID - 1];
    if (!square) {
      return;
    }

    // Clear previous children
    square.container.removeAllChildren();

    const elemId = BoardManager.boardArray[squareID - 1].element;

    // Re-add element graphic if exists
    if (elemId !== 0) {
      const elementGraphic = new createjs.Bitmap(
        `${config.imagePath}/elements/${config.elements[elemId].imagePath}`,
      );
      elementGraphic.x = offsets.gameOffsetX + 60;
      elementGraphic.y = offsets.gameOffsetY + 70;
      square.container.addChild(elementGraphic);
    }

    // Re-add hit area
    const hit = new createjs.Shape();
    hit.graphics
      .beginFill("#000")
      .drawRect(0, 0, offsets.cellWidth, offsets.cellHeight);
    square.container.hitArea = hit;

    Game.stage.update();
  },

  /**
   * Clears all squares from stage.
   */
  clearBoard() {
    UIManager.squares.forEach((square) => {
      if (square.container.parent) {
        square.container.parent.removeChild(square.container);
      }
    });
    UIManager.squares = [];
    Game.stage.update();
  },
};
