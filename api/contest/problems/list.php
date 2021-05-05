<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/contest/problems/list.php                                                               |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/contest.php";
	
	if (!isLoggedIn() && getConfig("contest.problem.public") !== true)
		stop(109, "Vui lòng đăng nhập để xem đề bài!", 403, Array());

	contest_timeRequire([CONTEST_STARTED], false);

	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/problem.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/submissions.php";

	$list = problemList($_SESSION["id"] === "admin");
	$status = (new fip(SUBMISSIONS_DIR ."/status.json", "{}")) -> read("json");

	foreach ($list as &$value) {
		$value["status"] = Array(
			"total" => 0,
			"correct" => Array(),
			"passed" => Array(),
			"accepted" => Array(),
			"failed" => Array(),
			"skipped" => Array()
		);

		if (isset($status[$value["id"]]))
			foreach ($status[$value["id"]] as $k => $v) {
				$value["status"]["total"]++;
				array_push($value["status"][$v], $k);
			}
	}

	stop(0, "Thành công!", 200, $list);
