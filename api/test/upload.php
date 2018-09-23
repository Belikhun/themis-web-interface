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
        stop(11, "Bạn chưa đăng nhập.", 403);

    if (!isset($_POST["token"]))
        stop(4, "Token please!", 400);
    if ($_POST["token"] !== $_SESSION["api_token"])
        stop(5, "Wrong token!", 403);

    if ($config["submit"] == false)
        stop(22, "Nộp bài đã bị tắt!", 403);

    if (!isset($_FILES["file"]))
        stop(41, "Chưa chọn tệp!", 400);

    $duringTime = $config["time"]["during"];

    if ($duringTime > 0) {
        $beginTime = $config["time"]["begin"]["times"];
        $offsetTime = $config["time"]["offset"];
        $t = $beginTime - time() + ($duringTime * 60);

        if ($t > $duringTime * 60)
            stop(103, "Chưa đến giờ nộp bài.", 403);
        else if($t < -$offsetTime && $duringTime != 0)
            stop(104, "Đã qua giờ nộp bài!", 403);
    }

    $maxfilesize = 10*1024*1024;
    $username = $_SESSION["username"];
    $userid = $_SESSION["id"];

    $file = $_FILES["file"]["name"];
    $filename = explode(".", $file);
    $acceptext = array("pas", "cpp", "c", "pp", "exe", "class", "py", "java");
    $extension = pathinfo($file, PATHINFO_EXTENSION);
    if (in_array($extension, $acceptext) && ($_FILES["file"]["size"] <= $maxfilesize)) {
        if ($_FILES["file"]["error"] > 0) {
            stop(-1, "Lỗi không rõ.", 500);
        } else {
            move_uploaded_file($_FILES["file"]["tmp_name"], $config["uploaddir"] ."/". $userid ."[". $username ."][". $filename[0] ."].". end($filename));
            stop(0, "Nộp bài thành công.", 200);
        }
    } elseif (($_FILES["file"]["size"] > $maxfilesize))  {
        stop(42, "Tệp quá lớn!", 400, Array(
            "file" => $_FILES["file"]["size"],
            "max" => $maxfilesize
        ));
    } else {
        stop(43, "Không chấp nhận tệp!", 415);
    }

?>