<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/account/edit.php                                                                        |
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

    if (!isLogedIn())
        stop(11, "Bạn chưa đăng nhập.", 403);
        
    checkToken();

    $username = reqForm("u");

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
    if (getUserData($_SESSION["username"])["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    $imagePath = AVATAR_DIR ."/". $username;
    $oldFiles = glob($imagePath .".{jpg,png,gif,webp}", GLOB_BRACE);

    // Find old avatar files and remove them
    if (count($oldFiles) > 0)
        foreach ($oldFiles as $oldFile) {
            $ext = pathinfo($oldFile, PATHINFO_EXTENSION);
            unlink($imagePath .".". $ext);
        }

    $res = deleteUser($username);

    switch ($res) {
        case USER_EDIT_SUCCESS:
            writeLog("OKAY", "Đã xóa tài khoản \"$username\"");
            stop(0, "Xóa tài khoản thành công!", 200, Array( "username" => $username ));
            break;
        case USER_EDIT_WRONGUSERNAME:
            stop(13, "Không tìm thấy tài khoản \"$username\"!", 400, Array( "username" => $username ));
            break;
        case USER_EDIT_ERROR:
            writeLog("ERRR", "Lỗi khi xóa tài khoản \"$username\"");
            stop(-1, "Lỗi không rõ.", 500);
            break;
    }