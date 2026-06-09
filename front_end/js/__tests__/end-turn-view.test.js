/**
 * @module end-turn-view
 * @description Unit tests for EndTurnView
 */

import { jest } from "@jest/globals";

describe("EndTurnView", () => {
  let EndTurnView;

  beforeAll(async () => {
    const module_ = await import("../phases/end-turn/end-turn-view.js");
    EndTurnView = module_.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("constructor stores stage reference", () => {
    const stage = { addChild: jest.fn() };
    const view = new EndTurnView(stage);
    expect(view.stage).toBe(stage);
  });

  test("show does not throw", () => {
    const view = new EndTurnView({});
    expect(() => view.show()).not.toThrow();
  });

  test("hide does not throw", () => {
    const view = new EndTurnView({});
    expect(() => view.hide()).not.toThrow();
  });

  test("activate calls show", () => {
    const view = new EndTurnView({});
    const showSpy = jest.spyOn(view, "show");
    view.activate();
    expect(showSpy).toHaveBeenCalled();
  });

  test("deactivate calls hide", () => {
    const view = new EndTurnView({});
    const hideSpy = jest.spyOn(view, "hide");
    view.deactivate();
    expect(hideSpy).toHaveBeenCalled();
  });
});
