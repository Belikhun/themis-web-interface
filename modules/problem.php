<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /modules/problem.php                                                                         |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/account.php";
	
	$problemList = Array();
	foreach(glob(PROBLEMS_DIR ."/*", GLOB_ONLYDIR) as $i => $path) {
		$problemID = basename($path);
		$problemList[$problemID] = json_decode((new fip($path ."/data.json")) -> read(), true);
	}

	define("PROBLEM_TEMPLATE", Array(
		"name" => "Sample Problem",
		"author" => null,
		"point" => 0,
		"time" => 1,
		"memory" => 1024,
		"limit" => 0,
		"type" => Array(
			"input" => "Bàn Phím",
			"output" => "Màn Hình"
		),
		"accept" => Array("pas", "cpp", "c", "pp", "exe", "class", "py", "java"),
		"loved" => Array(),
		"tags" => Array(),
		"description" => "Description About Problem",
		"test" => Array(),
		"thumbnail" => null,
		"attachment" => null,
		"disabled" => false,
		"canSubmit" => false
	));
	
	// Return Code
	define("PROBLEM_OKAY", 0);
	define("PROBLEM_ERROR", 1);
	define("PROBLEM_ERROR_IDREJECT", 2);
	define("PROBLEM_ERROR_FILETOOLARGE", 3);
	define("PROBLEM_ERROR_FILEREJECT", 4);
	define("PROBLEM_ERROR_FILENOTFOUND", 5);
	define("PROBLEM_ERROR_DISABLED", 6);
	
	function problemList(Bool $showDisabled = false) {
		global $problemList;
		$list = Array();
			
		foreach($problemList as $id => $item) {
			if ($showDisabled || !$item["disabled"])
				array_push($list, Array(
					"id" => $id,
					"name" => $item["name"],
					"point" => $item["point"],
					"thumbnail" => "/api/contest/problems/thumbnail?id=". $id,

					"author" => isset($item["author"])
						? (new Account($item["author"])) -> getDetails()
						: null,

					"attachment" => isset($item["attachment"])
						? $item["attachment"]
						: null,

					"loved" => isset($item["loved"])
						? $item["loved"]
						: Array(),

					"canSubmit" => isset($item["canSubmit"])
						? $item["canSubmit"]
						: null,

					"tags" => isset($item["tags"])
						? $item["tags"]
						: Array(),
					
					"modify" => filemtime(PROBLEMS_DIR ."/". $id ."/data.json"),
					"disabled" => $item["disabled"]
				));
		}

		if (getConfig("contest.problem.sortByName") === true)
			usort($list, function($a, $b) { return strcmp($a["name"], $b["name"]); });
		
		return $list;
	}

	function problemListAttachment() {
		global $problemList;
		$list = Array();
		
		foreach($problemList as $id => $item)
			if (isset($item["attachment"])) {
				$f = PROBLEMS_DIR ."/". $id ."/". $item["attachment"];

				array_push($list, Array(
					"id" => $id,
					"name" => $item["name"],
					"size" => filesize($f),
					"attachment" => $item["attachment"],
					"lastmodify" => filemtime($f),
					"url" => "/api/contest/problems/attachment?id=". $id
				));
			}

		if (getConfig("contest.problem.sortByName") === true)
			usort($list, function($a, $b) { return strcmp($a["name"], $b["name"]); });
		
		return $list;
	}

	function problemGet(String &$id, Bool $bypassDisabled = false) {
		global $problemList;

		if (!problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		$data = PROBLEM_TEMPLATE;
		mergeObjectRecursive($data, $problemList[$id]);

		if ($data["disabled"] && !$bypassDisabled)
			return PROBLEM_ERROR_DISABLED;

		$data["author"] = (new Account($data["author"])) -> getDetails();
		$data["modify"] = filemtime(PROBLEMS_DIR ."/". $id ."/data.json");
		$data["id"] = $id;
		return $data;
	}

	function problemEdit(String $id, Array $set, Array $thumbnail = null, Array $attachment = null) {
		global $problemList;

		if (!problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		$defTemplate = PROBLEM_TEMPLATE;

		// Add image and attachment value if current data have
		// it because the template does not have the image and
		// attachment field
		if (isset($problemList[$id]["thumbnail"]))
			$defTemplate["thumbnail"] = $problemList[$id]["thumbnail"];

		if (isset($problemList[$id]["attachment"]))
			$defTemplate["attachment"] = $problemList[$id]["attachment"];

		if (isset($thumbnail)) {
			$thumbnailFile = utf8_encode(strtolower($thumbnail["name"]));
			$extension = pathinfo($thumbnailFile, PATHINFO_EXTENSION);

			if (!in_array($extension, IMAGE_ALLOW))
				return PROBLEM_ERROR_FILEREJECT;

			if ($thumbnail["size"] > MAX_IMAGE_SIZE)
				return PROBLEM_ERROR_FILETOOLARGE;

			if ($thumbnail["error"] > 0)
				return PROBLEM_ERROR;

			if (isset($problemList[$id]["thumbnail"]) && file_exists(PROBLEMS_DIR ."/". $id ."/". $problemList[$id]["thumbnail"]))
				unlink(PROBLEMS_DIR ."/". $id ."/". $problemList[$id]["thumbnail"]);

			move_uploaded_file($thumbnail["tmp_name"], PROBLEMS_DIR ."/". $id ."/". $thumbnailFile);

			$set["thumbnail"] = $thumbnailFile;
		}

		if (isset($attachment)) {
			$attachmentFile = utf8_encode(strtolower($attachment["name"]));
			$extension = pathinfo($attachmentFile, PATHINFO_EXTENSION);

			if ($attachment["size"] > MAX_ATTACHMENT_SIZE)
				return PROBLEM_ERROR_FILETOOLARGE;

			if ($attachment["error"] > 0)
				return PROBLEM_ERROR;

			if (isset($problemList[$id]["attachment"]) && file_exists(PROBLEMS_DIR ."/". $id ."/". $problemList[$id]["attachment"]))
				unlink(PROBLEMS_DIR ."/". $id ."/". $problemList[$id]["attachment"]);

			move_uploaded_file($attachment["tmp_name"], PROBLEMS_DIR ."/". $id ."/". $attachmentFile);

			$set["attachment"] = $attachmentFile;
		}

		// Merge current data into the template, then merge changes into
		// the template.
		// This is to automaticly update problem config to the template
		mergeObjectRecursive($defTemplate, $problemList[$id], false, true);
		mergeObjectRecursive($defTemplate, $set, function($a, $b, $k) {
			if ($a !== "NULL" && $a !== $b)
				stop(3, "Loại biến không khớp! Yêu cầu $k là \"$a\", nhận được \"$b\"!", 400, Array(
					"expect" => $a,
					"got" => $b,
					"key" => $k
				));
	
			return true;
		}, true);

		$problemList[$id] = $defTemplate;
		problemSave($id);

		return PROBLEM_OKAY;
	}

	function problemAdd(String $id, Array $add, Array $thumbnail = null, Array $attachment = null) {
		global $problemList;

		if (problemExist($id))
			return PROBLEM_ERROR_IDREJECT;
		
		$problemList[$id] = PROBLEM_TEMPLATE;
		mergeObjectRecursive($problemList[$id], $add, function($a, $b, $k) {
			if ($a !== "NULL" && $a !== $b)
				stop(3, "Loại biến không khớp! Yêu cầu $k là \"$a\", nhận được \"$b\"!", 400, Array(
					"expect" => $a,
					"got" => $b,
					"key" => $k
				));
	
			return true;
		}, true);

		mkdir(PROBLEMS_DIR. "/" .$id, 0777, true);

		if (isset($thumbnail)) {
			$thumbnailFile = utf8_encode(strtolower($thumbnail["name"]));
			$extension = pathinfo($thumbnailFile, PATHINFO_EXTENSION);

			if (!in_array($extension, IMAGE_ALLOW))
				return PROBLEM_ERROR_FILEREJECT;

			if ($thumbnail["size"] > MAX_IMAGE_SIZE)
				return PROBLEM_ERROR_FILETOOLARGE;

			if ($thumbnail["error"] > 0)
				return PROBLEM_ERROR;

			move_uploaded_file($thumbnail["tmp_name"], PROBLEMS_DIR ."/". $id ."/". $thumbnailFile);
			$problemList[$id]["thumbnail"] = $thumbnailFile;
		}

		if (isset($attachment)) {
			$attachmentFile = utf8_encode(strtolower($attachment["name"]));

			if ($attachment["size"] > MAX_ATTACHMENT_SIZE)
				return PROBLEM_ERROR_FILETOOLARGE;

			if ($attachment["error"] > 0)
				return PROBLEM_ERROR;

			move_uploaded_file($attachment["tmp_name"], PROBLEMS_DIR ."/". $id ."/". $attachmentFile);
			$problemList[$id]["attachment"] = $attachmentFile;
		}

		problemSave($id);
		return PROBLEM_OKAY;
	}

	function problemGetAttachment(String $id, Bool $downloadHeader = true) {
		global $problemList;

		if (!problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		if (!isset($problemList[$id]["attachment"]))
			return PROBLEM_ERROR;
		
		$i = $problemList[$id]["attachment"];
		$f = PROBLEMS_DIR ."/". $id ."/". $i;

		contentType(pathinfo($i, PATHINFO_EXTENSION));
		header("Content-Length: ".filesize($f));

		if ($downloadHeader)
			header("Content-Disposition: attachment; filename=". utf8_decode(pathinfo($i, PATHINFO_BASENAME)));
		else
			header("Content-Disposition: inline");
		
		readfile($f);
		return PROBLEM_OKAY;
	}

	function problemRemove(String $id) {
		global $problemList;

		if (!problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		if (!file_exists(PROBLEMS_DIR ."/". $id))
			return PROBLEM_ERROR;

		rmrf(PROBLEMS_DIR ."/". $id);
		unset($problemList[$id]);
		return PROBLEM_OKAY;
	}

	function problemRemoveThumbnail(String $id) {
		global $problemList;

		if (!problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		if (!isset($problemList[$id]["thumbnail"]))
			return PROBLEM_ERROR_FILENOTFOUND;

		$thumbnailFile = $problemList[$id]["thumbnail"];
		$dir = PROBLEMS_DIR ."/". $id;
		$target = $dir ."/". $thumbnailFile;
		
		if (file_exists($target))
			unlink($target);

		unset($problemList[$id]["thumbnail"]);
		problemSave($id);

		return PROBLEM_OKAY;
	}

	function problemRemoveAttachment(String $id) {
		global $problemList;

		if (!problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		if (!isset($problemList[$id]["attachment"]))
			return PROBLEM_ERROR_FILENOTFOUND;

		$attachmentFile = $problemList[$id]["attachment"];
		$dir = PROBLEMS_DIR ."/". $id;
		$target = $dir ."/". $attachmentFile;
		
		if (file_exists($target))
			unlink($target);

		unset($problemList[$id]["attachment"]);
		problemSave($id);

		return PROBLEM_OKAY;
	}

	function problemSave(String $id) {
		global $problemList;
		return (new fip(PROBLEMS_DIR ."/". $id ."/data.json"))
			-> write(json_encode($problemList[$id], JSON_PRETTY_PRINT));
	}

	function problemLimit(String $id) {
		global $problemList;

		if (!problemExist($id))
			return -1;

		return isset($problemList[$id]["limit"])
			? $problemList[$id]["limit"]
			: -1;
	}

	/**
	 * Check if there is a problem with given ID
	 * 
	 * This function will try to autocorrect ID with different format:
	 * 
	 * + `original`
	 * + `UPPERCASE`
	 * + `lowercase`
	 * + `Upcasefirst`
	 * 
	 * @param	String	$id	Problem ID
	 * @return	Boolean
	 */
	function problemExist(String &$id) {
		global $problemList;

		// TRY LIST
		$try = Array(
			$id,
			strtoupper($id),
			strtolower($id),
			ucfirst($id)
		);

		foreach ($try as $value)
			if (isset($problemList[$value])) {
				$id = $value;
				return true;
			}
		
		return false;
	}

	function problemDisabled(String $id) {
		global $problemList;
		return (isset($problemList[$id]["disabled"]) && $problemList[$id]["disabled"]);
	}

	function problemCheckExtension(String $id, String $ext) {
		global $problemList;
		if (!problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		return isset($problemList[$id]["accept"]) ? in_array($ext, $problemList[$id]["accept"]) : false;
	}
