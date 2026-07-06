/*
 * @module opponent-selection-model
 * @description Unit tests for OpponentSelectionModel
 */

import OpponentSelectionModel from "../phases/opponent-selection/opponent-selection-model.js";

describe("OpponentSelectionModel", () => {
  let locations;
  beforeEach(() => {
    locations = [
      {
        name: "Balamb",
        players: [
          { id: 1, name: "A" },
          { id: 2, name: "B" },
        ],
      },
      {
        name: "Galbadia",
        players: [
          { id: 3, name: "C" },
          { id: 4, name: "D" },
          { id: 5, name: "E" },
        ],
      },
      { name: "Empty", players: [] },
    ];
  });

  test("constructor defaults", () => {
    const m = new OpponentSelectionModel(locations);
    expect(m.locationIndex).toBe(0);
    expect(m.playerIndex).toBe(0);
  });

  test("empty locations", () => {
    const m = new OpponentSelectionModel();
    expect(m.totalLocations).toBe(0);
    expect(m.currentLocation).toBeUndefined();
  });

  test("totalLocations", () => {
    expect(new OpponentSelectionModel(locations).totalLocations).toBe(3);
  });

  test("currentLocation first", () => {
    expect(new OpponentSelectionModel(locations).currentLocation.name).toBe(
      "Balamb",
    );
  });

  test("currentPlayerList", () => {
    expect(
      new OpponentSelectionModel(locations).currentPlayerList,
    ).toHaveLength(2);
  });

  test("empty player list", () => {
    const m = new OpponentSelectionModel(locations);
    m.locationIndex = 2;
    expect(m.currentPlayerList).toEqual([]);
  });

  test("totalPlayers", () => {
    expect(new OpponentSelectionModel(locations).totalPlayers).toBe(2);
  });

  test("selectedPlayer first", () => {
    expect(new OpponentSelectionModel(locations).selectedPlayer.id).toBe(1);
  });

  test("selectedPlayer undefined when empty", () => {
    const m = new OpponentSelectionModel(locations);
    m.locationIndex = 2;
    expect(m.selectedPlayer).toBeUndefined();
  });

  test("nextLocation", () => {
    const m = new OpponentSelectionModel(locations);
    m.nextLocation();
    expect(m.locationIndex).toBe(1);
    expect(m.playerIndex).toBe(0);
  });

  test("nextLocation wraps", () => {
    const m = new OpponentSelectionModel(locations);
    m.locationIndex = 2;
    m.nextLocation();
    expect(m.locationIndex).toBe(0);
  });

  test("nextLocation empty", () => {
    const m = new OpponentSelectionModel();
    m.nextLocation();
    expect(m.locationIndex).toBe(0);
  });

  test("prevLocation", () => {
    const m = new OpponentSelectionModel(locations);
    m.locationIndex = 1;
    m.prevLocation();
    expect(m.locationIndex).toBe(0);
  });

  test("prevLocation wraps", () => {
    const m = new OpponentSelectionModel(locations);
    m.prevLocation();
    expect(m.locationIndex).toBe(2);
  });

  test("prevLocation empty", () => {
    const m = new OpponentSelectionModel();
    m.prevLocation();
    expect(m.locationIndex).toBe(0);
  });

  test("nextPlayer increments", () => {
    const m = new OpponentSelectionModel(locations);
    m.nextPlayer();
    expect(m.playerIndex).toBe(1);
  });

  test("nextPlayer clamps", () => {
    const m = new OpponentSelectionModel(locations);
    m.playerIndex = 1;
    m.nextPlayer();
    expect(m.playerIndex).toBe(1);
  });

  test("nextPlayer empty list", () => {
    const m = new OpponentSelectionModel(locations);
    m.locationIndex = 2;
    m.nextPlayer();
    expect(m.playerIndex).toBe(0);
  });

  test("prevPlayer decrements", () => {
    const m = new OpponentSelectionModel(locations);
    m.playerIndex = 1;
    m.prevPlayer();
    expect(m.playerIndex).toBe(0);
  });

  test("prevPlayer clamps", () => {
    const m = new OpponentSelectionModel(locations);
    m.prevPlayer();
    expect(m.playerIndex).toBe(0);
  });

  test("handleInput left returns false", () => {
    expect(new OpponentSelectionModel(locations).handleInput("left")).toBe(
      false,
    );
  });

  test("handleInput right returns false", () => {
    expect(new OpponentSelectionModel(locations).handleInput("right")).toBe(
      false,
    );
  });

  test("handleInput up returns false", () => {
    expect(new OpponentSelectionModel(locations).handleInput("up")).toBe(false);
  });

  test("handleInput down returns false", () => {
    expect(new OpponentSelectionModel(locations).handleInput("down")).toBe(
      false,
    );
  });

  test("handleInput confirm returns true", () => {
    expect(new OpponentSelectionModel(locations).handleInput("confirm")).toBe(
      true,
    );
  });

  test("handleInput unknown returns false", () => {
    expect(new OpponentSelectionModel(locations).handleInput("unknown")).toBe(
      false,
    );
  });
});
