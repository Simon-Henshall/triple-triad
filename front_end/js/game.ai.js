import { config } from './config.js';
import { cards } from './cards.js';
import { offsets } from './offsets.js';
import { board } from './board.js';
import { ui } from './ui.js';

Game.ai = {
  handOffsetX: 0,
  cardsInAIHand: [],
  aiCardsAboveSelection: 0,
  aiCardCount: 0,
  aiDelay: 1000,
  totalRedCards: 5,

  // -------------------------
  // AI TURN
  // -------------------------
  turn() {
    // Pick A Card To Play (Currently Random)
    var aiSelectedCard =
      Game.ai.cardsInAIHand[
        Math.floor(Math.random() * Game.ai.cardsInAIHand.length)
      ];
    var aiSelectedCardNumber = Game.ai.cardsInAIHand.indexOf(aiSelectedCard);

    // Pick A Cell To Play In (Currently Random)
    ui.selectedAISquare =
      board.freeCells[
        Math.floor(Math.random() * board.freeCells.length)
      ];
    board.checkSelectedRowColumn();

    // Place The Card
    Game.ai.aiCardsAboveSelection = aiSelectedCardNumber;
    Game.ai.cardsInAIHand.splice(aiSelectedCardNumber, 1);
    setTimeout(function () {
      Game.cards.placement.placeCard(
        aiSelectedCard,
        offsets.gameOffsetX +
          offsets.cellWidth * (ui.selectedColumn - 1) +
          offsets.cardOffsetX,
        offsets.gameOffsetY +
          offsets.cellHeight * (ui.selectedRow - 1) +
          offsets.cardOffsetY
      );
    }, Game.ai.aiDelay);
  },
};

Game.cards = Game.cards || {};

Game.cards.aiHand = {
  /**
   * Helper: create a bitmap and scale after it's loaded.
   */
  _createScaledBitmap(src, targetW, targetH, onReady) {
    const bmp = new createjs.Bitmap(src);
    const applyScale = () => {
      bmp.scaleX = targetW / bmp.image.width;
      bmp.scaleY = targetH / bmp.image.height;
      if (onReady) onReady(bmp);
    };
    if (!bmp.image.complete) {
      bmp.image.onload = applyScale;
    } else {
      applyScale();
    }
    return bmp;
  },

  /**
   * Populate the AI hand.
   */
  populate() {
    const hand = Game.utils.shuffle((cards || []).slice()).slice(0, 5); // 5 AI cards
    Game.ai.cardsInAIHand = [];

    hand.forEach((chosenCard, i) => {
      const targetW =
        offsets.cardWidth || offsets.cellWidth - (offsets.cardOffsetX || 3) * 2;
      const targetH =
        offsets.cardHeight ||
        offsets.cellHeight - (offsets.cardOffsetY || 3) * 2;

      const cardImage = this._createScaledBitmap(
        config.cardPath + "back.png",
        targetW,
        targetH,
        () => Game.stage.update()
      );
      const cardColour = this._createScaledBitmap(
        config.cardPath + "red.png",
        targetW,
        targetH,
        () => Game.stage.update()
      );

      const cardContainer = new createjs.Container();
      cardContainer.addChild(cardColour, cardImage);

      // Card properties
      cardContainer.frontImage =
        config.cardPath + chosenCard.image + ".png";
      cardContainer.backImage = config.cardPath + "back.png";
      cardContainer.name = chosenCard.displayName;
      cardContainer.strengthUp = chosenCard.strengthUp;
      cardContainer.strengthRight = chosenCard.strengthRight;
      cardContainer.strengthDown = chosenCard.strengthDown;
      cardContainer.strengthLeft = chosenCard.strengthLeft;
      cardContainer.element = chosenCard.element;
      cardContainer.owner = "red";
      cardContainer.background = "red";

      // Position in AI hand
      cardContainer.x = Game.ai.handOffsetX || offsets.gameOffsetX / 2 || 100;
      cardContainer.y =
        (offsets.handOffsetY || 50) + i * (offsets.handCardOffset || 95);

      // Add to AI hand and stage
      Game.ai.cardsInAIHand.push(cardContainer);
      Game.stage.addChild(cardContainer);
    });

    // Default selection
    window.selectedCard = Game.ai.cardsInAIHand[0];
    ui.previouslySelectedCard = [];

    // Flip AI hand if "open" rule applies
    if (
      Game.rules &&
      Game.rules.indexOf("open") !== -1 &&
      Game.cards.flipping.flipAIHand
    ) {
      Game.cards.flipping.flipAIHand();
    }

    Game.stage.update();
  },
};
