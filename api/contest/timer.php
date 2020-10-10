<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/timer.php                                                                       |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
    require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";

	if (getConfig("time.contest.during") <= 0)
		stop(101, "Not in Contest mode.", 200, Array(
			"during" => getConfig("time.contest.during"),
			"phase" => 0
		));

	$beginTime = getConfig("time.contest.begin");
	$duringTime = getConfig("time.contest.during") * 60;
	$offsetTime = getConfig("time.contest.offset");
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