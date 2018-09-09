<?php
    // |====================================================|
    // |                     change.php                     |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    $maxfilesize = 2097152;

    if (!islogedin())
        stop(10, "You Are Not Logged In!", 403);

    if (!isset($_POST["t"]))
        stop(14, "Token required.", 400);
    if ($_POST["t"] !== $_SESSION["api_token"])
        stop(27, "Wrong token!", 403);

    if ($config["editinfo"] == false)
        stop(25, "Thay đổi thông tin đã bị vô hiệu hóa!", 403);
    
    if (!isset($_FILES["file"]))
        stop(13, "Chưa chọn tệp!", 400);

    $file = $_FILES["file"]["name"];
    $acceptext = array("jpg", "png", "gif", "webp");
    $extension = pathinfo($file, PATHINFO_EXTENSION);
    if (in_array($extension, $acceptext) && ($_FILES["file"]["size"] <= 2097153)) {
        if ($_FILES["file"]["error"] > 0) {
            stop(8, "Unknown Error!", 500);
        } else {
            $imagepath = $_SERVER["DOCUMENT_ROOT"] ."/api/avt/". $_SESSION["username"];
            $oldfiles = glob($imagepath.".*");
            if (count($oldfiles) > 0) foreach ($oldfiles as $oldfile) {
                $ext = pathinfo($oldfile, PATHINFO_EXTENSION);
                unlink($imagepath.".".$ext);
            }
            move_uploaded_file($_FILES["file"]["tmp_name"], $imagepath .".". $extension);
            stop(0, "Avatar Changed Successfully.", 200, Array(
                "src" => "/api/avt/get?u=". $_SESSION["username"] ."&t=". time()
            ));
        }
    } else {
        if (!$_FILES["file"]["name"]) {
            stop(13, "Chưa chọn tệp!", 400);
        } else if (($_FILES["file"]["size"] > $maxfilesize))  {
            stop(14, "Tệp quá lớn!", 400, Array(
                "this" => $_FILES["file"]["size"],
                "max" => $maxfilesize
            ));
        } else {
            stop(15, "Chỉ chấp nhận ảnh png, jpg, webp hoặc gif!", 400);
        }
    }

?>