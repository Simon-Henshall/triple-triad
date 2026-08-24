/*
 * @module card-claim-controller
 * @description Unit tests for CardClaimController
 */

import { jest } from "@jest/globals";
import CardClaimController from "../phases/card-claim/card-claim-controller.js";
import { Game } from "../shared/game/game.js";

describe("CardClaimController", () => {
  let transitionMock;
  let cards;
  beforeEach(() => {
    jest.clearAllMocks();
    transitionMock = jest.fn();
    cards = [{ data: { id: 1, name: "Card A" } }];
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
      canvas: { width: 800, height: 600 },
    };
    Game.models = { playerModel: { deck: [] } };
  });

  test("constructor sets model and view", () => {
    const ctrl = new CardClaimController(
      { aiInitialCards: cards },
      transitionMock,
    );
    expect(ctrl.model.aiInitialCards).toBe(cards);
    expect(ctrl.transition).toBe(transitionMock);
  });

  test("constructor with no deps", () => {
    const ctrl = new CardClaimController();
    expect(ctrl.model.aiInitialCards).toEqual([]);
  });

  test("deactivate calls view cleanup", async () => {
    const ctrl = new CardClaimController({}, transitionMock);
    ctrl.view = { cleanup: jest.fn() };
    await ctrl.deactivate();
    expect(ctrl.view.cleanup).toHaveBeenCalled();
  });

  test("activate builds the view and attaches the key handler", async () => {
    const ctrl = new CardClaimController({}, transitionMock);
    ctrl.view.build = jest.fn().mockResolvedValue();
    ctrl._attachKeyHandler = jest.fn();

    await ctrl.activate();

    expect(ctrl.view.build).toHaveBeenCalledWith(
      ctrl.model.aiInitialCards,
      ctrl.model.selectedIndex,
    );
    expect(ctrl._attachKeyHandler).toHaveBeenCalled();
  });

  test("_attachKeyHandler does not re-attach", () => {
    const ctrl = new CardClaimController({}, transitionMock);
    ctrl._attachKeyHandler();
    const h = ctrl._keyHandler;
    ctrl._attachKeyHandler();
    expect(ctrl._keyHandler).toBe(h);
  });

  test("_detachKeyHandler removes handler", () => {
    const ctrl = new CardClaimController({}, transitionMock);
    ctrl._attachKeyHandler();
    ctrl._detachKeyHandler();
    expect(ctrl._keyHandler).toBeUndefined();
  });

  test("_detachKeyHandler does nothing when no handler", () => {
    const ctrl = new CardClaimController({}, transitionMock);
    expect(() => ctrl._detachKeyHandler()).not.toThrow();
  });

  test("keyboard handler navigates, claims, skips, and ignores other keys", () => {
    const ctrl = new CardClaimController({}, transitionMock);
    ctrl.model.selectPrev = jest.fn();
    ctrl.model.selectNext = jest.fn();
    ctrl.view.updateSelection = jest.fn();
    ctrl._claimCard = jest.fn();
    ctrl._skipClaim = jest.fn();
    ctrl._attachKeyHandler();
    const handler = document.addEventListener.mock.calls.at(-1)[1];
    const event = { preventDefault: jest.fn() };

    handler({ ...event, key: "ArrowLeft" });
    handler({ ...event, key: "ArrowRight" });
    handler({ ...event, key: "Enter" });
    handler({ ...event, key: "Escape" });
    handler({ ...event, key: "Other" });

    expect(ctrl.model.selectPrev).toHaveBeenCalled();
    expect(ctrl.model.selectNext).toHaveBeenCalled();
    expect(ctrl.view.updateSelection).toHaveBeenCalledTimes(2);
    expect(ctrl._claimCard).toHaveBeenCalled();
    expect(ctrl._skipClaim).toHaveBeenCalled();
  });

  test("_claimCard with no card logs warning", () => {
    const ctrl = new CardClaimController({}, transitionMock);
    ctrl._claimCard();
    expect(console.warn).toHaveBeenCalled();
  });

  test("_claimCard adds clone to player deck", () => {
    const card = {
      data: { id: 1, name: "Card A" },
      clone: jest.fn().mockReturnValue({ data: { id: 1, name: "Clone A" } }),
    };
    const ctrl = new CardClaimController(
      { aiInitialCards: [card] },
      transitionMock,
    );
    ctrl.view = { animateClaim: jest.fn() };
    ctrl._claimCard();
    expect(card.clone).toHaveBeenCalledWith({ owner: "player", count: 1 });
    expect(Game.models.playerModel.deck).toHaveLength(1);
  });

  test("_skipClaim does not throw", () => {
    const ctrl = new CardClaimController({}, transitionMock);
    ctrl.deactivate = jest.fn();
    expect(() => ctrl._skipClaim()).not.toThrow();
  });
});
