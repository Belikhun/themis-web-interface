<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /module/contest.php                                                                          |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";

	define("CONTEST_STARTED", 1);
	define("CONTEST_NOTENDED", 2);
	define("CONTEST_ENDED", 3);

	function contest_timeRequire(array $req = Array(
		CONTEST_STARTED,
		CONTEST_NOTENDED
	), $justReturn = true, $instantDeath = false, $resCode = 403) {
		global $config;
		$duringTime = $config["time"]["during"];
		if ($duringTime <= 0)
			return true;

		// Admin can bypass this check
		if ($_SESSION["username"] !== null && $_SESSION["id"] === "admin")
			return true;

		$beginTime = $config["time"]["begin"]["times"];
		$offsetTime = $config["time"]["offset"];
		$t = $beginTime - microtime(true) + ($duringTime * 60);

		foreach ($req as $key => $value) {
			$returnCode = null;
			$message = null;

			switch($value) {
				case CONTEST_STARTED:
					if ($t > $duringTime * 60) {
						$returnCode = 103;
						$message = "Kì thi chưa bắt đầu";
					}
					break;

				case CONTEST_NOTENDED:
					if ($t < -$offsetTime && $duringTime !== 0) {
						$returnCode = 104;
						$message = "Kì thi đã kết thúc";
					}
					break;

				case CONTEST_ENDED:
					if ($t > -$offsetTime && $duringTime !== 0) {
						$returnCode = 105;
						$message = "Kì thi chưa kết thúc";
					}
					break;

				default:
					trigger_error("Unknown case: ". $code, E_USER_ERROR);
					break;
			}

			if ($returnCode !== null && $message !== null) {
				if ($justReturn === true)
					return $returnCode;

				//* Got NOTICE on Codefactor for no reason:
				//* if ($useDie === true)
				//* 	(http_response_code($resCode) && die());

				if ($instantDeath === true) {
					http_response_code($resCode);
					die();
				}

				stop($returnCode, $message, $resCode);
			}
		}

		return true;
	}