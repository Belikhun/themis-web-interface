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
    $id = getForm("id");
    $password = password_hash(getForm("p"));
    $name = getForm("n");

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
    if (getUserData($_SESSION["username"])["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    $data = Array();
    $id ? $data["id"] = $id : null;
    $password ? $data["password"] = $password : null;
    $name ? $data["name"] = $name : null;
    $res = editUser($username, $data);

    switch ($res) {
        case USER_EDIT_SUCCESS:
            writeLog("OKAY", "Đã chỉnh sửa tài khoản [$id] \"$username\"");
            stop(0, "Chỉnh sửa tài khoản thành công!", 200, $data);
            break;
        case USER_EDIT_WRONGUSERNAME:
            stop(13, "Không tìm thấy tài khoản \"$username\"!", 400, Array( "username" => $username ));
            break;
        case USER_EDIT_ERROR:
            writeLog("ERRR", "Lỗi khi lưu thông tin tài khoản [$id] \"$username\"");
            stop(-1, "Lỗi không rõ.", 500);
            break;
    }