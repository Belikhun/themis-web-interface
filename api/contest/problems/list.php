<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/contest/problems/list.php                                                               |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/contest.php";
	
	if (!isLoggedIn() && getConfig("contest.problem.public") !== true)
		stop(109, "Vui lòng đăng nhập để xem đề bài!", 403, Array());

	contest_timeRequire([CONTEST_STARTED], false);

	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/problems.php";
	stop(0, "Thành công!", 200, problemList($_SESSION["id"] === "admin"));