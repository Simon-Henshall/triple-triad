// Shuffle an array
function shuffle(array) {
  let counter = array.length,
    temp,
    index;
  while (counter--) {
    index = (Math.random() * counter) | 0;
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
}

// -------------------------
  // PLAYER TURN HELPERS
  // -------------------------

  function getPlayerTurn() {
    return Game.ui.playerTurn;
  }

  function setPlayerTurn(value) {
    Game.ui.playerTurn = value;
  }

  function player() {
    Game.ui.playerTurn = Game.ui.playerTurn === "red" ? "blue" : "red";
  }
