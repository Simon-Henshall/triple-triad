<?php
header("X-Content-Type-Options: nosniff");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Permissions-Policy: camera=(), geolocation=(), microphone=()");
header("Content-Security-Policy: default-src 'self'; script-src 'self' https://code.jquery.com https://maxcdn.bootstrapcdn.com https://code.createjs.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maxcdn.bootstrapcdn.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
include('header.php');
?>
<?php include_once("front_end/game.php"); ?>
<?php include('footer.php'); ?>