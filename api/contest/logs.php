<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/logs.php                                                                           |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";

	if (!isLogedIn())
		stop(11, "Bạn chưa đăng nhập.", 403);

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logParser.php";
	$username = $_SESSION["username"];
	$updir = glob($config["uploadDir"] ."/*.*");
	$queues = Array();
	$queuefiles = Array();

	foreach ($updir as $file) {
		if (!strpos($file, "[". $username ."]") > 0)
			continue;

		$data = parseLogName(pathinfo($file .".log", PATHINFO_BASENAME));
		$lastm = date("d/m/Y H:i:s", filemtime($file));
		
		array_push($queues, Array(
			"problem" => $data["problem"],
			"extension" => $data["extension"],
			"lastmodify" => $lastm
		));

		array_push($queuefiles, $file);
	}

	if ($_SERVER["REQUEST_METHOD"] === "DELETE")
		$_SESSION["logsData"]["judging"] = Array();
	
	$judging = isset($_SESSION["logsData"]["judging"]) ? $_SESSION["logsData"]["judging"] : Array();

	if (!isset($_SESSION["logsData"]["lastqueuesfiles"]))
		$_SESSION["logsData"]["lastqueuesfiles"] = $queuefiles;
	else {
		$lqfs = $_SESSION["logsData"]["lastqueuesfiles"];
		
		foreach($lqfs as $i => $item)
			if (!in_array($item, $queuefiles)) {
				$p = parseLogName($item .".log");

				// find and remove old log file
				$loglist = glob($config["logDir"] ."/*.*");
				foreach ($loglist as $log)
					if (strpos($log, $p["problem"]) > 0 && (strpos($log, $username) > 0))
						unlink($log);

				array_push($judging, Array(
					"problem" => $p["problem"],
					"name" => $p["name"],
					"extension" => $p["extension"],
					"lastmodify" => date("d/m/Y H:i:s"),
					"lastmtime" => time(),
				));
			}

		$_SESSION["logsData"]["lastqueuesfiles"] = $queuefiles;
	}

	$logDir = glob($config["logDir"] ."/*.log");
	$logres = Array();

	foreach($logDir as $log) {
		if (!strpos($log, "[". $username ."]") > 0 || strpos(strtolower($log), ".log") === -1)
			continue;

		$filename = null;
		if ($config["viewLog"] === true)
			$filename = pathinfo($log, PATHINFO_FILENAME);

		$lastmtime = filemtime($log);
		$lastm = date("d/m/Y H:i:s", $lastmtime);

		$data = ((new logParser($log, LOGPARSER_MODE_MINIMAL)) -> parse())["header"];
		$point = $data["point"];

		foreach ($judging as $i => $item)
			if ($item["name"] === $data["file"]["name"] && file_exists($log) && (int)$item["lastmtime"] < (int)filemtime($log))
				array_splice($judging, $i, 1);

		if ($config["publish"] !== true) {
			$data["status"] = "scored";
			$data["point"] = null;
		}

		array_push($logres, Array(
			"status" => $data["status"],
			"problem" => $data["problem"],
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