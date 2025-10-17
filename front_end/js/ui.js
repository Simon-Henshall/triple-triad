// -------------------------
// UI / Rendering Functions
// -------------------------

// Add the main board background
function addBackground() {
  const background = new createjs.Bitmap(Game.config.imagePath + "board.png");
  background.x = 0;
  background.y = 0;
  Game.stage.addChild(background);
  Game.stage.update();
}

// Draw the card counts for both players
function drawCardCounts() {
  // AI Count
  Game.ui.aiCardCount = new createjs.Text(Game.ai.totalRedCards, "90px Arial", "#ffffff");
  Game.ui.aiCardCount.x = Game.ai.handOffsetX + (Game.offsets.cellWidth - Game.offsets.cardOffsetX * 2) / 3;
  Game.ui.aiCardCount.y = Game.stageHeight - 15;
  Game.ui.aiCardCount.textBaseline = "alphabetic";
  Game.ui.aiCardCount.alpha = 1;
  Game.stage.addChild(Game.ui.aiCardCount);

  // Player Count
  Game.ui.playerCardCount = new createjs.Text(Game.player.totalBlueCards, "90px Arial", "#ffffff");
  Game.ui.playerCardCount.x = Game.player.handOffsetX + (Game.offsets.cellWidth - Game.offsets.cardOffsetX * 2) / 3;
  Game.ui.playerCardCount.y = Game.stageHeight - 15;
  Game.ui.playerCardCount.textBaseline = "alphabetic";
  Game.ui.playerCardCount.alpha = 1;
  Game.stage.addChild(Game.ui.playerCardCount);

  Game.stage.update();
}

// Draw the info box container
function drawInfoBox() {
  // Background
  const infoBoxBackground = new createjs.Shape();
  infoBoxBackground.graphics
    .beginFill("#666666")
    .drawRect(0, 0, 420, 65);
  infoBoxBackground.x = 260;
  infoBoxBackground.y = 540;
  Game.ui.infoBox.addChild(infoBoxBackground);

  // Static text
  const infoBoxText = new createjs.Text("INFO.", "18px Arial", "#ffffff");
  infoBoxText.x = infoBoxBackground.x + 10;
  infoBoxText.y = infoBoxBackground.y + 15;
  infoBoxText.textBaseline = "alphabetic";
  infoBoxText.alpha = 1;
  Game.ui.infoBox.addChild(infoBoxText);

  // Selected card name
  Game.ui.infoBoxCardName = new createjs.Text(
    Game.ui.selectedCard?.name || "",
    "30px Arial",
    "#ffffff"
  );
  Game.ui.infoBoxCardName.x = infoBoxBackground.x + infoBoxBackground.width / 3;
  Game.ui.infoBoxCardName.y = infoBoxBackground.y + infoBoxBackground.height / 2 + 10;
  Game.ui.infoBoxCardName.textBaseline = "alphabetic";
  Game.ui.infoBoxCardName.alpha = 1;
  Game.ui.infoBox.addChild(Game.ui.infoBoxCardName);

  Game.stage.addChild(Game.ui.infoBox);
  Game.stage.update();
}

// Update the info box when selection changes
function updateInfoBox() {
  if (Game.ui.infoBoxCardName && Game.ui.selectedCard) {
    Game.ui.infoBoxCardName.text = Game.ui.selectedCard.name;
  }
  Game.stage.update();
}

// -------------------------
// Card Hand / Selection Helpers
// -------------------------

// Highlight the currently selected card in hand
function indentSelectedCard() {
  const selectedCard = Game.ui.selectedHandCard;
  const prevCard = Game.ui.previouslySelectedCard;

  if (Game.ui.playerTurn === "red") {
    if (selectedCard) selectedCard.x += 30;
    if (prevCard) prevCard.x -= 30;
  } else if (Game.ui.playerTurn === "blue") {
    if (selectedCard) selectedCard.x -= 30;
    if (prevCard) prevCard.x += 30;
  }

  Game.stage.update();
}
