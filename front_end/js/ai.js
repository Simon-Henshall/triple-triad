// -------------------------
// AI TURN
// -------------------------

function aiTurn() {
  // Pick A Card To Play (Currently Random)
  var aiSelectedCard =
    cardsInAIHand[Math.floor(Math.random() * cardsInAIHand.length)];
  var aiSelectedCardNumber = cardsInAIHand.indexOf(aiSelectedCard);

  // Pick A Cell To Play In (Currently Random)
  selectedAISquare = freeCells[Math.floor(Math.random() * freeCells.length)];
  checkSelectedRowColumn();

  // Place The Card
  aiCardsAboveSelection = aiSelectedCardNumber;
  cardsInAIHand.splice(aiSelectedCardNumber, 1);
  setTimeout(function () {
    CardPlacer.placeCard(
      aiSelectedCard,
      gameOffsetX + cellWidth * (selectedColumn - 1) + cardOffsetX,
      gameOffsetY + cellHeight * (selectedRow - 1) + cardOffsetY
    );
  }, aiDelay);
}
