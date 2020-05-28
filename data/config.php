<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /data/config.php                                                                             |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";

	// get and parse config data from config file
	$config = json_decode((new fip($_SERVER["DOCUMENT_ROOT"] ."/data/config.json")) -> read(), true);
	$rawConfig = $config;

	date_default_timezone_set($config["time"]["zone"]);

	$config["time"]["begin"]["times"] = mktime(
		$config["time"]["begin"]["hours"],
		$config["time"]["begin"]["minutes"],
		$config["time"]["begin"]["seconds"],
		$config["time"]["begin"]["months"],
		$config["time"]["begin"]["days"],
		$config["time"]["begin"]["years"]
	);

	$config["logDir"] = $config["uploadDir"] ."/Logs";

	$customVarList = Array(
		"name" => APPNAME,
		"version" => VERSION,
		"author" => AUTHOR,
		"appTitle" => $config["app"]["title"],
		"root" => $_SERVER["DOCUMENT_ROOT"],
		"currentDate" => date("d/m/Y"),
		"currentTime" => date("H:i:s")
	);

	function applyCustomVar(&$string) {
		global $customVarList;
		global $config;
		$s = $string;

		foreach ($customVarList as $key => $value)
			if (!empty($value))
				$s = str_replace("%". $key ."%", $value, $s);

		$string = $s;
	}

	applyCustomVar($config["app"]["title"]);
	applyCustomVar($config["app"]["description"]);
	applyCustomVar($config["uploadDir"]);
	applyCustomVar($config["pageTitle"]);

	function saveConfig(Array $config) {
		unset($config["time"]["begin"]["times"]);
		unset($config["logDir"]);
		(new fip($_SERVER["DOCUMENT_ROOT"] ."/data/config.json")) -> write(json_encode($config, JSON_PRETTY_PRINT));
	}