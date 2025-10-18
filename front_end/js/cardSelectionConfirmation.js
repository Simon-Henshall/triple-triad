// -----------------------------
// displayConfirmationBox - UI for "Are you sure?" dialog
// -----------------------------
function displayConfirmationBox() {
  window.playerConfirming = true;

  // Background rectangle
  confirmationBackground.width = 300;
  confirmationBackground.height = 120;
  confirmationBackground.graphics
    .beginFill("#666666")
    .drawRect(
      0,
      0,
      confirmationBackground.width,
      confirmationBackground.height
    );
  confirmationBackground.x = 380;
  confirmationBackground.y = 285;

  // Border (black)
  var confirmationBorder = new createjs.Shape();
  confirmationBorder.width = confirmationBackground.width + 2;
  confirmationBorder.height = confirmationBackground.height + 2;
  confirmationBorder.graphics
    .beginFill("#000000")
    .drawRect(0, 0, confirmationBorder.width, confirmationBorder.height);
  confirmationBorder.x = confirmationBackground.x - 1;
  confirmationBorder.y = confirmationBackground.y - 1;

  // Text elements
  var confirmationChoice = new createjs.Text("CHOICE", "18px Arial", "#ffffff");
  confirmationChoice.x = confirmationBackground.x + 10;
  confirmationChoice.y = confirmationBackground.y + 15;
  confirmationChoice.textBaseline = "alphabetic";
  confirmationChoice.alpha = 1;

  var confirmationSure = new createjs.Text(
    "Are you sure?",
    "28px Arial",
    "#ffffff"
  );
  confirmationSure.x = confirmationBackground.x + 60;
  confirmationSure.y = confirmationBackground.y + 40;
  confirmationSure.textBaseline = "alphabetic";
  confirmationSure.alpha = 1;

  var confirmationYes = new createjs.Text("Yes", "28px Arial", "#ffffff");
  confirmationYes.x = confirmationBackground.x + 120;
  confirmationYes.y = confirmationBackground.y + 75;
  confirmationYes.textBaseline = "alphabetic";
  confirmationYes.alpha = 1;

  var confirmationNo = new createjs.Text("No", "28px Arial", "#ffffff");
  confirmationNo.x = confirmationBackground.x + 120;
  confirmationNo.y = confirmationBackground.y + 105;
  confirmationNo.textBaseline = "alphabetic";
  confirmationNo.alpha = 1;

  confirmation.addChild(
    confirmationBorder,
    confirmationBackground,
    confirmationChoice,
    confirmationSure,
    confirmationYes,
    confirmationNo
  );

  stage.addChild(confirmation);
  placeConfirmationCursor();
  stage.update();
}

function hideConfirmationBox() {
  window.playerConfirming = false;
  stage.removeChild(confirmation);
  window.playerSelectingHand = true;
}
