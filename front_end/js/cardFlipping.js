// =======================================================
// Card Flipping Logic
// =======================================================

const DEG_TO_RAD = Math.PI / 180;

// Maps direction keywords to relevant card-side references
const directionMap = {
  left: {
    prop: "cardLeft",
    playerStrength: "strengthLeft",
    opponentStrength: "strengthRight",
  },
  right: {
    prop: "cardRight",
    playerStrength: "strengthRight",
    opponentStrength: "strengthLeft",
  },
  up: {
    prop: "cardUp",
    playerStrength: "strengthUp",
    opponentStrength: "strengthDown",
  },
  down: {
    prop: "cardDown",
    playerStrength: "strengthDown",
    opponentStrength: "strengthUp",
  },
};

// =======================================================
// Flip The Entire AI Hand At Game Start
// =======================================================
function flipAIHand() {
  // Reverse copy ensures flipping starts from last to first visually
  Game.ai.cardsInAIHand.slice().reverse().forEach((card, index) => {
    setTimeout(() => {
      flipCard(card, "right");
    }, 2000 * (index + 1));
  });
}

// =======================================================
// Check Adjacent Cards For Flip
// =======================================================
function flipCardsCheck(card) {
  Object.entries(directionMap).forEach(
    ([direction, { prop, playerStrength, opponentStrength }]) => {
      const target = card[prop];

      if (
        target &&
        card.owner !== target.owner &&
        card[playerStrength] > target[opponentStrength]
      ) {
        flipCardOver(card, direction);
      }
    }
  );
}

// =======================================================
// Get Current Player Colour
// =======================================================
function getCurrentPlayerColour() {
  return Game.utils.getPlayerTurn();
}

// =======================================================
// Flip a Single Card Over (Triggered by flipCardsCheck)
// =======================================================
function flipCardOver(card, direction) {
  const targetCard = card[directionMap[direction].prop];

  // Change ownership colour to match current player
  targetCard.owner = getCurrentPlayerColour();

  // Update images: retain front card art, swap ownership overlay
  replaceCard(targetCard);

  // Update ownership counts
  updateOwnershipCounts(1);

  // Keep board state consistent
  const squareObj = Game.ui.squares[targetCard.inCell - 1];
  if (squareObj) {
    squareObj.card = targetCard;
  }

  // Debugging
  logCell(targetCard.inCell);
  logBoard();
  logTurn();
}

// =======================================================
// Update Ownership Totals
// =======================================================
function updateOwnershipCounts(flippedCount) {
  const playerColour = getCurrentPlayerColour();

  let totalBlueCardsConfined = Game.player.totalBlueCards;
  let totalRedCardsConfined = Game.ai.totalRedCards;

  const delta = {
    blue: { totalBlueCardsConfined: 1, totalRedCardsConfined: -1 },
    red: { totalBlueCardsConfined: -1, totalRedCardsConfined: 1 },
  };

  Game.player.totalBlueCards += delta[playerColour].totalBlueCardsConfined * flippedCount;
  Game.ai.totalRedCards += delta[playerColour].totalRedCardsConfined * flippedCount;

  updateCardCounts();
}

// =======================================================
// Update Displayed Card Counts
// =======================================================
function updateCardCounts() {
  Game.ai.aiCardCount.text = Game.ai.totalRedCards;
  Game.player.playerCardCount.text = Game.player.totalBlueCards;
  Game.stage.update();
}

// =======================================================
// Replace Card Image Upon Flip (retain front art + ownership colour)
// =======================================================
function replaceCard(cardToReplace) {
  if (!cardToReplace.children[0]) {
    // Create ownership background if missing
    const ownerBmp = new createjs.Bitmap(`front_end/images/cards/${cardToReplace.owner}.png`);
    cardToReplace.addChildAt(ownerBmp, 0);
  } else {
    // Only update ownership layer
    cardToReplace.children[0].image.src = `front_end/images/cards/${cardToReplace.owner}.png`;
  }

  // Ensure front face stays above ownership background
  if (cardToReplace.children[1]) {
    cardToReplace.setChildIndex(cardToReplace.children[1], cardToReplace.getNumChildren() - 1);
  }
}

// =======================================================
// Animate Card Flip (isolated container per card)
// =======================================================
function flipCard(card, direction) {
  const sliceContainer = new createjs.Container();

  const sliceWidth = card.children[1].image.width * card.scaleX;
  const sliceHeight = card.children[1].image.height * card.scaleY;

  const initialX = card.x;
  const initialY = card.y;

  sliceContainer.x = initialX + sliceWidth / 2;
  sliceContainer.y = initialY;

  // Cache the card before starting animation
  card.sourceRect = new createjs.Rectangle(0, 0, 0, sliceWidth);
  card.cache(0, 0, sliceWidth, sliceHeight);

  sliceContainer.addChild(card);
  Game.stage.addChild(sliceContainer);

  animateFlip(card, sliceContainer, direction, 0, initialX, initialY);
}

// =======================================================
// Animate Flip Progress (Recursive Timeout Loop)
// =======================================================
function animateFlip(card, container, direction, counter, initialX, initialY) {
  if (counter > 180) {
    finaliseFlip(card, container, initialX, initialY);
    return;
  }

  setTimeout(() => {
    counter++;

    if (counter === 90) {
      swapCardFace(card);
    }

    flipDirection(card, container, direction, counter);

    animateFlip(card, container, direction, counter, initialX, initialY);
  }, 2);
}

// =======================================================
// Swap Visible Card Face (front ↔ back)
// =======================================================
function swapCardFace(card) {
  const isBack = card.children[1].image.src.includes(card.backImage);

  card.children[1].image.src = isBack ? card.frontImage : card.backImage;

  card.children[1].x += card.children[1].image.width;
  card.children[1].scaleX = -1;
}

// =======================================================
// Flip Direction Math
// =======================================================
function flipDirection(card, container, direction, value) {
  const factor = direction === "left" ? -1 : 1;
  const totalSlices = container.getNumChildren();

  for (let i = 0; i < totalSlices; i++) {
    const slice = container.getChildAt(i);

    slice.y = Math.sin(value * DEG_TO_RAD) * factor * card.children[1].image.width / 2;
    slice.skewY = (i % 2 === 0 ? -1 : 1) * value * factor;

    if (i % 2 === 0) {
      slice.y -= card.children[1].image.width * Math.sin(slice.skewY * DEG_TO_RAD);
    }

    slice.x = card.children[1].image.width * (i - totalSlices / 2) * Math.cos(slice.skewY * DEG_TO_RAD);
    slice.updateCache();
  }

  Game.stage.update();
}

// =======================================================
// Finalise Flip
// =======================================================
function finaliseFlip(card, container, initialX, initialY) {
  card.x = initialX;
  card.y = initialY;

  Game.stage.addChild(card);
  container.removeAllChildren();
  Game.stage.removeChild(container);
}

// =======================================================
// Backwards-Compatible Export
// =======================================================
window.flipAIHand = flipAIHand;
window.flipCardsCheck = flipCardsCheck;
window.flipCard = flipCard;
