<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/contest/problems/image.php                                                              |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/contest.php";
	
	function showImage(string $path) {
		contentType(pathinfo($path, PATHINFO_EXTENSION))
			?: contentType("jpg");
		
		header("Content-length: ". filesize($path));
		readfile($path);
		stop(0, "Success", 200);
	}
	
	$requestMethod = $_SERVER["REQUEST_METHOD"];

	switch ($requestMethod) {
		case "GET":
			// SET PAGE TYPE
			define("PAGE_TYPE", "NORMAL");

			$id = preg_replace("/[.\/\\\\]/m", "", reqQuery("id"));

			require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";

			if (!isLoggedIn() && getConfig("contest.problem.public") !== true)
				stop(109, "Vui lòng đăng nhập để xem đề bài!", 403);

			contest_timeRequire([CONTEST_STARTED], false, false);
		
			require_once $_SERVER["DOCUMENT_ROOT"] ."/module/problems.php";
		
			if (!problemExist($id) || (problemDisabled($id) && $_SESSION["id"] !== "admin"))
				showImage(PROBLEMS_DIR ."/image.default");
		
			if (isset($problemList[$id]["image"])) {
				$i = $problemList[$id]["image"];
				$f = PROBLEMS_DIR ."/". $id ."/". $i;
				showImage($f);
			}
		
			showImage(PROBLEMS_DIR ."/image.default");
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

			require_once $_SERVER["DOCUMENT_ROOT"] ."/module/problems.php";
			
			$code = problemRemoveImage($id);
			
			switch ($code) {
				case PROBLEM_OKAY:
					writeLog("OKAY", "Đã xóa ảnh đính kèm của đề \"$id\"");
					stop(0, "Đã xóa ảnh đính kèm của đề", 200, Array( "id" => $id ));
					break;
				case PROBLEM_ERROR_IDREJECT:
					stop(45, "Không tìm thấy đề của id đã cho!", 404, Array( "id" => $id ));
					break;
				case PROBLEM_ERROR_FILENOTFOUND:
					stop(44, "Không tìm thấy ảnh đính kèm", 404, Array( "id" => $id ));
					break;
			}

			break;
		
		default:
			// SET PAGE TYPE
			define("PAGE_TYPE", "NORMAL");

			stop(7, "Unexpected request method: ". $requestMethod, 405, Array( "method" => $requestMethod ));
			break;
	}