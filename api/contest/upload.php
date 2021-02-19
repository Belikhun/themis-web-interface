<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/contest/upload.php                                                                      |
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
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/contest.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/submissions.php";

	if (!isLoggedIn())
		stop(11, "Bạn chưa đăng nhập", 401);

	checkToken();

	if (getConfig("contest.submit.enabled") === false)
		stop(22, "Nộp bài đã bị tắt!", 403);

	if (!isset($_FILES["file"]))
		stop(41, "Chưa chọn tệp!", 400);

	contest_timeRequire([CONTEST_STARTED, CONTEST_NOTENDED], false);

	$username = $_SESSION["username"];
	$userid = $_SESSION["id"];
	apache_setenv("no-gzip", "1");

	$file = utf8_encode($_FILES["file"]["name"]);
	$filename = pathinfo($file, PATHINFO_FILENAME);
	$extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));

	if (getConfig("contest.submit.inProblemsList") === true) {
		require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/problems.php";
		if (!problemExist($filename))
			stop(44, "Không có đề cho bài này!", 404, Array( "file" => $filename ));

		if (problemDisabled($filename) && $_SESSION["id"] !== "admin")
			stop(25, "Đề $filename đã bị tắt", 403, Array( "id" => $filename ));

		if (!problemCheckExtension($filename, $extension))
			stop(43, "Không chấp nhận tệp!", 415);
	} else
		$filename = strtoupper($filename);

	if (!in_array($extension, UPLOAD_ALLOW))
		stop(43, "Không chấp nhận tệp!", 415, Array( "allow" => UPLOAD_ALLOW ));

	if (($_FILES["file"]["size"] > MAX_UPLOAD_SIZE))
		stop(42, "Tệp quá lớn!", 400, Array(
			"size" => $_FILES["file"]["size"],
			"max" => MAX_UPLOAD_SIZE
		));

	if ($_FILES["file"]["error"] > 0)
		stop(-1, "Lỗi không rõ.", 500);

	$submission = new submissions($username);
	$submission -> saveCode($filename, $_FILES["file"]["tmp_name"], $extension);
	
	move_uploaded_file($_FILES["file"]["tmp_name"], getConfig("folders.submit") ."/". $userid ."[". $username ."][". $filename ."].". $extension);
	writeLog("INFO", "Đã tải lên \"$file\"");
	stop(0, "Nộp bài thành công.", 200);
?>