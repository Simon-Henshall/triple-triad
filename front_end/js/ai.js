// -------------------------
// AI TURN
// -------------------------

function aiTurn() {
  // Pick A Card To Play (Currently Random)
  var aiSelectedCard =
    cardsInAIHand[Math.floor(Math.random() * cardsInAIHand.length)];
  var aiSelectedCardNumber = cardsInAIHand.indexOf(aiSelectedCard);

  // Pick A Cell To Play In (Currently Random)
  Game.ui.selectedAISquare = Game.board.freeCells[Math.floor(Math.random() * Game.board.freeCells.length)];
  checkSelectedRowColumn();

  // Place The Card
  Game.ai.aiCardsAboveSelection = aiSelectedCardNumber;
  cardsInAIHand.splice(aiSelectedCardNumber, 1);
  setTimeout(function () {
    CardPlacer.placeCard(
      aiSelectedCard,
      gameOffsetX + cellWidth * (Game.ui.selectedColumn - 1) + cardOffsetX,
      gameOffsetY + cellHeight * (Game.ui.selectedRow - 1) + cardOffsetY
    );
  }, aiDelay);
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
        : cellWidth - cardOffsetX * 2 || 100;
    var baseHeight =
      card.children[0] &&
      card.children[0].image &&
      card.children[0].image.height
        ? card.children[0].image.height
        : cellHeight - cardOffsetY * 2 || 140;

    card.scaleX = (cardWidth || cellWidth - cardOffsetX * 2) / baseWidth;
    card.scaleY = (cardHeight || cellHeight - cardOffsetY * 2) / baseHeight;

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
    card.x = Game.ai.handOffsetX || gameOffsetX / 2 || 100;
    card.y = (handOffsetY || 50) + i * (handCardOffset || 95);

    // Add to AI hand and stage
    cardsInAIHand.push(card);
    Game.stage.addChild(card);
    Game.stage.update();
  }

  // Select the top card by default (preserve original globals)
  window.selectedCard = window.cardsInAIHand[Game.ui.selectedCardNumber];
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
