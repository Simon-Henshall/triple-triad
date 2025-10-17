// -----------------------------
// CARD SELECTION & CONFIRMATION
// -----------------------------

// Ensure the global variables exist
window.confirmation = window.confirmation || new createjs.Container();
window.confirmationBackground =
  window.confirmationBackground || new createjs.Shape();
window.confirmationCursor = window.confirmationCursor || new createjs.Shape();

// -----------------------------
// displayConfirmationBox - original UI for "Are you sure?" dialog
// -----------------------------
function displayConfirmationBox() {
  window.playerConfirming = true;

  // Background rectangle
  window.confirmationBackground.width = 300;
  window.confirmationBackground.height = 120;
  window.confirmationBackground.graphics
    .beginFill("#666666")
    .drawRect(
      0,
      0,
      window.confirmationBackground.width,
      window.confirmationBackground.height
    );
  window.confirmationBackground.x = 380;
  window.confirmationBackground.y = 285;

  // Border (black)
  var confirmationBorder = new createjs.Shape();
  confirmationBorder.width = window.confirmationBackground.width + 2;
  confirmationBorder.height = window.confirmationBackground.height + 2;
  confirmationBorder.graphics
    .beginFill("#000000")
    .drawRect(0, 0, confirmationBorder.width, confirmationBorder.height);
  confirmationBorder.x = window.confirmationBackground.x - 1;
  confirmationBorder.y = window.confirmationBackground.y - 1;

  // Text elements
  var confirmationChoice = new createjs.Text("CHOICE", "18px Arial", "#ffffff");
  confirmationChoice.x = window.confirmationBackground.x + 10;
  confirmationChoice.y = window.confirmationBackground.y + 15;
  confirmationChoice.textBaseline = "alphabetic";
  confirmationChoice.alpha = 1;

  var confirmationSure = new createjs.Text(
    "Are you sure?",
    "28px Arial",
    "#ffffff"
  );
  confirmationSure.x = window.confirmationBackground.x + 60;
  confirmationSure.y = window.confirmationBackground.y + 40;
  confirmationSure.textBaseline = "alphabetic";
  confirmationSure.alpha = 1;

  var confirmationYes = new createjs.Text("Yes", "28px Arial", "#ffffff");
  confirmationYes.x = window.confirmationBackground.x + 120;
  confirmationYes.y = window.confirmationBackground.y + 75;
  confirmationYes.textBaseline = "alphabetic";
  confirmationYes.alpha = 1;

  var confirmationNo = new createjs.Text("No", "28px Arial", "#ffffff");
  confirmationNo.x = window.confirmationBackground.x + 120;
  confirmationNo.y = window.confirmationBackground.y + 105;
  confirmationNo.textBaseline = "alphabetic";
  confirmationNo.alpha = 1;

  window.confirmation.addChild(
    confirmationBorder,
    window.confirmationBackground,
    confirmationChoice,
    confirmationSure,
    confirmationYes,
    confirmationNo
  );

  if (window.stage) {
    window.stage.addChild(window.confirmation);
    window.stage.update();
  }

  placeConfirmationCursor();
}

// -----------------------------
// placeConfirmationCursor
// -----------------------------
function placeConfirmationCursor() {
  window.confirmationCursor.x = window.confirmationBackground.x + 50;
  window.confirmationCursor.y = window.confirmationBackground.y + 60;
  window.confirmation.addChild(window.confirmationCursor);
  if (window.stage) window.stage.update();
}

// -----------------------------
// removeConfirmationCursor
// -----------------------------
function removeConfirmationCursor() {
  window.playerConfirming = false;
  window.confirmation.removeChild(window.confirmationCursor);
  if (window.stage) window.stage.update();
}

// -----------------------------
// moveConfirmationCursor
// -----------------------------
function moveConfirmationCursor(direction) {
  if (direction == "up" && window.selectedConfirmationChoice != 0) {
    window.confirmationCursor.y -= 30;
    window.selectedConfirmationChoice -= 1;
  } else if (direction == "down" && window.selectedConfirmationChoice != 1) {
    window.confirmationCursor.y += 30;
    window.selectedConfirmationChoice += 1;
  }
  if (window.stage) window.stage.update();
}

// -----------------------------
// hideConfirmationBox
// -----------------------------
function hideConfirmationBox() {
  window.playerConfirming = false;
  if (window.stage) window.stage.removeChild(window.confirmation);
  window.playerSelectingHand = true;
}

// -----------------------------
// PLAYER HAND SELECTION CURSOR
// -----------------------------

// Ensure cursor exists globally
window.playerHandSelectionCursor =
  window.playerHandSelectionCursor || new createjs.Shape();

// Initialize appearance if not already drawn
window.playerHandSelectionCursor.graphics.clear();
window.playerHandSelectionCursor.graphics
  .beginFill("#ffff00") // yellow triangle
  .moveTo(0, 0)
  .lineTo(15, 10)
  .lineTo(0, 20)
  .closePath();

// -----------------------------
// placePlayerHandSelectionCursor
// -----------------------------
function placePlayerHandSelectionCursor() {
  window.playerHandSelectionCursor.x = window.selectionBoardBackground.x - 40;
  window.playerHandSelectionCursor.y = window.selectionBoardBackground.y + 48;
  window.selectionBoard.addChild(window.playerHandSelectionCursor);
  if (window.stage) window.stage.update();
}

// -----------------------------
// moveSelectionCursor
// -----------------------------
function moveSelectionCursor(direction) {
  if (direction == "up" && window.selectedHandCardNumber % 11 != 0) {
    window.playerHandSelectionCursor.y -= 35;
    window.selectedHandCardNumber -= 1;
    window.selectedHandCard = window.ownedCards[window.selectedHandCardNumber];
    if (window.__playerCardManager)
      window.__playerCardManager.updateDisplayedCard();
  } else if (
    direction == "down" &&
    ((window.page != window.totalPages &&
      window.selectedHandCardNumber % 11 != 10) ||
      (window.page == window.totalPages &&
        window.selectedHandCardNumber % 11 < window.remainingCards - 1))
  ) {
    window.playerHandSelectionCursor.y += 35;
    window.selectedHandCardNumber += 1;
    window.selectedHandCard = window.ownedCards[window.selectedHandCardNumber];
    if (window.__playerCardManager)
      window.__playerCardManager.updateDisplayedCard();
  } else if (direction == "left" && window.page != 1) {
    window.page--;
    window.selectedHandCardNumber -= 11;
    window.selectedHandCard = window.ownedCards[window.selectedHandCardNumber];
    if (window.__playerCardManager) {
      window.__playerCardManager.updateHandCards();
      window.__playerCardManager.updateDisplayedCard();
    }
  } else if (direction == "right" && window.page != window.totalPages - 1) {
    if (window.page != window.totalPages) {
      window.page++;
      window.selectedHandCardNumber += 11;
      window.selectedHandCard =
        window.ownedCards[window.selectedHandCardNumber];
      if (window.__playerCardManager) {
        window.__playerCardManager.updateHandCards();
        window.__playerCardManager.updateDisplayedCard();
      }
    }
  } else if (direction == "right" && window.page == window.totalPages - 1) {
    window.page++;
    if (window.selectedHandCardNumber > window.ownedCards.length - 12) {
      var selectedHandCardNumberForPage = Math.floor(
        (window.selectedHandCardNumber % 11) + 1
      );
      window.playerHandSelectionCursor.y -=
        35 * (selectedHandCardNumberForPage - window.remainingCards);
      window.selectedHandCardNumber = window.ownedCards.length - 1;
      window.selectedHandCard =
        window.ownedCards[window.selectedHandCardNumber];
    } else {
      window.selectedHandCardNumber += 11;
      window.selectedHandCard =
        window.ownedCards[window.selectedHandCardNumber];
    }
    if (window.__playerCardManager) {
      window.__playerCardManager.updateHandCards();
      window.__playerCardManager.updateDisplayedCard();
    }
  }

  Game.ui.selectedHandCardNumber = window.selectedHandCardNumber;
  Game.ui.selectedHandCard =
    window.ownedCards?.[window.selectedHandCardNumber] || null;

  if (window.stage) window.stage.update();
}
