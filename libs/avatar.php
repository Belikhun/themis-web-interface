<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /libs/avatar.php                                                                             |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/tools/svgIcon.php";

	if (!defined("AVATAR_DIR"))
		throw new BLibException(50, "Undefined Constant: AVATAR_DIR", 500);

	function loadAvatar(String $path) {
		contentType(pathinfo($path, PATHINFO_EXTENSION))
			?: contentType("png");
			
		header("Content-length: ". filesize($path));
		readfile($path);
		
		stop(0, "Success", 200);
	}

	function getAvatar($username) {
		$username = preg_replace("/[.\/\\\\]/m", "", trim($username));
		$files = glob(AVATAR_DIR ."/". $username .".{". join(",", IMAGE_ALLOW) ."}", GLOB_BRACE);
	
		if (count($files) > 0)
			loadAvatar($files[0]);
		else
			svgIcon($username);
	}

	function changeAvatar($username, $file) {
		if (!isset($file["error"]) || is_array($file["error"]))
			throw new BLibException(-1, "Invalid Uploaded File", 400, $file["error"]);

		switch ($file["error"]) {
			case UPLOAD_ERR_OK:
				break;
			case UPLOAD_ERR_NO_FILE:
				throw new BLibException(41, "No file sent!", 400, $file["error"]);
			case UPLOAD_ERR_INI_SIZE:
			case UPLOAD_ERR_FORM_SIZE:
				throw new BLibException(42, "File limit exceeded!", 400, $file["error"]);
			default:
				throw new BLibException(-1, "Unknown error while handing file upload!", 500, $file["error"]);
		}

		$filename = strtolower($file["name"]);
		$extension = pathinfo($filename, PATHINFO_EXTENSION);

		if (!in_array($extension, IMAGE_ALLOW))
			stop(43, "Không chấp nhận loại tệp!", 400, Array( "allow" => IMAGE_ALLOW ));

		if ($file["size"] > MAX_IMAGE_SIZE)
			stop(42, "Tệp quá lớn!", 400, Array(
				"size" => $file["size"],
				"max" => MAX_IMAGE_SIZE
			));

		if ($file["error"] > 0)
			stop(-1, "Lỗi không rõ!", 500);

		$imagePath = AVATAR_DIR ."/". $username;
		$oldFiles = glob($imagePath .".{". join(",", IMAGE_ALLOW) ."}", GLOB_BRACE);

		// Find old avatar files and remove them
		if (count($oldFiles) > 0)
			foreach ($oldFiles as $oldFile) {
				$ext = pathinfo($oldFile, PATHINFO_EXTENSION);
				unlink($imagePath .".". $ext);
			}

		// Move new avatar
		move_uploaded_file($file["tmp_name"], $imagePath .".". $extension);
	}