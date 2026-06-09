/**
 * @module ai-turn-view
 * @description Unit tests for AiTurnView
 */

import { jest } from "@jest/globals";

describe("AiTurnView", () => {
  let AiTurnView;

  beforeAll(async () => {
    const module_ = await import("../phases/ai-turn/ai-turn-view.js");
    AiTurnView = module_.AITurnView;
  });

  test("constructor creates instance with stage", () => {
    const stage = new createjs.Stage();
    const view = new AiTurnView(stage);
    expect(view.stage).toBe(stage);
  });

  test("activate does not throw", () => {
    const view = new AiTurnView();
    expect(() => view.activate()).not.toThrow();
  });

  test("deactivate does not throw", () => {
    const view = new AiTurnView();
    expect(() => view.deactivate()).not.toThrow();
  });
});
