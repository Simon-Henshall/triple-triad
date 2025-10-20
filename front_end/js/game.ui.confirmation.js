// -----------------------------
// displayConfirmationBox - UI for "Are you sure?" dialog
// -----------------------------
function displayConfirmationBox() {
  Game.ui.playerConfirming = true;

  // Reset to the default selection (in the event of cancellation then reconfirmation)
  Game.ui.confirmation.selectedChoice = 0;
  Game.ui.confirmation.cursor.y = Game.ui.confirmation.background.y + 60;

  // Background rectangle
  Game.ui.confirmation.background.width = 300;
  Game.ui.confirmation.background.height = 120;
  Game.ui.confirmation.background.graphics
    .beginFill("#666666")
    .drawRect(
      0,
      0,
      Game.ui.confirmation.background.width,
      Game.ui.confirmation.background.height
    );
  Game.ui.confirmation.background.x = 380;
  Game.ui.confirmation.background.y = 285;

  // Border (black)
  var confirmationBorder = new createjs.Shape();
  confirmationBorder.width = Game.ui.confirmation.background.width + 2;
  confirmationBorder.height = Game.ui.confirmation.background.height + 2;
  confirmationBorder.graphics
    .beginFill("#000000")
    .drawRect(0, 0, confirmationBorder.width, confirmationBorder.height);
  confirmationBorder.x = Game.ui.confirmation.background.x - 1;
  confirmationBorder.y = Game.ui.confirmation.background.y - 1;

  // Text elements
  var confirmationChoice = new createjs.Text("CHOICE", "18px Arial", "#ffffff");
  confirmationChoice.x = Game.ui.confirmation.background.x + 10;
  confirmationChoice.y = Game.ui.confirmation.background.y + 15;
  confirmationChoice.textBaseline = "alphabetic";

  var confirmationSure = new createjs.Text(
    "Are you sure?",
    "28px Arial",
    "#ffffff"
  );
  confirmationSure.x = Game.ui.confirmation.background.x + 60;
  confirmationSure.y = Game.ui.confirmation.background.y + 40;
  confirmationSure.textBaseline = "alphabetic";

  var confirmationYes = new createjs.Text("Yes", "28px Arial", "#ffffff");
  confirmationYes.x = Game.ui.confirmation.background.x + 120;
  confirmationYes.y = Game.ui.confirmation.background.y + 75;
  confirmationYes.textBaseline = "alphabetic";

  var confirmationNo = new createjs.Text("No", "28px Arial", "#ffffff");
  confirmationNo.x = Game.ui.confirmation.background.x + 120;
  confirmationNo.y = Game.ui.confirmation.background.y + 105;
  confirmationNo.textBaseline = "alphabetic";

  Game.ui.confirmation.container.addChild(
    confirmationBorder,
    Game.ui.confirmation.background,
    confirmationChoice,
    confirmationSure,
    confirmationYes,
    confirmationNo
  );

  Game.stage.addChild(Game.ui.confirmation.container);
  Game.cursors.confirmation.place();
  Game.stage.update();
}

function hideConfirmationBox() {
  Game.ui.playerConfirming = false;
  Game.stage.removeChild(Game.ui.confirmation.container);
  Game.ui.playerSelectingHand = true;
}
