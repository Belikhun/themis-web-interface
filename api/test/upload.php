<?php
    // |====================================================|
    // |                     upload.php                     |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if (!islogedin())
        stop(10, "Bạn chưa đăng nhập.", 403);

    if (!isset($_POST["t"]))
        stop(14, "Yêu cầu token.", 400);
    if ($_POST["t"] !== $_SESSION["api_token"])
        stop(27, "Sai token!", 403);

    if ($config["submit"] == false)
        stop(10, "Nộp bài đã bị vô hiệu hóa!", 403);

    if (!isset($_FILES["file"]))
        stop(13, "Chưa chọn file!", 400);

    $beginTime = $config["time"]["begin"]["times"];
    $duringTime = $config["time"]["during"];
    $offsetTime = $config["time"]["offset"];
    $t = $beginTime - time() + ($duringTime * 60);

    if ($t > $duringTime * 60)
        stop(22, "Chưa tới thời gian làm bài.", 403);
    else if($t < -$offsetTime && $duringTime != 0)
        stop(22, "Đã hết thời gian làm bài!", 403);

    $maxfilesize = 10*1024*1024;
    $username = $_SESSION["username"];
    $userid = $_SESSION["id"];

    $file = $_FILES["file"]["name"];
    $filename = explode(".", $file);
    $acceptext = array("pas", "cpp", "c", "pp", "exe", "class", "py", "java");
    $extension = pathinfo($file, PATHINFO_EXTENSION);
    if (in_array($extension, $acceptext) && ($_FILES["file"]["size"] <= $maxfilesize)) {
        if ($_FILES["file"]["error"] > 0) {
            stop(8, "Lỗi không rõ", 500);
        } else {
            move_uploaded_file($_FILES["file"]["tmp_name"], $config["uploaddir"] ."/". $userid ."[". $username ."][". $filename[0] ."].". end($filename));
            stop(0, "Nộp bài thành công.", 200);
        }
    } else {
        if (!$_FILES["file"]["name"]) {
            stop(13, "Chưa chọn file!", 400);
        } else if (($_FILES["file"]["size"] > $maxfilesize))  {
            stop(14, "File quá lớn!", 400, Array(
                "this" => $_FILES["file"]["size"],
                "max" => $maxfilesize
            ));
        } else {
            stop(15, "Không chấp nhận tệp!", 415);
        }
    }

?>