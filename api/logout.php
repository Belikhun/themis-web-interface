<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/logout.php                                                                              |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	
	if (!isLoggedIn())
		stop(11, "Bạn chưa đăng nhập!", 401);

	checkToken();

	session_destroy();
	session_start();

	// Unset all of the session variables
	$_SESSION = Array();
	$_SESSION["username"] = null;
	$_SESSION["id"] = null;
	$_SESSION["name"] = null;
	$_SESSION["apiToken"] = null;

	stop(0, "Đăng xuất thành công.", 200, Array(
		"redirect" => "/"
	));