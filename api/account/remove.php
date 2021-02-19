<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/account/edit.php                                                                        |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/logger.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";

	if (!isLoggedIn())
		stop(11, "Bạn chưa đăng nhập", 401);
		
	checkToken();

	$username = reqForm("username");

	if ($_SESSION["id"] !== "admin")
		stop(31, "Access Denied!", 403);

	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/account.php";
	$acc = new account($username);

	if (!$acc -> dataExist())
		stop(13, "Không tìm thấy tài khoản \"$username\"!", 404, Array( "username" => $username ));

	$res = $acc -> delete();

	$imagePath = AVATAR_DIR ."/". $username;
	$oldFiles = glob($imagePath .".{". join(",", IMAGE_ALLOW) ."}", GLOB_BRACE);

	// Find old avatar files and remove them
	if (count($oldFiles) > 0)
		foreach ($oldFiles as $oldFile) {
			$ext = pathinfo($oldFile, PATHINFO_EXTENSION);
			unlink($imagePath .".". $ext);
		}

	writeLog("OKAY", "Đã xóa tài khoản \"$username\"");
	stop(0, "Xóa tài khoản thành công!", 200, Array( "username" => $username ));