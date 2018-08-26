<?php
	// |====================================================|
    // |                     timer.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belipack.php";
	require_once $_SERVER["DOCUMENT_ROOT"]."/config.php";

	function tparse($t = 0) {
		$h = ($t - $t % 3600) / 3600;
		$t =  $t % 3600;
		$m = ($t - $t % 60)/60;
		$s = $t % 60;
		return Array(
			"h" => $h,
			"m" => $m,
			"s" => $s
		);
	}

	$t = $beginTime - time() + ($duringTime * 60);

	if ($t > $duringTime * 60) {
		$t -= $duringTime * 60;
		$d = tparse($t);
		$stage = 1;
	} else if ($t > 0) {
		$d = tparse($t);
		$stage = 2;
	} else if ($t > -$bonusTime) {
		$t += $bonusTime;
		$d = tparse($t);
		$stage = 3;
	} else {
		$t += $bonusTime;
		$d = tparse(0);
		$stage = 4;
	}


	stop(0, "Success", 200, Array(
		"t" => $t,
		"h" => $d["h"],
		"m" => $d["m"],
		"s" => $d["s"],
		"d" => $duringTime*60,
		"b" => $bonusTime,
		"stage" => $stage
	));
?>