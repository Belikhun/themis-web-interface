<?php
	//|====================================================|
    //|                     config.php                     |
    //|            Copyright (c) 2018 Belikhun.            |
    //|      This file is licensed under MIT license.      |
    //|====================================================|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
	
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

	function save_config(Array $config) {
		unset($config["time"]["begin"]["times"]);
		unset($config["logdir"]);
		(new fip($_SERVER["DOCUMENT_ROOT"] ."/data/config.json")) -> write(json_encode($config, JSON_PRETTY_PRINT));
	}