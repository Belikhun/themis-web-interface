<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/logs.php                                                                        |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
    define("PAGE_TYPE", "API");

    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";

	if (!isLogedIn())
		stop(11, "Bạn chưa đăng nhập.", 403);

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logParser.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/problems/problem.php";
	$username = $_SESSION["username"];
	$updir = glob($config["uploadDir"] ."/*.*");
	$queues = Array();
	$queueFiles = Array();

	foreach ($updir as $file) {
		if (!strpos($file, "[". $username ."]") > 0)
			continue;

		$data = parseLogName($file);
		$lastm = date("d/m/Y H:i:s", filemtime($file));

		array_push($queues, Array(
			"problem" => $data["problem"],
			"problemName" => $data["problemName"],
			"problemPoint" => $data["problemPoint"],
			"extension" => $data["extension"],
			"lastmodify" => $lastm
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

				// find and remove old log file
				$loglist = glob($config["logDir"] ."/*.*");
				foreach ($loglist as $log)
					if (strpos($log, $data["problem"]) > 0 && (strpos($log, $username) > 0))
						unlink($log);

				array_push($judging, Array(
					"problem" => $data["problem"],
					"problemName" => $data["problemName"],
					"problemPoint" => $data["problemPoint"],
					"name" => $data["name"],
					"extension" => $data["extension"],
					"lastmodify" => date("d/m/Y H:i:s"),
					"lastmtime" => time(),
				));
			}

		$_SESSION["logsData"]["lastQueueFiles"] = $queueFiles;
	}

	$logDir = glob($config["logDir"] ."/*.log");
	$logres = Array();

	foreach ($logDir as $log) {
		if (!strpos($log, "[". $username ."]") > 0 || strpos(strtolower($log), ".log") === -1)
			continue;

		$filename = null;
		if ($config["viewLog"] === true || $_SESSION["id"] === "admin")
			$filename = pathinfo($log, PATHINFO_FILENAME);

		$lastmtime = filemtime($log);
		$lastm = date("d/m/Y H:i:s", $lastmtime);

		$data = ((new logParser($log, LOGPARSER_MODE_MINIMAL)) -> parse())["header"];
		$point = $data["point"];

		foreach ($judging as $i => $item)
			if ($item["name"] === $data["file"]["name"] && file_exists($log))
				array_splice($judging, $i, 1);

		if ($config["publish"] !== true && $_SESSION["id"] !== "admin") {
			$data["status"] = "scored";
			$data["point"] = null;
		}

		array_push($logres, Array(
			"status" => $data["status"],
			"problem" => $data["problem"],
			"problemName" => $data["problemName"],
			"problemPoint" => $data["problemPoint"],
			"extension" => $data["file"]["extension"],
			"point" => $data["point"],
			"lastmodify" => $lastm,
			"lastmtime" => $lastmtime,
			"logFile" => $filename
		));
	}

	$_SESSION["logsData"]["judging"] = $judging;

	stop(0, "Thành công!", 200, Array(
		"queues" => $queues,
		"judging" => $judging,
		"logs" => $logres,
	), true);
?>