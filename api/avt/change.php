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
        stop(11, "Bạn chưa đăng nhập!", 403);

    if (!isset($_POST["token"]))
        stop(4, "Token please!", 400);
    if ($_POST["token"] !== $_SESSION["api_token"])
        stop(5, "Wrong token!", 403);

    if ($config["editinfo"] == false)
        stop(21, "Thay đổi thông tin đã bị tắt!", 403);
    
    if (!isset($_FILES["file"]))
        stop(41, "Chưa chọn tệp!", 400);

    $file = $_FILES["file"]["name"];
    $acceptext = array("jpg", "png", "gif", "webp");
    $extension = pathinfo($file, PATHINFO_EXTENSION);
    if (in_array($extension, $acceptext) && ($_FILES["file"]["size"] <= 2097153)) {
        if ($_FILES["file"]["error"] > 0) {
            stop(-1, "Lỗi không rõ!", 500);
        } else {
            $imagepath = $_SERVER["DOCUMENT_ROOT"] ."/api/avt/". $_SESSION["username"];
            $oldfiles = glob($imagepath.".*");
            if (count($oldfiles) > 0) foreach ($oldfiles as $oldfile) {
                $ext = pathinfo($oldfile, PATHINFO_EXTENSION);
                unlink($imagepath.".".$ext);
            }
            move_uploaded_file($_FILES["file"]["tmp_name"], $imagepath .".". $extension);
            stop(0, "Thay đổi ảnh đại diện thành công.", 200, Array(
                "src" => "/api/avt/get?u=". $_SESSION["username"] ."&t=". time()
            ));
        }
    } elseif (($_FILES["file"]["size"] > $maxfilesize))  {
        stop(42, "Tệp quá lớn!", 400, Array(
            "this" => $_FILES["file"]["size"],
            "max" => $maxfilesize
        ));
    } else {
        stop(43, "Chỉ chấp nhận ảnh png, jpg, webp hoặc gif!", 400);
    }

?>