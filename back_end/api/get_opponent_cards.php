<?php

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/bootstrap.php';
sendApiHeaders();
requireApiMethod('POST');
require_once __DIR__ . '/../src/Database.php';

use TripleTriad\Database;

$response = ['success' => false, 'message' => '', 'cards' => [], 'rare_card' => null];
$input = readJsonBody();

if (!$input || !isset($input['player_id']) || filter_var($input['player_id'], FILTER_VALIDATE_INT) === false) {
  http_response_code(400);
  $response['message'] = 'Missing or invalid parameter: player_id.';
  echo json_encode($response);
  exit();
}

$uniqueCardId = $input['unique_card_id'] ?? null;
if ($uniqueCardId !== null && filter_var($uniqueCardId, FILTER_VALIDATE_INT) === false) {
  http_response_code(400);
  $response['message'] = 'Invalid parameter: unique_card_id.';
  echo json_encode($response);
  exit();
}

try {
  $conn = (new Database())->connect();
  $stmt = $conn->prepare(
    'SELECT c.id, c.display_name, c.image, c.strength_up, c.strength_right,
      c.strength_down, c.strength_left, c.element_id, e.name AS element_name,
      e.image_path AS element_image
    FROM card c LEFT JOIN element e ON e.id = c.element_id
    INNER JOIN player_level pl ON pl.level = c.level
    WHERE pl.player_id = :player_id ORDER BY c.level ASC, c.id ASC'
  );
  $stmt->bindValue(':player_id', (int) $input['player_id'], PDO::PARAM_INT);
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

  if ($uniqueCardId !== null) {
    $rareStmt = $conn->prepare(
      'SELECT c.id, c.display_name, c.image, c.strength_up, c.strength_right,
        c.strength_down, c.strength_left, c.element_id, e.name AS element_name,
        e.image_path AS element_image
      FROM card c LEFT JOIN element e ON e.id = c.element_id
      WHERE c.id = :unique_card_id LIMIT 1'
    );
    $rareStmt->bindValue(':unique_card_id', (int) $uniqueCardId, PDO::PARAM_INT);
    $rareStmt->execute();
    $rareCard = $rareStmt->fetch(PDO::FETCH_ASSOC);
    if ($rareCard) {
      $rareCard['id'] = (int) $rareCard['id'];
      $rareCard['strength_up'] = (int) $rareCard['strength_up'];
      $rareCard['strength_right'] = (int) $rareCard['strength_right'];
      $rareCard['strength_down'] = (int) $rareCard['strength_down'];
      $rareCard['strength_left'] = (int) $rareCard['strength_left'];
      $rareCard['element_id'] = (int) $rareCard['element_id'];
    }
    $response['rare_card'] = $rareCard ?: null;
  }

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
