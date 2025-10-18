// -------------------------
// Rendering / UI
// -------------------------

// Persistent objects
var aiCardCount = null;
var playerCardCount = null;
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
  Game.stage.addChild(background);
  Game.stage.update();
}

// -------------------------
// Draw The Card Count For Each Player
// -------------------------
function drawCardCounts() {
  if (aiCardCount) {
    Game.stage.removeChild(aiCardCount);
  }
  if (playerCardCount) {
    Game.stage.removeChild(playerCardCount);
  }

  aiCardCount = new createjs.Text(totalRedCards, "90px Arial", "#ffffff");
  aiCardCount.x = Game.ai.handOffsetX + cardWidth / 3;
  aiCardCount.y = Game.stageHeight - 15;
  aiCardCount.textBaseline = "alphabetic";
  aiCardCount.alpha = 1;
  Game.stage.addChild(aiCardCount);

  playerCardCount = new createjs.Text(totalBlueCards, "90px Arial", "#ffffff");
  playerCardCount.x = Game.player.handOffsetX + cardWidth / 3;
  playerCardCount.y = Game.stageHeight - 15;
  playerCardCount.textBaseline = "alphabetic";
  playerCardCount.alpha = 1;
  Game.stage.addChild(playerCardCount);

  Game.stage.update();
}

// -------------------------
// Draw The Info Box
// -------------------------
function drawInfoBox() {
  if (!Game.ui.infoBox) {
    Game.ui.infoBox = new createjs.Container();
  } else {
    Game.ui.infoBox.removeAllChildren();
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

  Game.ui.infoBox.addChild(infoBoxBackground);

  // "INFO." label
  const infoBoxText = new createjs.Text("INFO.", "18px Arial", "#ffffff");
  infoBoxText.x = infoBoxBackground.x + 10;
  infoBoxText.y = infoBoxBackground.y + 15;
  infoBoxText.textBaseline = "alphabetic";
  Game.ui.infoBox.addChild(infoBoxText);

  // Card name text
  if (!infoBoxCardName) {
    infoBoxCardName = new createjs.Text(
      Game.ui.selectedCard?.name || "",
      "30px Arial",
      "#ffffff"
    );
    infoBoxCardName.textBaseline = "alphabetic";
  }
  infoBoxCardName.text = Game.ui.selectedCard?.name || "";

  // Center card name inside the info box (horizontal and vertical)
  const verticalOffset = 30 / 2 + 10; // half of font size + 10px downward nudge
  infoBoxCardName.x =
    INFO_BOX_X + INFO_BOX_WIDTH / 2 - infoBoxCardName.getMeasuredWidth() / 2;
  infoBoxCardName.y =
    INFO_BOX_Y +
    INFO_BOX_HEIGHT / 2 -
    infoBoxCardName.getMeasuredHeight() / 2 +
    verticalOffset;

  Game.ui.infoBox.addChild(infoBoxCardName);

  Game.stage.addChild(Game.ui.infoBox);
  Game.stage.update();
}

// -------------------------
// Update The Info Box
// -------------------------
function updateInfoBox() {
  if (infoBoxCardName && Game.ui.selectedCard) {
    infoBoxCardName.text = Game.ui.selectedCard.name;
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

  Game.stage.update();
}
