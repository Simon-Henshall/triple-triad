/**
 * @module ai-turn-controller
 * @description Unit tests for AiTurnController
 */

import { jest } from "@jest/globals";

describe("AiTurnController", () => {
  let AiTurnController;

  beforeAll(async () => {
    const module_ = await import("../phases/ai-turn/ai-turn-controller.js");
    AiTurnController = module_.AITurnController;
  });

  test("constructor creates instance with deps", () => {
    const deps = { playerModel: {}, aiTurnModel: {}, boardModel: {} };
    const ctrl = new AiTurnController(deps, jest.fn());
    expect(ctrl.transition).toBeDefined();
  });
});
