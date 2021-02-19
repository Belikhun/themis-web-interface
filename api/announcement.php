<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/announcement.php                                                                        |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";

	$enabled = getConfig("announcement.enabled");

	if (!$enabled)
		stop(107, "Success", 200, Array( "enabled" => $enabled ));

	stop(0, "Success", 200, Array(
		"enabled" => $enabled,
		"level" => getConfig("announcement.level"),
		"message" => getConfig("announcement.message")
	));