// -------------------------
// Rendering / UI
// -------------------------

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
  if (Game.ai.aiCardCount) {
    Game.stage.removeChild(Game.ai.aiCardCount);
  }
  if (Game.player.playerCardCount) {
    Game.stage.removeChild(Game.player.playerCardCount);
  }

  Game.ai.aiCardCount = new createjs.Text(Game.ai.totalRedCards, "90px Arial", "#ffffff");
  Game.ai.aiCardCount.x = Game.ai.handOffsetX + Game.offsets.cardWidth / 3;
  Game.ai.aiCardCount.y = Game.stageHeight - 15;
  Game.ai.aiCardCount.textBaseline = "alphabetic";
  Game.stage.addChild(Game.ai.aiCardCount);

  Game.player.playerCardCount = new createjs.Text(Game.player.totalBlueCards, "90px Arial", "#ffffff");
  Game.player.playerCardCount.x = Game.player.handOffsetX + Game.offsets.cardWidth / 3;
  Game.player.playerCardCount.y = Game.stageHeight - 15;
  Game.player.playerCardCount.textBaseline = "alphabetic";
  Game.stage.addChild(Game.player.playerCardCount);

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
  if (!Game.ui.infoBoxCardName) {
    Game.ui.infoBoxCardName = new createjs.Text(
      Game.ui.selectedCard?.name || "",
      "30px Arial",
      "#ffffff"
    );
    Game.ui.infoBoxCardName.textBaseline = "alphabetic";
  }
  Game.ui.infoBoxCardName.text = Game.ui.selectedCard?.name || "";

  // Center card name inside the info box (horizontal and vertical)
  const verticalOffset = 30 / 2 + 10; // half of font size + 10px downward nudge
  Game.ui.infoBoxCardName.x =
    INFO_BOX_X + INFO_BOX_WIDTH / 2 - Game.ui.infoBoxCardName.getMeasuredWidth() / 2;
  Game.ui.infoBoxCardName.y =
    INFO_BOX_Y +
    INFO_BOX_HEIGHT / 2 -
    Game.ui.infoBoxCardName.getMeasuredHeight() / 2 +
    verticalOffset;

  Game.ui.infoBox.addChild(Game.ui.infoBoxCardName);

  Game.stage.addChild(Game.ui.infoBox);
  Game.stage.update();
}

// -------------------------
// Update The Info Box
// -------------------------
function updateInfoBox() {
  if (Game.ui.infoBoxCardName && Game.ui.selectedCard) {
    Game.ui.infoBoxCardName.text = Game.ui.selectedCard.name;
    const verticalOffset = 30 / 2 + 10; // half of font size + 10px downward nudge
    Game.ui.infoBoxCardName.x =
      INFO_BOX_X + INFO_BOX_WIDTH / 2 - Game.ui.infoBoxCardName.getMeasuredWidth() / 2;
    Game.ui.infoBoxCardName.y =
      INFO_BOX_Y +
      INFO_BOX_HEIGHT / 2 -
      Game.ui.infoBoxCardName.getMeasuredHeight() / 2 +
      verticalOffset;
  }

  if (Game.ai.aiCardCount) {
    Game.ai.aiCardCount.text = Game.ai.totalRedCards;
  }
  if (Game.player.playerCardCount) {
    Game.player.playerCardCount.text = Game.player.totalBlueCards;
  }

  Game.stage.update();
}
