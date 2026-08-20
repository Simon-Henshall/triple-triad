<?php
// This is a basic fallback loader for quick setups:
if (file_exists(__DIR__ . '/.env')) {
  $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    if (strpos($line, '=') === false) continue;
    list($name, $value) = explode('=', $line, 2);
    $name = trim($name);
    if (getenv($name) === false) {
      $_ENV[$name] = trim($value);
    }
  }
}

$getConfigValue = static function (string $name, string $default = ''): string {
  $value = getenv($name);
  return $value !== false ? $value : ($_ENV[$name] ?? $default);
};

return [
  'DB_HOST' => $getConfigValue('DB_HOST', 'localhost'),
  'DB_NAME' => $getConfigValue('DB_NAME'),
  'DB_USER' => $getConfigValue('DB_USER'),
  'DB_PASS' => $getConfigValue('DB_PASS'),
];
