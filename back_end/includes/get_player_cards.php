<?php
//include_once 'db_connect.php';
include_once 'functions.php';
 
//sec_session_start(); // Our custom secure way of starting a PHP session

get_player_cards_json($mysqli); // Get the cards that the player owns