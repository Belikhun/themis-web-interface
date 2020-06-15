<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/contest/problems/attachment.php                                                         |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/contest.php";

	$requestMethod = $_SERVER["REQUEST_METHOD"];

	switch ($requestMethod) {
		case "GET":
			// SET PAGE TYPE
			define("PAGE_TYPE", "NORMAL");
			
			$id = reqQuery("id");
			
			require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";
			
			if (!isLoggedIn() && getConfig("contest.problem.public") !== true)
				stop(109, "Vui lòng đăng nhập để xem đề bài!", 403);
			
			contest_timeRequire([CONTEST_STARTED], false, false);

			require_once $_SERVER["DOCUMENT_ROOT"] ."/data/problems/problem.php";

			if (!problemExist($id))
				stop(45, "Không tìm thấy đề của id đã cho!", 404, Array( "id" => $id ));

			if (problemDisabled($id) && $_SESSION["id"] !== "admin")
				stop(25, "Đề $id đã bị tắt", 403, Array( "id" => $id ));

			require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";

			if (problemGetAttachment($id, !getQuery("embed", false)) === PROBLEM_OKAY)
				writeLog("INFO", "Đã tải tệp đính kèm của bài \"". $_GET["id"] ."\"");
			else
				stop(44, "Không tìm thấy tệp đính kèm", 404);

			break;

		case "DELETE":
			// SET PAGE TYPE
			define("PAGE_TYPE", "API");

			if (!isLoggedIn())
				stop(11, "Bạn chưa đăng nhập", 401);

			$id = preg_replace("/[.\/\\\\]/m", "", reqHeader("id"));
			
			checkToken();
			
			if ($_SESSION["id"] !== "admin")
				stop(31, "Access Denied!", 403);

			require_once $_SERVER["DOCUMENT_ROOT"] ."/data/problems/problem.php";
			
			$code = problemRemoveAttachment($id);
			
			switch ($code) {
				case PROBLEM_OKAY:
					writeLog("OKAY", "Đã xóa tệp đính kèm của đề \"$id\"");
					stop(0, "Đã xóa tệp đính kèm của đề", 200, Array( "id" => $id ));
					break;
				case PROBLEM_ERROR_IDREJECT:
					stop(45, "Không tìm thấy đề của id đã cho!", 404, Array( "id" => $id ));
					break;
				case PROBLEM_ERROR_FILENOTFOUND:
					stop(44, "Không tìm thấy tệp đính kèm", 404, Array( "id" => $id ));
					break;
			}

			break;
		
		default:
			// SET PAGE TYPE
			define("PAGE_TYPE", "NORMAL");

			stop(7, "Unexpected request method: ". $requestMethod, 405, Array( "method" => $requestMethod ));
			break;
	}