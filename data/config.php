<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /data/config.php                                                                             |
    //? |                                                                                               |
    //? |  Copyright (c) 2018 Belikhun. All right reserved                                              |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
	define("VERSION", "0.3.6");

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
	$config["version"] = VERSION;

	function save_config(Array $config) {
		unset($config["time"]["begin"]["times"]);
		unset($config["logdir"]);
		unset($config["version"]);
		(new fip($_SERVER["DOCUMENT_ROOT"] ."/data/config.json")) -> write(json_encode($config, JSON_PRETTY_PRINT));
	}

	define("CONTEST_STARTED", 1);
	define("CONTEST_NOTENDED", 2);

	function contest_timecheck(array $req = Array(
		CONTEST_STARTED,
		CONTEST_NOTENDED
	), bool $die = false) {
		global $config;
		$duringTime = $config["time"]["during"];
		if ($duringTime <= 0)
			return false;

		if (getuserdata($_SESSION["username"])["id"] == "admin")
			return true;

		$beginTime = $config["time"]["begin"]["times"];
		$offsetTime = $config["time"]["offset"];
		$t = $beginTime - time() + ($duringTime * 60);

		foreach ($req as $key => $value) {
			switch($value) {
				case CONTEST_STARTED:
					if ($t > $duringTime * 60)
						if (!$die)
							stop(103, "Kì thi chưa bắt đầu.", 200);
						else
							die();
					break;
				case CONTEST_NOTENDED:
					if ($t < -$offsetTime && $duringTime != 0)
						if (!$die)
							stop(104, "Kì thi đã kết thúc!", 200);
						else
							die();
					break;
			}
		}
	}