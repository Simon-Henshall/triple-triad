/**
 * @namespace Game.cards.placement
 * @description Handles card placement, adjacency, turn switching, and element effects.
 */

Game.cards.placement = class CardPlacer {
  /**
   * Place a card onto the board (player or AI action)
   * @param {Object} card
   * @param {number} placementX
   * @param {number} placementY
   */
  static placeCard(card, placementX, placementY) {
    Game.board.checkSelectedSquare();

    // Determine the offscreen exit direction based on player turn
    const offscreenX = Game.utils.getPlayerTurn() === "red" ? card.x + 40 : card.x - 40;
    const offscreenY = -200;

    // Animate the card offscreen before placing
    createjs.Tween.get(card)
      .to({ x: offscreenX, y: offscreenY }, 500)
      .call(() => {
        Game.cards.placement.onCardOffscreenComplete(card, placementX, placementY);
      });

    Game.cards.placement.shiftHandCardsDown();
  }

  /**
   * Handle card after offscreen animation
   */
  static onCardOffscreenComplete(card, placementX, placementY) {
    // Ensure the card stays visually on top
    Game.stage.setChildIndex(card, Game.stage.getNumChildren() - 1);

    // Reveal the card face for AI cards if needed
    if (Game.utils.getPlayerTurn() === "red") {
      card.children[1].image.src = card.frontImage;
      // Ensure ownership background is correct
      Game.cards.flipping.replaceCard(card);
    }

    // Animate the card into its final placement position on the board
    createjs.Tween.get(card)
      .to({ x: placementX, y: placementY }, 500)
      .call(() => {
        Game.cards.placement.onCardPlacementComplete(card);
      });
  }

  /**
   * Handle logic after a card has been placed
   */
  static onCardPlacementComplete(card) {
    // Establish links to adjacent cards
    Game.cards.placement.setCardAdjacents(card);

    // Register this card in the board array and remove the cell from freeCells
    Game.cards.placement.addCardToBoard(card);

    // Apply elemental bonuses or penalties if applicable
    Game.cards.placement.applyElementEffects(card);

    // Check if adjacent cards should flip ownership
    Game.cards.flipping.flipCardsCheck(card);

    // Redraw the stage to show changes
    Game.stage.update();

    // Determine if the game has ended, otherwise swap turn
    if (Game.cards.placement.isGameOver()) {
      Game.endGame();
    } else {
      Game.cards.placement.playerTurnSwitch();
    }
  }

  /**
   * Set adjacent card references
   */
  static setCardAdjacents(card) {
    const board = Game.board.boardArray;

    const getOccupant = (index) => {
      const cell = board[index - 1];
      return cell ? cell.occupant ?? null : null;
    };

    card.cardLeft = getOccupant(squareLeft);
    card.cardUp = getOccupant(squareUp);
    card.cardRight = getOccupant(squareRight);
    card.cardDown = getOccupant(squareDown);

    if (Game.debug.active) {
      console.log(card);
    }
  }

  /**
   * Add card to board array and remove cell from freeCells
   */
  static addCardToBoard(card) {
    card.inCell = Game.ui.selectedSquare;
    Game.board.boardArray[Game.ui.selectedSquare - 1].occupant = card;

    // Remove the used square from the list of available cells
    const freeCellIndex = Game.board.freeCells.indexOf(Game.ui.selectedSquare);
    if (freeCellIndex > -1) {
      Game.board.freeCells.splice(freeCellIndex, 1);
    }

    // Ensure ownership background is correct after placement
    Game.cards.flipping.replaceCard(card);
  }

  /**
   * Apply element effects
   */
  static applyElementEffects(card) {
    const squareObj = Game.ui.squares[Game.ui.selectedSquare - 1];
    if (!squareObj || typeof squareObj.element === "undefined") {
      console.warn("Square missing or element undefined:", Game.ui.selectedSquare);
      return;
    }

    if (squareObj.element === 0) {
      return;
    }

    let effectImage;
      // Matching element: +1 to all sides
    if (card.element === squareObj.element) {
      card.strengthLeft++;
      card.strengthUp++;
      card.strengthRight++;
      card.strengthDown++;
      effectImage = "front_end/images/plus_one.png";
    } else {
      // Non-matching element: -1 to all sides
      card.strengthLeft--;
      card.strengthUp--;
      card.strengthRight--;
      card.strengthDown--;
      effectImage = "front_end/images/minus_one.png";
    }

    // Create and position the effect indicator
    const effectBmp = new createjs.Bitmap(effectImage);
    effectBmp.x = card.x + Game.offsets.cardWidth / 4;
    effectBmp.y = card.y + Game.offsets.cardHeight / 3;
    Game.stage.addChild(effectBmp);

    // Ensure the image appears on top
    Game.stage.setChildIndex(effectBmp, Game.stage.getNumChildren() - 1);
  }

  /**
   * Swap player turn and handle next phase
   */
  static playerTurnSwitch() {
    this.swapPlayerTurn();

    // Debugging
    if (Game.debug.active) {
      Game.debug.logTurn();
    }

    if (Game.utils.getPlayerTurn() === "blue") {
      // === PLAYER TURN ===
      Game.player.playedPlayerCardCount++;
      Game.ui.selectedCard = Game.player.cardsInPlayerHand[Game.ui.selectedCardNumber];

      // Reposition cursor and UI elements
      Game.stage.addChild(Game.player.playerHandCursor);
      Game.ui.selectedCard.x -= 30;

      Game.stage.setChildIndex(Game.ui.infoBox.container, Game.stage.getNumChildren() - 1);
      Game.ui.infoBox.container.visible = true;
      Game.ui.playerChoosingCard = true;
    } else if (Game.utils.getPlayerTurn() === "red") {
      Game.ai.turn();
    }
  }

  /**
   * Swap current active player
   */
  static swapPlayerTurn() {
    Game.ui.playerTurn = Game.utils.getPlayerTurn() === "blue" ? "red" : "blue";
  }

  /**
   * Determine if game is over
   */
  static isGameOver() {
    return Game.board.boardArray.every(cell => cell.occupant);
  }

  /**
   * Shift remaining cards in hand down
   */
  static shiftHandCardsDown() {
    /**
     * Helper to animate a list of cards by increasing their Y position
     * @param {Array} hand - The hand to animate
     * @param {number} count - Number of cards to move
     */
    function animateHandCardsDown(hand, count) {
      for (let i = 0; i < count; i++) {
        createjs.Tween.get(hand[i]).to({ y: hand[i].y + Game.offsets.handCardOffset }, 200);
      }
    }

    if (Game.utils.getPlayerTurn() === "blue") {
      // === PLAYER HAND ===
      animateHandCardsDown(Game.player.cardsInPlayerHand, Game.player.cardsAboveSelection);

      if (Game.ui.selectedCardNumber === 0) {
        // Top card was played; move cursor down
        Game.player.playerHandCursor.y += Game.offsets.handCardOffset;
        Game.ui.selectedCard = Game.player.cardsInPlayerHand[Game.ui.selectedCardNumber];
      } else {
        // Adjust selection to the next card
        Game.ui.selectedCardNumber--;
        Game.ui.selectedCard = Game.player.cardsInPlayerHand[Game.ui.selectedCardNumber];
        Game.player.cardsAboveSelection--;
      }
    } else if (Game.utils.getPlayerTurn() === "red") {
      // === AI HAND ===
      animateHandCardsDown(Game.ai.cardsInAIHand, Game.ai.aiCardsAboveSelection);
    }
  }
};
