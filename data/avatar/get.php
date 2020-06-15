<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /data/avatar/get.php                                                                         |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "NORMAL");

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";
	header("Cache-Control: no-cache, no-store, must-revalidate", true);
	
	chdir(AVATAR_DIR);

	function showAvatar(string $path) {
		contentType(pathinfo($path, PATHINFO_EXTENSION))
			?: contentType("jpg");
			
		header("Content-length: ". filesize($path));
		readfile($path);
		stop(0, "Success", 200);
	}

	if (!isset($_GET["u"]) || empty($_GET["u"]))
		showAvatar("avt.default");

	$username = preg_replace("/[.\/\\\\]/m", "", trim($_GET["u"]));
	$files = glob($username .".{". join(",", IMAGE_ALLOW) ."}", GLOB_BRACE);

	if (count($files) > 0)
		showAvatar($files[0]);
	else
		showAvatar("avt.default");
?>