import { config } from '../config.js';
import { offsets } from './offsets.js';
import { ui } from './ui.js';
import { utils } from '../game/utils.js';
import { debug } from '../debug.js';
import { Game } from '../game/game.js';

// Lookup table for square positions and adjacency
// Index corresponds to squareID - 1
const squareMap = [
  { row: 1, col: 1, left: "none", up: "none", right: 2, down: 4 },
  { row: 1, col: 2, left: 1, up: "none", right: 3, down: 5 },
  { row: 1, col: 3, left: 2, up: "none", right: "none", down: 6 },
  { row: 2, col: 1, left: "none", up: 1, right: 5, down: 7 },
  { row: 2, col: 2, left: 4, up: 2, right: 6, down: 8 },
  { row: 2, col: 3, left: 5, up: 3, right: "none", down: 9 },
  { row: 3, col: 1, left: "none", up: 4, right: 8, down: "none" },
  { row: 3, col: 2, left: 7, up: 5, right: 9, down: "none" },
  { row: 3, col: 3, left: 8, up: 6, right: "none", down: "none" },
];

export const board = {
  boardArray: Array(9)
    .fill(null)
    .map((_, i) => ({
      element: 0,
      occupant: null,
    })),
  freeCells: [1, 2, 3, 4, 5, 6, 7, 8, 9],

  // -------------------------
  // Determine selected square from row & column
  // -------------------------
  checkSelectedSquare() {
    for (let i = 0; i < squareMap.length; i++) {
      const s = squareMap[i];
      if (s.row === ui.selectedRow && s.col === ui.selectedColumn) {
        ui.selectedSquare = i + 1;
        ui.squareLeft = s.left;
        ui.squareUp = s.up;
        ui.squareRight = s.right;
        ui.squareDown = s.down;
        break;
      }
    }
  },

  // -------------------------
  // Determine row & column from selected square
  // -------------------------
  checkSelectedRowColumn() {
    const s = squareMap[ui.selectedAISquare - 1];
    ui.selectedRow = s.row;
    ui.selectedColumn = s.col;
    ui.squareLeft = s.left;
    ui.squareUp = s.up;
    ui.squareRight = s.right;
    ui.squareDown = s.down;
  },

  // -------------------------
  // Generate the 3x3 grid
  // -------------------------
  generateGrid() {
    let squareID = 0;

    // Randomly pick elemental cells
    const possibleElements = Object.keys(config.elements);
    const elements = [];
    const numElements = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numElements; i++) {
      const randomIndex = Math.floor(Math.random() * possibleElements.length);
      elements.push(Number(possibleElements[randomIndex]));
    }
    for (let i = numElements; i < 9; i++) {
      elements.push(0);
    }

    utils.shuffle(elements);

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        squareID++;
        const elemId = elements[squareID - 1];

        // Save element ID in boardArray
        this.boardArray[squareID - 1].element = elemId;

        const square = {
          id: squareID,
          x: x * offsets.cellWidth,
          y: y * offsets.cellHeight,
          element: elemId,
          container: new createjs.Container(),
        };

        square.container.x = square.x;
        square.container.y = square.y;
        square.container.name = squareID;

        // If the cell has an element, display the corresponding graphic
        if (elemId !== 0) {
          const elementGraphic = new createjs.Bitmap(
            config.imagePath + "/elements/" + config.elements[elemId].imagePath
          );
          elementGraphic.x = offsets.gameOffsetX + 60;
          elementGraphic.y = offsets.gameOffsetY + 70;
          square.container.addChild(elementGraphic);
        }

        // Transparent hit area
        const hit = new createjs.Shape();
        hit.graphics
          .beginFill("#000")
          .drawRect(0, 0, offsets.cellWidth, offsets.cellHeight);
        square.container.hitArea = hit;

        // Click handler
        square.container.addEventListener("click", (event) => {
          debug.clickHandler(event);
        });

        ui.squares.push(square);
        Game.stage.addChild(square.container);
      }
    }

    Game.stage.update();
  },

  // -------------------------
  // CELL CHECKS
  // -------------------------
  cellOccupied() {
    const cell = this.boardArray[ui.selectedSquare - 1];
    return cell.occupant ? cell.occupant : false;
  },
};
