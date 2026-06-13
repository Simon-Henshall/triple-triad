<?php

ini_set('display_errors', 0);
error_reporting(E_ALL);

// 1. Set required API headers
header("Content-Type: application/json; charset=UTF-8");

// 2. Load database dependencies
require_once __DIR__ . '/../../back_end/src/Database.php';

use TripleTriad\Database;

// 3. Initialise the response structure
$response = [
  "success" => false,
  "message" => "",
  "cards"   => []
];

try {
  // 4. Connect to the database
  $db   = new Database();
  $conn = $db->connect();

  // 5. Query all cards
  $sql = "
    SELECT
      c.id,
      c.display_name,
      c.image,
      c.strength_up,
      c.strength_right,
      c.strength_down,
      c.strength_left,
      c.element_id,
      e.name               AS element_name,
      e.image_path         AS element_image
    FROM card c
    LEFT JOIN element e   ON e.id = c.element_id
    ORDER BY c.id ASC
  ";

  $stmt = $conn->prepare($sql);
  $stmt->execute();
  $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // 6. Cast numeric fields to proper types so JSON output is numeric
  foreach ($cards as &$card) {
    $card["id"]            = (int) $card["id"];
    $card["strength_up"]   = (int) $card["strength_up"];
    $card["strength_right"] = (int) $card["strength_right"];
    $card["strength_down"] = (int) $card["strength_down"];
    $card["strength_left"] = (int) $card["strength_left"];
    $card["element_id"]    = (int) $card["element_id"];
  }
  unset($card);

  http_response_code(200);
  $response["success"] = true;
  $response["message"] = "Cards retrieved successfully.";
  $response["cards"]   = $cards;
} catch (PDOException $e) {
  http_response_code(500);

  $logFile = __DIR__ . '/../logs/db_errors.log';
  $timestamp = date('[Y-m-d H:i:s]');
  $logMessage = "{$timestamp} Database Error: " . $e->getMessage() . PHP_EOL;
  error_log($logMessage, 3, $logFile);

  $response["message"] = "A database connection error occurred.";
}

// 7. Output the JSON response
echo json_encode($response);
exit();
