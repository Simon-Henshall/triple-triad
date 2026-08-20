<?php

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/bootstrap.php';
sendApiHeaders();
requireApiMethod('GET');
require_once __DIR__ . '/../src/Database.php';

use TripleTriad\Database;

$response = [
  'success' => false,
  'message' => '',
  'cards' => [],
];

try {
  $conn = (new Database())->connect();
  $stmt = $conn->prepare(
    'SELECT c.id, c.display_name, c.image, c.strength_up, c.strength_right,
      c.strength_down, c.strength_left, c.element_id, e.name AS element_name,
      e.image_path AS element_image
    FROM card c LEFT JOIN element e ON e.id = c.element_id ORDER BY c.id ASC'
  );
  $stmt->execute();
  $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

  foreach ($cards as &$card) {
    $card['id'] = (int) $card['id'];
    $card['strength_up'] = (int) $card['strength_up'];
    $card['strength_right'] = (int) $card['strength_right'];
    $card['strength_down'] = (int) $card['strength_down'];
    $card['strength_left'] = (int) $card['strength_left'];
    $card['element_id'] = (int) $card['element_id'];
  }
  unset($card);

  $response['success'] = true;
  $response['message'] = 'Cards retrieved successfully.';
  $response['cards'] = $cards;
} catch (PDOException $exception) {
  http_response_code(500);
  logApiDatabaseError($exception);
  $response['message'] = 'A database connection error occurred.';
}

echo json_encode($response);
exit();
