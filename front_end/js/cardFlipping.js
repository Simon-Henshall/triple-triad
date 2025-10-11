// Card Flipping Logic
var sliceContainer = new createjs.Container();
var sliceWidth;
var sliceHeight;
var degToRad = Math.PI / 180;

// Flip The Entire AI Hand Over At The Start Of A Game
function flipAIHand() {
  setTimeout(function () {
    flipCard(cardsInAIHand[4], "right");
    setTimeout(function () {
      flipCard(cardsInAIHand[3], "right");
      setTimeout(function () {
        flipCard(cardsInAIHand[2], "right");
        setTimeout(function () {
          flipCard(cardsInAIHand[1], "right");
          setTimeout(function () {
            flipCard(cardsInAIHand[0], "right");
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);
  }, 2000);
}

// Check If A Card Needs To Be Flipped Over
// Check If A Card Needs To Be Flipped Over
function flipCardsCheck(card) {  // <-- pass the active card in
  if (
    card.cardLeft &&
    card.owner !== card.cardLeft.owner &&
    card.strengthLeft > card.cardLeft.strengthRight
  ) {
    flipCardOver(card, "left");
  }
  if (
    card.cardUp &&
    card.owner !== card.cardUp.owner &&
    card.strengthUp > card.cardUp.strengthDown
  ) {
    flipCardOver(card, "up");
  }
  if (
    card.cardRight &&
    card.owner !== card.cardRight.owner &&
    card.strengthRight > card.cardRight.strengthLeft
  ) {
    flipCardOver(card, "right");
  }
  if (
    card.cardDown &&
    card.owner !== card.cardDown.owner &&
    card.strengthDown > card.cardDown.strengthUp
  ) {
    flipCardOver(card, "down");
  }
}

// Returns the color of the player who is *currently flipping*
function getCurrentPlayerColour() {
  return getPlayerTurn(); // always 'red' or 'blue'
}

// Flip a card in the given direction
function flipCardOver(card, direction) {
  let cardsFlipped = 0;

  const targets = [];
  if (direction === "left" && card.cardLeft) targets.push(card.cardLeft);
  if (direction === "up" && card.cardUp) targets.push(card.cardUp);
  if (direction === "down" && card.cardDown) targets.push(card.cardDown);
  if (direction === "right" && card.cardRight) targets.push(card.cardRight);

  targets.forEach(targetCard => {
    // Assign ownership to the current player
    targetCard.owner = getCurrentPlayerColour();

    // Update the visual
    replaceCard(targetCard, direction);

    cardsFlipped++;
  });

  // Update card counts
  if (getCurrentPlayerColour() === "blue") {
    totalBlueCards += cardsFlipped;
    totalRedCards -= cardsFlipped;
  } else if (getCurrentPlayerColour() === "red") {
    totalBlueCards -= cardsFlipped;
    totalRedCards += cardsFlipped;
  }

  updateCardCounts();
}

// Update The Card Count For Each Player
function updateCardCounts() {
  aiCardCount.text = totalRedCards;
  playerCardCount.text = totalBlueCards;
  stage.update();
}

// Replace The Card Upon Flip
function replaceCard(cardToReplace, direction) {
  cardToReplace.children[0].image.src =
    "front_end/images/cards/" + cardToReplace.owner + ".png";
}

// Initiate A Card Flip
function flipCard(card, direction) {
  sliceWidth = card.children[1].image.width * card.scaleX;
  sliceHeight = card.children[1].image.height * card.scaleY;
  sliceContainer.x = card.x + sliceWidth / 2;
  sliceContainer.y = card.y;
  var slice = card;
  slice.sourceRect = new createjs.Rectangle(0, 0, 0, sliceWidth);
  slice.cache(0, 0, sliceWidth, sliceHeight);
  sliceContainer.addChild(slice);
  stage.addChild(sliceContainer);
  flipCard2(card, direction, 0);
}

// Handle Card Flip Main Logic
function flipCard2(card, direction, counter) {
  if (counter < 180) {
    setTimeout(function () {
      counter++;
      if (counter == 90) {
        if (card.children[1].image.src.indexOf(card.backImage) !== -1) {
          var replacementImage = card.frontImage;
        } else {
          var replacementImage = card.backImage;
        }
        card.children[1].image.src = replacementImage;
        card.children[1].x += card.children[1].image.width;
        card.children[1].scaleX = -1;
      }
      if (direction == "left") {
        flipLeft(counter);
      } else if (direction == "right") {
        flipRight(counter);
      }
      flipCard2(card, direction, counter);
    }, 2);
  } else if (counter == 180) {
    // Finished Flipping
    // This Gets Called Only AFTER Animation, Regardless Of Animation Length!
    // Thus, It's A Great Place For Time Logic!
    var cardToAdd = sliceContainer.getChildAt(0);
    console.log(card.x); // 76.5
    console.log(sliceContainer.x); // 118
    cardToAdd.x = sliceContainer.x + card.x;
    cardToAdd.y = sliceContainer.y;
    stage.addChild(cardToAdd); // Probably Not The Most Elegant Solution
    sliceContainer.children.pop();
  }
}

// Flip A Card Left
function flipLeft(value) {
  var l = sliceContainer.getNumChildren();
  for (var i = 0; i < l; i++) {
    var slice = sliceContainer.getChildAt(i);
    slice.y = (Math.sin(value * degToRad) * -sliceWidth) / 2;
    if (i % 2) {
      slice.skewY = value;
    } else {
      slice.skewY = -value;
      slice.y -= sliceWidth * Math.sin(slice.skewY * degToRad);
    }
    slice.x = sliceWidth * (i - l / 2) * Math.cos(slice.skewY * degToRad);
    slice.updateCache();
  }
  stage.update();
}

// Flip A Card Right
function flipRight(value) {
  var l = sliceContainer.getNumChildren();
  for (var i = 0; i < l; i++) {
    var slice = sliceContainer.getChildAt(i);
    slice.y = (Math.sin(value * degToRad) * sliceWidth) / 2;
    if (i % 2) {
      slice.skewY = -value;
    } else {
      slice.skewY = value;
      slice.y -= sliceWidth * Math.sin(slice.skewY * degToRad);
    }
    slice.x = sliceWidth * (i + l / -2) * Math.cos(slice.skewY * degToRad);
    slice.updateCache();
  }
  stage.update();
}
