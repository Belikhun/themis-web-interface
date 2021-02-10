<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /modules/hash.php                                                                            |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	function onUpdateConfig($config) {
		updateHash("config.timer", $config["time"]["contest"]["begin"] . $config["time"]["contest"]["during"] . $config["time"]["contest"]["offset"]);
		updateHash("config.announcement", $config["announcement"]["level"] . $config["announcement"]["message"]);
	}