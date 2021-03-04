<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /libs/logger.php                                                                             |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";

	define("LOG_FILE", $_SERVER["DOCUMENT_ROOT"] ."/data/log.json");

	function readLog(string $format, $reversed = false) {
		$logs = new fip(LOG_FILE, "[]");
		$logsData = json_decode($logs -> read(), true) ?: [];

		if ($reversed)
			$logsData = array_reverse($logsData);

		switch($format) {
			case "text":
				$output = "";
				foreach ($logsData as $key => $value) {
					$s = join("| ", Array(
						$value["time"],
						sprintf("%'. 22s", $value["module"]),
						sprintf("%'. 6s", $value["level"]),
						sprintf("%'. 14s", $value["client"]["username"] ?: "ANONYMOUS"),
						sprintf("%'. 42s", $value["client"]["ip"] ?: "NO IP ADDRESS"),
						$value["text"]
					));
					$output = $output.$s."\n";
				}
				break;

			case "json":
				array_walk($logsData, function(&$value, $index) { $value["nth"] = $index + 1; });
				$output = $logsData;
				break;

			case "formattedjson":
				$output = Array();
				foreach ($logsData as $key => $value)
					$s = join("| ", Array(
						date("d/m/Y H:i:s"),
						sprintf("%'. 16s", $value["module"]),
						sprintf("%'. 5s", $value["level"]),
						sprintf("%'. 42s", $value["client"]["username"] ."@". $value["client"]["ip"]),
						$value["text"]
					));

				array_push($output, $s);
				break;

			default:
				return false;
		}

		return $output;
	}

	function writeLog(string $level, string $text, bool $includeClientData = true) {
		$level = strtoupper($level);
		$l = Array("OKAY", "INFO", "WARN", "ERRR", "VERB");
		if (!in_array($level, $l))
			return false;

		$t = time();
		$bt = debug_backtrace();
		$bt = isset($bt[1]) ? $bt[1] : $bt[0];
		$file = isset($bt["file"]) ? $bt["file"] : "unknown";
		$line = isset($bt["line"]) ? $bt["line"] : "unknown";

		// Get client data
		$username = $includeClientData ? $_SESSION["username"] : null;
		$ip = $includeClientData ? $_SERVER["REMOTE_ADDR"] : null;

		$n = Array(
			"level" => $level,
			"unixtime" => $t,
			"time" => date("d/m/Y H:i:s", $t),
			"text" => $text,
			"module" => pathinfo($file, PATHINFO_BASENAME) .":". $line,
			"client" => Array(
				"username" => $username,
				"ip" => $ip
			)
		);

		// Write to log file
		$logs = new fip(LOG_FILE, "[]");
		$logsData = $logs -> read("json");
		array_push($logsData, $n);
		$logs -> write($logsData, "json");
		
		if (file_exists($_SERVER["DOCUMENT_ROOT"] ."/modules/hash.php")) {
			require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/hash.php";
			onUpdateSysLogs(filesize(LOG_FILE), count($logsData));
		}
		
		return true;
	}

	function clearLog() {
		$logs = new fip(LOG_FILE, "[]");
		$logs -> write("[]");
		writeLog("WARN", "Đã xóa nhật kí!");
	}