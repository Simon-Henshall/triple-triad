<?php require_once __DIR__ . '/../config.php'; ?>

<div id="game">
  <canvas id="gameArea" width="950" height="650"></canvas>
  <?php include_once __DIR__ . '/rules-panel.html'; ?>
</div>

<script type="module" src="front_end/build/main.js"></script>