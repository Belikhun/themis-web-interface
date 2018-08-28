<?php
	// |====================================================|
    // |                      logs.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belipack.php";
	require_once $_SERVER["DOCUMENT_ROOT"]."/config.php";

	function getname(string $str) {
		$n = null;
		preg_match("/(\[\w{1,}\]\.[a-zA-Z1-9]{1,})/", $str, $t);
		if (count($t) != 0 && isset($t[count($t) - 1]))
			$n = str_replace("]", "", str_replace("[", "", $t[count($t) - 1]));
		return $n;
	}
	
	if (!islogedin())
		stop(9, "Bạn chưa đăng nhập.", 403);

	$username = $_SESSION["username"];

	$updir = glob($uploadDir ."/*.*");
	$queues = Array();
	$queuefiles = Array();

	foreach ($updir as $file) {
		if (!strpos($file, "[". $username ."]") > 0)
			continue;

		$name = getname($file);
		$lastm = date("d/m/Y H:i:s", filemtime($file));
		
		array_push($queues, Array(
			"name" => $name,
			"lastmodify" => $lastm
		));
		array_push($queuefiles, $file);
	}

	$judging = (isset($_SESSION["logs-module"]["judging"]) ? $_SESSION["logs-module"]["judging"] : Array());

	if (!isset($_SESSION["logs-module"]["lastqueuesfiles"])) {
		$_SESSION["logs-module"]["lastqueuesfiles"] = $queuefiles;
	} else {
		$lqfs = $_SESSION["logs-module"]["lastqueuesfiles"];
		foreach($lqfs as $i => $item)
			if (!file_exists($item))
				array_push($judging, Array(
					"name" => getname($item),
					"lastmodify" => date("d/m/Y H:i:s"),
					"lastmtime" => time(),
				));
		
		$_SESSION["logs-module"]["lastqueuesfiles"] = $queuefiles;
	}

	$logdir = glob($logsDir ."/*.log");
	$logres = Array();

	foreach($logdir as $log) {
		if (!strpos($log, "[". $username ."]") > 0)
			continue;

		$url = "#";

		if ($publish == true)
			$url = "/api/test/getlog?f=" . basename($log);

		if (strpos(strtolower($log), ".log") > 0) {
			$out = "Đã chấm xong!";
			$lastm = null;
			$name = getname($log);
			$logtmp = $log .".tmp";
			copy($log, $logtmp);
			$flog = fopen($logtmp, "r");

			// TODO: This part is not working correctly
			foreach ($judging as $i => $item)
				if ($item["name"] === $name && $item["lastmtime"] < filemtime($log))
					unset($judging[$i]);

			if ($publish == true) {
				$lastm = date("d/m/Y H:i:s", filemtime($log));
				$out = str_replace(PHP_EOL, "", fgets($flog));
				$out = substr($out, strlen($username) + strlen(pathinfo($name, PATHINFO_FILENAME)) + 8);
				preg_match("/[0-9]{1,},[0-9]{1,}/", $out, $t);
				if (count($t) != 0 && isset($t[count($t) - 1]))
					$out = $t[count($t) - 1];
			} else {
				fgets($log);
				$name = str_replace(PHP_EOL, "", fgets($log));
			}
			fclose($flog);
			unlink($logtmp);
		}

		array_push($logres, Array(
			"name" => $name,
			"out" => $out,
			"lastmodify" => $lastm,
			"url" => $url
		));
	}

	$_SESSION["logs-module"]["judging"] = $judging;

	stop(0, "Success!", 200, Array(
		"queues" => $queues,
		"judging" => $judging,
		"logs" => $logres,
	));
?>