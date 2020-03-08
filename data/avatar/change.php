<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /data/avatar/change.php                                                                      |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "API");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";

    if (!isLoggedIn())
        stop(11, "Bạn chưa đăng nhập!", 401);

    checkToken();

    if ($config["edit"]["avatar"] === false)
        stop(21, "Thay đổi Avatar đã bị tắt!", 403);
    
    if (!isset($_FILES["file"]))
        stop(41, "Chưa chọn tệp!", 400);

    $username = getForm("username");

    if (!empty($username) && $_SESSION["id"] !== "admin")
        stop(31, "Access Denied!", 403);
    else
        $username = $_SESSION["username"];

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

    $imagePath = AVATAR_DIR ."/". $username;
    $oldFiles = glob($imagePath .".{". join(",", IMAGE_ALLOW) ."}", GLOB_BRACE);

    // Find old avatar files and remove them
    if (count($oldFiles) > 0)
        foreach ($oldFiles as $oldFile) {
            $ext = pathinfo($oldFile, PATHINFO_EXTENSION);
            unlink($imagePath .".". $ext);
        }

    // Move new avatar
    move_uploaded_file($_FILES["file"]["tmp_name"], $imagePath .".". $extension);

    stop(0, "Thay đổi ảnh đại diện thành công.", 200, Array(
        "src" => "/api/avatar?u=". $username,
        "username" => $username
    ));
?>