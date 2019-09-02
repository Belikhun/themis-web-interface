<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/upload.php                                                                         |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "API");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";

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

    if (!isLogedIn())
        stop(11, "Bạn chưa đăng nhập.", 403);

    checkToken();

    if ($config["submit"] === false)
        stop(22, "Nộp bài đã bị tắt!", 403);

    if (!isset($_FILES["file"]))
        stop(41, "Chưa chọn tệp!", 400);

    contest_timeRequire([CONTEST_STARTED, CONTEST_NOTENDED], false);

    $maxfilesize = 10*1024*1024;
    $username = $_SESSION["username"];
    $userid = $_SESSION["id"];
    apache_setenv("no-gzip", "1");

    $file = utf8_encode(strtolower($_FILES["file"]["name"]));
    $filename = pathinfo($file, PATHINFO_FILENAME);
    $acceptext = Array("pas", "cpp", "c", "pp", "exe", "class", "py", "java");
    $extension = pathinfo($file, PATHINFO_EXTENSION);

    if ($config["submitInProblems"] === true) {
        require_once $_SERVER["DOCUMENT_ROOT"] ."/data/problems/problem.php";
        if (!problemExist($filename))
            stop(44, "Không có đề cho bài này!", 404, Array( "file" => $filename ));

        if (!problemCheckExtension($filename, $extension))
            stop(43, "Không chấp nhận tệp!", 415);
    }

    if (!in_array($extension, $acceptext))
        stop(43, "Không chấp nhận tệp!", 415);

    if (($_FILES["file"]["size"] > $maxfilesize))
        stop(42, "Tệp quá lớn!", 400, Array(
            "size" => $_FILES["file"]["size"],
            "max" => $maxfilesize
        ));

    if ($_FILES["file"]["error"] > 0)
        stop(-1, "Lỗi không rõ.", 500);

    move_uploaded_file($_FILES["file"]["tmp_name"], $config["uploadDir"] ."/". $userid ."[". $username ."][". $filename ."] .". $extension);
    writeLog("INFO", "Đã tải lên \"$file\"");
    stop(0, "Nộp bài thành công.", 200);
?>