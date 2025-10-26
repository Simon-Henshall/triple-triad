import { config } from "../config.js";
import { offsets } from "./offsets.js";
import { player } from "./player.js";
import { ai } from "../game/ai.js";
import { Game } from "../game/game.js";

// Info box fixed dimensions
const INFO_BOX_WIDTH = 420;
const INFO_BOX_HEIGHT = 65;
const INFO_BOX_X = 260;
const INFO_BOX_Y = 540;

// -------------------------
// Rendering / UI
// -------------------------

export const ui = {
  squares: [],
  selectedRow: 2,
  selectedColumn: 2,
  selectedSquare: 5,
  selectedAISquare: undefined,
  squareLeft: undefined,
  squareUp: undefined,
  squareRight: undefined,
  squareDown: undefined,
  gridCursor: null,
  selectionBoard: {
    container: null,
    background: null,
    shownCards: null,
    page: 1,
    pageDisplay: null,
    totalPages: undefined,
    remainingCards: undefined,
    displayedCards: undefined,
    displayedCard: null,
    displayedCardImage: null,
    displayedCardColour: null,
    selectedHandCardNumber: 0,
    selectedHandCard: null,
    hidePreviewCard() {
      if (this.displayedCard && this.displayedCard.parent) {
        this.displayedCard.parent.removeChild(this.displayedCard);
      }
    },

    showPreviewCard() {
      if (this.displayedCard && !this.displayedCard.parent) {
        Game.stage.addChild(this.displayedCard);
      }
    },
  },
  confirmation: {
    container: null,
    background: null,
    cursor: null,
    selectedChoice: 0,
  },
  infoBox: {
    container: null,
    cardName: null,
  },
  cardName: undefined,
  cardCount: undefined,
  selectedCardNumber: 0,
  selectedCard: undefined,
  card: undefined,
  cardImage: undefined,
  previouslySelectedCard: [],
  playerSelectingHand: false,
  playerConfirming: false,
  playerChoosingCard: false,
  playerSelectingPlacement: false,
  playerTurn: "blue",

  // -------------------------
  // Add Background
  // -------------------------
  addBackground() {
    const background = new createjs.Bitmap(config.imagePath + "board.png");
    background.x = 0;
    background.y = 0;
    Game.stage.addChild(background);
    Game.stage.update();
  },

  // -------------------------
  // Draw The Card Count For Each Player
  // -------------------------
  drawCardCounts() {
    if (ai.aiCardCount) {
      Game.stage.removeChild(ai.aiCardCount);
    }
    if (player.playerCardCount) {
      Game.stage.removeChild(player.playerCardCount);
    }

    ai.aiCardCount = new createjs.Text(
      ai.totalRedCards,
      "90px Arial",
      "#ffffff"
    );
    ai.aiCardCount.x = ai.handOffsetX + offsets.cardWidth / 3;
    ai.aiCardCount.y = Game.stageHeight - 15;
    ai.aiCardCount.textBaseline = "alphabetic";
    Game.stage.addChild(ai.aiCardCount);

    player.playerCardCount = new createjs.Text(
      player.totalBlueCards,
      "90px Arial",
      "#ffffff"
    );
    player.playerCardCount.x = player.handOffsetX + offsets.cardWidth / 3;
    player.playerCardCount.y = Game.stageHeight - 15;
    player.playerCardCount.textBaseline = "alphabetic";
    Game.stage.addChild(player.playerCardCount);

    Game.stage.update();
  },

  // -------------------------
  // Draw The Info Box
  // -------------------------
  drawInfoBox() {
    if (!ui.infoBox.container) {
      ui.infoBox.container = new createjs.Container();
    } else {
      ui.infoBox.container.removeAllChildren();
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

    ui.infoBox.container.addChild(infoBoxBackground);

    // "INFO." label
    const infoBoxText = new createjs.Text("INFO.", "18px Arial", "#ffffff");
    infoBoxText.x = infoBoxBackground.x + 10;
    infoBoxText.y = infoBoxBackground.y + 15;
    infoBoxText.textBaseline = "alphabetic";
    ui.infoBox.container.addChild(infoBoxText);

    // Card name text
    if (!ui.infoBox.cardName) {
      ui.infoBox.cardName = new createjs.Text(
        ui.selectedCard?.name || "",
        "30px Arial",
        "#ffffff"
      );
      ui.infoBox.cardName.textBaseline = "alphabetic";
    }
    ui.infoBox.cardName.text = ui.selectedCard?.name || "";

    // Center card name inside the info box (horizontal and vertical)
    const verticalOffset = 30 / 2 + 10; // half of font size + 10px downward nudge
    ui.infoBox.cardName.x =
      INFO_BOX_X +
      INFO_BOX_WIDTH / 2 -
      ui.infoBox.cardName.getMeasuredWidth() / 2;
    ui.infoBox.cardName.y =
      INFO_BOX_Y +
      INFO_BOX_HEIGHT / 2 -
      ui.infoBox.cardName.getMeasuredHeight() / 2 +
      verticalOffset;

    ui.infoBox.container.addChild(ui.infoBox.cardName);

    Game.stage.addChild(ui.infoBox.container);
    Game.stage.update();
  },

  // -------------------------
  // Update The Info Box
  // -------------------------
  updateInfoBox() {
    if (ui.infoBox.cardName && ui.selectedCard) {
      ui.infoBox.cardName.text = ui.selectedCard.name;
      const verticalOffset = 30 / 2 + 10; // half of font size + 10px downward nudge
      ui.infoBox.cardName.x =
        INFO_BOX_X +
        INFO_BOX_WIDTH / 2 -
        ui.infoBox.cardName.getMeasuredWidth() / 2;
      ui.infoBox.cardName.y =
        INFO_BOX_Y +
        INFO_BOX_HEIGHT / 2 -
        ui.infoBox.cardName.getMeasuredHeight() / 2 +
        verticalOffset;
    }

    if (ai.aiCardCount) {
      ai.aiCardCount.text = ai.totalRedCards;
    }
    if (player.playerCardCount) {
      player.playerCardCount.text = player.totalBlueCards;
    }

    Game.stage.update();
  },
};
