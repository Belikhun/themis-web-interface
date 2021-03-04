<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/delete.php                                                                      |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
    define("PAGE_TYPE", "API");

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";
	
	if (!isLoggedIn())
		stop(11, "Bạn chưa đăng nhập", 401);

	checkToken();

	if ($_SESSION["id"] !== "admin")
		stop(31, "Access Denied!", 403);

	$type = reqForm("type");
	switch ($type) {
		case "submission":
			$counter = 0;
			rmrf(getConfig("folders.submissions"), $counter);

			stop(0, "Đã xóa Dữ Liệu Bài Làm!", 200, Array( "amount" => $counter ));
			break;
		
		default:
			stop(60, "Invalid Type: $type", 406, Array( "type" => $type ));
	}