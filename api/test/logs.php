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
	
	if (!islogedin())
		stop(9, "Bạn chưa đăng nhập.", 403);

	$dir = glob($logsDir ."/*.log");
	$username = $_SESSION["username"];
	$hurl = "/api/test/download?f=";
	$res = Array();

	$i = -1;
	foreach($dir as $file) {
		if (!strpos($file, "[". $username ."]") > 0)
			continue;
		$i++;
		$url = "#";

		if ($publish == true)
			$url = $hurl . basename($file);

		if (strpos(strtolower($file), ".log") > 0) {
			$out = "Đã chấm xong!";
			$lastm = null;
			$name = null;
			$log = fopen($file, "r");

			if ($publish == true) {
				$lastm = date("d/m/Y H:i:s.", filemtime($file));
				$l1 = str_replace(PHP_EOL, "", fgets($log));
				$name = str_replace(PHP_EOL, "", fgets($log));
				$out = substr($l1, strlen($username) + strlen(pathinfo($name, PATHINFO_FILENAME)) + 8);
				preg_match("/[0-9]{1,},[0-9]{1,}/", $out, $t);
				if (isset($t[0]))
					$out = $t[0];
			} else {
				fgets($log);
				$name = str_replace(PHP_EOL, "", fgets($log));
			}

			fclose($log);
		}
		else $out = "Đang đợi chấm...";

		$res[$i] = Array(
			"name" => $name,
			"out" => $out,
			"lastmodify" => $lastm,
			"url" => $url
		);
	}
	stop(0, "Success!", 200, $res);
?>