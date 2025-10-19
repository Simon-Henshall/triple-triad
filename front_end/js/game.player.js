Game.player = {
  handOffsetX: 0,
  playerCards: [],
  ownedCards: [],
  cardsInPlayerHand: [],
  playerHand: [],
  cardsAboveSelection: 0,
  playerCardCount: 0,
  playedPlayerCardCount: 0,
  totalBlueCards: 5,
  playerHandCursor: null,
  playerHandSelectionCursor: null,

  // Choose Which Cards To Play With (Currently Random Cards)
  populatePlayerCards(playerCardsParam) {
    // Calculate The Current Player
    Game.utils.togglePlayerTurn();

    // Shuffle and copy hand
    Game.player.playerHand = Game.utils
      .shuffle([...playerCardsParam])
      .slice(0, 5);

    for (let i = 0; i < Game.player.playerHand.length; i++) {
      const chosenCard = Game.player.playerHand[i];

      // Transparent card data
      Game.ui.cardImage = new createjs.Bitmap(
        `${Game.config.cardPath}${chosenCard.image}.png`
      );
      // Card Background Colour
      const cardColour = new createjs.Bitmap(
        `${Game.config.cardPath}${Game.utils.getPlayerTurn()}.png`
      );

      // Card Container
      Game.ui.card = new createjs.Container();
      Game.ui.card.addChild(cardColour, Game.ui.cardImage);

      // Adjust The Card For The Board
      Game.ui.card.scaleX =
        Game.offsets.cardWidth / Game.ui.card.children[0].image.width;
      Game.ui.card.scaleY =
        Game.offsets.cardHeight / Game.ui.card.children[0].image.height;

      // Assign stats
      Game.ui.card.name = chosenCard.displayName;
      Game.ui.card.strengthUp = chosenCard.strengthUp;
      Game.ui.card.strengthRight = chosenCard.strengthRight;
      Game.ui.card.strengthDown = chosenCard.strengthDown;
      Game.ui.card.strengthLeft = chosenCard.strengthLeft;
      Game.ui.card.element = chosenCard.element;
      Game.ui.card.owner = Game.ui.card.background = Game.utils.getPlayerTurn();

      // Place The Card
      Game.ui.card.x = Game.player.handOffsetX;
      Game.ui.card.y =
        Game.offsets.handOffsetY + i * Game.offsets.handCardOffset;
      Game.player.cardsInPlayerHand.push(Game.ui.card);
      Game.stage.addChild(Game.ui.card);
      Game.stage.update();
    }

    // Select The Top Card By Default
    Game.ui.selectedCard =
      Game.player.cardsInPlayerHand[Game.ui.selectedCardNumber];
    Game.ui.previouslySelectedCard = [];

    // Indent The Chosen Card
    this.indentSelectedCard();

    // Ready For The Player To Choose Which Card To Play
    Game.ui.playerConfirming = false;
    Game.ui.playerChoosingCard = true;
  },

  // Choose Which Cards To Play With (Currently Random Cards)
  indentSelectedCard() {
    if (Game.utils.getPlayerTurn() == "red") {
      if (
        Game.ui.selectedCard &&
        typeof Game.ui.selectedCard.x !== "undefined"
      ) {
        Game.ui.selectedCard.x = Game.ui.selectedCard.x + 30;
      }
      if (
        Game.ui.previouslySelectedCard &&
        typeof Game.ui.previouslySelectedCard.x !== "undefined"
      ) {
        Game.ui.previouslySelectedCard.x =
          Game.ui.previouslySelectedCard.x - 30;
      }
    } else if (Game.utils.getPlayerTurn() == "blue") {
      if (
        Game.ui.selectedCard &&
        typeof Game.ui.selectedCard.x !== "undefined"
      ) {
        Game.ui.selectedCard.x = Game.ui.selectedCard.x - 30;
      }
      if (
        Game.ui.previouslySelectedCard &&
        typeof Game.ui.previouslySelectedCard.x !== "undefined"
      ) {
        Game.ui.previouslySelectedCard.x =
          Game.ui.previouslySelectedCard.x + 30;
      }
    }
    Game.stage.update();
  },
};
