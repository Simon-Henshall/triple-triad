// -------------------------
// AI TURN
// -------------------------

function aiTurn() {
  // Pick A Card To Play (Currently Random)
  var aiSelectedCard =
    cardsInAIHand[Math.floor(Math.random() * cardsInAIHand.length)];
  var aiSelectedCardNumber = cardsInAIHand.indexOf(aiSelectedCard);

  // Pick A Cell To Play In (Currently Random)
  selectedAISquare = freeCells[Math.floor(Math.random() * freeCells.length)];
  checkSelectedRowColumn();

  // Place The Card
  aiCardsAboveSelection = aiSelectedCardNumber;
  cardsInAIHand.splice(aiSelectedCardNumber, 1);
  setTimeout(function () {
    CardPlacer.placeCard(
      aiSelectedCard,
      gameOffsetX + cellWidth * (selectedColumn - 1) + cardOffsetX,
      gameOffsetY + cellHeight * (selectedRow - 1) + cardOffsetY
    );
  }, aiDelay);
}

// -----------------------------
// populateAICards - unchanged behaviour (just organised into method)
// -----------------------------
function populateAICards() {
  // Setup AI hand (match original behaviour)
  var aiHand = this.shuffle(window.cards || []);
  aiHand = $.extend({}, window.cards || []);
  aiHand.length = 5;

  for (var i = 0; i < aiHand.length; i++) {
    var chosen_card = aiHand[i];

    // Default to a face-down card
    var cardImage = new createjs.Bitmap(Game.config.cardPath + "back.png");

    // Card background colour (owner)
    var cardColour = new createjs.Bitmap(
      Game.config.cardPath +
        (typeof window.getPlayerTurn === "function"
          ? getPlayerTurn()
          : "blue") +
        ".png"
    );

    // Card container
    var card = new createjs.Container();
    card.addChild(cardColour, cardImage);

    // Adjust card scale (guard against missing images by checking width/height values)
    if (
      card.children[0] &&
      card.children[0].image &&
      card.children[0].image.width
    ) {
      card.scaleX =
        (window.cardWidth || window.cellWidth - (window.cardOffsetX || 3) * 2) /
        card.children[0].image.width;
      card.scaleY =
        (window.cardHeight ||
          window.cellHeight - (window.cardOffsetY || 3) * 2) /
        card.children[0].image.height;
    } else {
      card.scaleX = card.scaleY = 1;
    }

    // Card imagery
    card.frontImage = Game.config.cardPath + chosen_card.image + ".png";
    card.backImage = Game.config.cardPath + "back.png";

    // Card stats (preserve original property names)
    card.name = chosen_card.displayName;
    card.strengthUp = chosen_card.strengthUp;
    card.strengthRight = chosen_card.strengthRight;
    card.strengthDown = chosen_card.strengthDown;
    card.strengthLeft = chosen_card.strengthLeft;
    card.element = chosen_card.element;
    card.owner = card.background =
      typeof window.getPlayerTurn === "function" ? getPlayerTurn() : "blue";

    // Place the card off to the AI hand area
    card.x =
      window.aiHandOffsetX ||
      (window.gameOffsetX ? window.gameOffsetX / 2 : 100);
    card.y = (window.handOffsetY || 50) + i * (window.handCardOffset || 95);

    window.cardsInAIHand.push(card);
    if (this.stage) {
      this.stage.addChild(card);
    } else if (window.stage) {
      window.stage.addChild(card);
    }

    if (this.stage || window.stage) {
      (this.stage || window.stage).update();
    }
  }

  // Select the top card by default (preserve original globals)
  window.selectedCardNumber = 0;
  window.selectedCard = window.cardsInAIHand[window.selectedCardNumber];
  window.cardsAboveSelection = 0;
  window.previouslySelectedCard = [];

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
