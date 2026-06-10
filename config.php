<?php
// This is a basic fallback loader for quick setups:
if (file_exists(__DIR__ . '/.env')) {
  $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    list($name, $value) = explode('=', $line, 2);
    $_ENV[trim($name)] = trim($value);
  }
}

return [
  'DB_HOST' => $_ENV['DB_HOST'] ?? 'localhost',
  'DB_NAME' => $_ENV['DB_NAME'] ?? '',
  'DB_USER' => $_ENV['DB_USER'] ?? '',
  'DB_PASS' => $_ENV['DB_PASS'] ?? '',
];
