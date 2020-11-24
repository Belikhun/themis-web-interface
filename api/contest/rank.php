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

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/cache.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/contest.php";

	if ($export && !isLoggedIn())
		stop(11, "Bạn chưa đăng nhập!", 401);

	if ($export && $_SESSION["id"] !== "admin")
		stop(31, "Access Denied!", 403);

	if (getConfig("contest.result.publish") !== true && $_SESSION["id"] !== "admin")
		stop(108, "Thông tin không được công bố", 200, Array(
			"list" => Array(),
			"rank" => Array()
		));

	if (getConfig("contest.ranking.enabled") !== true && $_SESSION["id"] !== "admin")
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
		$cacheName = ($_SESSION["id"] === "admin") ? "contestRank.admin" : "contestRank.user";

		$cache = new Cache($cacheName);
		$cache -> setAge(getConfig("cache.contestRank"));
		
		if ($cache -> validate()) {
			$returnData = $cache -> getData();
			stop(0, "Thành công!", 200, $returnData, Array($returnData["spOverall"], $returnData["spRanking"], $returnData["overall"], count($returnData["rank"])));
		}
	}

	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/account.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/logParser.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/submissions.php";

	updateSubmissions();

	//? SUBMISSIONS CALCULATION
	$usersList = getSubmissionsList();

	if (getConfig("contest.ranking.showAllUsers"))
		$usersList = array_merge($usersList, getAccountsList());

	$res = Array();
	$_list_ = Array();
	$list = Array();
	$nameList = Array();
	$total = Array();
	$sp = Array();
	$overall = 0;
	$spOverall = 0;

	foreach ($usersList as $user) {
		$sub = new submissions($user);
		$subList = $sub -> list();

		$userData = (new account($user)) -> data;
		$res[$user] = Array(
			"username" => $user,
			"name" => ($userData && isset($userData["name"])) ? $userData["name"] : null,
			"total" => 0,
			"sp" => 0,
			"logFile" => Array(),
			"status" => Array(),
			"point" => Array(),
			"lastSubmit" => null
		);

		if (count($subList) === 0 && !getConfig("contest.ranking.showAllUsers")) {
			unset($res[$user]);
			continue;
		}

		foreach ($sub -> list() as $id) {
			$data = $sub -> getData($id);

			if (!$data || !isset($data["header"]))
				continue;

			$data = $data["header"];
			$meta = $sub -> getMeta($id);
			$filename = $data["file"]["logFilename"];
	
			if (problemDisabled($data["problem"]) && getConfig("contest.ranking.hideDisabled") && $_SESSION["id"] !== "admin")
				continue;
	
			if (getConfig("contest.ranking.viewTask") === true || $_SESSION["id"] === "admin") {
				$_list_[$data["problem"]] = null;
				$res[$user]["status"][$data["problem"]] = $data["status"];
				$res[$user]["point"][$data["problem"]] = $data["point"];
				$res[$user]["logFile"][$data["problem"]] = (getConfig("contest.log.enabled") === true || $_SESSION["id"] === "admin") ? $filename : null;

				if (isset($meta["sp"]))
					$res[$user]["sps"][$data["problem"]] = $meta["sp"]["point"];

				if (isset($data["problemName"]))
					$nameList[$data["problem"]] = $data["problemName"];
			}
	
			if (!isset($res[$user]["lastSubmit"]) || $res[$user]["lastSubmit"] < $data["file"]["lastModify"])
				$res[$user]["lastSubmit"] = $data["file"]["lastModify"];
				
			$res[$user]["total"] += $data["point"];

			if (isset($meta["sp"]))
				$res[$user]["sp"] += $meta["sp"]["point"];
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

	$spRanking = getConfig("contest.result.spRanking");

	// Sort data
	usort($res, function($a, $b) {
		global $spRanking;

		if ($spRanking) {
			$a = $a["sp"];
			$b = $b["sp"];
		} else {
			$a = $a["total"];
			$b = $b["total"];
		}
	
		if ($a === $b)
			return 0;

		return ($a > $b) ? -1 : 1;
	});

	foreach ($res as $value) {
		$total[$value["username"]] = $value["total"];
		$overall += $total[$value["username"]];
		$sp[$value["username"]] = $value["sp"];
		$spOverall += $sp[$value["username"]];
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
		$returnData = Array(
			"list" => $list,
			"nameList" => $nameList,
			"total" => $total,
			"sp" => $sp,
			"rank" => $res,
			"overall" => $overall,
			"spOverall" => $spOverall,
			"spRanking" => $spRanking
		);
		
		$cache -> save($returnData);
		stop(0, "Thành công!", 200, $returnData, Array($returnData["spOverall"], $returnData["spRanking"], $returnData["overall"], count($returnData["rank"])));
	}