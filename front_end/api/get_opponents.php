<?php

ini_set('display_errors', 0);
error_reporting(E_ALL);

// 1. Set required API headers
require_once __DIR__ . '/bootstrap.php';
sendApiHeaders();
requireApiMethod('GET');

// 2. Load database dependencies
require_once __DIR__ . '/../../back_end/src/Database.php';

use TripleTriad\Database;

// 3. Initialise the response structure
$response = [
  "success" => false,
  "message" => "",
  "opponents" => []
];

try {
  // 4. Connect to the database
  $db   = new Database();
  $conn = $db->connect();

  // 5. Query all opponents (excluding player 1) with their allowed levels
  $sql = "
    SELECT
      p.id,
      p.name,
      p.location,
      p.unique_card_id
    FROM player p
    WHERE p.id != 1
    ORDER BY p.location ASC, p.name ASC
  ";

  $stmt = $conn->prepare($sql);
  $stmt->execute();
  $opponents = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // 6. Query player levels for all opponents
  $levelSql = "
    SELECT player_id, level
    FROM player_level
    ORDER BY player_id ASC, level ASC
  ";
  $levelStmt = $conn->prepare($levelSql);
  $levelStmt->execute();
  $playerLevels = $levelStmt->fetchAll(PDO::FETCH_ASSOC);

  // Build a map of player_id => [levels]
  $levelMap = [];
  foreach ($playerLevels as $row) {
    $pid = (int) $row['player_id'];
    if (!isset($levelMap[$pid])) {
      $levelMap[$pid] = [];
    }
    $levelMap[$pid][] = (int) $row['level'];
  }

  // 7. Group opponents by location
  $grouped = [];
  foreach ($opponents as $opponent) {
    $opponent['id'] = (int) $opponent['id'];
    $opponent['unique_card_id'] = $opponent['unique_card_id'] !== null ? (int) $opponent['unique_card_id'] : null;
    $opponent['levels'] = $levelMap[$opponent['id']] ?? [];

    // Extract the location name (everything before the ' - ')
    $fullLocation = $opponent['location'] ?? 'Unknown';
    $parts = explode(' - ', $fullLocation, 2);
    $locationName = trim($parts[0]);

    if (!isset($grouped[$locationName])) {
      $grouped[$locationName] = [];
    }
    $grouped[$locationName][] = $opponent;
  }

  // Convert grouped object to array format
  $result = [];
  foreach ($grouped as $location => $players) {
    $result[] = [
      'name' => $location,
      'players' => $players,
    ];
  }

  http_response_code(200);
  $response["success"] = true;
  $response["message"] = "Opponents retrieved successfully.";
  $response["opponents"] = $result;
} catch (PDOException $e) {
  http_response_code(500);

  logApiDatabaseError($e);

  $response["message"] = "A database connection error occurred.";
}

// 8. Output the JSON response
echo json_encode($response);
exit();
