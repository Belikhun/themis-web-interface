<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/login.php                                                                               |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";

	if (isLogedIn())
		stop(12, "Đã đăng nhập bằng username: ". $_SESSION["username"], 400);
	
	$username = reqForm("username");
	$password = reqForm("password");
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";

	$res = simpleLogin($username, $password);
	if ($res === LOGIN_SUCCESS) {
		$udata = getUserData($username);
		$_SESSION["username"] = $username;
		$_SESSION["id"] = $udata["id"];
		$_SESSION["name"] = $udata["name"];
		$_SESSION["apiToken"] = bin2hex(random_bytes(64));
		session_regenerate_id();

		writeLog("OKAY", "Đăng nhập thành công [". session_id() ."]");
		stop(0, "Đăng nhập thành công.", 200, Array(
			"token" => $_SESSION["apiToken"],
			"sessid" => session_id(),
			"redirect" => "/",
			"user" => Array(
				"id" => $udata["id"],
				"name" => $udata["name"]
			)
		));
	}
	else if ($res === LOGIN_WRONGPASSWORD)
		stop(14, "Sai mật khẩu!", 403);
	else if ($res === LOGIN_USERNAMENOTFOUND)
		stop(13, "Sai tên đăng nhập!", 403);
	else
		stop(-1, "Lỗi không rõ.", 500);