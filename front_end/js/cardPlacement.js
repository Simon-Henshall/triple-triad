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
      .call(() => {
        CardPlacer.onCardOffscreenComplete(card, placementX, placementY);
      });

    // Animate the remaining cards in the player's or AI's hand
    CardPlacer.shiftHandCardsDown();
  }

  // ======================================================================
  // Handle card once it moves offscreen
  // ======================================================================
  static onCardOffscreenComplete(card, placementX, placementY) {
    // Ensure the card stays visually on top
    Game.stage.setChildIndex(card, Game.stage.getNumChildren() - 1);

    // Reveal the card face for AI cards if needed
    if (Game.utils.getPlayerTurn() === "red") {
      card.children[1].image.src = card.frontImage;
      // Ensure ownership background is correct
      replaceCard(card);
    }

    // Animate the card into its final placement position on the board
    createjs.Tween.get(card)
      .to({ x: placementX, y: placementY }, 500)
      .call(() => {
        CardPlacer.onCardPlacementComplete(card);
      });
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
    Game.stage.update();

    // Debug
    logCell(card.inCell); // logs the specific cell
    logBoard(); // logs the whole board
    logHands(); // logs remaining cards in hands
    logTurn(); // logs current turn and totals

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
    if (squareLeft !== "none") {
      card.cardLeft = Game.board.boardArray[squareLeft - 1];
    } else {
      card.cardLeft = null;
    }

    if (squareUp !== "none") {
      card.cardUp = Game.board.boardArray[squareUp - 1];
    } else {
      card.cardUp = null;
    }

    if (squareRight !== "none") {
      card.cardRight = Game.board.boardArray[squareRight - 1];
    } else {
      card.cardRight = null;
    }

    if (squareDown !== "none") {
      card.cardDown = Game.board.boardArray[squareDown - 1];
    } else {
      card.cardDown = null;
    }
  }

  // ======================================================================
  // Add card to board array and mark the cell as occupied
  // ======================================================================
  static addCardToBoard(card) {
    card.inCell = Game.ui.selectedSquare;
    Game.board.boardArray[Game.ui.selectedSquare - 1] = card;

    // Remove the used square from the list of available cells
    const freeCellIndex = Game.board.freeCells.indexOf(Game.ui.selectedSquare);
    if (freeCellIndex > -1) {
      Game.board.freeCells.splice(freeCellIndex, 1);
    }

    // Ensure ownership background is correct after placement
    replaceCard(card);
  }

  // ======================================================================
  // Apply element bonuses or penalties, and display corresponding effect image
  // ======================================================================
  static applyElementEffects(card) {
    const squareObj = Game.ui.squares[Game.ui.selectedSquare - 1];

    if (!squareObj || squareObj.element === undefined) {
      console.warn("Square missing or element undefined:", Game.ui.selectedSquare);
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
    Game.stage.addChild(effectBmp);

    // Ensure the image appears on top
    Game.stage.setChildIndex(effectBmp, Game.stage.getNumChildren() - 1);
  }

  // ======================================================================
  // Swap the player turn and trigger next phase
  // ======================================================================
  static playerTurnSwitch() {
    CardPlacer.swapPlayerTurn();

    // Debugging
    logTurn(); // shows whose turn, card totals, free cells

    if (Game.utils.getPlayerTurn() === "blue") {
      // === PLAYER TURN ===
      playedPlayerCardCount++;
      Game.ui.selectedCard = Game.player.cardsInPlayerHand[Game.ui.selectedCardNumber];

      // Reposition cursor and UI elements
      Game.stage.addChild(Game.player.playerHandCursor);
      Game.ui.selectedCard.x -= 30;

      Game.stage.setChildIndex(Game.ui.infoBox, Game.stage.getNumChildren() - 1);
      Game.ui.infoBox.visible = true;
      Game.ui.playerChoosingCard = true;
    } else if (Game.utils.getPlayerTurn() === "red") {
      // === AI TURN ===
      aiTurn();
    }
  }

  // ======================================================================
  // Swap the current active player (red <-> blue)
  // ======================================================================
  static swapPlayerTurn() {
    Game.ui.playerTurn = Game.utils.getPlayerTurn() === "blue" ? "red" : "blue";
  }

  // ======================================================================
  // Determine if the game is finished (no more empty cells)
  // ======================================================================
  static isGameOver() {
    return Game.board.boardArray.indexOf("Empty") === -1;
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
      animateHandCardsDown(Game.player.cardsInPlayerHand, Game.player.cardsAboveSelection);

      if (Game.ui.selectedCardNumber === 0) {
        // Top card was played; move cursor down
        Game.player.playerHandCursor.y += handCardOffset;
        Game.ui.selectedCard = Game.player.cardsInPlayerHand[Game.ui.selectedCardNumber];
      } else {
        // Adjust selection to the next card
        Game.ui.selectedCardNumber -= 1;
        Game.ui.selectedCard = Game.player.cardsInPlayerHand[Game.ui.selectedCardNumber];
        Game.player.cardsAboveSelection -= 1;
      }
    } else if (Game.utils.getPlayerTurn() === "red") {
      // === AI HAND ===
      animateHandCardsDown(cardsInAIHand, Game.ai.aiCardsAboveSelection);
    }
  }
}

// ========================================================================
// Backwards-compatible alias for older game logic expecting a global symbol
// ========================================================================
window.CardPlacer = CardPlacer;
