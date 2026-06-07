import { offsets } from "../../constants/offsets.js";
import { Game } from "../game/game.js";
import { BoardModel } from "./board-model.js";
import { debug } from "../../utilities/debug.js";
import { config } from "../../constants/config.js";
import { elements } from "../../constants/elements.js";

/**
 * Handles all visual rendering of the board,
 * including the 3x3 grid, elements, and hit areas.
 */
export const BoardView = {
  /**
   * Generate the 3x3 board visually.
   * Pulls element IDs from BoardModel.generateElements()
   * and creates createjs.Containers for each square.
   */
  generateGrid() {
    const elementIDs = BoardModel.generateElements();
    BoardModel.squares = [];

    // Clear existing squares from the board container
    BoardModel.boardContainer.removeAllChildren();

    let squareID = 0;

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        squareID++;
        const elementID = elementIDs[squareID - 1];

        // Update board logic state
        BoardModel.boardArray[squareID - 1].element = elementID;

        // Create square container
        const square = {
          id: squareID,
          x: x * offsets.cellWidth,
          y: y * offsets.cellHeight,
          element: elementID,
          container: new createjs.Container(),
        };

        const c = square.container;
        c.x = square.x;
        c.y = square.y;
        c.name = String(squareID);

        // Element graphic (LOCAL offsets!)
        if (elementID !== 0) {
          const elementGraphic = new createjs.Bitmap(
            `${config.imagePath}elements/${elements[elementID].imagePath}`,
          );
          elementGraphic.x = 60; // <- relative to square
          elementGraphic.y = 70;

          // store reference for redraw
          square.elementGraphic = elementGraphic;

          c.addChild(elementGraphic);
        }

        // Hit area (not added as visible child)
        const hit = new createjs.Shape();
        hit.graphics
          .beginFill("#000")
          .drawRect(0, 0, offsets.cellWidth, offsets.cellHeight);
        c.hitArea = hit;

        // Click handler
        c.addEventListener("click", debug.clickHandler);

        BoardModel.squares.push(square);

        // Add square to board layer (not the stage!)
        BoardModel.boardContainer.addChild(c);
      }
    }

    Game.stage.update();
  },

  /**
   * Redraws a specific square when its element changes.
   * @param {number} squareID
   */
  redrawSquare(squareID) {
    const square = BoardModel.squares[squareID - 1];
    if (!square) {
      return;
    }

    const c = square.container;

    // Remove old element graphic if it exists
    if (square.elementGraphic && c.contains(square.elementGraphic)) {
      c.removeChild(square.elementGraphic);
    }

    const elementId = BoardModel.boardArray[squareID - 1].element;

    if (elementId === 0) {
      square.elementGraphic = undefined;
    } else {
      const elementGraphic = new createjs.Bitmap(
        `${config.imagePath}/elements/${elements[elementId].imagePath}`,
      );

      elementGraphic.x = 60;
      elementGraphic.y = 70;

      square.elementGraphic = elementGraphic;
      c.addChild(elementGraphic);
    }

    Game.stage.update();
  },

  /**
   * Clears all squares from stage.
   */
  clearBoard() {
    for (const square of BoardModel.squares) {
      if (square.container.parent) {
        square.container.remove();
      }
    }
    BoardModel.squares = [];
    Game.stage.update();
  },
};
