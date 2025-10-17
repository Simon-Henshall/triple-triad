// -------------------------
// ai.js
// AI behaviour and AI hand rendering
// -------------------------

// Top-level aiTurn uses legacy window array alias for compatibility
function aiTurn() {
  // ensure compatibility with legacy variable names
  window.cardsInAIHand = window.cardsInAIHand || Game.ai.cardsInAIHand || [];

  var hand = window.cardsInAIHand;
  if (!hand || hand.length === 0) return;

  var aiSelectedCard = hand[Math.floor(Math.random() * hand.length)];
  var aiSelectedCardNumber = hand.indexOf(aiSelectedCard);

  // Pick a cell
  selectedAISquare = Game.board.freeCells[Math.floor(Math.random() * Game.board.freeCells.length)];
  checkSelectedRowColumn && checkSelectedRowColumn();

  // Place the card
  Game.ai.aiCardsAboveSelection = aiSelectedCardNumber;
  hand.splice(aiSelectedCardNumber, 1);

  setTimeout(function () {
    CardPlacer.placeCard(
      aiSelectedCard,
      Game.offsets.gameOffsetX + Game.offsets.cellWidth * (selectedColumn - 1) + Game.offsets.cardOffsetX,
      Game.offsets.gameOffsetY + Game.offsets.cellHeight * (selectedRow - 1) + Game.offsets.cardOffsetY
    );
  }, Game.ai.aiDelay || 1000);
}

// Populate AI hand cleanly (clear old cards, add new, alias globals)
function populateAICards() {
  // Ensure ai structure exists
  Game.ai = Game.ai || {};
  Game.ai.cardsInAIHand = Game.ai.cardsInAIHand || [];

  // Clear any previous AI hand from both Game.ai and legacy window
  Game.ai.cardsInAIHand.length = 0;
  window.cardsInAIHand = window.cardsInAIHand || Game.ai.cardsInAIHand;
  window.cardsInAIHand.length = 0;

  var totalToShow = Game.ai.totalRedCards || 5;

  // Build the AI hand (face-down placeholders)
  for (var i = 0; i < totalToShow; i++) {
    var container = new createjs.Container();

    var cardBack = new createjs.Bitmap((Game && Game.config ? Game.config.cardPath : "front_end/images/cards/") + "back.png");
    var cardColour = new createjs.Bitmap((Game && Game.config ? Game.config.cardPath : "front_end/images/cards/") + "blue.png");

    container.addChild(cardColour, cardBack);

    // Guard scaling (if images loaded)
    if (cardBack.image && cardBack.image.width) {
      container.scaleX = (Game.offsets.cellWidth - Game.offsets.cardOffsetX * 2) / cardBack.image.width;
      container.scaleY = (Game.offsets.cellHeight - Game.offsets.cardOffsetY * 2) / cardBack.image.height;
    } else {
      // onload fix: scale once image available (single update)
      (function (c, cb) {
        cb.image.onload = function () {
          c.scaleX = (Game.offsets.cellWidth - Game.offsets.cardOffsetX * 2) / cb.image.width;
          c.scaleY = (Game.offsets.cellHeight - Game.offsets.cardOffsetY * 2) / cb.image.height;
          if (Game.stage) Game.stage.update();
        };
      })(container, cardBack);
    }

    container.x = Game.ai.handOffsetX || (Game.offsets.gameOffsetX / 2 - Game.offsets.cellWidth / 2);
    container.y = Game.offsets.handOffsetY + i * Game.offsets.handCardOffset;

    Game.ai.cardsInAIHand.push(container);
    window.cardsInAIHand.push(container);

    // add to stage (do not cause duplication)
    if (Game.stage && Game.stage.getChildIndex(container) === -1) {
      Game.stage.addChild(container);
    }
  }

  // One update after all added
  if (Game.stage) Game.stage.update();

  // Legacy aliases for other scripts
  window.cardsInAIHand = Game.ai.cardsInAIHand;

  // default selection indices (legacy)
  window.selectedCardNumber = 0;
  window.selectedCard = window.cardsInAIHand[window.selectedCardNumber];
  window.cardsAboveSelection = 0;
  window.previouslySelectedCard = [];
}
