/**
 * @module hand-select-view
 * @description Unit tests for HandSelectView
 */

import { jest } from "@jest/globals";

describe("HandSelectView", () => {
  let HandSelectView;

  beforeAll(async () => {
    const module_ = await import("../phases/hand-select/hand-select-view.js");
    HandSelectView = module_.default;
  });

  test("constructor stores playerModel", () => {
    const playerModel = { hand: [] };
    const view = new HandSelectView(playerModel);
    expect(view.playerModel).toBe(playerModel);
  });
});
