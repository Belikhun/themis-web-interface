<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/avt/change.php                                                                          |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if (!isLogedIn())
        stop(11, "Bạn chưa đăng nhập!", 403);

    checkToken();

    if ($config["editInfo"] === false)
        stop(21, "Thay đổi thông tin đã bị tắt!", 403);
    
    if (!isset($_FILES["file"]))
        stop(41, "Chưa chọn tệp!", 400);

    $maxfilesize = 1048576;
    $file = strtolower($_FILES["file"]["name"]);
    $acceptext = array("jpg", "png", "gif", "webp");
    $extension = pathinfo($file, PATHINFO_EXTENSION);

    if (!in_array($extension, $acceptext))
        stop(43, "Chỉ chấp nhận ảnh png, jpg, webp hoặc gif!", 400);

    if ($_FILES["file"]["size"] > $maxfilesize)
        stop(42, "Tệp quá lớn!", 400, Array(
            "size" => $_FILES["file"]["size"],
            "max" => $maxfilesize
        ));

    if ($_FILES["file"]["error"] > 0)
        stop(-1, "Lỗi không rõ!", 500);

    $imagePath = $_SERVER["DOCUMENT_ROOT"] ."/api/avt/". $_SESSION["username"];
    $oldFiles = glob($imagePath .".{jpg,png,gif,webp}", GLOB_BRACE);
    if (count($oldFiles) > 0)
        foreach ($oldFiles as $oldFile) {
            $ext = pathinfo($oldFile, PATHINFO_EXTENSION);
            unlink($imagePath .".". $ext);
        }

    move_uploaded_file($_FILES["file"]["tmp_name"], $imagePath .".". $extension);
    stop(0, "Thay đổi ảnh đại diện thành công.", 200, Array(
        "src" => "/api/avt/get?u=". $_SESSION["username"] ."&t=". time()
    ));
?>