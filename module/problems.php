<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /module/problems.php                                                                         |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	
	$problemList = Array();
	foreach(glob(PROBLEMS_DIR ."/*", GLOB_ONLYDIR) as $i => $path) {
		$problemID = basename($path);
		$problemList[$problemID] = json_decode((new fip($path ."/data.json")) -> read(), true);
		$problemList[$problemID]["id"] = $problemID;
	}
	
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
			
		foreach($problemList as $i => $item) {
			if ($showDisabled || !$item["disabled"])
				array_push($list, Array(
					"id" => $item["id"],
					"name" => $item["name"],
					"point" => $item["point"],
					"image" => "/api/contest/problems/image?id=". $i,
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
		
		foreach($problemList as $i => $item)
			if (isset($item["attachment"])) {
				$f = PROBLEMS_DIR ."/". $i ."/". $item["attachment"];

				array_push($list, Array(
					"id" => $i,
					"name" => $item["name"],
					"size" => filesize($f),
					"attachment" => $item["attachment"],
					"lastmodify" => filemtime($f),
					"url" => "/api/contest/problems/attachment?id=". $i
				));
			}
		
		return $list;
	}

	function problemGet(String &$id, Bool $bypassDisabled = false) {
		global $problemList;

		if (!problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		$data = $problemList[$id];

		if ($data["disabled"] && !$bypassDisabled)
			return PROBLEM_ERROR_DISABLED;

		$data["id"] = $id;
		return $data;
	}

	function problemEdit(String $id, Array $set, Array $image = null, Array $attachment = null) {
		global $problemList;

		if (!problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		$data = $problemList[$id];
		$new = $data;

		if (isset($image)) {
			$imageFile = utf8_encode(strtolower($image["name"]));
			$extension = pathinfo($imageFile, PATHINFO_EXTENSION);

			if (!in_array($extension, IMAGE_ALLOW))
				return PROBLEM_ERROR_FILEREJECT;

			if ($image["size"] > MAX_IMAGE_SIZE)
				return PROBLEM_ERROR_FILETOOLARGE;

			if ($image["error"] > 0)
				return PROBLEM_ERROR;

			if (isset($problemList[$id]["image"]) && file_exists(PROBLEMS_DIR ."/". $id ."/". $problemList[$id]["image"]))
				unlink(PROBLEMS_DIR ."/". $id ."/". $problemList[$id]["image"]);

			move_uploaded_file($image["tmp_name"], PROBLEMS_DIR ."/". $id ."/". $imageFile);

			$new["image"] = $imageFile;
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

			$new["attachment"] = $attachmentFile;
		}

		$key = array_intersect_key($data, $set);
		foreach ($key as $i => $value)
			$new[$i] = isset($set[$i]) ? $set[$i] : $new[$i];

		$problemList[$id] = $new;
		problemSave($id);

		return PROBLEM_OKAY;
	}

	function problemAdd(String $id, Array $add, Array $image = null, Array $attachment = null) {
		global $problemList;

		$moveImage = false;
		$moveAttachment = false;
		if (problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		$problemList[$id] = $add;

		if (isset($image)) {
			$imageFile = utf8_encode(strtolower($image["name"]));
			$acceptExt = array("jpg", "png", "gif", "webp");
			$extension = pathinfo($imageFile, PATHINFO_EXTENSION);

			if (!in_array($extension, $acceptExt))
				return PROBLEM_ERROR_FILEREJECT;

			if ($image["size"] > MAX_IMAGE_SIZE)
				return PROBLEM_ERROR_FILETOOLARGE;

			if ($image["error"] > 0)
				return PROBLEM_ERROR;

			$moveImage = true;
			$problemList[$id]["image"] = $imageFile;
		}

		if (isset($attachment)) {
			$attachmentFile = utf8_encode(strtolower($attachment["name"]));

			if ($attachment["size"] > MAX_ATTACHMENT_SIZE)
				return PROBLEM_ERROR_FILETOOLARGE;

			if ($attachment["error"] > 0)
				return PROBLEM_ERROR;

			$moveAttachment = true;
			$problemList[$id]["attachment"] = $attachmentFile;
		}

		mkdir(PROBLEMS_DIR. "/" .$id, 0777, true);
		problemSave($id);

		if ($moveImage)
			move_uploaded_file($image["tmp_name"], PROBLEMS_DIR ."/". $id ."/". $imageFile);

		if ($moveAttachment)
			move_uploaded_file($attachment["tmp_name"], PROBLEMS_DIR ."/". $id ."/". $attachmentFile);

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
			header("Content-disposition: attachment; filename=". utf8_decode(pathinfo($i, PATHINFO_BASENAME))); 
		
		readfile($f);
		return PROBLEM_OKAY;
	}

	function problemRemove(String $id) {
		global $problemList;

		if (!problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		$dir = PROBLEMS_DIR ."/". $id;

		if (!file_exists(PROBLEMS_DIR ."/". $id))
			return PROBLEM_ERROR;

		rmrf(PROBLEMS_DIR ."/". $id);
		unset($problemList[$id]);
		return PROBLEM_OKAY;
	}

	function problemRemoveImage(String $id) {
		global $problemList;

		if (!problemExist($id))
			return PROBLEM_ERROR_IDREJECT;

		if (!isset($problemList[$id]["image"]))
			return PROBLEM_ERROR_FILENOTFOUND;

		$imageFile = $problemList[$id]["image"];
		$dir = PROBLEMS_DIR ."/". $id;
		$target = $dir ."/". $imageFile;
		
		if (file_exists($target))
			unlink($target);

		unset($problemList[$id]["image"]);
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

	function problemExist(String &$filename) {
		global $problemList;

		// TRY LIST
		$try = Array(
			$filename,
			strtoupper($filename),
			strtolower($filename)
		);

		foreach ($try as $value)
			if (isset($problemList[$value])) {
				$filename = $value;
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