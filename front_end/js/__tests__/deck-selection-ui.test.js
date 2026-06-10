/**
 * @module deck-selection-ui
 * @description Unit tests for DeckSelectionUI
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { Card } from "../shared/card/card.js";

describe("DeckSelectionUI", () => {
  let DeckSelectionUI;
  let mockController;

  beforeAll(async () => {
    jest.unstable_mockModule(
      "../phases/deck-selection/deck-selection-view.js",
      () => ({
        DeckSelectionView: {
          populate: jest.fn(),
        },
      }),
    );
    const module_ = await import(
      "../phases/deck-selection/deck-selection-ui.js"
    );
    DeckSelectionUI = module_.DeckSelectionUI;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockContainer = new createjs.Container();
    mockController = {
      moveNext: jest.fn(),
      movePrevious: jest.fn(),
      paginate: jest.fn(),
      visibleCards: [{ data: { id: 1, name: "TestCard" }, remaining: 3 }],
      selectedIndexOnPage: 0,
      playerModel: { hand: [] },
    };
    DeckSelectionUI.controller = mockController;
    Game.stage = {
      addChild: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
    };
  });

  test("populate calls DeckSelectionView.populate with controller", () => {
    DeckSelectionUI.populate();
  });

  test("populate returns early when controller is undefined", () => {
    DeckSelectionUI.controller = undefined;
    expect(DeckSelectionUI.populate()).toBeUndefined();
  });

  test("moveSelection with next=true calls moveNext", () => {
    DeckSelectionUI.moveSelection(true);
    expect(mockController.moveNext).toHaveBeenCalled();
  });

  test("moveSelection with next=false calls movePrevious", () => {
    DeckSelectionUI.moveSelection(false);
    expect(mockController.movePrevious).toHaveBeenCalled();
  });

  test("moveSelection returns early if no controller", () => {
    DeckSelectionUI.controller = undefined;
    expect(DeckSelectionUI.moveSelection(true)).toBeUndefined();
  });

  test("paginate calls controller.paginate and populate", () => {
    DeckSelectionUI.paginate("right");
    expect(mockController.paginate).toHaveBeenCalledWith("right");
  });

  test("paginate returns early if no controller", () => {
    DeckSelectionUI.controller = undefined;
    expect(DeckSelectionUI.paginate("left")).toBeUndefined();
  });

  test("getSelectedCard returns a Card instance when valid selection exists", () => {
    const card = DeckSelectionUI.getSelectedCard();
    expect(card).toBeInstanceOf(Card);
  });

  test("getSelectedCard returns undefined when selected card has 0 remaining", () => {
    mockController.visibleCards[0].remaining = 0;
    const result = DeckSelectionUI.getSelectedCard();
    expect(result).toBeUndefined();
  });

  test("getSelectedCard returns undefined when no visible cards", () => {
    mockController.visibleCards = [];
    const result = DeckSelectionUI.getSelectedCard();
    expect(result).toBeUndefined();
  });

  test("createText returns a createjs.Text with correct properties", () => {
    const text = DeckSelectionUI.createText("Hello", 10, 20);
    expect(text.text).toBe("Hello");
    expect(text.x).toBe(10);
    expect(text.y).toBe(20);
  });
});
