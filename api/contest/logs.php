<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/logs.php                                                                        |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
    define("PAGE_TYPE", "API");

    require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";

	if (!isLoggedIn())
		stop(11, "Bạn chưa đăng nhập", 401);

	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/logParser.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/contest.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/submissions.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/problems.php";

	$username = $_SESSION["username"];
	$uploadFiles = glob(getConfig("folders.submit") ."/*.*");
	$queueFiles = Array();
	$queues = Array();

	foreach ($uploadFiles as $file) {
		if (!strpos($file, "[". $username ."]") > 0)
			continue;

		$data = parseLogName($file);

		array_push($queues, Array(
			"problem" => $data["problem"],
			"problemName" => $data["problemName"],
			"problemPoint" => $data["problemPoint"],
			"extension" => $data["extension"],
			"lastModify" => filemtime($file)
		));

		array_push($queueFiles, $file);
	}

	if ($_SERVER["REQUEST_METHOD"] === "DELETE")
		$_SESSION["logsData"]["judging"] = Array();
	
	$judging = isset($_SESSION["logsData"]["judging"]) ? $_SESSION["logsData"]["judging"] : Array();

	if (!isset($_SESSION["logsData"]["lastQueueFiles"]))
		$_SESSION["logsData"]["lastQueueFiles"] = $queueFiles;
	else {
		$lqfs = $_SESSION["logsData"]["lastQueueFiles"];
		
		foreach($lqfs as $i => $item)
			if (!in_array($item, $queueFiles)) {
				$data = parseLogName($item);

				// GET PROBLEM DETAIL
				$problemData = problemGet($data["problem"], $_SESSION["id"] === "admin");
				$problemName = null;
				$problemPoint = null;
				
				if ($problemData !== PROBLEM_ERROR_IDREJECT && $problemData !== PROBLEM_ERROR_DISABLED) {
					$problemName = $problemData["name"];
					$problemPoint = $problemData["point"];
				}

				// find and remove old log file
				$loglist = glob(getConfig("folders.submitLogs") ."/*.*");
				foreach ($loglist as $log)
					if (strpos($log, $data["problem"]) > 0 && (strpos($log, $username) > 0))
						unlink($log);

				array_push($judging, Array(
					"problem" => $data["problem"],
					"problemName" => $problemName,
					"problemPoint" => $problemPoint,
					"name" => $data["name"],
					"extension" => $data["extension"],
					"lastModify" => time(),
				));
			}

		$_SESSION["logsData"]["lastQueueFiles"] = $queueFiles;
	}

	updateSubmissions();

	$sub = new Submissions($username);
	$logs = Array();

	foreach ($sub -> list() as $id) {
		$data = $sub -> getData($id);

		if (!$data || !isset($data["header"]))
			continue;

		$data = $data["header"];
		$meta = $sub -> getMeta($id);

		foreach ($judging as $i => $item)
			if ($item["name"] === $data["file"]["name"] && $meta["lastModify"]["data"] > $item["lastModify"])
				array_splice($judging, $i, 1);

		if (getConfig("contest.result.publish") !== true && $_SESSION["id"] !== "admin") {
			$data["status"] = "scored";
			$data["point"] = null;
		}

		array_push($logs, Array(
			"status" => $data["status"],
			"problem" => $data["problem"],
			"problemName" => $data["problemName"],
			"problemPoint" => $data["problemPoint"],
			"extension" => $data["file"]["extension"],
			"point" => $data["point"],
			"lastModify" => $data["file"]["lastModify"],
			"logFile" => ((getConfig("contest.log.enabled") === true || $_SESSION["id"] === "admin") && $data["file"]["logFilename"])
		));
	}

	$_SESSION["logsData"]["judging"] = $judging;

	stop(0, "Thành công!", 200, Array(
		"queues" => $queues,
		"judging" => $judging,
		"logs" => $logs,
	), true);
?>