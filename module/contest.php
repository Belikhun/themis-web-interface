<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /module/contest.php                                                                          |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/module/config.php";

	function calculateSubmissionPoint($point, $time, $subNth) {
		// Time Graph
		// https://www.geogebra.org/graphing/gtcczbqu
		$timePoint = 0.2 + (0.8 * cos(((($time ** 0.5) * pi()) / 2) - (pi() / 2)));

		// SubmitNth Graph
		// https://www.geogebra.org/graphing/e2tt3wab
		$subNth = 1 / $subNth;
		$submitNthPoint = 1 + ((($subNth ** 0.5) - 1) / (($subNth ** 6) + 2));

		return $point * $timePoint * $submitNthPoint;
	}

	print "<pre>";
	for ($i=0;$i < 10; $i++) { 
		$point = 10;
		$time = randBetween(0, 1, false);
		$subNth = randBetween(1, 100);
		
		print "$point $time $subNth ". calculateSubmissionPoint($point, $time, $subNth) ."\n";
	}

	function updateSubmissions() {
		require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
		require_once $_SERVER["DOCUMENT_ROOT"] ."/module/logParser.php";
		require_once $_SERVER["DOCUMENT_ROOT"] ."/module/submissions.php";

		//? PARSE LOG FILES
		$logDir = glob(getConfig("folders.submitLogs") ."/*.log");

		foreach ($logDir as $log) {
			$data = ((new logParser($log, LOGPARSER_MODE_FULL)) -> parse());
			$id = $data["header"]["problem"];

			$sub = new submissions($data["header"]["user"]);

			if ($sub -> exist($id) && $saved = $sub -> getData($id))
				if ($saved["header"]["point"] > $data["header"]["point"]) {
					unlink($log);
					continue;
				}

			// GET PROBLEM DETAIL
			$data["header"]["problemName"] = null;
			$data["header"]["problemPoint"] = null;
			$problemData = problemGet($id, $_SESSION["id"] === "admin");
								
			if ($problemData !== PROBLEM_ERROR_IDREJECT && $problemData !== PROBLEM_ERROR_DISABLED) {
				$data["header"]["problemName"] = $problemData["name"];
				$data["header"]["problemPoint"] = $problemData["point"];
				
				if ($data["header"]["problemPoint"] <= $data["header"]["point"])
					$data["header"]["status"] = "correct";
			}

			$sub -> saveData($id, $data);
			$sub -> saveLog($id, $log);
		}
	}

	define("CONTEST_STARTED", 1);
	define("CONTEST_NOTENDED", 2);
	define("CONTEST_ENDED", 3);

	function contest_timeRequire(array $req = Array(
		CONTEST_STARTED,
		CONTEST_NOTENDED
	), $justReturn = true, $instantDeath = false, $resCode = 403) {
		$duringTime = getConfig("time.contest.during");
		if ($duringTime <= 0)
			return true;

		// Admin can bypass this check
		if ($_SESSION["username"] !== null && $_SESSION["id"] === "admin")
			return true;

		$beginTime = getConfig("time.contest.begin");
		$offsetTime = getConfig("time.contest.offset");
		$t = $beginTime - microtime(true) + ($duringTime * 60);

		foreach ($req as $key => $value) {
			$returnCode = null;
			$message = null;

			switch($value) {
				case CONTEST_STARTED:
					if ($t > $duringTime * 60) {
						$returnCode = 103;
						$message = "Kì thi chưa bắt đầu";
					}
					break;

				case CONTEST_NOTENDED:
					if ($t < -$offsetTime && $duringTime !== 0) {
						$returnCode = 104;
						$message = "Kì thi đã kết thúc";
					}
					break;

				case CONTEST_ENDED:
					if ($t > -$offsetTime && $duringTime !== 0) {
						$returnCode = 105;
						$message = "Kì thi chưa kết thúc";
					}
					break;

				default:
					trigger_error("Unknown case: ". $code, E_USER_ERROR);
					break;
			}

			if ($returnCode !== null && $message !== null) {
				if ($justReturn === true)
					return $returnCode;

				//* Got NOTICE on Codefactor for no reason:
				//* if ($useDie === true)
				//* 	(http_response_code($resCode) && die());

				if ($instantDeath === true) {
					http_response_code($resCode);
					die();
				}

				stop($returnCode, $message, $resCode);
			}
		}

		return true;
	}