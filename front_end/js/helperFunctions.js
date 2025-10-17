Game.utils = Game.utils || {};

Game.utils.shuffle = function (array) {
  let counter = array.length, temp, index;
  while (counter--) {
    index = (Math.random() * counter) | 0;
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
};

Game.utils.getPlayerTurn = function() {
  return Game.ui.playerTurn;
};

Game.utils.setPlayerTurn = function(value) {
  Game.ui.playerTurn = value;
};

Game.utils.togglePlayerTurn = function() {
  Game.ui.playerTurn = Game.ui.playerTurn === "red" ? "blue" : "red";
};
