/**
 * @module placement-view
 * @description Unit tests for the PlacementView class.
 */

import { jest } from "@jest/globals";
import { PlacementView } from "../phases/placement/placement-view.js";
import { Game } from "../shared/game/game.js";
import { getPlayerTurn, swapPlayerTurn } from "../utilities/turn.js";

describe("PlacementView", () => {
  let view;
  let mockPlayerModel;
  let mockAITurnModel;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPlayerModel = {
      shiftCardsDown: jest.fn(),
      selectedCard: undefined,
    };
    mockAITurnModel = {
      hand: [
        { visuals: { container: { y: 100 } } },
        { visuals: { container: { y: 100 } } },
      ],
      cardsAboveSelection: 1,
    };
    Game.models = {
      playerModel: mockPlayerModel,
      aiTurnModel: mockAITurnModel,
    };

    view = new PlacementView();
  });

  test("shiftHandCardsDown shifts player cards when turn is blue", () => {
    while (getPlayerTurn() !== "blue") {
      swapPlayerTurn();
    }
    view.shiftHandCardsDown();
    expect(mockPlayerModel.shiftCardsDown).toHaveBeenCalled();
  });

  test("shiftHandCardsDown animates AI cards when turn is red", () => {
    while (getPlayerTurn() !== "red") {
      swapPlayerTurn();
    }
    view.shiftHandCardsDown();
    expect(mockPlayerModel.shiftCardsDown).not.toHaveBeenCalled();
  });

  test("animateDown iterates hand up to count", () => {
    expect(() => view.animateDown(mockAITurnModel.hand, 2)).not.toThrow();
  });

  test("animateDown handles count of 0", () => {
    expect(() => view.animateDown(mockAITurnModel.hand, 0)).not.toThrow();
  });

  test("moveCardOffscreen does not throw with valid card", () => {
    const card = { visuals: { container: {} } };
    const callback = jest.fn();
    expect(() => view.moveCardOffscreen(card, callback)).not.toThrow();
  });

  test("moveCardToBoard does not throw with valid card", () => {
    const card = { visuals: { container: {} } };
    const callback = jest.fn();
    expect(() => view.moveCardToBoard(card, 100, 200, callback)).not.toThrow();
  });

  test("showElementEffect adds a bitmap to the card container", () => {
    const container = {
      addChild: jest.fn(),
      getBounds: () => ({ width: 100, height: 100 }),
    };
    const card = { visuals: { container } };
    view.showElementEffect(card, "front_end/images/plus_one.png");
    expect(container.addChild).toHaveBeenCalled();
  });

  test("indentAfterPlacement does not throw when no selected card", () => {
    expect(() => view.indentAfterPlacement()).not.toThrow();
  });

  test("indentAfterPlacement indents the selected card", () => {
    mockPlayerModel.selectedCard = { visuals: { container: { x: 100 } } };
    view.indentAfterPlacement();
    expect(mockPlayerModel.selectedCard.visuals.container.x).toBe(70);
  });
});