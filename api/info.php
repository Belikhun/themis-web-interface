<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/info.php                                                                                |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/submissions.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/logParser.php";

	$username = reqQuery("u");
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";

	if ($username !== preg_replace("/[^a-zA-Z0-9]+/", "", $username))
		stop(-1, "Tên người dùng chỉ được phép dùng các kí tự trong khoảng a-zA-Z0-9", 400);

	if (!$data = getUserData($username))
		stop(13, "Không tìm thấy tên người dùng \"$username\"!", 404, Array( "username" => $username ));

	$userData = getUserData($username);
	unset($userData["password"]);
	unset($userData["repass"]);

	$contestData = null;

	if (true) {
		$contestData = Array(
			"total" => 0,
			"correct" => 0,
			"passed" => 0,
			"accepted" => 0,
			"failed" => 0,
			"skipped" => 0,
			"scored" => 0,
			"list" => Array()
		);

		$sub = new submissions($username);

		foreach ($sub -> list() as $id) {
			$data = $sub -> getData($id);

			if (!$data)
				continue;

			$data = $data["header"];

			if (getConfig("contest.result.publish") !== true && $_SESSION["id"] !== "admin") {
				$data["status"] = "scored";
				$data["point"] = null;
			}
	
			$contestData["total"]++;
			$contestData[$data["status"]]++;
			
			array_push($contestData["list"], Array(
				"status" => $data["status"],
				"problem" => $data["problem"],
				"problemName" => $data["problemName"],
				"problemPoint" => $data["problemPoint"],
				"extension" => $data["file"]["extension"],
				"point" => $data["point"],
				"lastModify" => $data["file"]
			));
		}
	}

	$userData["contest"] = $contestData;
	stop(0, "Thành công!", 200, $userData);
?>