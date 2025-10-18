// -------------------------
// AI TURN
// -------------------------

function aiTurn() {
  // Pick A Card To Play (Currently Random)
  var aiSelectedCard =
    Game.ai.cardsInAIHand[Math.floor(Math.random() * Game.ai.cardsInAIHand.length)];
  var aiSelectedCardNumber = Game.ai.cardsInAIHand.indexOf(aiSelectedCard);

  // Pick A Cell To Play In (Currently Random)
  Game.ui.selectedAISquare = Game.board.freeCells[Math.floor(Math.random() * Game.board.freeCells.length)];
  checkSelectedRowColumn();

  // Place The Card
  Game.ai.aiCardsAboveSelection = aiSelectedCardNumber;
  Game.ai.cardsInAIHand.splice(aiSelectedCardNumber, 1);
  setTimeout(function () {
    CardPlacer.placeCard(
      aiSelectedCard,
      Game.offsets.gameOffsetX + Game.offsets.cellWidth * (Game.ui.selectedColumn - 1) + Game.offsets.cardOffsetX,
      Game.offsets.gameOffsetY + Game.offsets.cellHeight * (Game.ui.selectedRow - 1) + Game.offsets.cardOffsetY
    );
  }, Game.ai.aiDelay);
}

// -----------------------------
// populateAICards
// -----------------------------
function populateAICards() {
  // Setup AI hand
  var aiHand = Game.utils.shuffle((window.cards || []).slice());
  aiHand = aiHand.slice(0, 5); // 5 cards for AI

  for (var i = 0; i < aiHand.length; i++) {
    var chosen_card = aiHand[i];

    // Default to a face-down card image
    var cardImage = new createjs.Bitmap(Game.config.cardPath + "back.png");

    // Card background colour (owner) - AI cards should be red
    var cardColour = new createjs.Bitmap(Game.config.cardPath + "red.png");

    // Card container
    var card = new createjs.Container();
    card.addChild(cardColour, cardImage);

    // Safely compute scale (fall back to 1 if images not loaded)
    var baseWidth =
      card.children[0] && card.children[0].image && card.children[0].image.width
        ? card.children[0].image.width
        : Game.offsets.cellWidth - Game.offsets.cardOffsetX * 2 || 100;
    var baseHeight =
      card.children[0] &&
      card.children[0].image &&
      card.children[0].image.height
        ? card.children[0].image.height
        : Game.offsets.cellHeight - Game.offsets.cardOffsetY * 2 || 140;

    card.scaleX = (Game.offsets.cardWidth || Game.offsets.cellWidth - Game.offsets.cardOffsetX * 2) / baseWidth;
    card.scaleY = (Game.offsets.cardHeight || Game.offsets.cellHeight - Game.offsets.cardOffsetY * 2) / baseHeight;

    // Card imagery paths
    card.frontImage = Game.config.cardPath + chosen_card.image + ".png";
    card.backImage = Game.config.cardPath + "back.png";

    // Card stats and ownership
    card.name = chosen_card.displayName;
    card.strengthUp = chosen_card.strengthUp;
    card.strengthRight = chosen_card.strengthRight;
    card.strengthDown = chosen_card.strengthDown;
    card.strengthLeft = chosen_card.strengthLeft;
    card.element = chosen_card.element;
    card.owner = "red";
    card.background = "red";

    // Position off to AI hand area
    card.x = Game.ai.handOffsetX || Game.offsets.gameOffsetX / 2 || 100;
    card.y = (Game.offsets.handOffsetY || 50) + i * (Game.offsets.handCardOffset || 95);

    // Add to AI hand and stage
    Game.ai.cardsInAIHand.push(card);
    Game.stage.addChild(card);
    Game.stage.update();
  }

  // Select the top card by default (preserve original globals)
  window.selectedCard = Game.ai.cardsInAIHand[Game.ui.selectedCardNumber];
  Game.ui.previouslySelectedCard = [];

  // Handle the "open" rule flip all AI hand behaviour
  if (
    (window.rules && window.rules.indexOf("open") != -1) ||
    (window.Game && Game.rules && Game.rules.indexOf("open") != -1)
  ) {
    if (typeof window.flipAIHand === "function") {
      flipAIHand();
    }
  }
}
