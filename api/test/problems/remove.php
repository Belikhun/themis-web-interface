<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/test/problems/remove.php                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/logs.php";
    
    if (!isLogedIn())
    stop(11, "Bạn chưa đăng nhập.", 403);
    
    checkToken();
    
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
    if (getuserdata($_SESSION["username"])["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    $id = reqform("id");
    $id = str_replace("\"", "", $id);
    $id = str_replace("/", "", $id);
    $id = str_replace(".", "", $id);

    $code = problem_remove($id);

    switch ($code) {
        case PROBLEM_OKAY:
            writeLog("WARN", "Đã xóa đề \"$id\"");
            stop(0, "Success!", 200);
            break;
        case PROBLEM_ERROR_IDREJECT:
            stop(45, "Không tìm thấy đề của id đã cho!", 404);
            break;
        case PROBLEM_ERROR:
            stop(-1, "Lỗi không rõ.", 500);
            break;
    }