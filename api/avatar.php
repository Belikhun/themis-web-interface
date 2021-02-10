<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/avatar.php                                                                              |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	$requestMethod = $_SERVER["REQUEST_METHOD"];

	switch ($requestMethod) {
		case "GET":
			define("PAGE_TYPE", "NORMAL");
			require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
			require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/avatar.php";
			require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";
			header("Cache-Control: no-cache, no-store, must-revalidate", true);

			if (!isset($_GET["u"]) || empty($_GET["u"]))
				loadAvatar(AVATAR_DIR ."/avt.default");

			getAvatar($_GET["u"]);
			break;

		case "POST":
			define("PAGE_TYPE", "API");
			require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
			require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
			require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/avatar.php";
			require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";

			if (!isLoggedIn())
				stop(11, "Bạn chưa đăng nhập!", 401);

			checkToken();

			if (getConfig("system.edit.avatar") === false)
				stop(21, "Thay đổi Avatar đã bị tắt!", 403);
			
			if (!isset($_FILES["file"]))
				stop(41, "Chưa chọn tệp!", 400);

			$username = getForm("username");

			if (!empty($username) && $_SESSION["id"] !== "admin")
				stop(31, "Access Denied!", 403);
			else
				$username = $_SESSION["username"];

			changeAvatar($username, $_FILES["file"]);
			stop(0, "Success!", 200);
			break;
		
		default:
			// SET PAGE TYPE
			define("PAGE_TYPE", "NORMAL");
			require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";

			stop(7, "Unexpected request method: ". $requestMethod, 405, Array( "method" => $requestMethod ));
			break;
	}