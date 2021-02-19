<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/edit.php                                                                                |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/logger.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";

	if (!isLoggedIn())
		stop(11, "Bạn chưa đăng nhập!", 401);

	$username = $_SESSION["username"];
	checkToken();

	$change = Array();

	if (isset($_POST["name"])) {
		if (getConfig("system.edit.name") === false && $_SESSION["id"] !== "admin")
			stop(21, "Thay đổi tên đã bị tắt!", 403);

		$change["name"] = htmlspecialchars(trim($_POST["name"]));
		if (strlen($change["name"]) > 34)
			stop(16, "Tên người dùng không được vượt quá 34 kí tự", 400);
	}

	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/account.php";
	$acc = new account($username);
	$userdata = $acc -> data;

	if (isset($_POST["password"])) {
		if (getConfig("system.edit.password") === false && $_SESSION["id"] !== "admin")
			stop(21, "Thay đổi mật khẩu đã bị tắt!", 403);

		$oldpass = $_POST["password"];

		if ($acc -> auth($oldpass) === ACCOUNT_LOGIN_WRONGPASSWORD)
			stop(14, "Sai mật khẩu!", 403);

		$newpass = reqForm("newPassword");
		$change["password"] = password_hash($newpass, PASSWORD_DEFAULT);
		$change["repass"] = $userdata["repass"] + 1;
	}

	if (empty($change))
		stop(102, "No action taken", 200);

	$res = $acc -> update($change);

	switch ($res) {
		case ACCOUNT_SUCCESS:
			writeLog("INFO", "Đã thay đổi ". (isset($change["name"]) ? "tên thành \"". $change["name"] ."\"" : "") . ((isset($change["name"]) && isset($change["password"])) ? " và " : "") . (isset($change["password"]) ? "mật khẩu" : ""));
			stop(0, "Thay đổi thông tin thành công!", 200, $change);
			break;
		case ACCOUNT_NOTFOUND:
			stop(13, "Không tìm thấy tài khoản \"$username\"!", 400, Array( "username" => $username ));
			break;
	}