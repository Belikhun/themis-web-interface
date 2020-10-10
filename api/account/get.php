<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/account/get.php                                                                         |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/logs.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";

	if (!isLoggedIn())
		stop(11, "Bạn chưa đăng nhập", 401);
		
	checkToken();
	$username = getForm("username");

	if ($_SESSION["id"] !== "admin")
		stop(31, "Access Denied!", 403);

	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/account.php";

	if ($username) {
		$acc = new account($username);

		if (!$acc -> dataExist())
			stop(13, "Tài khoản với tên người dùng \"$username\" không tồn tại!", 404, Array( "username" => $username ));

		stop(0, "Success", 200, $acc -> data);
	} else {
		$data = Array();
		$list = getAccountsList();

		foreach ($list as $username)
			array_push($data, (new account($username)) -> data);

		stop(0, "Thành công!", 200, $data);
	}