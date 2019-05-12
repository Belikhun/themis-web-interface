<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /data/config.php                                                                             |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";

	// dont claim it for your own. thats not nice
	define("APPNAME", "Themis Web Interface");
	define("AUTHOR", "Belikhun");
	define("VERSION", "0.4.1");
	define("VERSION_TAG", "release");
	define("REPORT_ERROR", "https://github.com/belivipro9x99/themis-web-interface/issues");

	$config = (new fip($_SERVER["DOCUMENT_ROOT"] ."/data/config.json")) -> read();
	$config = json_decode($config, true);

	date_default_timezone_set($config["time"]["zone"]);
	$config["time"]["begin"]["times"] = mktime(
		$config["time"]["begin"]["hours"],
		$config["time"]["begin"]["minutes"],
		$config["time"]["begin"]["seconds"],
		$config["time"]["begin"]["months"],
		$config["time"]["begin"]["days"],
		$config["time"]["begin"]["years"]
	);
	$config["logdir"] = $config["uploaddir"] ."/Logs";

	function applyCustomVar(&$string) {
		global $config;
		$s = $string;
		$list = Array(
			"name" => APPNAME,
			"version" => VERSION,
			"author" => AUTHOR,
			"contestName" => $config["contest"]["name"]
		);

		foreach ($list as $key => $value)
			if (!empty($value))
				$s = str_replace("%". $key ."%", $value, $s);

		$string = $s;
	}

	applyCustomVar($config["contest"]["name"]);
	applyCustomVar($config["contest"]["description"]);
	applyCustomVar($config["pagetitle"]);

	function saveConfig(Array $config) {
		unset($config["time"]["begin"]["times"]);
		unset($config["logdir"]);
		(new fip($_SERVER["DOCUMENT_ROOT"] ."/data/config.json")) -> write(json_encode($config, JSON_PRETTY_PRINT));
	}

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
		if ($_SESSION["username"] !== null && getUserData($_SESSION["username"])["id"] === "admin")
			return true;

		$beginTime = $config["time"]["begin"]["times"];
		$offsetTime = $config["time"]["offset"];
		$t = $beginTime - time() + ($duringTime * 60);

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