class CardPlacer {
  // Place a card onto the board
  static placeCard(card, placementX, placementY) {
    checkSelectedSquare();

    const offscreenX = getPlayerTurn() === "red"
      ? card.x + 40
      : card.x - 40;
    const offscreenY = -200;

    // Animate card offscreen
    createjs.Tween.get(card)
      .to({ x: offscreenX, y: offscreenY }, 500)
      .call(() => CardPlacer.onCardOffscreenComplete(card, placementX, placementY));

    // Shift remaining hand cards
    CardPlacer.shiftHandCardsDown();
  }

  // Handle card reaching offscreen position
  static onCardOffscreenComplete(card, placementX, placementY) {
    stage.setChildIndex(card, stage.getNumChildren() - 1);

    if (getPlayerTurn() === "red") {
      card.children[1].image.src = card.frontImage;
    }

    // Animate card to target position
    createjs.Tween.get(card)
      .to({ x: placementX, y: placementY }, 500)
      .call(() => CardPlacer.onCardPlacementComplete(card));
  }

  // Handle card reaching final placement
  static onCardPlacementComplete(card) {
    CardPlacer.setCardAdjacents(card);
    CardPlacer.addCardToBoard(card);
    CardPlacer.applyElementEffects(card);
    flipCardsCheck(card);
    stage.update();

    if (CardPlacer.isGameOver()) {
      endGame();
    } else {
      CardPlacer.playerTurnSwitch();
    }
  }

  // Set neighbour references for the card
  static setCardAdjacents(card) {
    card.cardLeft  = (squareLeft  !== "none") ? board[squareLeft - 1]  : "[INVALID]";
    card.cardUp    = (squareUp    !== "none") ? board[squareUp - 1]    : "[INVALID]";
    card.cardRight = (squareRight !== "none") ? board[squareRight - 1] : "[INVALID]";
    card.cardDown  = (squareDown  !== "none") ? board[squareDown - 1]  : "[INVALID]";
  }

  // Add card to board and remove from freeCells
  static addCardToBoard(card) {
    card.inCell = selectedSquare;
    board[selectedSquare - 1] = card;

    const freeCellIndex = freeCells.indexOf(selectedSquare);
    if (freeCellIndex > -1) {
      freeCells.splice(freeCellIndex, 1);
    }
  }

  // Apply element bonuses/penalties
  static applyElementEffects(card) {
    const square = squares[selectedSquare - 1];
    if (square.element === 0) return;

    let bmp;
    if (card.element === square.element) {
      card.strengthLeft += 1;
      card.strengthUp += 1;
      card.strengthRight += 1;
      card.strengthDown += 1;
      bmp = new createjs.Bitmap("front_end/images/plus_one.png");
    } else {
      card.strengthLeft -= 1;
      card.strengthUp -= 1;
      card.strengthRight -= 1;
      card.strengthDown -= 1;
      bmp = new createjs.Bitmap("front_end/images/minus_one.png");
    }

    bmp.x = card.x + cardWidth / 4;
    bmp.y = card.y + cardHeight / 3;
    stage.addChild(bmp);
    stage.setChildIndex(bmp, stage.getNumChildren() - 1);
  }

  // Swap turn and handle next player
  static playerTurnSwitch() {
    CardPlacer.swapPlayerTurn();

    if (getPlayerTurn() === "blue") {
      // Player turn
      playedPlayerCardCount++;
      selectedCard = cardsInPlayerHand[selectedCardNumber];
      stage.addChild(playerHandCursor);
      selectedCard.x -= 30;
      stage.setChildIndex(infoBox, stage.getNumChildren() - 1);
      infoBox.visible = true;
      playerChoosingCard = true;
    } else if (getPlayerTurn() === "red") {
      // AI turn
      aiTurn();
    }
  }

  // Swap the current player turn
  static swapPlayerTurn() {
    Game.ui.playerTurn = getPlayerTurn() === "blue" ? "red" : "blue";
  }

  // Check if the game is over
  static isGameOver() {
    return board.indexOf("Empty") === -1;
  }

  // Shift remaining hand cards down
  static shiftHandCardsDown() {
    if (getPlayerTurn() === "blue") {
      for (let i = 0; i < cardsAboveSelection; i++) {
        createjs.Tween.get(cardsInPlayerHand[i])
          .to({ y: cardsInPlayerHand[i].y + handCardOffset }, 200);
      }

      if (selectedCardNumber === 0) {
        playerHandCursor.y += handCardOffset;
        selectedCard = cardsInPlayerHand[selectedCardNumber];
      } else {
        selectedCardNumber -= 1;
        selectedCard = cardsInPlayerHand[selectedCardNumber];
        cardsAboveSelection -= 1;
      }

    } else if (getPlayerTurn() === "red") {
      for (let i = 0; i < aiCardsAboveSelection; i++) {
        createjs.Tween.get(cardsInAIHand[i])
          .to({ y: cardsInAIHand[i].y + handCardOffset }, 200);
      }
    }
  }
}
