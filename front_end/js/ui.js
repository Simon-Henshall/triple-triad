// -------------------------
// Rendering / UI
// -------------------------
function addBackground() {
  const background = new createjs.Bitmap(Game.config.imagePath + "board.png");
  background.x = 0;
  background.y = 0;
  stage.addChild(background);
  stage.update();
}

// Draw The Card Count For Each Player
function drawCardCounts() {
  // AI Count
  aiCardCount = new createjs.Text(totalRedCards, "90px Arial", "#ffffff");
  aiCardCount.x = aiHandOffsetX + cardWidth / 3;
  aiCardCount.y = stageHeight - 15;
  aiCardCount.textBaseline = "alphabetic";
  aiCardCount.alpha = 1;
  stage.addChild(aiCardCount);

  // Player Count
  playerCardCount = new createjs.Text(totalBlueCards, "90px Arial", "#ffffff");
  playerCardCount.x = playerHandOffsetX + cardWidth / 3;
  playerCardCount.y = stageHeight - 15;
  playerCardCount.textBaseline = "alphabetic";
  playerCardCount.alpha = 1;
  stage.addChild(playerCardCount);

  // Refresh The Visual Numbers
  stage.update();
}

// Draw The Info Box
function drawInfoBox() {
  // Background
  const infoBoxBackground = new createjs.Shape();
  infoBoxBackground.width = 420;
  infoBoxBackground.height = 65;
  infoBoxBackground.graphics
    .beginFill("#666666")
    .drawRect(0, 0, infoBoxBackground.width, infoBoxBackground.height);
  infoBoxBackground.x = 260;
  infoBoxBackground.y = 540;
  infoBox.addChild(infoBoxBackground);

  // Text
  var infoBoxText = new createjs.Text("INFO.", "18px Arial", "#ffffff");
  infoBoxText.x = infoBoxBackground.x + 10;
  infoBoxText.y = infoBoxBackground.y + 15;
  infoBoxText.textBaseline = "alphabetic";
  infoBoxText.alpha = 1;
  infoBox.addChild(infoBoxText);

  // Player Count (selectedCard may be undefined until a selection exists)
  infoBoxCardName = new createjs.Text(
    selectedCard?.name || "",
    "30px Arial",
    "#ffffff"
  );
  infoBoxCardName.x = infoBoxBackground.x + infoBoxBackground.width / 3;
  infoBoxCardName.y = infoBoxBackground.y + infoBoxBackground.height / 2 + 10;
  infoBoxCardName.textBaseline = "alphabetic";
  infoBoxCardName.alpha = 1;
  infoBox.addChild(infoBoxCardName);

  stage.addChild(infoBox);
  stage.update();
}

// Update The Info Box
function updateInfoBox() {
  if (
    typeof infoBoxCardName !== "undefined" &&
    infoBoxCardName !== null &&
    typeof selectedCard !== "undefined" &&
    selectedCard !== null
  ) {
    infoBoxCardName.text = selectedCard.name;
  }
  stage.update();
}
