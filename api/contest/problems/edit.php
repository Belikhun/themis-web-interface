<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/contest/problems/edit.php                                                               |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/logs.php";
	
	if (!isLoggedIn())
		stop(11, "Bạn chưa đăng nhập", 401);
	
	checkToken();
	
	if ($_SESSION["id"] !== "admin")
		stop(31, "Access Denied!", 403);

	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/problems.php";

	$id = preg_replace("/[.\/\\\\]/m", "", reqForm("id"));
	$problem = problemGet($id, true);

	$name = getForm("name");
	$description = getForm("description");

	$point = withType(getForm("point"), "integer");
	$time = withType(getForm("time"), "integer");
	$memLimit = withType(getForm("memory"), "integer");
	$inpType = getForm("inpType", $problem["type"]["inp"]);
	$outType = getForm("outType", $problem["type"]["out"]);
	$accept = json_decode(getForm("acpt", "[]"), true) ?: null;
	$test = json_decode(getForm("test", "[]"), true) ?: null;
	$image = isset($_FILES["image"]) ? $_FILES["image"] : null;
	$attachment = isset($_FILES["attachment"]) ? $_FILES["attachment"] : null;
	$disabled = withType(getForm("disabled"), "boolean");

	$code = problemEdit($id, Array(
		"name" => $name,
		"description" => $description,
		"point" => $point,
		"time" => $time,
		"memory" => $memLimit,
		"type" => Array(
			"inp" => $inpType,
			"out" => $outType
		),
		"accept" => $accept,
		"test" => $test,
		"disabled" => $disabled
	), $image, $attachment);

	switch ($code) {
		case PROBLEM_OKAY:
			writeLog("OKAY", "Đã chỉnh sửa đề \"$id\"");
			stop(0, "Chỉnh sửa đề thành công!", 200, Array( "id" => $id ));
			break;
		case PROBLEM_ERROR_IDREJECT:
			stop(45, "Không tìm thấy đề của id đã cho!", 404, Array( "id" => $id ));
			break;
		case PROBLEM_ERROR_FILEREJECT:
			stop(43, "Không chấp nhận loại tệp!", 400, Array( "id" => $id, "allow" => IMAGE_ALLOW ));
			break;
		case PROBLEM_ERROR_FILETOOLARGE:
			stop(42, "Tệp quá lớn!", 400, Array( "id" => $id, "image" => MAX_IMAGE_SIZE, "attachment" => MAX_ATTACHMENT_SIZE ));
			break;
		case PROBLEM_ERROR:
			stop(-1, "Lỗi không rõ.", 500, Array( "id" => $id ));
			break;
	}