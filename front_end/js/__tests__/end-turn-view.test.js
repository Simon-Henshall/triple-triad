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

  test("constructor creates instance with stage reference", () => {
    const stage = new createjs.Stage();
    const view = new EndTurnView(stage);
    expect(view.stage).toBe(stage);
  });

  test("activate does not throw", () => {
    const stage = new createjs.Stage();
    const view = new EndTurnView(stage);
    expect(() => view.activate()).not.toThrow();
  });

  test("deactivate does not throw", () => {
    const stage = new createjs.Stage();
    const view = new EndTurnView(stage);
    expect(() => view.deactivate()).not.toThrow();
  });
});
