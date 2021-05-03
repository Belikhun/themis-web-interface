<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/register.php                                                                            |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/logger.php";

	$isSetupSession = isset($_SESSION["setup"]) && ($_SESSION["setup"] === true);

	if (isLoggedIn())
		stop(12, "Đã đăng nhập bằng tài khoản: ". $_SESSION["username"], 400);

	if (getConfig("system.allowRegister") !== true  && !$isSetupSession)
		stop(21, "Đăng kí tài khoản đã bị tắt!", 403);
	
	$username = preg_replace("/[^a-zA-Z0-9]+/", "", reqForm("username"));
	$password = reqForm("password");

	if (!$isSetupSession) {
		$captcha = reqForm("captcha");
	
		if (!isset($_SESSION["captcha"]) || $captcha !== $_SESSION["captcha"])
			stop(8, "Sai Captcha", 403);
	}

	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/account.php";
	$acc = new Account($username);
	
	switch ($acc -> init($password)) {
		case ACCOUNT_EXIST:
			stop(17, "Tài khoản \"$username\" đã tồn tại", 400);
			break;
		
		case ACCOUNT_SUCCESS:
			if ($isSetupSession)
				$acc -> update(Array( "id" => "admin" ));

			$udata = $acc -> data;

			$_SESSION["username"] = $username;
			$_SESSION["id"] = $udata["id"];
			$_SESSION["name"] = $udata["name"];
			$_SESSION["apiToken"] = bin2hex(random_bytes(64));
			session_regenerate_id();

			writeLog("OKAY", "Đăng kí thành công '". $udata["name"] ."' [". session_id() ."]");
			stop(0, "Đăng kí thành công", 200, Array(
				"token" => $_SESSION["apiToken"],
				"sessid" => session_id(),
				"redirect" => "/",
				"user" => Array(
					"id" => $udata["id"],
					"name" => $udata["name"]
				)
			));
			break;

		default:
			stop(-1, "Lỗi không rõ", 500);
			break;
	}