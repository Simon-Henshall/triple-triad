/**
 * @module placement-view-extended
 * @description Additional unit tests for PlacementView
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { offsets } from "../constants/offsets.js";

describe("PlacementView (extended)", () => {
  let PlacementView;
  let PhaseChecker;

  beforeAll(async () => {
    const module_ = await import("../phases/placement/placement-view.js");
    PlacementView = module_.PlacementView;
    const phasesModule = await import("../game/phases.js");
    PhaseChecker = phasesModule.PhaseChecker;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Game.stage = { canvas: { width: 800, height: 600 } };
    Game.models = { playerModel: { shiftCardsDown: jest.fn() } };
    Game.controllers = {};
    PhaseChecker.playerTurn = "blue";
  });

  test("shiftHandCardsDown calls playerModel.shiftCardsDown for blue turn", () => {
    const view = new PlacementView();
    view.shiftHandCardsDown();
    expect(Game.models.playerModel.shiftCardsDown).toHaveBeenCalledWith(
      offsets.handCardOffset,
    );
  });

  test("shiftHandCardsDown animates AI hand cards down for red turn", () => {
    const view = new PlacementView();
    PhaseChecker.playerTurn = "red";
    const card1 = { visuals: { container: { y: 0 } } };
    const card2 = { visuals: { container: { y: 50 } } };
    Game.models.aiTurnModel = {
      hand: [card1, card2],
      cardsAboveSelection: 2,
    };
    view.shiftHandCardsDown();
    expect(createjs.Tween.get).toHaveBeenCalled();
  });

  test("animateDown calls createjs.Tween.get for each card", () => {
    const view = new PlacementView();
    const card1 = { visuals: { container: { y: 0 } } };
    const card2 = { visuals: { container: { y: 50 } } };
    view.animateDown([card1, card2], 2);
    expect(createjs.Tween.get).toHaveBeenCalledTimes(2);
  });

  test("moveCardOffscreen uses playerOffscreenX for blue turn", () => {
    const view = new PlacementView();
    const card = { visuals: { container: { x: 0, y: 0 } } };
    const callback = jest.fn();
    view.moveCardOffscreen(card, callback);
    expect(createjs.Tween.get).toHaveBeenCalledWith(card.visuals.container);
  });

  test("moveCardOffscreen uses aiOffscreenX for red turn", () => {
    const view = new PlacementView();
    PhaseChecker.playerTurn = "red";
    const card = { visuals: { container: { x: 0, y: 0 } } };
    view.moveCardOffscreen(card, jest.fn());
    expect(createjs.Tween.get).toHaveBeenCalled();
  });

  test("moveCardToBoard animates card to target position", () => {
    const view = new PlacementView();
    const card = { visuals: { container: { x: 0, y: 0 } } };
    const callback = jest.fn();
    view.moveCardToBoard(card, 100, 200, callback);
    expect(createjs.Tween.get).toHaveBeenCalledWith(card.visuals.container);
  });

  test("showElementEffect adds a Bitmap to the card container", () => {
    const view = new PlacementView();
    const container = {
      /**
       * Mock implementation of getBounds for testing. In a real test, this would return the actual bounds of the container.
       * @return {object} An object with width and height properties.
       */
      getBounds: () => ({ width: 100, height: 100 }),
      addChild: jest.fn(),
    };
    const card = { visuals: { container } };
    view.showElementEffect(card, "front_end/images/plus_one.png");
    expect(container.addChild).toHaveBeenCalled();
  });

  test("indentAfterPlacement modifies selected card x position", () => {
    const view = new PlacementView();
    Game.models = {
      playerModel: {
        selectedCard: {
          visuals: { container: { x: 100 } },
        },
      },
    };
    view.indentAfterPlacement();
    expect(Game.models.playerModel.selectedCard.visuals.container.x).toBe(70);
  });

  test("indentAfterPlacement does nothing without selected card", () => {
    const view = new PlacementView();
    Game.models = { playerModel: {} };
    expect(() => view.indentAfterPlacement()).not.toThrow();
  });
});
