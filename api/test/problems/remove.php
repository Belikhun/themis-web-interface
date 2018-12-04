<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/test/problems/remove.php                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018 Belikhun. All right reserved                                              |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";

    if (!islogedin())
        stop(11, "Bạn chưa đăng nhập.", 403);

    checktoken();

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
    if (getuserdata($_SESSION["username"])["id"] != "admin")
        stop(31, "Access Denied!", 403);

    $id = reqform("id");
    $id = str_replace("\"", "", $id);
    $id = str_replace("/", "", $id);
    $id = str_replace(".", "", $id);

    $code = problem_remove($id);

    switch ($code) {
        case PROBLEM_OKAY:
            stop(0, "Success!", 200);
        case PROBLEM_ERROR_IDREJECT:
            stop(45, "Không tìm thấy đề của id đã cho!", 404);
        case PROBLEM_ERROR:
            stop(-1, "Lỗi không rõ.", 500);
    }