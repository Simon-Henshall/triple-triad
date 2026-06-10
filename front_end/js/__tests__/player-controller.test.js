/**
 * @module player-controller
 * @description Unit tests for the PlayerController class.
 * Most of PlayerController delegates to the model/view, so we test
 * the delegation logic with mocks.
 */

import { jest } from "@jest/globals";
import { PlayerController } from "../shared/player/player-controller.js";

describe("PlayerController delegation", () => {
  let mockModel;
  let mockView;
  let controller;

  beforeEach(() => {
    jest.clearAllMocks();

    mockModel = {
      addCardToHand: jest.fn().mockReturnValue(true),
      removeLastCardFromHand: jest.fn().mockReturnValue({ id: 1 }),
      resetHand: jest.fn(),
      shiftCardsDown: jest.fn(),
      getHandCard: jest.fn(),
      hand: [],
      previouslySelectedCard: undefined,
    };

    mockView = {
      animateCardToHand: jest.fn(),
      indentSelectedCard: jest.fn(),
      resetHand: jest.fn(),
    };

    controller = new PlayerController(mockModel, mockView);
  });

  test("constructor stores model and view", () => {
    expect(controller.model).toBe(mockModel);
    expect(controller.view).toBe(mockView);
  });

  test("addCardToHand returns false when model returns false", () => {
    mockModel.addCardToHand.mockReturnValue(false);
    expect(controller.addCardToHand({})).toBe(false);
  });

  test("addCardToHand calls model and view when card is added", () => {
    const card = { visuals: { container: {} } };
    mockModel.hand = [card];
    expect(controller.addCardToHand(card)).toBe(true);
    expect(mockModel.addCardToHand).toHaveBeenCalledWith(card);
  });

  test("removeLastCardFromHand returns false when model returns false", () => {
    mockModel.removeLastCardFromHand.mockReturnValue(false);
    expect(controller.removeLastCardFromHand()).toBe(false);
  });

  test("removeLastCardFromHand returns the card from model", () => {
    const result = controller.removeLastCardFromHand();
    expect(result).toEqual({ id: 1 });
  });

  test("indentSelectedCard calls view and stores on model", () => {
    const card = { id: 5 };
    controller.indentSelectedCard(card);
    expect(mockView.indentSelectedCard).toHaveBeenCalledWith(card);
    expect(mockModel.previouslySelectedCard).toBe(card);
  });

  test("indentSelectedCard can clear selection with undefined", () => {
    controller.indentSelectedCard();
    expect(mockView.indentSelectedCard).toHaveBeenCalledWith(undefined);
    expect(mockModel.previouslySelectedCard).toBeUndefined();
  });

  test("resetHand calls model.resetHand and view.resetHand", () => {
    controller.resetHand();
    expect(mockModel.resetHand).toHaveBeenCalled();
    expect(mockView.resetHand).toHaveBeenCalled();
  });

  test("shiftCardsDown delegates to model", () => {
    controller.shiftCardsDown(10);
    expect(mockModel.shiftCardsDown).toHaveBeenCalledWith(10);
  });

  test("getHandCard delegates to model", () => {
    mockModel.getHandCard.mockReturnValue({ id: 1 });
    const result = controller.getHandCard(0);
    expect(result).toEqual({ id: 1 });
    expect(mockModel.getHandCard).toHaveBeenCalledWith(0);
  });
});
