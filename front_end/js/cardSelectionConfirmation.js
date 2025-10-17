// -----------------------------
// displayConfirmationBox - original UI for "Are you sure?" dialog
// -----------------------------
function displayConfirmationBox() {
  window.playerConfirming = true;

  // Background rectangle
  confirmationBackground.width = 300;
  confirmationBackground.height = 120;
  confirmationBackground.graphics
    .beginFill("#666666")
    .drawRect(
      0,
      0,
      confirmationBackground.width,
      confirmationBackground.height
    );
  confirmationBackground.x = 380;
  confirmationBackground.y = 285;

  // Border (black)
  var confirmationBorder = new createjs.Shape();
  confirmationBorder.width = confirmationBackground.width + 2;
  confirmationBorder.height = confirmationBackground.height + 2;
  confirmationBorder.graphics
    .beginFill("#000000")
    .drawRect(0, 0, confirmationBorder.width, confirmationBorder.height);
  confirmationBorder.x = confirmationBackground.x - 1;
  confirmationBorder.y = confirmationBackground.y - 1;

  // Text elements
  var confirmationChoice = new createjs.Text("CHOICE", "18px Arial", "#ffffff");
  confirmationChoice.x = confirmationBackground.x + 10;
  confirmationChoice.y = confirmationBackground.y + 15;
  confirmationChoice.textBaseline = "alphabetic";
  confirmationChoice.alpha = 1;

  var confirmationSure = new createjs.Text(
    "Are you sure?",
    "28px Arial",
    "#ffffff"
  );
  confirmationSure.x = confirmationBackground.x + 60;
  confirmationSure.y = confirmationBackground.y + 40;
  confirmationSure.textBaseline = "alphabetic";
  confirmationSure.alpha = 1;

  var confirmationYes = new createjs.Text("Yes", "28px Arial", "#ffffff");
  confirmationYes.x = confirmationBackground.x + 120;
  confirmationYes.y = confirmationBackground.y + 75;
  confirmationYes.textBaseline = "alphabetic";
  confirmationYes.alpha = 1;

  var confirmationNo = new createjs.Text("No", "28px Arial", "#ffffff");
  confirmationNo.x = confirmationBackground.x + 120;
  confirmationNo.y = confirmationBackground.y + 105;
  confirmationNo.textBaseline = "alphabetic";
  confirmationNo.alpha = 1;

  confirmation.addChild(
    confirmationBorder,
    confirmationBackground,
    confirmationChoice,
    confirmationSure,
    confirmationYes,
    confirmationNo
  );

  if (this.stage) {
    this.stage.addChild(confirmation);
  } else if (window.stage) {
    window.stage.addChild(confirmation);
  }

  this.placeConfirmationCursor();
  if (this.stage) {
    this.stage.update();
  } else if (window.stage) {
    window.stage.update();
  }
}

function placeConfirmationCursor() {
  confirmationCursor.x = confirmationBackground.x + 50;
  confirmationCursor.y = confirmationBackground.y + 60;
  if (this.stage) {
    this.stage.addChild(confirmationCursor);
  } else if (window.stage) {
    window.stage.addChild(confirmationCursor);
  }
  if (this.stage) {
    this.stage.update();
  } else if (window.stage) {
    window.stage.update();
  }
}

function removeConfirmationCursor() {
  window.playerConfirming = false;
  if (this.stage) {
    this.stage.removeChild(confirmationCursor);
  } else if (window.stage) {
    window.stage.removeChild(confirmationCursor);
  }
  if (this.stage) {
    this.stage.update();
  } else if (window.stage) {
    window.stage.update();
  }
}

function moveConfirmationCursor(direction) {
  if (direction == "up" && window.selectedConfirmationChoice != 0) {
    confirmationCursor.y -= 30;
    window.selectedConfirmationChoice -= 1;
  } else if (direction == "down" && window.selectedConfirmationChoice != 1) {
    confirmationCursor.y += 30;
    window.selectedConfirmationChoice += 1;
  }
  if (this.stage) {
    this.stage.update();
  } else if (window.stage) {
    window.stage.update();
  }
}

function hideConfirmationBox() {
  window.playerConfirming = false;
  if (this.stage) {
    this.stage.removeChild(confirmation);
  } else if (window.stage) {
    window.stage.removeChild(confirmation);
  }
  window.playerSelectingHand = true;
}

// -----------------------------
// placePlayerHandSelectionCursor - show the small cursor next to the list
// -----------------------------
function placePlayerHandSelectionCursor() {
  playerHandSelectionCursor.x = selectionBoardBackground.x - 40;
  playerHandSelectionCursor.y = selectionBoardBackground.y + 48;
  selectionBoard.addChild(playerHandSelectionCursor);
  if (this.stage) {
    this.stage.update();
  } else if (window.stage) {
    window.stage.update();
  }
}

// -----------------------------
// moveSelectionCursor - move selection cursor and update displayed card
// -----------------------------
function moveSelectionCursor(direction) {
  if (direction == "up" && selectedHandCardNumber % 11 != 0) {
    playerHandSelectionCursor.y -= 35;
    selectedHandCardNumber -= 1;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    this.updateDisplayedCard();
  } else if (
    direction == "down" &&
    ((page != totalPages && selectedHandCardNumber % 11 != 10) ||
      (page == totalPages && selectedHandCardNumber % 11 < remainingCards - 1))
  ) {
    playerHandSelectionCursor.y += 35;
    selectedHandCardNumber += 1;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    this.updateDisplayedCard();
  } else if (direction == "left" && page != 1) {
    page--;
    selectedHandCardNumber -= 11;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    this.updateHandCards();
    this.updateDisplayedCard();
  } else if (direction == "right" && page != totalPages - 1) {
    if (page != totalPages) {
      page++;
      selectedHandCardNumber += 11;
      selectedHandCard = window.ownedCards[selectedHandCardNumber];
      this.updateHandCards();
      this.updateDisplayedCard();
    }
  } else if (direction == "right" && page == totalPages - 1) {
    page++;
    if (selectedHandCardNumber > window.ownedCards.length - 12) {
      var selectedHandCardNumberForPage = Math.floor(
        (selectedHandCardNumber % 11) + 1
      );
      playerHandSelectionCursor.y -=
        35 * (selectedHandCardNumberForPage - remainingCards);
      selectedHandCardNumber = window.ownedCards.length - 1;
      selectedHandCard = window.ownedCards[selectedHandCardNumber];
    } else {
      selectedHandCardNumber += 11;
      selectedHandCard = window.ownedCards[selectedHandCardNumber];
    }
    this.updateHandCards();
    this.updateDisplayedCard();
  }

  if (this.stage) {
    this.stage.update();
  } else if (window.stage) {
    window.stage.update();
  }
}
