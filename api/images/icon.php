<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /api/images/icon.php                                                                         |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|
	
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	
	define("DEFAULT_IMAGE", $_SERVER["DOCUMENT_ROOT"] ."/assets/img/icon.webp");
	define("MODIFIED_IMAGE_PATH", $_SERVER["DOCUMENT_ROOT"] ."/data/images");
	define("MODIFIED_IMAGE_NAME", "icon");
	define("MODIFIED_IMAGE", MODIFIED_IMAGE_PATH ."/". MODIFIED_IMAGE_NAME);

	if (!file_exists(MODIFIED_IMAGE_PATH))
		mkdir(MODIFIED_IMAGE_PATH);

	switch ($_SERVER["REQUEST_METHOD"]) {
		case "GET":
			// SET PAGE TYPE
			define("PAGE_TYPE", "NORMAL");

			function showImage(string $path) {
				if (!file_exists($path)) {
					$file = pathinfo($path, PATHINFO_BASENAME);
					stop(44, "Image Not Found: $file", 404, Array( "file" => $file ));
				}

				contentType(pathinfo($path, PATHINFO_EXTENSION))
					?: contentType("jpg");
					
				header("Content-length: ". filesize($path));
				readfile($path);
				stop(0, "Success", 200);
			}

			//? Try to Glob the modified image
			$modifiedImage = glob(MODIFIED_IMAGE .".*");

			if (empty($modifiedImage))
				showImage(DEFAULT_IMAGE);
			else
				showImage($modifiedImage[0]);

			stop(0, "Success", 200);
			break;

		case "POST":
			// SET PAGE TYPE
			define("PAGE_TYPE", "API");

			if (!isLoggedIn())
				stop(11, "Bạn chưa đăng nhập!", 401);
				
			checkToken();

			if ($_SESSION["id"] !== "admin")
				stop(31, "Access Denied!", 403);

			if (!isset($_FILES["file"]))
				stop(41, "Chưa chọn tệp!", 400);
		
			$file = strtolower($_FILES["file"]["name"]);
			$extension = pathinfo($file, PATHINFO_EXTENSION);
		
			if (!in_array($extension, IMAGE_ALLOW))
				stop(43, "Không chấp nhận loại tệp!", 400, Array( "allow" => IMAGE_ALLOW ));
		
			if ($_FILES["file"]["size"] > MAX_IMAGE_SIZE)
				stop(42, "Tệp quá lớn!", 400, Array(
					"size" => $_FILES["file"]["size"],
					"max" => MAX_IMAGE_SIZE
				));
		
			if ($_FILES["file"]["error"] > 0)
				stop(-1, "Lỗi không rõ!", 500);
		
			$oldFiles = glob(MODIFIED_IMAGE .".{". join(",", IMAGE_ALLOW) ."}", GLOB_BRACE);
		
			// Find old files and remove them
			if (count($oldFiles) > 0)
				foreach ($oldFiles as $oldFile) {
					$ext = pathinfo($oldFile, PATHINFO_EXTENSION);
					unlink(MODIFIED_IMAGE .".". $ext);
				}
		
			// Move new avatar
			move_uploaded_file($_FILES["file"]["tmp_name"], MODIFIED_IMAGE .".". $extension);
			stop(0, "Thay đổi ảnh thành công.", 200, Array( "src" => "/api/images/". MODIFIED_IMAGE_NAME ));
			break;

		case "DELETE":
			// SET PAGE TYPE
            define("PAGE_TYPE", "API");

            if (!isLoggedIn())
                stop(11, "Bạn chưa đăng nhập", 401);
            
            checkToken();
            
            if ($_SESSION["id"] !== "admin")
                stop(31, "Access Denied!", 403);

			$files = glob(MODIFIED_IMAGE .".{". join(",", IMAGE_ALLOW) ."}", GLOB_BRACE);
	
			// Find old files and remove them
			if (count($files) > 0)
				foreach ($files as $file) {
					$ext = pathinfo($file, PATHINFO_EXTENSION);
					unlink(MODIFIED_IMAGE .".". $ext);
				}

			stop(0, "Đã xóa ảnh ". MODIFIED_IMAGE_NAME, 200, Array( "unlinked" => count($files) ));
			break;
		
		default:
			// SET PAGE TYPE
			define("PAGE_TYPE", "API");

			stop(7, "Unexpected request method: ". $requestMethod, 405, Array( "method" => $requestMethod ));
			break;
	}