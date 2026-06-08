/**
 * @module scoreboard
 * @description Unit tests for the ScoreBoard class.
 */

import { jest } from "@jest/globals";
import { ScoreBoard } from "../shared/ui/scoreboard.js";
import { Game } from "../shared/game/game.js";

describe("ScoreBoard", () => {
  let mockStage;
  let mockPlayerModel;
  let mockAITurnModel;
  let scoreBoard;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStage = {
      addChild: jest.fn(),
      update: jest.fn(),
    };

    mockPlayerModel = {
      totalBlueCards: 5,
      handOffsetX: 100,
    };

    mockAITurnModel = {
      currentlyOwnedCards: 3,
      handOffsetX: 50,
    };

    Game.stageHeight = 600;

    scoreBoard = new ScoreBoard(mockStage, mockPlayerModel, mockAITurnModel);
  });

  test("constructor sets initial state", () => {
    expect(scoreBoard.stage).toBe(mockStage);
    expect(scoreBoard.playerModel).toBe(mockPlayerModel);
    expect(scoreBoard.aiTurnModel).toBe(mockAITurnModel);
    expect(scoreBoard.container).toBeDefined();
    expect(mockStage.addChild).toHaveBeenCalled();
  });

  test("draw method creates text elements and adds to container", () => {
    scoreBoard.draw();

    expect(scoreBoard.aiText).toBeDefined();
    expect(scoreBoard.playerText).toBeDefined();
    expect(scoreBoard.container.addChild).toHaveBeenCalledWith(
      scoreBoard.aiText,
      scoreBoard.playerText,
    );
    expect(mockStage.update).toHaveBeenCalled();
  });

  test("draw method uses the player and AI model values", () => {
    scoreBoard.draw();

    // The text mocks capture the initial text
    expect(scoreBoard.aiText.text).toBe(3);
    expect(scoreBoard.playerText.text).toBe(5);
  });

  test("update method updates text values and stage", () => {
    scoreBoard.draw();
    mockPlayerModel.totalBlueCards = 8;
    mockAITurnModel.currentlyOwnedCards = 2;

    scoreBoard.update();

    expect(scoreBoard.aiText.text).toBe(2);
    expect(scoreBoard.playerText.text).toBe(8);
    expect(mockStage.update).toHaveBeenCalled();
  });
});