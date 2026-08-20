<?php

function sendApiHeaders(): void
{
  header('Content-Type: application/json; charset=UTF-8');
  header('X-Content-Type-Options: nosniff');
  header('Referrer-Policy: no-referrer');
  header('Cache-Control: no-store');
}

function requireApiMethod(string $method): void
{
  if ($_SERVER['REQUEST_METHOD'] === $method) {
    return;
  }

  http_response_code(405);
  header('Allow: ' . $method);
  echo json_encode([
    'success' => false,
    'message' => 'Method not allowed.',
  ]);
  exit();
}

function readJsonBody(): ?array
{
  $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
  if ($contentLength > 16384) {
    http_response_code(413);
    echo json_encode([
      'success' => false,
      'message' => 'Request body is too large.',
    ]);
    exit();
  }

  $input = json_decode(file_get_contents('php://input'), true);
  return is_array($input) ? $input : null;
}

function logApiDatabaseError(PDOException $exception): void
{
  error_log(sprintf(
    '[%s] Database Error: %s',
    date('Y-m-d H:i:s'),
    $exception->getMessage()
  ));
}
