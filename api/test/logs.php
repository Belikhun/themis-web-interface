<?php
	// |====================================================|
    // |                      logs.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";
	
	if (!islogedin())
		stop(11, "Bạn chưa đăng nhập.", 403);

	function parsename(string $path) {
		$path = basename($path);
		$path = str_replace("[", " ", str_replace(".", " ", str_replace("]", "", $path)));
		list($id, $username, $filename, $ext) = sscanf($path, "%s %s %s %s");
		return Array(
			"id" => $id,
			"username" => $username,
			"filename" => $filename,
			"ext" => $ext,
			"name" => $filename.".".$ext
		);
	}

	$username = $_SESSION["username"];

	$updir = glob($config["uploaddir"] ."/*.*");
	$queues = Array();
	$queuefiles = Array();

	foreach ($updir as $file) {
		if (!strpos($file, "[". $username ."]") > 0)
			continue;

		$name = parsename($file);
		$lastm = date("d/m/Y H:i:s", filemtime($file));
		
		array_push($queues, Array(
			"name" => $name["name"],
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
			if (!in_array($item, $queuefiles)) {
				$p = parsename($item);
				$loglist = glob($config["logdir"] ."/*.*");
				foreach ($loglist as $log)
					if (strpos($log, $p["filename"]) > 0 && (strpos($log, $username) > 0))
						unlink($log);

				array_push($judging, Array(
					"filename" => $p["filename"],
					"name" => $p["name"],
					"lastmodify" => date("d/m/Y H:i:s"),
					"lastmtime" => time(),
				));
			}

		$judging = arrayremblk($judging);
		$_SESSION["logs-module"]["lastqueuesfiles"] = $queuefiles;
	}

	$logdir = glob($config["logdir"] ."/*.log");
	$logres = Array();

	foreach($logdir as $log) {
		if (!strpos($log, "[". $username ."]") > 0)
			continue;

		$url = null;

		if ($config["viewlog"] == true)
			$url = "/api/test/viewlog?f=" . basename($log);

		if (strpos(strtolower($log), ".log") > 0) {
			$out = "Đã chấm xong!";
			$lastm = date("d/m/Y H:i:s", filemtime($log));
			$name = parsename($log);
			$flog = fopen($log, "r");

			foreach ($judging as $i => $item)
				if ($item["filename"] === $name["filename"] && file_exists($log) && (int)$item["lastmtime"] < (int)filemtime($log))
					unset($judging[$i]);

			if ($config["publish"] == true) {
				$out = str_replace(PHP_EOL, "", fgets($flog));
				$out = substr($out, strlen($username) + strlen($name["filename"]) + 8);
				preg_match("/[0-9]{1,},[0-9]{1,}/", $out, $t);
				if (count($t) != 0 && isset($t[count($t) - 1]))
					$out = $t[count($t) - 1];
			}
			fclose($flog);
		}

		array_push($logres, Array(
			"name" => $name["name"],
			"out" => $out,
			"lastmodify" => $lastm,
			"lastmtime" => filemtime($log),
			"url" => $url
		));
	}

	$_SESSION["logs-module"]["judging"] = $judging;

	stop(0, "Thành công!", 200, Array(
		"queues" => $queues,
		"judging" => $judging,
		"logs" => $logres,
	));
?>