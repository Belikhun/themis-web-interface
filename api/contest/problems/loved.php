<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/contest/problems/loved.php                                                              |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|
	
	define("PAGE_TYPE", "API");

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";

	$requestMethod = $_SERVER["REQUEST_METHOD"];
	switch ($requestMethod) {
		case "GET":
			$id = reqQuery("id");
			require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/problem.php";

			if (!problemExist($id))
				stop(45, "Không tìm thấy đề của id đã cho!", 404, Array( "id" => $id ));

			if (problemDisabled($id) && $_SESSION["id"] !== "admin")
				stop(25, "Đề $id đã bị tắt", 403, Array( "id" => $id ));

			$data = problemGet($id, $_SESSION["id"] === "admin");
			switch ($data) {
				case PROBLEM_ERROR_IDREJECT:
					stop(44, "Không tìm thấy để của id đã cho!", 404, Array( "id" => $id ));
					break;
		
				case PROBLEM_ERROR_DISABLED:
					stop(25, "Đề $id đã bị tắt", 403, Array( "id" => $id ));
					break;
			}

			stop(0, "Thành công!", 200, is_array($data["loved"]) ? $data["loved"] : Array());

		case "POST":
			if (!isLoggedIn())
				stop(11, "Bạn chưa đăng nhập", 401);

			$id = preg_replace("/[.\/\\\\]/m", "", reqForm("id"));
			$loved = reqType(reqForm("loved"), "boolean", "loved");

			checkToken();

			require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/problem.php";

			if (!problemExist($id))
				stop(45, "Không tìm thấy đề của id đã cho!", 404, Array( "id" => $id ));

			if (problemDisabled($id) && $_SESSION["id"] !== "admin")
				stop(25, "Đề $id đã bị tắt", 403, Array( "id" => $id ));

			if (!is_array($problemList[$id]["loved"]))
				$problemList[$id]["loved"] = Array();
			
			if ($loved) {
				if (!in_array($_SESSION["username"], $problemList[$id]["loved"]))
					array_push($problemList[$id]["loved"], $_SESSION["username"]);
			} else
				foreach ($problemList[$id]["loved"] as $key => $value)
					if ($value === $_SESSION["username"])
						array_splice($problemList[$id]["loved"], $key, 1);
		
			problemSave($id);
			stop(0, "Success", 200, Array( "loved" => $loved ));

		default:
			stop(7, "Unexpected request method: ". $requestMethod, 405, Array( "method" => $requestMethod ));
			break;
	}