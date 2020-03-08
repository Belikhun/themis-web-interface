<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/problems/remove.php                                                             |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	// SET PAGE TYPE
    define("PAGE_TYPE", "API");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";
    
    if (!isLoggedIn())
        stop(11, "Bạn chưa đăng nhập.", 401);
    
    checkToken();
    
    if ($_SESSION["id"] !== "admin")
        stop(31, "Access Denied!", 403);
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/problems/problem.php";

    $id = preg_replace("/[.\/\\\\]/m", "", reqForm("id"));
    $code = problemRemove($id);

    switch ($code) {
        case PROBLEM_OKAY:
            writeLog("WARN", "Đã xóa đề \"$id\"");
            stop(0, "Xóa đề thành công!", 200, Array( "id" => $id ));
            break;
        case PROBLEM_ERROR_IDREJECT:
            stop(45, "Không tìm thấy đề của id đã cho!", 404, Array( "id" => $id ));
            break;
        case PROBLEM_ERROR:
            stop(-1, "Lỗi không rõ.", 500, Array( "id" => $id ));
            break;
    }