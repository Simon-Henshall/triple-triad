// =======================================================
// Card Flipping Logic
// =======================================================

const DEG_TO_RAD = Math.PI / 180;
const sliceContainer = new createjs.Container();

let sliceWidth;
let sliceHeight;

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
  cardsInAIHand.slice().reverse().forEach((card, index) => {
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
  // Always returns 'red' or 'blue'
  return getPlayerTurn();
}

// =======================================================
// Flip a Single Card Over (Triggered by flipCardsCheck)
// =======================================================
function flipCardOver(card, direction) {
  const targetCard = card[directionMap[direction].prop];

  // Change ownership colour to match current player
  targetCard.owner = getCurrentPlayerColour();

  // Replace card image to reflect new owner
  replaceCard(targetCard);

  // Update ownership counts accordingly
  updateOwnershipCounts(1);
}

// =======================================================
// Update Ownership Totals
// =======================================================
function updateOwnershipCounts(flippedCount) {
  const playerColour = getCurrentPlayerColour();

  // Ownership delta table for each colour
  const delta = {
    blue: { totalBlueCards: 1, totalRedCards: -1 },
    red: { totalBlueCards: -1, totalRedCards: 1 },
  };

  totalBlueCards += delta[playerColour].totalBlueCards * flippedCount;
  totalRedCards += delta[playerColour].totalRedCards * flippedCount;

  updateCardCounts();
}

// =======================================================
// Update Displayed Card Counts
// =======================================================
function updateCardCounts() {
  aiCardCount.text = totalRedCards;
  playerCardCount.text = totalBlueCards;
  stage.update();
}

// =======================================================
// Replace Card Image Upon Flip
// =======================================================
function replaceCard(cardToReplace) {
  // Swap the image source to reflect ownership change
  cardToReplace.children[0].image.src = `front_end/images/cards/${cardToReplace.owner}.png`;
}

// =======================================================
// Animate Card Flip (for full 3D-like effect)
// =======================================================
function flipCard(card, direction) {
  sliceWidth = card.children[1].image.width * card.scaleX;
  sliceHeight = card.children[1].image.height * card.scaleY;

  sliceContainer.x = card.x + sliceWidth / 2;
  sliceContainer.y = card.y;

  // Cache the card before starting animation
  card.sourceRect = new createjs.Rectangle(0, 0, 0, sliceWidth);
  card.cache(0, 0, sliceWidth, sliceHeight);

  sliceContainer.addChild(card);
  stage.addChild(sliceContainer);

  // Begin recursive flip animation
  animateFlip(card, direction, 0);
}

// =======================================================
// Animate Flip Progress (Recursive Timeout Loop)
// =======================================================
function animateFlip(card, direction, counter) {
  if (counter > 180) {
    finaliseFlip(card);
    return;
  }

  setTimeout(() => {
    counter++;

    // At halfway point, switch visible card face
    if (counter === 90) {
      swapCardFace(card);
    }

    // Apply rotation frame
    flipDirection(direction, counter);

    // Continue animation
    animateFlip(card, direction, counter);
  }, 2);
}

// =======================================================
// Swap Visible Card Face (front ↔ back)
// =======================================================
function swapCardFace(card) {
  const isBack = card.children[1].image.src.includes(card.backImage);

  // Toggle image between front and back
  card.children[1].image.src = isBack
    ? card.frontImage
    : card.backImage;

  // Adjust for horizontal mirroring effect
  card.children[1].x += card.children[1].image.width;
  card.children[1].scaleX = -1;
}

// =======================================================
// Calculate Flip Direction Offset For Each Frame
// =======================================================
function flipDirection(direction, value) {
  const factor = direction === "left" ? -1 : 1;
  const totalSlices = sliceContainer.getNumChildren();

  for (let i = 0; i < totalSlices; i++) {
    const slice = sliceContainer.getChildAt(i);

    slice.y = Math.sin(value * DEG_TO_RAD) * factor * sliceWidth / 2;
    slice.skewY = (i % 2 === 0 ? -1 : 1) * value * factor;

    if (i % 2 === 0) {
      slice.y -= sliceWidth * Math.sin(slice.skewY * DEG_TO_RAD);
    }

    slice.x = sliceWidth * (i - totalSlices / 2) * Math.cos(slice.skewY * DEG_TO_RAD);
    slice.updateCache();
  }

  stage.update();
}

// =======================================================
// Finalise Flip Animation
// =======================================================
function finaliseFlip(card) {
  const cardToAdd = sliceContainer.getChildAt(0);

  cardToAdd.x = sliceContainer.x + card.x;
  cardToAdd.y = sliceContainer.y;

  stage.addChild(cardToAdd);
  sliceContainer.removeAllChildren();
}

// =======================================================
// Backwards-Compatible Export
// =======================================================
window.flipAIHand = flipAIHand;
window.flipCardsCheck = flipCardsCheck;
window.flipCard = flipCard;
