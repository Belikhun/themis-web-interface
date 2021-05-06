<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/contest/problems/rank.php                                                               |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
	define("PAGE_TYPE", "API");

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/cache.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/contest.php";

	$id = reqQuery("id");

	if (getConfig("contest.result.publish") !== true && $_SESSION["id"] !== "admin")
		stop(108, "Thông tin không được công bố", 200, Array());

	if (getConfig("contest.ranking.enabled") !== true && $_SESSION["id"] !== "admin")
		stop(107, "Xếp hạng đã bị tắt", 200, Array());

	if (contest_timeRequire([CONTEST_STARTED], true) !== true)
		stop(103, "Kì thi chưa bắt đầu", 200, Array());

	// Validate cache
	// If the cache age is still valid, we will return cache data instead
	// of recalculating the entire ranking table
	$cacheName = ($_SESSION["id"] === "admin") ? "contestRank.$id.admin" : "contestRank.$id.user";
	$cache = new Cache($cacheName);
	$cache -> setAge(getConfig("cache.contestRank"));
	
	if ($cache -> validate()) {
		$returnData = $cache -> getData();
		stop(0, "Thành công!", 200, $returnData, "hash here!!!");
	}

	// Update ranking table for problem
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/account.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/logParser.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/submissions.php";

	//? SUBMISSIONS CALCULATION
	$usersList = getSubmissionsByID($id);

	$res = Array();
	$point = Array();
	$sp = Array();
	$overall = 0;
	$spOverall = 0;

	foreach ($usersList as $user) {
		$sub = new Submissions($user);
		$subList = $sub -> list();

		$userData = (new Account($user)) -> getDetails();
		$res[$user] = Array(
			"username" => $user,
			"name" => ($userData && isset($userData["name"]))
				? $userData["name"]
				: null,
			"online" => ($userData && isset($userData["online"]))
				? $userData["online"]
				: false,
			
			"status" => null,
			"logFile" => null,
			"point" => 0,
			"sp" => null,
			"statistic" => null,
			"lastSubmit" => null,
			"lastModify" => null
		);

		$data = $sub -> getData($id);

		if (!$data || !isset($data["header"]))
			continue;

		$data = $data["header"];
		$meta = $sub -> getMeta($id);

		if (getConfig("contest.ranking.viewTask") === true || $_SESSION["id"] === "admin") {
			$res[$user]["status"] = $data["status"];
			$res[$user]["point"] = $data["point"];

			$res[$user]["logFile"] =
				(getConfig("contest.log.enabled") === true || $_SESSION["id"] === "admin")
					? $data["file"]["logFilename"]
					: null;

			if (isset($meta["sp"]))
				$res[$user]["sp"] = $meta["sp"];

			if (isset($meta["statistic"]))
				$res[$user]["statistic"] = $meta["statistic"];

			if (isset($meta["lastModify"]))
				$res[$user]["lastModify"] = $meta["lastModify"];
		}

		$res[$user]["lastSubmit"] = $data["file"]["lastModify"];
	}

	$spRanking = getConfig("contest.result.spRanking");

	// Sort data
	usort($res, function($a, $b) {
		global $spRanking;

		if ($spRanking) {
			$a = $a["sp"];
			$b = $b["sp"];
		} else {
			$a = $a["point"];
			$b = $b["point"];
		}
	
		if ($a === $b)
			return 0;

		return ($a > $b) ? -1 : 1;
	});

	foreach ($res as $value) {
		$point[$value["username"]] = $value["point"];
		$overall += $point[$value["username"]];

		if (isset($value["sp"])) {
			$sp[$value["username"]] = $value["sp"]["point"];
			$spOverall += $sp[$value["username"]];
		} else
			$sp[$value["username"]] = null;
	}

	$returnData = Array(
		"id" => $id,
		"point" => $point,
		"sp" => $sp,
		"rank" => $res,
		"overall" => $overall,
		"spOverall" => $spOverall,
		"spRanking" => $spRanking
	);
		
	$cache -> save($returnData);
	stop(0, "Thành công!", 200, $returnData, Array($returnData["spOverall"], $returnData["spRanking"], $returnData["overall"], count($returnData["rank"])));