/**
 * @module input-model
 * @description Unit tests for InputModel
 */

import { jest } from "@jest/globals";

describe("InputModel", () => {
  let InputModel;

  beforeAll(async () => {
    const module_ = await import("../shared/input/input-model.js");
    InputModel = module_.default || module_.InputModel;
  });

  test("InputModel is defined", () => {
    expect(InputModel).toBeDefined();
  });

  test("InputModel exists in the module", () => {
    // InputModel is a class, so typeof is "function"
    expect(typeof InputModel).toBe("function");
  });
});
