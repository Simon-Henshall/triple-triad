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

// -------------------------
// Determine selected square from row & column
// -------------------------

function checkSelectedSquare() {
  for (let i = 0; i < squareMap.length; i++) {
    const s = squareMap[i];
    if (s.row === selectedRow && s.col === selectedColumn) {
      selectedSquare = i + 1;
      squareLeft = s.left;
      squareUp = s.up;
      squareRight = s.right;
      squareDown = s.down;
      break;
    }
  }
}

// -------------------------
// Determine row & column from selected square
// -------------------------

function checkSelectedRowColumn() {
  const s = squareMap[selectedAISquare - 1];
  selectedRow = s.row;
  selectedColumn = s.col;
  squareLeft = s.left;
  squareUp = s.up;
  squareRight = s.right;
  squareDown = s.down;
}

// -------------------------
// Generate the 3x3 grid
// -------------------------

function generateGrid() {
  let squareID = 0;
  let squareElement;

  const squares = Game.ui.squares || [];
  squares.length = 0;
  Game.ui.squares = squares;

  // Determine elemental squares if "elemental" rule active
  const possibleElements = [1, 2, 3, 4, 5, 6, 7, 8];
  const elements = [];
  const numElements = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numElements; i++) {
    elements.push(
      possibleElements[Math.floor(Math.random() * possibleElements.length)]
    );
  }
  for (let i = numElements; i < 9; i++) elements.push(0);
  shuffle(elements);

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      squareID++;
      const square = new createjs.Shape();
      square.graphics.beginStroke("#000").setStrokeStyle(1).beginFill("White");
      square.graphics.drawRect(
        Game.offsets.gameOffsetX,
        Game.offsets.gameOffsetY,
        Game.offsets.cellWidth,
        Game.offsets.cellHeight
      );
      square.x = x * Game.offsets.cellWidth;
      square.y = y * Game.offsets.cellHeight;
      square.alpha = Game.alpha;

      if (Game.rules.includes("elemental")) {
        square.element = elements[squareID - 1];
        if (square.element !== 0) {
          squareElement = new createjs.Bitmap(
            `front_end/images/elements/${square.element}.png`
          );
          squareElement.x = Game.offsets.gameOffsetX + square.x + 60;
          squareElement.y = Game.offsets.gameOffsetY + square.y + 70;
          Game.stage.addChild(squareElement);
        }
      } else {
        square.element = 0;
      }

      square.addEventListener("click", clickHandler);

      square.name = squareID;
      squares.push(square);

      Game.stage.addChild(square);
      Game.stage.update();
    }
  }
}

// -------------------------
// Draw grid numbers for reference
// -------------------------

function drawGridNumbers() {
  let count = 1;
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      const text = new createjs.Text(count, "40px Arial", "#ff7700");
      text.x = gameOffsetX + cellWidth * x + 10;
      text.y = gameOffsetY + cellHeight * y + 40;
      text.textBaseline = "alphabetic";
      text.alpha = alpha;
      stage.addChild(text);
      count++;
    }
  }
}

// -------------------------
// CELL CHECKS
// -------------------------

function cellOccupied() {
  return board[selectedSquare - 1] === "Empty"
    ? false
    : board[selectedSquare - 1];
}
