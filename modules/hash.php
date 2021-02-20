<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /modules/hash.php                                                                            |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/hash.php";

	function onUpdateConfig() {
		require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";

		(new Hash("config.contest.basicInfo")) -> update(implode(Array(
			getConfig("contest.name"),
			getConfig("contest.description")
		)));
		
		(new Hash("config.timer")) -> update(implode(Array(
			getConfig("time.contest.begin"),
			getConfig("time.contest.during"),
			getConfig("time.contest.offset")
		)));

		(new Hash("config.announcement")) -> update(implode(Array(
			getConfig("announcement.enabled"),
			getConfig("announcement.level"),
			getConfig("announcement.message")
		)));
	}

	function onUpdateSysLogs($size, $count) {
		(new Hash("syslogs")) -> update($size . $count);
	}