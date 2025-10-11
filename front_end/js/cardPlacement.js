// Place A Card Onto The Board
  function placeCard(cardToPlace, placement_x, placement_y) {

    // Grab Info About The Card
    card = cardToPlace;
    checkSelectedSquare();

    if (getPlayerTurn() == 'red') {
      var offscreen_x = card.x + 40;

    } else if (getPlayerTurn() == 'blue') {
      var offscreen_x = card.x - 40;
    }
    var offscreen_y = -200;

    // Animate The Transition
    createjs.Tween.get(card)
      .to({
        "x": offscreen_x,
        "y": offscreen_y
      }, 500)
      .call(handleComplete);

    function handleComplete() {
      stage.setChildIndex(card, stage.getNumChildren() - 1); // Bring The Card To The Front Of The Z-Index
      if (getPlayerTurn() == 'red') {
        card.children[1].image.src = card.frontImage;
      }
      createjs.Tween.get(card)
        .to({
          "x": placement_x,
          "y": placement_y
        }, 500)
        .call(handleComplete);

      function handleComplete() {
        card.inCell = selectedSquare;

        // Invalid Card References
        if (squareLeft != "none") {
          card.cardLeft = board[squareLeft - 1];
        } else {
          card.cardLeft = "[INVALID]";
        }

        if (squareUp != "none") {
          card.cardUp = board[squareUp - 1];
        } else {
          card.cardUp = "[INVALID]";
        }

        if (squareRight != "none") {
          card.cardRight = board[squareRight - 1];
        } else {
          card.cardRight = "[INVALID]";
        }

        if (squareDown != "none") {
          card.cardDown = board[squareDown - 1];
        } else {
          card.cardDown = "[INVALID]";
        }

        // Add The Card To The Board
        board[selectedSquare - 1] = card;

        var selectedSquareFreeCellsIndex = freeCells.indexOf(selectedSquare);
        freeCells.splice(selectedSquareFreeCellsIndex, 1);

        // Calculate Elements
        if (squares[selectedSquare - 1].element != 0 && card.element == squares[selectedSquare - 1].element) {
          card.strengthLeft += 1;
          card.strengthUp += 1;
          card.strengthRight += 1;
          card.strengthDown += 1;
          var plus_one = new createjs.Bitmap('front_end/images/plus_one.png');
          plus_one.x = card.x + (cardWidth / 4);
          plus_one.y = card.y + (cardHeight / 3);
          stage.addChild(plus_one);
          stage.setChildIndex(plus_one, stage.getNumChildren() - 1);
        } else if (squares[selectedSquare - 1].element != 0 && card.element != squares[selectedSquare - 1].element) {
          card.strengthLeft -= 1;
          card.strengthUp -= 1;
          card.strengthRight -= 1;
          card.strengthDown -= 1;
          var minus_one = new createjs.Bitmap('front_end/images/minus_one.png');
          minus_one.x = card.x + (cardWidth / 4);
          minus_one.y = card.y + (cardHeight / 3);
          stage.addChild(minus_one);
          stage.setChildIndex(minus_one, stage.getNumChildren() - 1);
        }

        // Check If The Card Flipped Any Existing Cards
        flipCardsCheck(card);

        // Apply Logic
        stage.update();

        // Check If The Game Is Now Over
        if (board.indexOf("Empty") == -1) {
          endGame();
        } else {
          // Swap The Players
          player();
          // Re-select The Correct Card In The Hand
          if (getPlayerTurn() == "blue") {
            playedPlayerCardCount++;
            selectedCard = cardsInPlayerHand[selectedCardNumber];
            stage.addChild(playerHandCursor);
            selectedCard.x = selectedCard.x - 30;
            stage.setChildIndex(infoBox, stage.getNumChildren() - 1);
            infoBox.visible = true;
            playerChoosingCard = true;
          } else if (getPlayerTurn() == "red") {
            aiSelectedCard = cardsInAIHand[selectedCardNumber];
            aiTurn();
          }
        }
      }
    }

    // Shift Remaining Cards In Hand Down
    if (getPlayerTurn() == "blue") {
      for (var i = 0; i < cardsAboveSelection; i++) {
        // Animate The Transition
        createjs.Tween.get(cardsInPlayerHand[i]).to({
          "y": cardsInPlayerHand[i].y + handCardOffset
        }, 200);
      }
      if (selectedCardNumber == 0) {
        playerHandCursor.y += handCardOffset;
        selectedCard = cardsInPlayerHand[selectedCardNumber];
      } else {
        selectedCardNumber -= 1;
        selectedCard = cardsInPlayerHand[selectedCardNumber];
        cardsAboveSelection -= 1;
      }

    } else if (getPlayerTurn() == "red") {
      for (var i = 0; i < aiCardsAboveSelection; i++) {
        // Animate The Transition
        createjs.Tween.get(cardsInAIHand[i]).to({
          "y": cardsInAIHand[i].y + handCardOffset
        }, 200);
      }
    }

  }