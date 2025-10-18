// ========================================================================
// Card Placement Logic
// Handles all stages of card placement, adjacency, turn switching, and effects.
// ========================================================================

class CardPlacer {
  // ======================================================================
  // Place a card onto the board (triggered when player or AI selects a slot)
  // ======================================================================
  static placeCard(card, placementX, placementY) {
    checkSelectedSquare();

    // Determine the offscreen exit direction based on player turn
    const offscreenX =
      Game.utils.getPlayerTurn() === "red" ? card.x + 40 : card.x - 40;
    const offscreenY = -200;

    // Animate the card offscreen before placing
    createjs.Tween.get(card)
      .to({ x: offscreenX, y: offscreenY }, 500)
      .call(() =>
        CardPlacer.onCardOffscreenComplete(card, placementX, placementY)
      );

    // Animate the remaining cards in the player's or AI's hand
    CardPlacer.shiftHandCardsDown();
  }

  // ======================================================================
  // Handle card once it moves offscreen
  // ======================================================================
  static onCardOffscreenComplete(card, placementX, placementY) {
    // Ensure the card stays visually on top
    stage.setChildIndex(card, stage.getNumChildren() - 1);

    // Reveal the card face if it belongs to the AI (red)
    if (Game.utils.getPlayerTurn() === "red") {
      card.children[1].image.src = card.frontImage;
    }

    // Animate the card into its final placement position on the board
    createjs.Tween.get(card)
      .to({ x: placementX, y: placementY }, 500)
      .call(() => CardPlacer.onCardPlacementComplete(card));
  }

  // ======================================================================
  // Handle all logic after a card has been placed in its cell
  // ======================================================================
  static onCardPlacementComplete(card) {
    // Establish links to adjacent cards
    CardPlacer.setCardAdjacents(card);

    // Register this card in the board array and remove the cell from freeCells
    CardPlacer.addCardToBoard(card);

    // Apply elemental bonuses or penalties if applicable
    CardPlacer.applyElementEffects(card);

    // Check if adjacent cards should flip ownership
    flipCardsCheck(card);

    // Redraw the stage to show changes
    stage.update();

    // Determine if the game has ended, otherwise swap turn
    if (CardPlacer.isGameOver()) {
      endGame();
    } else {
      CardPlacer.playerTurnSwitch();
    }
  }

  // ======================================================================
  // Set the card's adjacent references (left, right, up, down)
  // ======================================================================
  static setCardAdjacents(card) {
    card.cardLeft = squareLeft !== "none" ? board[squareLeft - 1] : "[INVALID]";
    card.cardUp = squareUp !== "none" ? board[squareUp - 1] : "[INVALID]";
    card.cardRight =
      squareRight !== "none" ? board[squareRight - 1] : "[INVALID]";
    card.cardDown = squareDown !== "none" ? board[squareDown - 1] : "[INVALID]";
  }

  // ======================================================================
  // Add card to board array and mark the cell as occupied
  // ======================================================================
  static addCardToBoard(card) {
    card.inCell = selectedSquare;
    board[selectedSquare - 1] = card;

    // Remove the used square from the list of available cells
    const freeCellIndex = freeCells.indexOf(selectedSquare);
    if (freeCellIndex > -1) {
      freeCells.splice(freeCellIndex, 1);
    }
  }

  // ======================================================================
  // Apply element bonuses or penalties, and display corresponding effect image
  // ======================================================================
  static applyElementEffects(card) {
    // Reference the correct squares array
    const squareObj = Game.ui.squares[selectedSquare - 1];

    if (!squareObj || squareObj.element === undefined) {
      console.warn("Square missing or element undefined:", selectedSquare);
      return; // Safety guard
    }

    // Skip if the square has no element type
    if (squareObj.element === 0) {
      return;
    }

    let effectImage;
    const isElementMatch = card.element === squareObj.element;

    if (isElementMatch) {
      // Matching element: +1 to all sides
      card.strengthLeft += 1;
      card.strengthUp += 1;
      card.strengthRight += 1;
      card.strengthDown += 1;
      effectImage = "front_end/images/plus_one.png";
    } else {
      // Non-matching element: -1 to all sides
      card.strengthLeft -= 1;
      card.strengthUp -= 1;
      card.strengthRight -= 1;
      card.strengthDown -= 1;
      effectImage = "front_end/images/minus_one.png";
    }

    // Create and position the effect indicator
    const effectBmp = new createjs.Bitmap(effectImage);
    effectBmp.x = card.x + cardWidth / 4;
    effectBmp.y = card.y + cardHeight / 3;
    stage.addChild(effectBmp);

    // Ensure the image appears on top
    stage.setChildIndex(effectBmp, stage.getNumChildren() - 1);
  }

  // ======================================================================
  // Swap the player turn and trigger next phase
  // ======================================================================
  static playerTurnSwitch() {
    // Swap the internal turn tracker
    CardPlacer.swapPlayerTurn();

    if (Game.utils.getPlayerTurn() === "blue") {
      // === PLAYER TURN ===
      playedPlayerCardCount++;
      selectedCard = cardsInPlayerHand[selectedCardNumber];

      // Reposition cursor and UI elements
      stage.addChild(playerHandCursor);
      selectedCard.x -= 30;
      stage.setChildIndex(infoBox, stage.getNumChildren() - 1);
      infoBox.visible = true;
      playerChoosingCard = true;
    } else if (Game.utils.getPlayerTurn() === "red") {
      // === AI TURN ===
      aiTurn();
    }
  }

  // ======================================================================
  // Swap the current active player (red <-> blue)
  // ======================================================================
  static swapPlayerTurn() {
    console.log("Before swap:", Game.ui.playerTurn);
    console.log("getPlayerTurn() reports:", Game.utils.getPlayerTurn());
    Game.ui.playerTurn = Game.utils.getPlayerTurn() === "blue" ? "red" : "blue";
    console.log("After swap:", Game.ui.playerTurn);
  }

  // ======================================================================
  // Determine if the game is finished (no more empty cells)
  // ======================================================================
  static isGameOver() {
    return board.indexOf("Empty") === -1;
  }

  // ======================================================================
  // Shift the remaining cards in the player's or AI's hand down
  // ======================================================================
  static shiftHandCardsDown() {
    /**
     * Helper to animate a list of cards by increasing their Y position
     * @param {Array} hand - The hand to animate
     * @param {number} count - Number of cards to move
     */
    function animateHandCardsDown(hand, count) {
      for (let i = 0; i < count; i++) {
        createjs.Tween.get(hand[i]).to({ y: hand[i].y + handCardOffset }, 200);
      }
    }

    if (Game.utils.getPlayerTurn() === "blue") {
      // === PLAYER HAND ===
      animateHandCardsDown(cardsInPlayerHand, cardsAboveSelection);

      if (selectedCardNumber === 0) {
        // Top card was played; move cursor down
        playerHandCursor.y += handCardOffset;
        selectedCard = cardsInPlayerHand[selectedCardNumber];
      } else {
        // Adjust selection to the next card
        selectedCardNumber -= 1;
        selectedCard = cardsInPlayerHand[selectedCardNumber];
        cardsAboveSelection -= 1;
      }
    } else if (Game.utils.getPlayerTurn() === "red") {
      // === AI HAND ===
      animateHandCardsDown(cardsInAIHand, aiCardsAboveSelection);
    }
  }
}

// ========================================================================
// Backwards-compatible alias for older game logic expecting a global symbol
// ========================================================================
window.CardPlacer = CardPlacer;
