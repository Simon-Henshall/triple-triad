// cardFlipping.js

// =========================
// Card Flipping Logic
// =========================

const degToRad = Math.PI / 180;
const sliceContainer = new createjs.Container();
let sliceWidth, sliceHeight;

const directionMap = {
  left:  { prop: 'cardLeft',  playerStrength: 'strengthLeft',  opponentStrength: 'strengthRight' },
  right: { prop: 'cardRight', playerStrength: 'strengthRight', opponentStrength: 'strengthLeft' },
  up:    { prop: 'cardUp',    playerStrength: 'strengthUp',    opponentStrength: 'strengthDown' },
  down:  { prop: 'cardDown',  playerStrength: 'strengthDown',  opponentStrength: 'strengthUp' }
};

// =========================
// Flip The Entire AI Hand At Game Start
// =========================
function flipAIHand() {
  cardsInAIHand.slice().reverse().forEach((card, index) => {
    setTimeout(() => {
      flipCard(card, 'right');
    }, 2000 * (index + 1));
  });
}

// =========================
// Check Adjacent Cards For Flip
// =========================
function flipCardsCheck(card) {
  Object.entries(directionMap).forEach(([direction, { prop, playerStrength, opponentStrength }]) => {
    const target = card[prop];
    if (target && card.owner !== target.owner && card[playerStrength] > target[opponentStrength]) {
      flipCardOver(card, direction);
    }
  });
}

// =========================
// Get Current Player Colour
// =========================
function getCurrentPlayerColour() {
  return getPlayerTurn(); // always 'red' or 'blue'
}

// =========================
// Flip a Single Card Over
// =========================
function flipCardOver(card, direction) {
  const targetCard = card[directionMap[direction].prop];
  if (!targetCard) {
    return;
  }

  targetCard.owner = getCurrentPlayerColour();
  replaceCard(targetCard);

  updateOwnershipCounts(1);
}

// =========================
// Update Ownership Totals
// =========================
function updateOwnershipCounts(flippedCount) {
  const playerColour = getCurrentPlayerColour();
  const delta = {
    blue: { totalBlueCards: 1, totalRedCards: -1 },
    red:  { totalBlueCards: -1, totalRedCards: 1 }
  };

  totalBlueCards += delta[playerColour].totalBlueCards * flippedCount;
  totalRedCards  += delta[playerColour].totalRedCards * flippedCount;

  updateCardCounts();
}

// =========================
// Update Displayed Card Counts
// =========================
function updateCardCounts() {
  aiCardCount.text = totalRedCards;
  playerCardCount.text = totalBlueCards;
  stage.update();
}

// =========================
// Replace Card Image Upon Flip
// =========================
function replaceCard(cardToReplace) {
  cardToReplace.children[0].image.src = `front_end/images/cards/${cardToReplace.owner}.png`;
}

// =========================
// Animate Card Flip
// =========================
function flipCard(card, direction) {
  sliceWidth = card.children[1].image.width * card.scaleX;
  sliceHeight = card.children[1].image.height * card.scaleY;

  sliceContainer.x = card.x + sliceWidth / 2;
  sliceContainer.y = card.y;

  card.sourceRect = new createjs.Rectangle(0, 0, 0, sliceWidth);
  card.cache(0, 0, sliceWidth, sliceHeight);

  sliceContainer.addChild(card);
  stage.addChild(sliceContainer);

  animateFlip(card, direction, 0);
}

function animateFlip(card, direction, counter) {
  if (counter > 180) {
    finalizeFlip(card);
    return;
  }

  setTimeout(() => {
    counter++;

    if (counter === 90) {
      swapCardFace(card);
    }

    flipDirection(direction, counter);

    animateFlip(card, direction, counter);
  }, 2);
}

function swapCardFace(card) {
  const isBack = card.children[1].image.src.includes(card.backImage);
  card.children[1].image.src = isBack ? card.frontImage : card.backImage;
  card.children[1].x += card.children[1].image.width;
  card.children[1].scaleX = -1;
}

function flipDirection(direction, value) {
  const factor = direction === 'left' ? -1 : 1;
  const l = sliceContainer.getNumChildren();

  for (let i = 0; i < l; i++) {
    const slice = sliceContainer.getChildAt(i);
    slice.y = Math.sin(value * degToRad) * factor * sliceWidth / 2;
    slice.skewY = (i % 2 === 0 ? -1 : 1) * value * factor;
    if (i % 2 === 0) {
      slice.y -= sliceWidth * Math.sin(slice.skewY * degToRad);
    }

    slice.x = sliceWidth * (i - l / 2) * Math.cos(slice.skewY * degToRad);
    slice.updateCache();
  }

  stage.update();
}

function finalizeFlip(card) {
  const cardToAdd = sliceContainer.getChildAt(0);
  cardToAdd.x = sliceContainer.x + card.x;
  cardToAdd.y = sliceContainer.y;
  stage.addChild(cardToAdd);
  sliceContainer.removeAllChildren();
}
