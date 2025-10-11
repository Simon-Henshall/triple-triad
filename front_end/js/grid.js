// Calculate Which Square Is Currently Selected And The Adjacent Squares
function checkSelectedSquare() {
  if (selectedRow == 1 && selectedColumn == 1) {
    selectedSquare = 1;
    squareLeft = "none";
    squareUp = "none";
    squareRight = 2;
    squareDown = 4;
  } else if (selectedRow == 1 && selectedColumn == 2) {
    selectedSquare = 2;
    squareLeft = 1;
    squareUp = "none";
    squareRight = 3;
    squareDown = 5;
  } else if (selectedRow == 1 && selectedColumn == 3) {
    selectedSquare = 3;
    squareLeft = 2;
    squareUp = "none";
    squareRight = "none";
    squareDown = 6;
  } else if (selectedRow == 2 && selectedColumn == 1) {
    selectedSquare = 4;
    squareLeft = "none";
    squareUp = 1;
    squareRight = 5;
    squareDown = 7;
  } else if (selectedRow == 2 && selectedColumn == 2) {
    selectedSquare = 5;
    squareLeft = 4;
    squareUp = 2;
    squareRight = 5;
    squareDown = 8;
  } else if (selectedRow == 2 && selectedColumn == 3) {
    selectedSquare = 6;
    squareLeft = 5;
    squareUp = 3;
    squareRight = "none";
    squareDown = 9;
  } else if (selectedRow == 3 && selectedColumn == 1) {
    selectedSquare = 7;
    squareLeft = "none";
    squareUp = 4;
    squareRight = 8;
    squareDown = "none";
  } else if (selectedRow == 3 && selectedColumn == 2) {
    selectedSquare = 8;
    squareLeft = 7;
    squareUp = 5;
    squareRight = 9;
    squareDown = "none";
  } else if (selectedRow == 3 && selectedColumn == 3) {
    selectedSquare = 9;
    squareLeft = 8;
    squareUp = 6;
    squareRight = "none";
    squareDown = "none";
  }
}

// Inverse Of checkSelectedSquare()
// Calculate Which Row And Column Is Currently Selected And The Adjacent Squares
function checkSelectedRowColumn() {
  if (selectedAISquare == 1) {
    selectedRow = 1;
    selectedColumn = 1;
    squareLeft = "none";
    squareUp = "none";
    squareRight = 2;
    squareDown = 4;
  } else if (selectedAISquare == 2) {
    selectedRow = 1;
    selectedColumn = 2;
    squareLeft = 1;
    squareUp = "none";
    squareRight = 3;
    squareDown = 5;
  } else if (selectedAISquare == 3) {
    selectedRow = 1;
    selectedColumn = 3;
    squareLeft = 2;
    squareUp = "none";
    squareRight = "none";
    squareDown = 6;
  } else if (selectedAISquare == 4) {
    selectedRow = 2;
    selectedColumn = 1;
    squareLeft = "none";
    squareUp = 1;
    squareRight = 5;
    squareDown = 7;
  } else if (selectedAISquare == 5) {
    selectedRow = 2;
    selectedColumn = 2;
    squareLeft = 4;
    squareUp = 2;
    squareRight = 5;
    squareDown = 8;
  } else if (selectedAISquare == 6) {
    selectedRow = 2;
    selectedColumn = 3;
    squareLeft = 5;
    squareUp = 3;
    squareRight = "none";
    squareDown = 9;
  } else if (selectedAISquare == 7) {
    selectedRow = 3;
    selectedColumn = 1;
    squareLeft = "none";
    squareUp = 4;
    squareRight = 8;
    squareDown = "none";
  } else if (selectedAISquare == 8) {
    selectedRow = 3;
    selectedColumn = 2;
    squareLeft = 7;
    squareUp = 5;
    squareRight = 9;
    squareDown = "none";
  } else if (selectedAISquare == 9) {
    selectedRow = 3;
    selectedColumn = 3;
    squareLeft = 8;
    squareUp = 6;
    squareRight = "none";
    squareDown = "none";
  }
}

// Generate The Main Grid For The Game
function generateGrid() {
  // Square Variables
  var squareID = 0;
  var squareElement;

  // Element Calculation
  var possibleElements = [1, 2, 3, 4, 5, 6, 7, 8];
  var elements = [];
  var numElements = Math.floor(Math.random() * 3) + 1;
  for (var i = 0; i < numElements; i++) {
    var chosenElement =
      possibleElements[Math.floor(Math.random() * possibleElements.length)];
    elements.push(chosenElement);
  }
  for (var i = numElements; i < 9; i++) {
    elements.push(0);
  }
  shuffle(elements);

  // Add The Squares
  for (var y = 0; y < 3; y++) {
    for (var x = 0; x < 3; x++) {
      var color = "White";
      square = new createjs.Shape();
      square.graphics.beginStroke("#000");
      square.graphics.setStrokeStyle(1);
      square.graphics.beginFill(color);
      square.graphics.drawRect(gameOffsetX, gameOffsetY, cellWidth, cellHeight);
      square.x = x * cellWidth;
      square.y = y * cellHeight;
      squareID += 1;
      square.alpha = alpha;

      // Handle Elements
      if (rules.indexOf("elemental") != -1) {
        square.element = elements[squareID - 1];
        if (square.element != 0) {
          squareElement = new createjs.Bitmap(
            "front_end/images/elements/" + square.element + ".png"
          );
          squareElement.x = gameOffsetX + square.x + 60;
          squareElement.y = gameOffsetY + square.y + 70;
          stage.addChild(squareElement);
        }
      } else {
        square.element = 0;
      }

      square.addEventListener("click", clickHandler);
      stage.addChild(square);
      var id = square.x + "_" + square.y;
      square.name = squareID;
      squares.push(square);
      stage.update();
    }
  }
}

// Draw Numbers Onto The Grid For Reference
function drawGridNumbers() {
  var count = 1;
  for (var y = 0; y < 3; y++) {
    for (var x = 0; x < 3; x++) {
      var text = new createjs.Text(count, "40px Arial", "#ff7700");
      text.x = gameOffsetX + cellWidth * x + 10;
      text.y = gameOffsetY + cellHeight * y + 40;
      text.textBaseline = "alphabetic";
      text.alpha = alpha;
      stage.addChild(text);
      count++;
    }
  }
}
