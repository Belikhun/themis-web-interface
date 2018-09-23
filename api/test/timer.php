<?php
	// |====================================================|
    // |                     timer.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

	if ($config["time"]["during"] <= 0)
		stop(101, "Unlimited Time.", 200, Array(
			"during" => $config["time"]["during"],
			"stage" => 0
		));

	$beginTime = $config["time"]["begin"]["times"];
	$duringTime = $config["time"]["during"];
	$offsetTime = $config["time"]["offset"];
	$t = $beginTime - time() + ($duringTime * 60);

	if ($t > $duringTime * 60) {
		$t -= $duringTime * 60;
		$stage = 1;
	} else if ($t > 0) {
		$stage = 2;
	} else if ($t > -$offsetTime) {
		$t += $offsetTime;
		$stage = 3;
	} else {
		$t += $offsetTime;
		$stage = 4;
	}


	stop(0, "Thành công!", 200, Array(
		"time" => $t,
		"during" => $duringTime * 60,
		"offset" => $offsetTime,
		"stage" => $stage
	));
?>