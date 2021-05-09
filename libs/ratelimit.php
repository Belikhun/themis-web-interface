<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /libs/ratelimit.php                                                                          |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/cache.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";

	if (getConfig("ratelimit.enabled")) {
		$maxRequest = getConfig("ratelimit.maxRequest") ?: 60;
		$perSeconds = getConfig("ratelimit.requestTime") ?: 8;
		$banTime = getConfig("ratelimit.banTime") ?: 15;
		$identifier = getConfig("ratelimit.useIP")
			? getClientIP()
			: session_id();
	
		$ratelimitCache = new Cache("ratelimit.". md5($identifier), Array(
			"firstRequest" => time(),
			"requestCount" => 0,
			"banned" => false,
			"unban" => 0
		));
	
		$ratelimitData = $ratelimitCache -> getData();
		$first = $ratelimitData["firstRequest"];
		$now = time();
	
		if ($ratelimitData["banned"] && $ratelimitData["unban"] <= $now) {
			//unban
			$ratelimitData["banned"] = false;
			$ratelimitData["firstRequest"] = $now;
			$ratelimitData["requestCount"] = 0;
		} else {
			if (($now - $first) < $perSeconds && !$ratelimitData["banned"]) {
				//count
				$ratelimitData["requestCount"]++;
				if ($ratelimitData["requestCount"] > $maxRequest) {
					//ban
					$ratelimitData["banned"] = true;
					$ratelimitData["unban"] = $now + $banTime;
					writeLog("WARN", "Banned for $banTime seconds");
					printBanMsg();
				}
			} elseif($ratelimitData["banned"])
				printBanMsg();
			else {
				$ratelimitData["requestCount"] = 0;
				$ratelimitData["firstRequest"] = $now;
			}
		}

		function printBanMsg() {
			global $ratelimitData;
			global $banTime;
			global $now;

			$time = $ratelimitData["unban"] - $now;

			stop(
				32,
				"NO SPAMMING IN THE HALL! ". $time ." seconds detention for you! You should know better.",
				429,
				Array(
					"time" => $banTime,
					"reset" => $time,
					"start" => $ratelimitData["unban"] - $banTime,
					"end" => $ratelimitData["unban"]
				)
			);
		}
	}

?>