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
