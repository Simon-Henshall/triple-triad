<?php

/* COMING SOON

include_once 'variables.php';
 
function get_player_cards_json($mysqli) {
	$id = 1;
	$sql = 'SELECT * FROM `members_has_cards` WHERE `members_id` = ' . $id;
	$result = $mysqli->query($sql);
	$numResults = $result->num_rows;
	$i = 0;
	echo '[';
	while($row = $result->fetch_array()) {
		echo '{';
		echo '"card": ' . $row['cards_id'] . ', ';
		echo '"image": ' . '"card' . ($row['cards_id'] - 1) . '", ';
		echo '"count": ' . $row['count'];
		if($i == $numResults - 1) {
			echo '}';
		}
		else {
			echo '}, ';
		}
		
		$i++;
	}
	echo ']';
}

*/