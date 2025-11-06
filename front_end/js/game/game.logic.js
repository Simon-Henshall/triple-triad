class GameLogic {
  canFlip(attackerCard, defenderCard, direction) {
    if (!attackerCard || !defenderCard) {
      return false;
    }

    const strengthMap = {
      up: ["strengthUp", "strengthDown"],
      down: ["strengthDown", "strengthUp"],
      left: ["strengthLeft", "strengthRight"],
      right: ["strengthRight", "strengthLeft"],
    };

    const map = strengthMap[direction];
    if (!map) {
      throw new Error("Invalid direction: " + direction);
    }

    const [attackerStat, defenderStat] = map;
    return attackerCard[attackerStat] > defenderCard[defenderStat];
  }

  getFlippableNeighbours(board, x, y) {
    const attacker = board[y][x];
    if (!attacker) {
      return [];
    }

    const directions = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };

    const flips = [];

    for (const [dir, [dx, dy]] of Object.entries(directions)) {
      const nx = x + dx;
      const ny = y + dy;

      if (ny < 0 || ny >= board.length || nx < 0 || nx >= board[0].length) {
        continue;
      }

      const defender = board[ny][nx];
      if (!defender) {
        continue;
      }

      // Only flip if enemy card and attacker beats defender
      if (
        attacker.owner !== defender.owner &&
        this.canFlip(attacker, defender, dir)
      ) {
        flips.push({ x: nx, y: ny });
      }
    }

    return flips;
  }

  applyFlips(board, flips, newOwner) {
    // Deep clone board to avoid mutating input
    const newBoard = board.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null)),
    );

    for (const { x, y } of flips) {
      const card = newBoard[y][x];
      if (card) {
        card.owner = newOwner;
      }
    }

    return newBoard;
  }

  playCard(board, x, y, card, currentPlayer) {
    // Ensure cell is empty
    if (board[y][x] !== null) {
      throw new Error("Cell already occupied");
    }

    // Clone board deeply
    const newBoard = board.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null)),
    );

    // Place the card
    newBoard[y][x] = { ...card, owner: currentPlayer };

    // Find flippable neighbours
    const flips = this.getFlippableNeighbours(newBoard, x, y);

    // Apply flips
    const finalBoard = this.applyFlips(newBoard, flips, currentPlayer);

    return finalBoard;
  }
}

export default GameLogic;
