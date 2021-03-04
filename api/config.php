<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/config.php                                                                              |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/logger.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/hash.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";

	if ($_SERVER["REQUEST_METHOD"] === "GET")
		switch (getQuery("type", "value")) {
			case "structure":
				stop(0, "Thành công!", 200, CONFIG_STRUCTURE);
			
			default:
				stop(0, "Thành công!", 200, $rawConfig);
		}

	if (!isLoggedIn())
		stop(11, "Bạn chưa đăng nhập", 401);
		
	checkToken();

	if ($_SESSION["id"] !== "admin")
		stop(31, "Access Denied!", 403);

	$defConfig = DEFAULT_CONFIG;
	$newConfig = reqData("json");
	$changed = 0;

	// First merge new config with current config
	// to include new added config value
	mergeObjectRecursive($defConfig, $rawConfig);

	// Merge new config into default config
	mergeObjectRecursive($defConfig, $newConfig, function($a, $b, $k) {
		if ($a !== $b)
			stop(3, "Loại biến không khớp! Yêu cầu $k là \"$a\", nhận được \"$b\"!", 400, Array(
				"expect" => $a,
				"got" => $b,
				"key" => $k
			));

		return true;
	}, false, $changed);

	// Set new config into current config
	$rawConfig = $defConfig;

	if ($rawConfig["contest"]["result"]["publish"] !== true) {
		$rawConfig["contest"]["ranking"]["enabled"] = false;
		$rawConfig["contest"]["log"]["enabled"] = false;
	}

	if ($rawConfig["contest"]["ranking"]["viewTask"] !== true)
		$rawConfig["contest"]["log"]["viewOther"] = false;

	if ($changed === 0)
		// Stop executing if no change applied
		stop(102, "Woah nothing happened", 200);

	if (file_exists($_SERVER["DOCUMENT_ROOT"] ."/modules/hash.php")) {
		require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/hash.php";
		onUpdateConfig();
	}

	saveConfig($rawConfig);
	writeLog("OKAY", "Đã thay đổi cài đặt");
	stop(0, "Thay đổi cài đặt thành công!", 200, Array( "changed" => $changed ));