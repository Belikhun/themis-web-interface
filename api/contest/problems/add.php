<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/contest/problems/add.php                                                                |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/logger.php";
	
	if (!isLoggedIn())
		stop(11, "Bạn chưa đăng nhập", 401);
	
	checkToken();
	
	if ($_SESSION["id"] !== "admin")
		stop(31, "Access Denied!", 403);

	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/problems.php";

	$data = safeJSONParsing(reqForm("data"), "data");
	$id = reqType($data["id"], "string", "id");
	$sid = preg_replace("/[^a-zA-Z0-9_]/m", "", $id);

	if ($id !== $sid)
		stop(9, "Mã Đề Không Hợp Lệ (chỉ sử dụng các kí tự a-zA-Z0-9 và _)", 400, Array( "id" => $id, "expect" => $sid ));

	$thumbnail = isset($_FILES["thumbnail"]) ? $_FILES["thumbnail"] : null;
	$attachment = isset($_FILES["attachment"]) ? $_FILES["attachment"] : null;

	$code = problemAdd($id, $data, $thumbnail, $attachment);

	switch ($code) {
		case PROBLEM_OKAY:
			writeLog("OKAY", "Đã thêm đề \"$id\"");
			stop(0, "Thêm đề thành công!", 200, Array( "id" => $id ));
			break;
		case PROBLEM_ERROR_IDREJECT:
			stop(45, "Đã có đề với id này!", 404, Array( "id" => $id ));
			break;
		case PROBLEM_ERROR_FILEREJECT:
			stop(43, "Không chấp nhận loại tệp!", 400, Array( "id" => $id, "allow" => IMAGE_ALLOW ));
			break;
		case PROBLEM_ERROR_FILETOOLARGE:
			stop(42, "Tệp quá lớn!", 400, Array( "id" => $id, "thumbnail" => MAX_IMAGE_SIZE, "attachment" => MAX_ATTACHMENT_SIZE ));
			break;
		case PROBLEM_ERROR:
			stop(-1, "Lỗi không rõ.", 500, Array( "id" => $id ));
			break;
	}