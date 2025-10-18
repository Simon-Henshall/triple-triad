// -------------------------
// Rendering / UI
// -------------------------

// Persistent objects
var aiCardCount = null;
var playerCardCount = null;
var infoBox = null;
var infoBoxCardName = null;

// Info box fixed dimensions
const INFO_BOX_WIDTH = 420;
const INFO_BOX_HEIGHT = 65;
const INFO_BOX_X = 260;
const INFO_BOX_Y = 540;

// -------------------------
// Add Background
// -------------------------
function addBackground() {
  const background = new createjs.Bitmap(Game.config.imagePath + "board.png");
  background.x = 0;
  background.y = 0;
  stage.addChild(background);
  stage.update();
}

// -------------------------
// Draw The Card Count For Each Player
// -------------------------
function drawCardCounts() {
  if (aiCardCount) {
    stage.removeChild(aiCardCount);
  }
  if (playerCardCount) {
    stage.removeChild(playerCardCount);
  }

  aiCardCount = new createjs.Text(totalRedCards, "90px Arial", "#ffffff");
  aiCardCount.x = aiHandOffsetX + cardWidth / 3;
  aiCardCount.y = stageHeight - 15;
  aiCardCount.textBaseline = "alphabetic";
  aiCardCount.alpha = 1;
  stage.addChild(aiCardCount);

  playerCardCount = new createjs.Text(totalBlueCards, "90px Arial", "#ffffff");
  playerCardCount.x = playerHandOffsetX + cardWidth / 3;
  playerCardCount.y = stageHeight - 15;
  playerCardCount.textBaseline = "alphabetic";
  playerCardCount.alpha = 1;
  stage.addChild(playerCardCount);

  stage.update();
}

// -------------------------
// Draw The Info Box
// -------------------------
function drawInfoBox() {
  if (!infoBox) {
    infoBox = new createjs.Container();
  } else {
    infoBox.removeAllChildren();
  }

  // Background
  const infoBoxBackground = new createjs.Shape();
  infoBoxBackground.graphics
    .beginFill("#666666")
    .drawRect(0, 0, INFO_BOX_WIDTH, INFO_BOX_HEIGHT);
  infoBoxBackground.x = INFO_BOX_X;
  infoBoxBackground.y = INFO_BOX_Y;

  // Explicitly set bounds so getBounds() works
  infoBoxBackground.setBounds(
    infoBoxBackground.x,
    infoBoxBackground.y,
    INFO_BOX_WIDTH,
    INFO_BOX_HEIGHT
  );

  infoBox.addChild(infoBoxBackground);

  // "INFO." label
  const infoBoxText = new createjs.Text("INFO.", "18px Arial", "#ffffff");
  infoBoxText.x = infoBoxBackground.x + 10;
  infoBoxText.y = infoBoxBackground.y + 15;
  infoBoxText.textBaseline = "alphabetic";
  infoBox.addChild(infoBoxText);

  // Card name text
  if (!infoBoxCardName) {
    infoBoxCardName = new createjs.Text(
      selectedCard?.name || "",
      "30px Arial",
      "#ffffff"
    );
    infoBoxCardName.textBaseline = "alphabetic";
  }
  infoBoxCardName.text = selectedCard?.name || "";

  // Center card name inside the info box (horizontal and vertical)
  const verticalOffset = 30 / 2 + 10; // half of font size + 10px downward nudge
  infoBoxCardName.x =
    INFO_BOX_X + INFO_BOX_WIDTH / 2 - infoBoxCardName.getMeasuredWidth() / 2;
  infoBoxCardName.y =
    INFO_BOX_Y +
    INFO_BOX_HEIGHT / 2 -
    infoBoxCardName.getMeasuredHeight() / 2 +
    verticalOffset;

  infoBox.addChild(infoBoxCardName);

  stage.addChild(infoBox);
  stage.update();
}

// -------------------------
// Update The Info Box
// -------------------------
function updateInfoBox() {
  if (infoBoxCardName && selectedCard) {
    infoBoxCardName.text = selectedCard.name;
    const verticalOffset = 30 / 2 + 10; // half of font size + 10px downward nudge
    infoBoxCardName.x =
      INFO_BOX_X + INFO_BOX_WIDTH / 2 - infoBoxCardName.getMeasuredWidth() / 2;
    infoBoxCardName.y =
      INFO_BOX_Y +
      INFO_BOX_HEIGHT / 2 -
      infoBoxCardName.getMeasuredHeight() / 2 +
      verticalOffset;
  }

  if (aiCardCount) {
    aiCardCount.text = totalRedCards;
  }
  if (playerCardCount) {
    playerCardCount.text = totalBlueCards;
  }

  stage.update();
}
