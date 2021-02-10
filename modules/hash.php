<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /modules/hash.php                                                                            |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/hash.php";

	function onUpdateConfig() {
		require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";

		updateHash("config.timer", implode(Array(
			getConfig("time.contest.begin"),
			getConfig("time.contest.during"),
			getConfig("time.contest.offset")
		)));

		updateHash("config.announcement", implode(Array(
			getConfig("announcement.enabled"),
			getConfig("announcement.level"),
			getConfig("announcement.message")
		)));
	}

	function onUpdateSysLogs($size, $count) {
		updateHash("syslogs", $size . $count);
	}