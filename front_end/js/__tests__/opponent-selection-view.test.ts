import { jest } from "@jest/globals";
import { OpponentSelectionView } from "../phases/opponent-selection/opponent-selection-view.js";
import { Game } from "../shared/game/game.js";

describe("OpponentSelectionView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    OpponentSelectionView.container = undefined;
    OpponentSelectionView.background = undefined;
    OpponentSelectionView.model = undefined;
    Game.models = {};
  });

  test("draws an empty dialog with fallback location", () => {
    OpponentSelectionView.show();

    expect(OpponentSelectionView.container.children.length).toBeGreaterThan(0);
    expect(OpponentSelectionView.background.graphics.clear).toHaveBeenCalled();
    expect(createjs.Text).toHaveBeenCalledWith(
      "Location: Unknown",
      "bold 16px Arial",
      "#cccccc",
    );
  });

  test("renders visible players and navigation indicators", () => {
    const players = Array.from({ length: 8 }, (_, index) => ({
      name: `Player ${index}`,
      location: "Balamb",
    }));
    const cursor = new createjs.Container();
    OpponentSelectionView.model = {
      currentLocation: { name: "Balamb" },
      currentPlayerList: players,
      playerIndex: 6,
      totalLocations: 2,
      selectedPlayer: players[6],
    };
    Game.models = { playerModel: { playerHandSelectionCursor: cursor } };

    OpponentSelectionView.drawDialog();

    expect(OpponentSelectionView.container.children).toContain(cursor);
    expect(cursor.x).toBe(260);
    expect(cursor.y).toBe(405);
    expect(createjs.Text).toHaveBeenCalledWith(
      "Player 6",
      "20px Arial",
      "#ffffff",
    );
    expect(createjs.Text).toHaveBeenCalledWith("▲", "12px Arial", "#cccccc");
    expect(createjs.Text).toHaveBeenCalledWith("▼", "12px Arial", "#cccccc");
    expect(createjs.Text).toHaveBeenCalledWith("◀", "12px Arial", "#cccccc");
    expect(createjs.Text).toHaveBeenCalledWith("▶", "12px Arial", "#cccccc");
  });

  test("hide clears the dialog and refresh redraws it", () => {
    OpponentSelectionView.model = {
      currentLocation: { name: "Dollet" },
      currentPlayerList: [{ name: "Player A" }],
    };

    OpponentSelectionView.show();
    const drawDialog = jest.spyOn(OpponentSelectionView, "drawDialog");
    OpponentSelectionView.refresh();
    OpponentSelectionView.hide();

    expect(drawDialog).toHaveBeenCalled();
    expect(OpponentSelectionView.container.children).toHaveLength(0);
  });
});
