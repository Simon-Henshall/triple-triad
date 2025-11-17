import { offsets } from "../../constants/offsets.js";
import { Game } from "../game/game.js";
import { UIManager } from "../ui/ui-manager.js";
import { BoardManager } from "./board-manager.js";
import { debug } from "../../utilities/debug.js";
import { config } from "../../constants/config.js";

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
    UIManager.squares = [];

    // Clear existing squares from the board container
    UIManager.boardContainer.removeAllChildren();

    let squareID = 0;

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        squareID++;
        const elementId = elements[squareID - 1];

        // Update board logic state
        BoardManager.boardArray[squareID - 1].element = elementId;

        // Create square container
        const square = {
          id: squareID,
          x: x * offsets.cellWidth,
          y: y * offsets.cellHeight,
          element: elementId,
          container: new createjs.Container(),
        };

        const c = square.container;
        c.x = square.x;
        c.y = square.y;
        c.name = String(squareID);

        // Element graphic (LOCAL offsets!)
        if (elementId !== 0) {
          const elementGraphic = new createjs.Bitmap(
            `${config.imagePath}/elements/${config.elements[elementId].imagePath}`,
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

        UIManager.squares.push(square);

        // Add square to board layer (not the stage!)
        UIManager.boardContainer.addChild(c);
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

    const c = square.container;

    // Remove old element graphic if it exists
    if (square.elementGraphic && c.contains(square.elementGraphic)) {
      c.removeChild(square.elementGraphic);
    }

    const elementId = BoardManager.boardArray[squareID - 1].element;

    if (elementId === 0) {
      square.elementGraphic = undefined;
    } else {
      const elementGraphic = new createjs.Bitmap(
        `${config.imagePath}/elements/${config.elements[elementId].imagePath}`,
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
    for (const square of UIManager.squares) {
      if (square.container.parent) {
        square.container.remove();
      }
    }
    UIManager.squares = [];
    Game.stage.update();
  },
};
