<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /libs/avatar.php                                                                             |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";

	if (!defined("AVATAR_DIR"))
		throw new BLibException(50, "Undefined Constant: AVATAR_DIR", 500);

	function makeAvatar(String $name, Int $size = 200) {
		$color = Array(
			"A" => "#5A876F", "B" => "#B2B7BB", "C" => "#6FA9AB", "D" => "#F5AF29", "E" => "#0088B9", "F" => "#F18536",
			"G" => "#D93A37", "H" => "#B3BC50", "I" => "#5B9BBD", "J" => "#F5878C", "K" => "#9B89B5", "L" => "#407887",
			"M" => "#9B89B5", "N" => "#5A876F", "O" => "#D33F33", "P" => "#D33F33", "Q" => "#F1B126", "R" => "#0087BF",
			"S" => "#F18536", "T" => "#0087BF", "U" => "#B2B7BB", "V" => "#72ACAE", "W" => "#9B89B5", "X" => "#5A876F",
			"Y" => "#EEB424", "Z" => "#407887"
		);

		$letter = strtoupper($name[0]);

		ob_start(); ?>
		<svg width="<?php print $size; ?>" height="<?php print $size; ?>" xmlns="http://www.w3.org/2000/svg">
			<rect
				fill="<?php print $color[$letter] ?? "#846B32"; ?>"
				height="<?php print $size; ?>"
				width="<?php print $size; ?>"
			/>

			<text
				xml:space="preserve"
				text-anchor="middle"
				dominant-baseline="central"
				font-family="Nunito, Arial, sans-serif"
				font-size="<?php print ($size / 2) + 20; ?>"
				font-weight="bold"
				y="50%"
				x="50%"
				fill="#FFF"
			><?php print $letter; ?></text>
		</svg>
		<?php $svg = ob_get_clean();

		contentType("svg");
		print $svg;
		stop(0, "Success", 200);
	}

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
			makeAvatar($username);
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