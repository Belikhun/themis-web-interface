<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/contest/viewlog.php                                                                     |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/submissions.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/contest.php";

	if (getConfig("contest.log.enabled") === false && $_SESSION["id"] !== "admin")
		stop(23, "Xem nhật ký đã bị tắt!", 403);

	contest_timeRequire([CONTEST_STARTED], false);

	$username = reqQuery("u");
	$id = reqQuery("id");

	updateSubmissions();

	if (!submissionExist($username))
		stop(13, "Không tìm thấy tên người dùng \"$username\"!", 404, Array( "username" => $username ));

	if ($username !== $_SESSION["username"] && getConfig("contest.log.viewOther") === false && $_SESSION["id"] !== "admin")
		stop(31, "Không cho phép xem tệp nhật kí của người khác!", 403);

	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/account.php";
	
	$submission = new submissions($username);
	$logData = $submission -> getData($id);

	if (!$logData)
		stop(44, "Không tìm thấy dữ liệu", 404, Array( "username" => $username, "id" => $id ));

	$userData = (new account($logData["header"]["user"])) -> data;
	$logData["header"]["name"] = ($userData && isset($userData["name"])) ? $userData["name"] : null;
	$logData["meta"] = $submission -> getMeta($id);

	stop(0, "Thành công!", 200, $logData);
?>