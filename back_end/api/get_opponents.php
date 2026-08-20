<?php

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/bootstrap.php';
sendApiHeaders();
requireApiMethod('GET');
require_once __DIR__ . '/../src/Database.php';

use TripleTriad\Database;

$response = ['success' => false, 'message' => '', 'opponents' => []];

try {
  $conn = (new Database())->connect();
  $stmt = $conn->prepare(
    'SELECT p.id, p.name, p.location, p.unique_card_id
    FROM player p WHERE p.id != 1 ORDER BY p.location ASC, p.name ASC'
  );
  $stmt->execute();
  $opponents = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $levelStmt = $conn->prepare(
    'SELECT player_id, level FROM player_level ORDER BY player_id ASC, level ASC'
  );
  $levelStmt->execute();
  $levelMap = [];
  foreach ($levelStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $playerId = (int) $row['player_id'];
    $levelMap[$playerId][] = (int) $row['level'];
  }

  $grouped = [];
  foreach ($opponents as $opponent) {
    $opponent['id'] = (int) $opponent['id'];
    $opponent['unique_card_id'] = $opponent['unique_card_id'] !== null
      ? (int) $opponent['unique_card_id']
      : null;
    $opponent['levels'] = $levelMap[$opponent['id']] ?? [];
    $locationParts = explode(' - ', $opponent['location'] ?? 'Unknown', 2);
    $locationName = trim($locationParts[0]);
    $grouped[$locationName][] = $opponent;
  }

  $result = [];
  foreach ($grouped as $location => $players) {
    $result[] = ['name' => $location, 'players' => $players];
  }

  $response['success'] = true;
  $response['message'] = 'Opponents retrieved successfully.';
  $response['opponents'] = $result;
} catch (PDOException $exception) {
  http_response_code(500);
  logApiDatabaseError($exception);
  $response['message'] = 'A database connection error occurred.';
}

echo json_encode($response);
exit();
