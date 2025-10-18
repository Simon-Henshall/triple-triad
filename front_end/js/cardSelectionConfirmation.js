// -----------------------------
// displayConfirmationBox - UI for "Are you sure?" dialog
// -----------------------------
function displayConfirmationBox() {
  Game.ui.playerConfirming = true;

  // Background rectangle
  Game.ui.confirmationBackground.width = 300;
  Game.ui.confirmationBackground.height = 120;
  Game.ui.confirmationBackground.graphics
    .beginFill("#666666")
    .drawRect(
      0,
      0,
      Game.ui.confirmationBackground.width,
      Game.ui.confirmationBackground.height
    );
  Game.ui.confirmationBackground.x = 380;
  Game.ui.confirmationBackground.y = 285;

  // Border (black)
  var confirmationBorder = new createjs.Shape();
  confirmationBorder.width = Game.ui.confirmationBackground.width + 2;
  confirmationBorder.height = Game.ui.confirmationBackground.height + 2;
  confirmationBorder.graphics
    .beginFill("#000000")
    .drawRect(0, 0, confirmationBorder.width, confirmationBorder.height);
  confirmationBorder.x = Game.ui.confirmationBackground.x - 1;
  confirmationBorder.y = Game.ui.confirmationBackground.y - 1;

  // Text elements
  var confirmationChoice = new createjs.Text("CHOICE", "18px Arial", "#ffffff");
  confirmationChoice.x = Game.ui.confirmationBackground.x + 10;
  confirmationChoice.y = Game.ui.confirmationBackground.y + 15;
  confirmationChoice.textBaseline = "alphabetic";
  confirmationChoice.alpha = 1;

  var confirmationSure = new createjs.Text(
    "Are you sure?",
    "28px Arial",
    "#ffffff"
  );
  confirmationSure.x = Game.ui.confirmationBackground.x + 60;
  confirmationSure.y = Game.ui.confirmationBackground.y + 40;
  confirmationSure.textBaseline = "alphabetic";
  confirmationSure.alpha = 1;

  var confirmationYes = new createjs.Text("Yes", "28px Arial", "#ffffff");
  confirmationYes.x = Game.ui.confirmationBackground.x + 120;
  confirmationYes.y = Game.ui.confirmationBackground.y + 75;
  confirmationYes.textBaseline = "alphabetic";
  confirmationYes.alpha = 1;

  var confirmationNo = new createjs.Text("No", "28px Arial", "#ffffff");
  confirmationNo.x = Game.ui.confirmationBackground.x + 120;
  confirmationNo.y = Game.ui.confirmationBackground.y + 105;
  confirmationNo.textBaseline = "alphabetic";
  confirmationNo.alpha = 1;

  Game.ui.confirmation.addChild(
    confirmationBorder,
    Game.ui.confirmationBackground,
    confirmationChoice,
    confirmationSure,
    confirmationYes,
    confirmationNo
  );

  Game.stage.addChild(Game.ui.confirmation);
  placeConfirmationCursor();
  Game.stage.update();
}

function hideConfirmationBox() {
  Game.ui.playerConfirming = false;
  Game.stage.removeChild(Game.ui.confirmation);
  Game.ui.playerSelectingHand = true;
}
