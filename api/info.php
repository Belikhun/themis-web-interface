<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/info.php                                                                                |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/logger.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/submissions.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/logParser.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/account.php";

	$username = reqQuery("u");

	if ($username !== preg_replace("/[^a-zA-Z0-9]+/", "", $username))
		stop(-1, "Tên người dùng chỉ được phép dùng các kí tự trong khoảng a-zA-Z0-9", 400);

	$acc = new Account($username);

	if (!$acc -> dataExist())
		stop(13, "Không tìm thấy tên người dùng \"$username\"!", 404, Array( "username" => $username ));

	$userData = $acc -> getDetails();
	$submissionsData = null;

	if (getConfig("contest.result.publish")) {
		require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/account.php";

		$submissionsData = Array(
			"total" => 0,
			"correct" => 0,
			"passed" => 0,
			"accepted" => 0,
			"failed" => 0,
			"skipped" => 0,
			"list" => Array()
		);

		$sub = new Submissions($username);

		foreach ($sub -> list() as $id) {
			$data = $sub -> getData($id);
			
			if (!$data)
				continue;
			
			$data = $data["header"];
			$meta = $sub -> getMeta($id);

			$submissionsData["total"]++;
			$submissionsData[$data["status"]]++;
			
			array_push($submissionsData["list"], Array(
				"status" => $data["status"],
				"problem" => $data["problem"],
				"problemName" => $data["problemName"],
				"problemPoint" => $data["problemPoint"],
				"extension" => $data["file"]["extension"],
				"point" => $data["point"],
				"sp" => ($meta && isset($meta["sp"])) ? $meta["sp"]["point"] : null,
				"file" => $data["file"]
			));
		}

		$submissionsData["total"] = max($submissionsData["total"], count($problemList));
	}

	$userData["submissions"] = $submissionsData;
	stop(0, "Thành công!", 200, $userData);
?>