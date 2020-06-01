<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/contest/rank.php                                                                        |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	$export = isset($_GET["export"]);

	// SET PAGE TYPE
	define("PAGE_TYPE", $export ? "NORMAL" : "API");

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/cache.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/contest.php";

	if ($export && !isLoggedIn())
		stop(11, "Bạn chưa đăng nhập!", 401);

	if ($export && $_SESSION["id"] !== "admin")
		stop(31, "Access Denied!", 403);

	if ($config["publish"] !== true && $_SESSION["id"] !== "admin")
		stop(108, "Thông tin không được công bố", 200, Array(
			"list" => Array(),
			"rank" => Array()
		));

	if ($config["viewRank"] !== true && $_SESSION["id"] !== "admin")
		stop(107, "Xếp hạng đã bị tắt", 200, Array(
			"list" => Array(),
			"rank" => Array()
		));

	if (contest_timeRequire([CONTEST_STARTED], true) !== true)
		stop(103, "Kì thi chưa bắt đầu", 200, Array(
			"list" => Array(),
			"rank" => Array()
		));

	if (!$export) {
		$cache = new cache("api.contest.rank.". md5($_SESSION["username"] . $_SESSION["id"]));
		$cache -> setAge($config["cache"]["contestRank"]);
		
		if ($cache -> validate()) {
			$returnData = $cache -> getData();
			stop(0, "Thành công!", 200, $returnData, $returnData["overall"]);
		}
	}

	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/logParser.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/submissions.php";

	updateSubmissions();

	//? SUBMISSIONS CALCULATION
	$usersList = getSubmissionsList();
	$res = Array();
	$_list_ = Array();
	$list = Array();
	$nameList = Array();
	$total = Array();
	$overall = 0;

	foreach ($usersList as $username) {
		$sub = new submissions($username);

		foreach ($sub -> list() as $id) {
			$data = $sub -> getData($id)["header"];
	
			$filename = $data["file"]["logFilename"];
			$user = $data["user"];
			$userData = getUserData($user);
	
			if (problemDisabled($data["problem"]) && $config["viewRankHideDisabled"] && $_SESSION["id"] !== "admin")
				continue;
	
			if ($config["viewRankTask"] === true || $_SESSION["id"] === "admin") {
				$_list_[$data["problem"]] = null;
				$res[$user]["status"][$data["problem"]] = $data["status"];
				$res[$user]["point"][$data["problem"]] = $data["point"];
				$res[$user]["logFile"][$data["problem"]] = ($config["viewLog"] === true || $_SESSION["id"] === "admin") ? $filename : null;
	
				if (isset($data["problemName"]))
					$nameList[$data["problem"]] = $data["problemName"];
			}
	
			$res[$user]["username"] = $user;
			$res[$user]["name"] = ($userData && isset($userData["name"])) ? $userData["name"] : null;
	
			if (!isset($res[$user]["lastSubmit"]) || $res[$user]["lastSubmit"] < $data["file"]["lastModify"])
				$res[$user]["lastSubmit"] = $data["file"]["lastModify"];
	
			if (!isset($res[$user]["total"]))
				$res[$user]["total"] = 0;
				
			$res[$user]["total"] += $data["point"];
		}
	}

	foreach ($_list_ as $key => $value)
		array_push($list, $key);

	// Sort data by lastSubmit
	usort($res, function($a, $b) {
		$a = $a["lastSubmit"];
		$b = $b["lastSubmit"];

		if ($a === $b)
			return 0;

		return ($a < $b) ? -1 : 1;
	});

	// Sort data by total point
	usort($res, function($a, $b) {
		$a = $a["total"];
		$b = $b["total"];
	
		if ($a === $b)
			return 0;

		return ($a > $b) ? -1 : 1;
	});

	foreach ($res as $value) {
		$total[$value["username"]] = $value["total"];
		$overall += $total[$value["username"]];
	}

	if ($export) {
		$data = Array();
		$header = Array("#", "username", "name", "total");

		foreach ($list as $id)
			array_push($header, isset($nameList[$id]) ? $nameList[$id] : $id);
		
		array_push($data, $header);

		foreach ($res as $i => $item) {
			$line = Array($i + 1, $item["username"], $item["name"], $item["total"]);

			foreach ($list as $id)
				array_push($line, isset($item["point"][$id]) ? $item["point"][$id] : null);

			array_push($data, $line);
		}

		contentType("csv");
		header("Content-disposition: attachment; filename=rank.csv");
		$stream = fopen("php://output", "w");
		fprintf($stream, chr(0xEF).chr(0xBB).chr(0xBF));

		foreach ($data as $line)
			fputcsv($stream, $line, ";");

		fclose($stream);
	} else {
		$returnData = Array (
			"list" => $list,
			"nameList" => $nameList,
			"total" => $total,
			"rank" => $res,
			"overall" => $overall
		);
		
		$cache -> save($returnData);
		stop(0, "Thành công!", 200, $returnData, $returnData["overall"]);
	}