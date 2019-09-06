<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/account/add.php                                                                         |
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

    $id = reqForm("id");
    $username = reqForm("u");
    $password = password_hash(reqForm("p"));
    $name = reqForm("n");

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
    if (getUserData($_SESSION["username"])["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    $res = addUser($id, $username, $password, $name);
    $data = Array(
        "id" => $id,
        "username" => $username,
        "password" => $password,
        "name" => $name
    );

    switch ($res) {
        case USER_ADD_SUCCESS:
            writeLog("OKAY", "Đã thêm tài khoản [$id] \"$username\"");
            stop(0, "Tạo tài khoản thành công!", 200, $data);
            break;
        case USER_ADD_USEREXIST:
            stop(17, "Tài khoản với tên người dùng \"$username\" đã tồn tại!", 400, Array( "username" => $username ));
            break;
        case USER_ADD_ERROR:
            writeLog("ERRR", "Lỗi khi lưu thông tin tài khoản [$id] \"$username\"");
            stop(-1, "Lỗi không rõ.", 500);
            break;
    }