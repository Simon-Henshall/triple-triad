// -------------------------
// DEBUG HELPERS
// -------------------------

function clickHandler(event) {
  console.log("++++++++++++++++++++++++++++++++++++");
  console.log("Cell ID: " + event.target.name);
  console.log("Cell Element: " + event.target.element);
  var cardHere = board[event.target.name - 1];
  if (cardHere != "Empty") {
    console.log("Card In This Cell: " + cardHere.name);
    console.log("Card Owner: " + cardHere.owner);
    console.log("Card Strength Left: " + cardHere.strengthLeft);
    console.log("Card Strength Up: " + cardHere.strengthUp);
    console.log("Card Strength Right: " + cardHere.strengthRight);
    console.log("Card Strength Down: " + cardHere.strengthDown);
    console.log("Card Element: " + cardHere.element);
    console.log("(WHEN PLAYED) Card To The Left: " + cardHere.cardLeft.name);
    console.log("(WHEN PLAYED) Card Above: " + cardHere.cardUp.name);
    console.log("(WHEN PLAYED) Card To The Right: " + cardHere.cardRight.name);
    console.log("(WHEN PLAYED) Card Below: " + cardHere.cardDown.name);
  } else {
    console.log("Card In This Cell: NONE");
  }
  console.log("++++++++++++++++++++++++++++++++++++");
}
