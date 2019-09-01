<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/timer.php                                                                          |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

	if ($config["time"]["during"] <= 0)
		stop(101, "Not in Contest mode.", 200, Array(
			"during" => $config["time"]["during"],
			"phase" => 0
		));

	$beginTime = $config["time"]["begin"]["times"];
	$duringTime = $config["time"]["during"] * 60;
	$offsetTime = $config["time"]["offset"];
	$t = $beginTime - microtime(true) + $duringTime;

	if ($t > $duringTime) {
		$t -= $duringTime;
		$phase = 1;
	} else if ($t > 0) {
		$phase = 2;
	} else if ($t > -$offsetTime) {
		$t += $offsetTime;
		$phase = 3;
	} else {
		$t += $offsetTime;
		$phase = 4;
	}


	stop(0, "Thành công!", 200, Array(
		"phase" => $phase,
		"start" => $beginTime,
		"during" => $duringTime,
		"time" => $t,
		"offset" => $offsetTime
	));
?>